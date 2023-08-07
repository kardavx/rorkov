import { Controller, OnTick, OnStart } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { Players, SoundService, Debris } from "@rbxts/services";
import waitForSound from "shared/wait_for_sound";

type Sounds = Sound[];
interface MaterialSounds {
	[materialName: string]: Sounds;
}

@Controller({})
export class Footsteps implements OnStart, OnTick, OnCharacterAdded {
	static localPlayer = Players.LocalPlayer;
	static soundGroup = SoundService.WaitForChild("Footsteps");

	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;

	private lastStep = 0;
	private amplitude = 5;
	private lastSound: Sound | undefined = undefined;

	private materialSounds: MaterialSounds = {};

	getSound(): Sound {
		const materialSounds = this.materialSounds[this.humanoid!.FloorMaterial.Name];
		const sound: Sound = materialSounds[math.random(materialSounds.size()) - 1].Clone();

		return sound;
	}

	playSound() {
		let sound: Sound = this.getSound();
		while (this.lastSound && sound.Name === this.lastSound.Name) {
			sound = this.getSound();
		}
		this.lastSound = sound;

		sound.Parent = SoundService;
		waitForSound(sound);

		sound.Play();
		Debris.AddItem(sound, sound.TimeLength);
	}

	onTick() {
		if (!this.humanoid || this.humanoid.Health === 0 || this.humanoid.FloorMaterial === Enum.Material.Air) return;
		const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
		if (velocity < 0.1) return;

		const currentTick = os.clock();
		if (currentTick - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = currentTick;

		this.playSound();
	}

	onCharacterAdded(character: Model) {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
	}

	onStart() {
		const soundGroups = Footsteps.soundGroup.GetChildren() as SoundGroup[];

		soundGroups.forEach((soundGroup: SoundGroup) => {
			this.materialSounds[soundGroup.Name] = [];

			const sounds = soundGroup.GetChildren() as Sound[];

			sounds.forEach((sound: Sound) => {
				this.materialSounds[soundGroup.Name].push(sound);
			});
		});
	}
}
