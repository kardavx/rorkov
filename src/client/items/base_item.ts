import { Players, Workspace } from "@rbxts/services";
import { VectorSpring } from "shared/Spring/spring";
import { Input } from "client/controllers/input";
import State from "shared/state";
import createViewmodel from "client/functions/items/create_viewmodel";
import { Bobbing } from "client/render_pipelines/nodes/bobbing";
import { RenderPipeline } from "client/render_pipelines/render_pipeline";
import { Camera, Modifier } from "client/controllers/camera";
import { Dependency } from "@flamework/core";
import { Sway } from "client/render_pipelines/nodes/sway";
import { MoveSway } from "client/render_pipelines/nodes/move_sway";
import { Jump } from "client/render_pipelines/nodes/jump";
import { lerp } from "shared/utilities/number_utility";
import { Aim } from "client/render_pipelines/nodes/aim";
import { Recoil } from "client/render_pipelines/nodes/recoil";
import { Land } from "client/render_pipelines/nodes/land";
import { Fall } from "client/render_pipelines/nodes/fall";

import { Alphas, Springs, EquippedItem, ViewmodelWithItem, Item, Offsets, Actions } from "client/types/items";
import { InputType } from "client/types/input";
import { Obstruction } from "client/render_pipelines/nodes/obstruction";
import { ItemConfig } from "shared/configurations/items";
import { Slide } from "client/render_pipelines/nodes/slide";
import { Projectors } from "client/render_pipelines/nodes/projectors";
import { OnJump, OnLand, OnRunningChanged } from "client/controllers/movement";
import Tween from "shared/variableTween";
import { RunWithJump } from "client/render_pipelines/nodes/run_with_jump";
import { Breathing } from "client/render_pipelines/nodes/breathing";

import { CanimTrack } from "@rbxts/canim";
import { Animation } from "client/controllers/animation";

const ischambered = false;

export class BaseItem implements OnJump, OnRunningChanged, OnLand {
	static camera = Workspace.CurrentCamera;

	private states: string[] = ["equip", "unequip", "magCheck", "reload", "chamberCheck"];
	private blockingStates: string[] = ["equip", "unequip", "magCheck", "reload", "chamberCheck"];
	private springs: Springs = {
		Sway: new VectorSpring(1, 20, 60, undefined, undefined, undefined, {
			x: new NumberRange(-Sway.maxSway, Sway.maxSway),
			y: new NumberRange(-Sway.maxSway, Sway.maxSway),
		}),
		Jump: new VectorSpring(9.4, 100, 300),
		Land: new VectorSpring(9.4, 100, 400),
		Recoil: new VectorSpring(1, 28, 200),
	};

	private renderPipeline: RenderPipeline;
	private cameraModifier: Modifier;
	private targetXAxisFactor = 1;
	private currentXAxisFactor = this.targetXAxisFactor;
	public character: Model | undefined;

	protected equippedItem: EquippedItem;

	private input = Dependency<Input>();
	private camera = Dependency<Camera>();
	private animation = Dependency<Animation>();

	//Inputs
	private magCheck = (inputState: boolean) => {
		if (!inputState || this.isAnyBlockingStateActive()) return;

		this.equippedItem.state.activateState("magCheck");

		const magCheck = this.animation.playAnimation(`${this.itemName}/magCheck`);
		if (magCheck) magCheck.finished.Wait();

		this.equippedItem.state.disableState("magCheck");
	};

	private chamberCheck = (inputState: boolean) => {
		if (!inputState || this.isAnyBlockingStateActive()) return;

		this.equippedItem.state.activateState("chamberCheck");

		const chamberCheck = this.animation.playAnimation(`${this.itemName}/chamberCheck`);
		if (chamberCheck) chamberCheck.finished.Wait();

		this.equippedItem.state.disableState("chamberCheck");
	};

	private reload = (inputState: boolean) => {
		if (!inputState || this.isAnyBlockingStateActive()) return;

		this.equippedItem.state.activateState("reload");

		const reload = this.animation.playAnimation(`${this.itemName}/reload`);
		if (reload) reload.finished.Wait();

		this.equippedItem.state.disableState("reload");
	};

	private aim = (inputState: boolean) => {
		inputState ? this.equippedItem.state.activateState("aiming") : this.equippedItem.state.disableState("aiming");
	};

