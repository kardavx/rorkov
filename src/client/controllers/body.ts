import { Controller, OnRender, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Items, OnItemEquipped, OnItemUnequipped } from "./items";

@Controller({})
export class Body implements OnRender, OnItemEquipped, OnItemUnequipped, OnStart {
	static allBodyParts = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
	static bodyPartsToShow = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
	static bodyPartsToShowWithItemEquipped = ["Head", "Torso", "Left Leg", "Right Leg"];
	static modelsToShow = ["top", "bottom"];
	static player = Players.LocalPlayer;
	static test = "test"

	private currentBodyPartsShowState = Body.bodyPartsToShow;

	constructor(private items: Items) {}

	private resetTransparency = () => {
		const character = Body.player.Character;
		if (!character) return;
		Body.allBodyParts.forEach((bodyPart: string) => {
			const bodyPartObject = character.FindFirstChild(bodyPart) as BasePart;
			if (!bodyPartObject) return;
			bodyPartObject.LocalTransparencyModifier = 1;
		});
	};

	onRender(dt: number): void {
		const character = Body.player.Character;
		if (!character) return;
		this.currentBodyPartsShowState.forEach((bodyPart: string) => {
			const bodyPartObject = character.FindFirstChild(bodyPart) as BasePart;
			if (!bodyPartObject) return;
			bodyPartObject.LocalTransparencyModifier = 0;
		});

		Body.modelsToShow.forEach((model: string) => {
			const modelObject = character.FindFirstChild(model) as Model;
			if (!modelObject) return;

			modelObject.GetChildren().forEach((limb) => {
				if (!limb.IsA("Model")) return;

				limb.GetDescendants().forEach((descendant) => {
					if (!descendant.IsA("BasePart")) return;
					descendant.LocalTransparencyModifier =
						this.currentBodyPartsShowState.find((bodyPart: string) => bodyPart === limb.Name) !== undefined ? 0 : 1;
				});
			});
		});
	}

	onItemEquipped(): void {
		this.currentBodyPartsShowState = Body.bodyPartsToShowWithItemEquipped;
		this.resetTransparency();
	}

	onItemUnequipped(): void {
		this.currentBodyPartsShowState = Body.bodyPartsToShow;
		this.resetTransparency();
	}

	onStart(): void {
		if (this.items.isEquipped()) {
			this.currentBodyPartsShowState = Body.bodyPartsToShowWithItemEquipped;
			this.resetTransparency();
		}
	}
}
