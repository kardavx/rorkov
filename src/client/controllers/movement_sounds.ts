import { Controller, Dependency, OnTick } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { SoundService } from "@rbxts/services";
import waitForSound from "shared/wait_for_sound";
import { lerp } from "shared/utilities/number_utility";
import { OnJump, OnRunningChanged } from "./movement";
import { Camera } from "./camera";

type MaterialSounds = {
	[materialName: string]: {
		[soundName: string]: number[];
	};
};

@Controller({})
export class MovementSounds implements OnTick, OnCharacterAdded, OnJump, OnRunningChanged {
	static maxTurnVolume = 2;
	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;
	private lastSoundId = 0;
	private lastStep = 0;
	private amplitude = 6;
	private turnSound: Sound | undefined = undefined;
	private turnSoundCooldown = false;
	private isRunning = false;
	private materialSounds: MaterialSounds = {
		Plastic: {
			Walk: [5682504255, 4817498373],
			Run: [0, 0],
			Jump: [14380892475],
			Land: [14380890500],
			Turn: [14380891843],
		},
	};

	private camera = Dependency<Camera>();

	createSound(soundId: number, volume: number): Sound {
		const sound = new Instance("Sound");
		sound.Volume = volume !== undefined ? volume : 1;
		sound.SoundId = `rbxassetid://${soundId}`;
		sound.Parent = SoundService;
		waitForSound(sound);

		return sound;
	}

	playSound(name: string, materialName?: string, volume?: number): Sound {
		volume = volume !== undefined ? volume : 10;
		materialName = materialName !== undefined ? materialName : "PLastic";
		const sounds = this.materialSounds[materialName] !== undefined ? this.materialSounds[materialName][name] : this.materialSounds.Plastic[name];
		const soundsArraySize = sounds.size();
		let soundId = sounds[math.random(soundsArraySize) - 1];

		while (soundsArraySize > 1 && soundId === this.lastSoundId) {
			task.wait();
			soundId = sounds[math.random(soundsArraySize) - 1];
		}
		this.lastSoundId = soundId;

		const sound = this.createSound(soundId, volume);
		sound.Play();
		task.delay(sound.TimeLength, () => {
			if (name === "Turn") this.turnSoundCooldown = false;
			if (sound && sound.Parent) sound.Destroy();
		});

		return sound;
	}

	onCharacterAdded(character: Model): void {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

		this.humanoid.StateChanged.Connect((oldValue: Enum.HumanoidStateType, newValue: Enum.HumanoidStateType) => {
			const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
			const currentTick = os.clock();

			if (this.humanoid!.GetState() === Enum.HumanoidStateType.Landed) {
				this.playSound("Land", this.humanoid!.FloorMaterial.Name, math.clamp(velocity / 10, 0.1, 10));
				this.lastStep = currentTick;
			}
		});
	}

	onJump(): void {
		const currentTick = os.clock();

		this.playSound("Jump", this.humanoid!.FloorMaterial.Name);
		this.lastStep = currentTick;
	}

	onTick(dt: number): void {
		if (!this.humanoid || this.humanoid.Health === 0) return;
		const floorMaterial = this.humanoid.FloorMaterial;
		if (floorMaterial === Enum.Material.Air) return;

		const deltaX = math.abs(this.camera.getRotationDelta().X);

		if (deltaX >= 5 && !this.turnSoundCooldown) {
			this.turnSoundCooldown = true;
			this.turnSound = this.playSound("Turn");
		}

		if (this.turnSound) this.turnSound.Volume = lerp(this.turnSound.Volume, math.clamp(deltaX * 5, 0, MovementSounds.maxTurnVolume), 10 * dt);

		const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
		if (velocity < 0.3) return;

		const currentTick = os.clock();
		if (currentTick - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = currentTick;

		this.playSound(this.isRunning ? "Run" : "Walk", floorMaterial.Name);
	}

	onRunningChanged(runningState: boolean): void {
		this.isRunning = runningState;
	}
}