	private shoot = () => {
		this.springs.Recoil.impulse(new Vector3(6, math.random(-3, 3), 0));

		if (this.equippedItem.item.Grip.Slide) {
			const direction = this.equippedItem.configuration.properties.slideDirection as Vector3;
			this.equippedItem.slide.targetSlideOffset = direction.mul(this.equippedItem.configuration.properties.slideMoveBack as number);
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
		["magCheck", { keyCode: Enum.KeyCode.T, action: this.magCheck, inputType: "Click", modifierKeys: [Enum.ModifierKey.Alt] }],
		["chamberCheck", { keyCode: Enum.KeyCode.T, action: this.chamberCheck, inputType: "Click", modifierKeys: [Enum.ModifierKey.Shift] }],
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

	private createEquippedItem = (itemName: string, itemConfiguration: ItemConfig): EquippedItem => {
		const viewmodel: ViewmodelWithItem = createViewmodel(itemName);
		const item: Item = viewmodel.item;
		const alphas: Alphas = {};
		const offsets: Offsets = this.createOffsets(viewmodel);
		const springs = this.springs;
		const state = new State(this.states);
		const blockingStates = this.blockingStates;
		const configuration = itemConfiguration;
		const runWithJumpOffset = false;
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
			runWithJumpOffset,
			blockingStates,
		};
	};

	private destroyEquippedItem = () => {
		this.equippedItem!.viewmodel.Destroy();
	};

	private bindStateToAlpha = () => {
		const registeredStates = this.equippedItem.state.getRegisteredStates();
		if (!registeredStates) return;
		registeredStates.forEach((state: string) => {
			this.equippedItem.alphas[state] = this.equippedItem.state.isStateActive(state) ? 1 : 0;

			const stateIdentificator = `${state}/state_to_alpha`;
			const tweenInfo = new TweenInfo(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
			this.equippedItem.state.bindToStateChanged(state, (stateActive: boolean) => {
				const tween = Tween.create(stateIdentificator, this.equippedItem.alphas[state], tweenInfo, stateActive ? 1 : 0);
				tween.play((newValue) => (this.equippedItem.alphas[state] = newValue as number));
			});
		});
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

	constructor(
		public itemName: string,
		itemConfiguration: ItemConfig,
		states: string[] = [],
		blockingStates: string[] = [],
		springs: Springs = {},
		actions: Actions = new Map(),
	) {
		this.states = [...this.states, ...states];
		this.blockingStates = [...this.blockingStates, ...blockingStates];
		this.springs = { ...this.springs, ...springs };
		this.actions = new Map([...this.actions]);
		this.renderPipeline = new RenderPipeline([
			Aim,
			Bobbing,
			MoveSway,
			Sway,
			Jump,
			Land,
			Fall,
			Obstruction,
			Slide,
			Recoil,
			Projectors,
			RunWithJump,
			Breathing,
		]);
		this.cameraModifier = Modifier.create("test", true);

		this.bindActions();
		this.equippedItem = this.createEquippedItem(this.itemName, itemConfiguration);
		this.bindStateToAlpha();

		this.renderPipeline.initialize(this.character, this.equippedItem);

		task.spawn(() => {
			this.equippedItem.state.activateState("equip");

			if (!ischambered) {
				const chamberToReady = this.animation.playAnimation(`${itemName}/chamberToReady`);
				this.animation.playAnimation(`${itemName}/idle`);
				if (chamberToReady) chamberToReady.finished.Wait();

				this.equippedItem.state.disableState("equip");
			} else {
				const equip = this.animation.playAnimation(`${itemName}/equip`);
				this.animation.playAnimation(`${itemName}/idle`);
				if (equip) equip.finished.Wait();

				this.equippedItem.state.disableState("equip");
			}
		});
	}

	public destroy = (): void => {
		this.equippedItem.state.activateState("unequip");

		this.animation.stopAnimation(`${this.itemName}/idle`);
		this.unbindActions();
		this.cameraModifier.destroy();
		this.destroyEquippedItem();

		this.equippedItem.state.disableState("unequip");
	};

	onJump(wasRunning: boolean): void {
		if (wasRunning) this.equippedItem.runWithJumpOffset = true;
		this.springs.Jump.impulse(new Vector3(-2, -1, 2));
	}

	onLand(fallTime: number): void {
		this.equippedItem.runWithJumpOffset = false;
		this.springs.Land.impulse(new Vector3(-2, -1, 2).mul(math.clamp(fallTime, 0.7, 3)));
	}

	onRunningChanged(runningState: boolean): void {
		if (runningState) {
			this.targetXAxisFactor = 0;
			this.animation.playAnimation(`${this.itemName}/run`);
		} else {
			this.targetXAxisFactor = 1;
			this.animation.stopAnimation(`${this.itemName}/run`);
		}
	}

	onRender = (dt: number): void => {
		if (!this.character) return;

		const rawCameraCFrame = this.camera.getRawCFrame();

		const lookVector = rawCameraCFrame.LookVector;
		this.currentXAxisFactor = lerp(this.currentXAxisFactor, this.targetXAxisFactor, 0.08);
		const baseCFrame = CFrame.lookAt(
			rawCameraCFrame.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0.43)).Position,
			rawCameraCFrame
				.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0.43))
				.Position.add(lookVector.mul(new Vector3(1, this.currentXAxisFactor, 1))),
		);

		this.equippedItem.viewmodel.PivotTo(baseCFrame);

		this.renderPipeline.preUpdate(dt, this.character, this.equippedItem);
		this.equippedItem.viewmodel.PivotTo(this.renderPipeline.update(dt, baseCFrame, this.character, this.equippedItem));
		this.renderPipeline.postUpdate(dt, this.character, this.equippedItem);
	};
}
