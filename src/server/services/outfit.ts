import { Service, OnInit } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { ReplicatedStorage as shared } from "@rbxts/services";
import { log } from "shared/log_message";
import welder from "shared/welder";
import { Functions } from "server/network";

@Service({})
export class Outfit implements OnInit, OnCharacterAdded {
	static choosenOutfit = { top: "operator_2", bottom: "operator" };

	private outfits:
		| {
				tops: { [outfitName in string]: Model };
				bottoms: { [outfitName in string]: Model };
		  }
		| undefined;

	private loadOutfits = (directory: Folder): { [outfitName in string]: Model } => {
		const fetchedOutfits: { [outfitName in string]: Model } = {};
		directory.GetChildren().forEach((outfit) => {
			if (!outfit.IsA("Model")) return;

			// if (!outfit.PrimaryPart) {
			// 	const newRoot = outfit.FindFirstChild("primary");
			// 	if (!newRoot) {
			// 		log("warning", `Outfit ${outfit.Name} doesn't have a primaryPart set, and there isn't a part called 'primary' in it`);
			// 		return;
			// 	}
			// }

			fetchedOutfits[outfit.Name] = outfit;
			log("verbose", `Outfit ${outfit.Name} loaded`);
		});
		return fetchedOutfits;
	};

	private weldOutfitElementsToCharacter = (limb: Model, character: Model) => {
		if (!limb.IsA("Model")) return;

		const correspondingLimb = character.FindFirstChild(limb.Name) as BasePart;
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

		welder(limb, limb.PrimaryPart, { Anchored: false, CanCollide: false, CanTouch: false, CanQuery: false, Massless: true });

		limb.PivotTo(correspondingLimb.CFrame);

		const topWeld = new Instance("WeldConstraint");
		topWeld.Name = "joint";
		topWeld.Part0 = correspondingLimb;
		topWeld.Part1 = limb.PrimaryPart;
		topWeld.Parent = limb.PrimaryPart;
	};

	private applyOutfit = (player: Player, character: Model) => {
		if (!this.outfits) {
			log("warning", "this.outfits has been used before its intialization, request dropped");
			return;
		}

		const oldPlayerTop = character.FindFirstChild("top") as Model;
		const oldPlayerBottom = character.FindFirstChild("bottom") as Model;

		if (oldPlayerTop) {
			log("verbose", `Destroyed old top (${oldPlayerTop.Name}) for player ${player.Name}`);
			oldPlayerTop.Destroy();
		}

		if (oldPlayerBottom) {
			log("verbose", `Destroyed old bottom (${oldPlayerBottom.Name}) for player ${player.Name}`);
			oldPlayerBottom.Destroy();
		}

		const playerTop = this.outfits.tops[Outfit.choosenOutfit.top];
		const playerBottom = this.outfits.bottoms[Outfit.choosenOutfit.bottom];

		if (!playerTop) {
			log("warning", `didn't find top of name ${Outfit.choosenOutfit.top}`);
			return;
		}

		if (!playerBottom) {
			log("warning", `didn't find bottom of name ${Outfit.choosenOutfit.bottom}`);
			return;
		}

		const clonedTop = playerTop.Clone();
		clonedTop.Name = "top";
		clonedTop.Parent = character;
		clonedTop.GetChildren().forEach((limb) => this.weldOutfitElementsToCharacter(limb as Model, character));

		const clonedBottom = playerBottom.Clone();
		clonedBottom.Name = "bottom";
		clonedBottom.Parent = character;
		clonedBottom.GetChildren().forEach((limb) => this.weldOutfitElementsToCharacter(limb as Model, character));
	};

	onInit() {
		const data = shared.FindFirstChild("data") as Folder;
		const outfits = data.FindFirstChild("outfits") as Folder;

		const tops = outfits.FindFirstChild("tops") as Folder;
		const bottoms = outfits.FindFirstChild("bottoms") as Folder;

		this.outfits = {
			tops: this.loadOutfits(tops),
			bottoms: this.loadOutfits(bottoms),
		};

		Functions.getCurrentTop.setCallback((player: Player) => {
			if (!this.outfits) {
				throw "this.outfits has been used before its intialization, request dropped";
			}

			const playerTop = this.outfits.tops[Outfit.choosenOutfit.top];

			if (!playerTop) {
				throw `didn't find top of name ${Outfit.choosenOutfit.top}`;
			}

			return playerTop;
		});

		Functions.getCurrentBottom.setCallback((player: Player) => {
			if (!this.outfits) {
				throw "this.outfits has been used before its intialization, request dropped";
			}

			const playerBottom = this.outfits.bottoms[Outfit.choosenOutfit.bottom];

			if (!playerBottom) {
				throw `didn't find bottom of name ${Outfit.choosenOutfit.bottom}`;
			}

			return playerBottom;
		});
	}

	onCharacterAdded(player: Player, character: Model): void {
		this.applyOutfit(player, character);
	}
}
