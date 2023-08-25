import { Workspace } from "@rbxts/services";
import { VectorSpring } from "shared/Spring/spring";
import { Input } from "client/controllers/input";
import State from "shared/state";
import createViewmodel from "client/functions/items/create_viewmodel";
import { Bobbing } from "client/render_pipelines/nodes/bobbing";
import { RenderPipeline } from "client/render_pipelines/render_pipeline";
import { Modifier } from "client/controllers/camera";
import { Dependency } from "@flamework/core";
import { Sway } from "client/render_pipelines/nodes/sway";
import { MoveSway } from "client/render_pipelines/nodes/move_sway";
import { Jump } from "client/render_pipelines/nodes/jump";
import { lerp } from "shared/utilities/number_utility";
import { Aim } from "client/render_pipelines/nodes/aim";

import { Alphas, Springs, EquippedItem, ViewmodelWithItem, Item, Offsets, Actions } from "client/types/items";
import { InputType } from "client/types/input";
import { Obstruction } from "client/render_pipelines/nodes/obstruction";
import { configs, ItemConfig } from "shared/configurations/items";
import { Slide } from "client/render_pipelines/nodes/slide";

let ischambered = false;

export class BaseItem {
	static camera = Workspace.CurrentCamera;

	private states: string[] = ["equip", "unequip", "magCheck", "reload", "aiming"];
	private blockingStates: string[] = ["equip", "unequip", "magCheck", "reload"];
	private springs: Springs = {
		Sway: new VectorSpring(1, 20, 60, undefined, undefined, undefined, {
			x: new NumberRange(-Sway.maxSway, Sway.maxSway),
			y: new NumberRange(-Sway.maxSway, Sway.maxSway),
		}),
		Jump: new VectorSpring(3, 20, 60),
	};

	private idle: AnimationTrack | undefined;
	private run: AnimationTrack | undefined;
	private equipanim: AnimationTrack | undefined;
	private renderPipeline: RenderPipeline;
	private cameraModifier: Modifier;
	private isRunning = false;
	private targetXAxisFactor = 1;
	private currentXAxisFactor = this.targetXAxisFactor;
	public character: Model | undefined;

	protected equippedItem: EquippedItem;

	private input = Dependency<Input>();

	//Inputs
	private magCheck = (inputState: boolean) => {
		if (!inputState || this.isAnyBlockingStateActive()) return;

		this.equippedItem.state.activateState("magCheck");

		const animator: Animator = this.equippedItem.viewmodel.AnimationController!.Animator;

		const magcheck = new Instance("Animation");
		magcheck.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.magCheck.id}`;

		const animationmc = animator.LoadAnimation(magcheck);
		animationmc.Play();
		animationmc.Stopped.Wait();

		this.equippedItem.state.disableState("magCheck");
	};

	private reload = (inputState: boolean) => {
		if (!inputState || this.isAnyBlockingStateActive()) return;

		this.equippedItem.state.activateState("reload");

		const animator: Animator = this.equippedItem.viewmodel.AnimationController!.Animator;

		const reload = new Instance("Animation");
		reload.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.reload.id}`;

		const animationmc = animator.LoadAnimation(reload);
		animationmc.Play();
		animationmc.Stopped.Wait();

