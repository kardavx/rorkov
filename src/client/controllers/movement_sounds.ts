import { Controller, Dependency, OnRender, OnTick } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { SoundService } from "@rbxts/services";
import waitForSound from "shared/wait_for_sound";
import { lerp } from "shared/utilities/number_utility";
import { OnJump, OnLand, OnRunningChanged } from "./movement";
import { Camera } from "./camera";
import { Shobnode } from "client/shobnode";

Shobnode.setup();

type MaterialSounds = {
	[materialName: string]: {
		[soundName: string]: number[];
	};
};

@Controller({})
export class MovementSounds implements OnTick, OnCharacterAdded, OnJump, OnLand, OnRunningChanged, OnRender {
	static maxTurnVolume = 1.4;
	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;
	private lastSoundId = 0;
	private lastStep = 0;
	private amplitude = 6;
	private turnSound: Sound | undefined = undefined;
	private turnSoundCooldown = false;
	private isRunning = false;
	private currentlyPlaying: string[] = [];
	private materialSounds: MaterialSounds = {
		Plastic: {
			Walk: [14645467477, 14645467634, 14645467806, 14645468759, 14645468432],
			Run: [14645468940, 14645469109, 14645469252, 14645469591, 14645469807],
			Jump: [14645470347, 14645470514],
			Land: [14645469401, 14645470070, 14645470230],
			Turn: [14645468029, 14645468244, 14645468608],
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

	playSound(name: string, materialName = "Plastic", volume = 10): Sound {
		const sounds = this.materialSounds[materialName] !== undefined ? this.materialSounds[materialName][name] : this.materialSounds.Plastic[name];
		const soundsArraySize = sounds.size();
		let soundIndex = math.random(soundsArraySize) - 1;
		let soundId = sounds[soundIndex];

		while (soundsArraySize > 1 && soundId === this.lastSoundId) {
			task.wait();
			soundIndex = math.random(soundsArraySize) - 1;
			soundId = sounds[soundIndex];
		}
		this.lastSoundId = soundId;

		this.currentlyPlaying.push(`${materialName}/${name}${soundIndex} ${volume}`);
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
	}

	onJump(): void {
		const currentTick = os.clock();

		this.playSound("Jump", this.humanoid!.FloorMaterial.Name);
		this.lastStep = currentTick;
	}

	onLand(fallTime: number): void {
		const currentTick = os.clock();

		this.playSound("Land", this.humanoid!.FloorMaterial.Name, math.clamp(fallTime, 1, 3));
		this.lastStep = currentTick;
	}

	onTick(dt: number): void {
		if (!this.humanoid || this.humanoid.Health === 0 || !this.humanoidRootPart) return;
		const floorMaterial = this.humanoid.FloorMaterial;
		if (floorMaterial === Enum.Material.Air) return;

		const velocity = this.humanoidRootPart.AssemblyLinearVelocity.Magnitude;

		if (velocity < 1) {
			const deltaX = math.abs(this.camera.getRotationDelta().X);

			if (deltaX >= 20 && !this.turnSoundCooldown) {
				this.turnSoundCooldown = true;
				this.turnSound = this.playSound("Turn");
			}

			if (this.turnSound) this.turnSound.Volume = lerp(this.turnSound.Volume, math.clamp(deltaX * 5, 0, MovementSounds.maxTurnVolume), 10 * dt);
		}

		if (velocity < 0.3) return;

		const currentTick = os.clock();
		if (currentTick - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = currentTick;

		this.playSound(this.isRunning ? "Run" : "Walk", floorMaterial.Name);
	}

	onRender(dt: number): void {
		Shobnode.display_node(93412, new UDim2(0, 0, 0, 0), this.currentlyPlaying);
	}

	onRunningChanged(runningState: boolean): void {
		this.isRunning = runningState;
	}
}
