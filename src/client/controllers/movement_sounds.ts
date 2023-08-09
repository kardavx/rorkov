import { Controller, OnStart, OnTick } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { ReplicatedStorage, SoundService, Debris, Workspace } from "@rbxts/services";
import waitForSound from "shared/wait_for_sound";

type MaterialSounds = {
	[materialName: string]: {
		[soundName: string]: number[];
	};
};

@Controller({})
export class MovementSounds implements OnStart, OnTick, OnCharacterAdded {
	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;
	private lastSoundId = 0;
	private lastStep = 0;
	private amplitude = 6;
	private oldCamLV = Vector3.zero;
	private camera = Workspace.CurrentCamera;

	private materialSounds: MaterialSounds = {
		Plastic: {
			Step: [5682504255, 988593556],
			Jump: [8025268823],
			Land: [268933900],
		},
	};

	lerp(a: number, b: number, c: number) {
		return a + (b - a) * c;
	}

	createSound(soundId: number, volume: number, parent: Instance, looped?: boolean) {
		const sound = new Instance("Sound");
		sound.Volume = volume !== undefined ? volume : 1;
		sound.Looped = looped !== undefined ? looped : false;
		sound.SoundId = `rbxassetid://${soundId}`;
		sound.Parent = parent || SoundService;
		waitForSound(sound);

		return sound;
	}

	private rattleSound: Sound = this.createSound(7405488042, 1, SoundService, true);

	playSound(name: string, materialName: string, volume?: number) {
		volume = volume !== undefined ? volume : 1;
		const sounds = this.materialSounds[materialName] !== undefined ? this.materialSounds[materialName][name] : this.materialSounds.Plastic[name];
		const soundsArraySize = sounds.size();
		let soundId = sounds[math.random(soundsArraySize) - 1];

		while (soundsArraySize > 1 && soundId === this.lastSoundId) {
			task.wait();
			soundId = sounds[math.random(soundsArraySize) - 1];
		}
		this.lastSoundId = soundId;

		const sound = this.createSound(soundId, volume, SoundService);
		sound.Play();
		Debris.AddItem(sound, sound.TimeLength);
	}

	onCharacterAdded(character: Model): void {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

		this.humanoid.StateChanged.Connect((oldValue: Enum.HumanoidStateType, newValue: Enum.HumanoidStateType) => {
			const currentTick = os.clock();
			if (this.humanoid!.GetState() === Enum.HumanoidStateType.Jumping) this.playSound("Jump", this.humanoid!.FloorMaterial.Name);
			this.lastStep = currentTick;

			const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;

			if (this.humanoid!.GetState() === Enum.HumanoidStateType.Landed) {
				this.playSound("Land", this.humanoid!.FloorMaterial.Name, math.clamp(velocity / 10, 0.1, 10));
				this.lastStep = currentTick;
			}
		});
	}

	onTick(dt: number): void {
		if (!this.humanoid || this.humanoid.Health === 0) return;
		const camLV = this.camera!.CFrame.LookVector;

		let angle = math.deg(math.acos(camLV.Dot(this.oldCamLV)));
		if (angle !== angle) angle = 0;
		this.rattleSound.Volume = this.lerp(this.rattleSound.Volume, math.clamp(angle, 0.1, 10), 10 * dt);
		this.oldCamLV = camLV;

		const floorMaterial = this.humanoid.FloorMaterial;
		if (floorMaterial === Enum.Material.Air) return;

		const velocity = this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude;
		if (velocity < 0.1) return;

		const currentTick = os.clock();
		if (currentTick - this.lastStep < this.amplitude / velocity) return;
		this.lastStep = currentTick;

		this.playSound("Step", floorMaterial.Name);
	}

	onStart(): void {
		this.rattleSound.Play();
	}
}
