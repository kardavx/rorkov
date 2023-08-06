import { Controller, OnInit, OnRender } from "@flamework/core";
import { Players, SoundService, Debris } from "@rbxts/services";

@Controller({})
export class Footsteeps implements OnInit, OnRender {
	static localPlayer = Players.LocalPlayer;
	static footSteepSounds = SoundService.WaitForChild("Footsteeps");

	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;

	private lastStep = 0;
	private amplitude = 5;

	playSound(): void {
		const sound = Footsteeps.footSteepSounds.WaitForChild("Step").Clone() as Sound;
		sound.Parent = SoundService;
		while (sound.TimeLength === 0) task.wait(); // pewnie nie wiesz po chuj to ale trzeba poczekac az sie sound zaladuje

		sound.Play();
		Debris.AddItem(sound, sound.TimeLength);
	}

	onRender(dt: number): void {
		if (!this.humanoid || this.humanoid.Health === 0 || this.humanoid.FloorMaterial === Enum.Material.Air) return;
		const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
		if (velocity < 0.1) return;

		const now = os.clock();
		if (now - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = now;

		this.playSound();
	}

	onCharacterAdded(character: Model) {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
	}

	onInit(): void {
		if (Footsteeps.localPlayer.Character) this.onCharacterAdded(Footsteeps.localPlayer.Character);
		Footsteeps.localPlayer.CharacterAdded.Connect((character: Model) => this.onCharacterAdded(character));
	}
}
