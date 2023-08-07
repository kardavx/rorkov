import { Controller, OnInit, OnTick } from "@flamework/core";
import { Players, SoundService, Debris } from "@rbxts/services";
import waitForSound from "shared/wait_for_sound";

@Controller({})
export class Footsteps implements OnInit, OnTick {
	static localPlayer = Players.LocalPlayer;
	static footSteepSounds = SoundService.WaitForChild("Footsteeps");

	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;

	private lastStep = 0;
	private amplitude = 5;

	playSound() {
		const sound = Footsteps.footSteepSounds.WaitForChild("Step").Clone() as Sound;
		sound.Parent = SoundService;
		waitForSound(sound)

		sound.Play();
		Debris.AddItem(sound, sound.TimeLength);
	}

	onTick() {
		if (!this.humanoid || this.humanoid.Health === 0 || this.humanoid.FloorMaterial === Enum.Material.Air) return;
		const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
		if (velocity < 0.1) return;

		const tick = os.clock();
		if (tick - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = tick;

		this.playSound();
	}

	onCharacterAdded(character: Model) {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
	}

	onInit() {
		if (Footsteps.localPlayer.Character) this.onCharacterAdded(Footsteps.localPlayer.Character);
		Footsteps.localPlayer.CharacterAdded.Connect((character: Model) => this.onCharacterAdded(character));
	}
}
