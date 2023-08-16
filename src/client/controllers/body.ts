import { Controller, OnRender } from "@flamework/core";
import { Players } from "@rbxts/services";
import { OnItemEquipped, OnItemUnequipped } from "./items";

@Controller({})
export class Body implements OnRender, OnItemEquipped, OnItemUnequipped {
	static allBodyParts = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
	static bodyPartsToShow = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
	static bodyPartsToShowWithItemEquipped = ["Head", "Torso", "Left Leg", "Right Leg"];
	static player = Players.LocalPlayer;

	private currentBodyPartsShowState = Body.bodyPartsToShow;

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
	}

	onItemEquipped(): void {
		this.currentBodyPartsShowState = Body.bodyPartsToShowWithItemEquipped;
		this.resetTransparency();
	}

	onItemUnequipped(): void {
		this.currentBodyPartsShowState = Body.bodyPartsToShow;
		this.resetTransparency();
	}
}
