import { Controller, OnRender, OnInit } from "@flamework/core";
import { Canim, CanimPose, CanimTrack } from "@rbxts/canim";
import { OnCharacterAdded } from "./core";
import { Viewmodel } from "client/types/items";
import { configs, ItemConfig } from "shared/configurations/items";
import { RunService } from "@rbxts/services";
import getObjectSize from "shared/getObjectSize";
import { log } from "shared/log_message";

export type CanimTracks = CanimPose | CanimTrack;
interface Tracks {
	viewmodel: { [animationKey in string]: CanimTracks | undefined };
	character: { [animationKey in string]: CanimTracks | undefined };
}

@Controller({})
export class Animation implements OnRender, OnCharacterAdded, OnInit {
	private viewmodelAnimator = new Canim();
	private characterAnimator = new Canim();

	private typeLookup: { [animationKey: string]: "Animation" | "Pose" } = {};
	private tracks: Tracks = {
		viewmodel: {},
		character: {},
	};

	playAnimation = (animationKey: string): { viewmodelTrack: CanimTrack | CanimPose | undefined; characterTrack: CanimTrack | CanimPose | undefined } => {
		const animationType = this.typeLookup[animationKey];
		if (!animationType) {
			throw `Couldn't find type for given animationKey (animationKey: ${animationKey})`;
		}

		const viewmodelTrack =
			(animationType === "Animation" ? this.viewmodelAnimator.play_animation(animationKey) : this.viewmodelAnimator.play_pose(animationKey)) || undefined;
		const characterTrack =
			(animationType === "Animation" ? this.characterAnimator.play_animation(animationKey) : this.characterAnimator.play_pose(animationKey)) || undefined;

		return {
			viewmodelTrack,
			characterTrack,
		};
	};

	stopAnimation = (animationKey: string): void => {
		this.viewmodelAnimator.stop_animation(animationKey);
		this.characterAnimator.stop_animation(animationKey);
	};

	getAnimationTrack = (
		animationKey: string,
		scope: "Character" | "Viewmodel" | "Both" = "Both",
	): CanimTracks | undefined | [character: CanimTracks | undefined, viewmodel: CanimTracks | undefined] => {
		const characterAnimationTrack = this.tracks.character[animationKey];
		const viewmodelAnimationTrack = this.tracks.viewmodel[animationKey];

		if (scope === "Character") return characterAnimationTrack;
		if (scope === "Viewmodel") return viewmodelAnimationTrack;
		if (scope === "Both") return [characterAnimationTrack, viewmodelAnimationTrack];
	};

	assignViewmodel = (viewmodel: Viewmodel) => {
		this.viewmodelAnimator.assign_model(viewmodel);
	};

	onCharacterAdded(character: Model): void {
		this.characterAnimator.assign_model(character);
	}

	onInit(): void {
		const globalChecksum = {
			current: 0,
			target: 0,
		};

		configs.forEach((itemConfig: ItemConfig, itemName: string) => {
			const amountOfAnimations = getObjectSize(itemConfig.animations);
			globalChecksum.target += amountOfAnimations;

			task.spawn(() => {
				const loadedTracks: { [animationName in string]: { track: CanimTracks; trackType: "Animation" | "Pose" } } = {};

				for (const [animationName, animationProperties] of pairs(itemConfig.animations)) {
					const key = `${itemName}/${animationName}`;
					const id = `rbxassetid://${animationProperties.id}`;
					const type = animationProperties.type;
					const priority = animationProperties.id;
					const looped = animationProperties.looped || false;

					let animation: CanimTrack | CanimPose;

					if (type === "Animation") {
						animation = this.viewmodelAnimator.load_animation(key, priority, id);
						this.characterAnimator.load_animation(key, priority, id);
					} else {
						animation = this.viewmodelAnimator.load_pose(key, priority, id);
						this.characterAnimator.load_pose(key, priority, id);
					}

					animation.finished_loading.Wait();
					globalChecksum.current += 1;

					//TODO: WEIGHTS
					animation.looped = looped;
					this.typeLookup[animationName] = type;

					log("verbose", `(${globalChecksum.current}/${globalChecksum.target}) animation ${animationName} for item ${itemName} sucesfully loaded`);
				}

				const idle = loadedTracks.idle;
				if (idle) {
					const idleTrack = idle.track as CanimPose;
					for (const [animationName, { track, trackType }] of pairs(loadedTracks)) {
						if (trackType !== "Animation") return;

						// eslint-disable-next-line camelcase
						(track as CanimTrack).rebase_target = idleTrack;
					}
				}
			});
		});

		while (globalChecksum.current < globalChecksum.target) RunService.Heartbeat.Wait();
	}

	onRender(dt: number): void {
		this.viewmodelAnimator.update(dt);
		this.characterAnimator.update(dt);
	}
}