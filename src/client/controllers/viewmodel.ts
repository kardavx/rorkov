import { Controller, OnInit, OnRender } from "@flamework/core";
import { Canim, CanimPose, CanimTrack } from "@rbxts/canim";
import { Workspace, ReplicatedStorage as shared } from "@rbxts/services";
import { ItemConfig, configs } from "shared/configurations/items";
import { log } from "shared/log_message";
import { Viewmodel as ViewmodelType } from "client/types/items";

import { Functions } from "client/network";
import welder from "shared/welder";
import { scaleOnAxis } from "shared/utilities/model_utility";

const outfitIgnoredLimbs = ["Torso"];

@Controller({})
export class Viewmodel implements OnInit, OnRender {
	private viewmodel: ViewmodelType | undefined;
	private temp: Folder = new Instance("Folder");
	private viewmodelAnimator = new Canim();

	private typeLookup: { [animationKey: string]: "Animation" | "Pose" } = {};
	private currentOccupierId: string | undefined;

	private getViewmodel = (): Model => {
		const data = shared.FindFirstChild("data") as Folder;
		if (!data) throw `no data????`;

		const viewmodel = data.FindFirstChild("viewmodel") as Model;
		if (!viewmodel) throw `cos`;

		return viewmodel;
	};

	private weldOutfitElementsToViewmodel = (limb: Model) => {
		if (!limb.IsA("Model")) return;

		const correspondingLimb = this.viewmodel!.FindFirstChild(limb.Name) as BasePart;
		if (!correspondingLimb) {
			log("warning", `Improper limb name, couldn't find limb name of ${limb.Name}`);
			limb.Destroy();
			return;
		}

		if (!correspondingLimb.IsA("BasePart")) {
			log("warning", `Limb name ${limb.Name} found, but it isn't a basepart`);
			limb.Destroy();
			return;
		}

		const sizeDifference = correspondingLimb.Size.div(limb.PrimaryPart!.Size);

		scaleOnAxis(limb, sizeDifference.X, sizeDifference.Y, sizeDifference.Z);
		welder(limb, limb.PrimaryPart, { Anchored: false, CanCollide: false, CanTouch: false, CanQuery: false, Massless: true });
		limb.PivotTo(correspondingLimb.CFrame);

		const topWeld = new Instance("WeldConstraint");
		topWeld.Name = "joint";
		topWeld.Part0 = correspondingLimb;
		topWeld.Part1 = limb.PrimaryPart;
		topWeld.Parent = limb.PrimaryPart;
	};

	private handleCurrentOutfit = () => {
		const oldTop = this.viewmodel!.FindFirstChild("top");
		if (oldTop) {
			oldTop.Destroy();
		}

		Functions.getCurrentTop
			.invokeWithTimeout(5)
			.andThen((top: Model) => {
				const clonedTop = top.Clone();
				clonedTop.Name = "top";
				clonedTop.Parent = this.viewmodel;

				clonedTop.GetChildren().forEach((limb) => {
					if (!limb.IsA("Model")) return;

					if (outfitIgnoredLimbs.find((ignoredLimb: string) => ignoredLimb === limb.Name) !== undefined) {
						limb.Destroy();
						return;
					}
					this.weldOutfitElementsToViewmodel(limb);
				});
			})
			.catch((reason) => {
				log("warning", `error from the network handler: ${reason}`);
			});
	};

	playAnimation = (animationKey: string): CanimTrack | CanimPose | void => {
		print(this.viewmodelAnimator.identified_bones);

		return this.typeLookup[animationKey] === "Animation"
			? this.viewmodelAnimator.play_animation(animationKey)
			: this.viewmodelAnimator.play_pose(animationKey);
	};

	stopAnimation = (animationKey: string): void => {
		this.viewmodelAnimator.stop_animation(animationKey);
		this.refreshBones();
	};

	refreshBones = () => {
		if (!this.viewmodel) {
			log("warning", "Attempt to refresh viewmodel bones before its initialization");
			return;
		}

		this.viewmodelAnimator.assign_model(this.viewmodel);
	};