		this.equippedItem.state.disableState("reload");
	};

	private aim = (inputState: boolean) => {
		inputState ? this.equippedItem.state.activateState("aiming") : this.equippedItem.state.disableState("aiming");
	};

	private shoot = () => {
		if (this.equippedItem.item.Grip.Slide) {
			this.equippedItem.slide.targetSlideOffset = new Vector3(this.equippedItem.configuration.properties.slideMoveBack as number, 0, 0);
			task.wait(0.1);
			this.equippedItem.slide.targetSlideOffset = new Vector3(0, 0, 0);
		}
	};

	private actions = new Map<
		string,
		{
			keyCode: Enum.KeyCode | Enum.UserInputType.MouseButton1 | Enum.UserInputType.MouseButton2;
			action: (inputState: boolean) => void;
			inputType?: InputType;
			modifierKeys?: Enum.ModifierKey[];
		}
	>([
		["magCheck", { keyCode: Enum.KeyCode.R, action: this.magCheck, inputType: "Click", modifierKeys: [Enum.ModifierKey.Alt] }],
		["reload", { keyCode: Enum.KeyCode.R, action: this.reload, inputType: "Click" }],
		[
			"aim",
			{
				keyCode: Enum.UserInputType.MouseButton2,
				action: this.aim,
			},
		],
		["shoot", { keyCode: Enum.UserInputType.MouseButton1, action: this.shoot, inputType: "Click" }],
	]);

	private createOffsets = (viewmodel: ViewmodelWithItem) => ({
		HumanoidRootPartToCameraBoneDistance: viewmodel.Torso.Position.Y - viewmodel.CameraBone.Position.Y,
		...(viewmodel.item.Muzzle && { GripToMuzzleDistance: math.abs(viewmodel.item.Muzzle.Position.Y - viewmodel.item.Grip.Position.Y) }),
	});

	private createAlphas = () => ({
		testAlpha: 0,
	});

	private createEquippedItem = (itemName: string): EquippedItem => {
		const viewmodel: ViewmodelWithItem = createViewmodel(itemName);
		const item: Item = viewmodel.item;
		const alphas: Alphas = this.createAlphas();
		const offsets: Offsets = this.createOffsets(viewmodel);
		const springs = this.springs;
		const state = new State(this.states);
		const blockingStates = this.blockingStates;
		const configuration = configs.get(itemName) as ItemConfig;
		const slide = {
			targetSlideOffset: Vector3.zero,
			currentSlideOffset: Vector3.zero,
		};

		return {
			viewmodel,
			item,
			alphas,
			offsets,
			springs,
			state,
			configuration,
			slide,
			blockingStates,
		};
	};

	private destroyEquippedItem = () => {
		this.equippedItem!.viewmodel.Destroy();
	};

	private bindActions = () => {
		this.actions.forEach(({ keyCode, action, inputType = "Default", modifierKeys = [] }, actionName: string) => {
			this.input.bindAction(actionName, keyCode, 10, inputType, modifierKeys, action);
		});
	};

	private unbindActions = () => {
		this.actions.forEach((_, actionName: string) => {
			this.input.unbindAction(actionName);
		});
	};

	public isAnyBlockingStateActive = (): boolean => {
		return this.equippedItem.state.isAnyActive(this.blockingStates);
	};

	constructor(public itemName: string, states: string[] = [], blockingStates: string[] = [], springs: Springs = {}, actions: Actions = new Map()) {
		this.states = [...this.states, ...states];
		this.blockingStates = [...this.blockingStates, ...blockingStates];
		this.springs = { ...this.springs, ...springs };
		this.actions = new Map([...this.actions]);
		this.renderPipeline = new RenderPipeline([Aim, Bobbing, MoveSway, Sway, Jump, Obstruction, Slide]);
		this.cameraModifier = Modifier.create("test", true);

		this.bindActions();
		this.equippedItem = this.createEquippedItem(this.itemName);

		this.renderPipeline.initialize(this.character, this.equippedItem);

		task.spawn(() => {
			this.equippedItem.state.activateState("equip");

			const animator: Animator = this.equippedItem.viewmodel.AnimationController!.Animator;

			const idle = new Instance("Animation");
			idle.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.idle.id}`;

			const equip = new Instance("Animation");
			equip.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.equip.id}`;

			const chambertoready = new Instance("Animation");
			chambertoready.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.chamberToReady.id}`;

			const run = new Instance("Animation");
			run.AnimationId = `rbxassetid://${this.equippedItem.configuration.animations.run.id}`;

			this.idle = animator.LoadAnimation(idle);
			this.equipanim = animator.LoadAnimation(equip);
			this.run = animator.LoadAnimation(run);
			this.run.Priority = Enum.AnimationPriority.Action2;
			this.run.AdjustWeight(5, 0);

			const animationctr = animator.LoadAnimation(chambertoready);

			if (!ischambered) {
				ischambered = true;
				animationctr.Play(0, 10, 1);
				this.idle.Play(0);
				animationctr.Stopped.Wait();

				this.equippedItem.state.disableState("equip");
			} else {
				this.equipanim.Play(0, undefined, 1);
				this.idle.Play(0);
				this.equipanim.Stopped.Wait();

				this.equippedItem.state.disableState("equip");
			}
		});
	}

	public destroy = (): void => {
		this.equippedItem.state.activateState("unequip");

		this.idle!.Stop(0);
		this.equipanim!.Play(0, undefined, -1);
		this.equipanim!.Stopped.Wait();
		this.unbindActions();
		this.cameraModifier.destroy();
		this.destroyEquippedItem();

		this.equippedItem.state.disableState("unequip");
	};

	onJump(): void {
		print("jumped");
		this.springs.Jump.impulse(new Vector3(-3, -5, 0));
	}

	onRunningChanged(runningState: boolean): void {
		if (!this.run) return;

		this.isRunning = runningState;
		runningState ? this.run.Play(0.2) : this.run.Stop(0.2);

		if (runningState) {
			this.targetXAxisFactor = 0;
		} else {
			this.targetXAxisFactor = 1;
		}
	}

	onRender = (dt: number): void => {
		if (!this.character) return;

		const lookVector = BaseItem.camera!.CFrame.LookVector;
		this.currentXAxisFactor = lerp(this.currentXAxisFactor, this.targetXAxisFactor, 0.08);
		const baseCFrame = CFrame.lookAt(
			BaseItem.camera!.CFrame.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0)).Position,
			BaseItem.camera!.CFrame.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0)).Position.add(
				lookVector.mul(new Vector3(1, this.currentXAxisFactor, 1)),
			),
		);

		this.equippedItem.viewmodel.PivotTo(baseCFrame);
		this.renderPipeline.preUpdate(dt, this.character, this.equippedItem);

		this.equippedItem.viewmodel.PivotTo(this.renderPipeline.update(dt, baseCFrame, this.character, this.equippedItem));
	};
}