	occupyViewmodel = (occupierId: string): ViewmodelType | undefined => {
		if (!this.viewmodel) {
			log("warning", "Attempt to occupy viewmodel before its initialization");
			return;
		}

		if (this.currentOccupierId !== undefined) {
			log("warning", "Attempt to get viewmodel when its occupied");
			return;
		}

		this.handleCurrentOutfit();
		this.currentOccupierId = occupierId;
		this.viewmodel.PivotTo(new CFrame(0, 0, 0));
		this.viewmodel.Parent = Workspace.CurrentCamera as Camera;
		return this.viewmodel;
	};

	deocuppyViewmodel = (occupierId: string) => {
		if (!this.viewmodel) {
			log("warning", "Attempt to deoccupy viewmodel before its initialization");
			return;
		}

		if (this.currentOccupierId === undefined) {
			log("warning", "Attempt to deocuppy viewmodel when its not occupied");
			return;
		}

		if (this.currentOccupierId !== occupierId) {
			log("warning", "Attempt to deoccupy the viewmodel without being its occupier");
			return;
		}

		this.currentOccupierId = undefined;
		this.viewmodel.PivotTo(new CFrame(0, 0, 0));
		this.viewmodel.Parent = this.temp;
	};

	getOccupiedViewmodel = (occupierId: string): ViewmodelType | undefined => {
		if (!this.viewmodel) {
			log("warning", "Attempt to get viewmodel before its initialization");
			return;
		}

		if (this.currentOccupierId === undefined) {
			log("warning", "Attempt to get viewmodel when its not occupied");
			return;
		}

		if (this.currentOccupierId !== occupierId) {
			log("warning", "Attempt to get the viewmodel without being its occupier");
			return;
		}

		return this.viewmodel;
	};

	onInit() {
		this.temp.Name = "viewmodel_temp";

		this.viewmodel = this.getViewmodel().Clone() as ViewmodelType;
		this.viewmodel.PivotTo(new CFrame(0, 0, 0));
		this.viewmodel.Name = "viewmodel";
		this.viewmodel.Parent = this.temp;

		this.viewmodelAnimator.assign_model(this.viewmodel);

		const animationLoadStart = os.clock();
		configs.forEach((itemConfig: ItemConfig, itemName: string) => {
			task.spawn(() => {
				let createdAnimations:
					| {
							[animationName in string]: {
								track: CanimPose | CanimTrack;
								trackType: "Animation" | "Pose";
							};
					  }
					| undefined = {};

				log("verbose", `Starting to load animations for item ${itemName}`);
				for (const [animationName, animationProperties] of pairs(itemConfig.animations)) {
					const animationKey = `${itemName}/${animationName}`;
					const animationID = `rbxassetid://${animationProperties.id}`;
					const animation =
						animationProperties.type === "Animation"
							? this.viewmodelAnimator.load_animation(animationKey, animationProperties.priority, animationID)
							: this.viewmodelAnimator.load_pose(animationKey, animationProperties.priority, animationID);

					animation.finished_loading.Wait();

					this.typeLookup[animationKey] = animationProperties.type;
					createdAnimations[animationName] = { track: animation, trackType: animationProperties.type };
					animation.looped = animationProperties.looped || false;
					log("verbose", `Animation of name ${animationName} loaded for item ${itemName}`);
				}

				const idle = createdAnimations.idle;
				if (idle) {
					const idleTrack = idle.track as CanimPose;
					for (const [animationName, { track, trackType }] of pairs(createdAnimations)) {
						if (trackType !== "Animation") continue;
						// eslint-disable-next-line camelcase
						(track as CanimTrack).rebase_target = idleTrack;
						log("verbose", `Animation of name ${animationName} rebased for item ${itemName}`);
					}
				}

				createdAnimations = undefined;
				log("verbose", `Animations for item ${itemName} has been loaded`);
			});
		});

		log("verbose", `Animation loading finished in ${os.clock() - animationLoadStart}s`);
	}

	onRender(dt: number): void {
		this.viewmodelAnimator.update(dt);
	}
}
