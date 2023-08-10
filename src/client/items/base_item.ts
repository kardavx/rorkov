import { Players, Workspace } from "@rbxts/services";
import { Spring } from "shared/math_utility";
import { Input } from "client/controllers/input";
import State from "shared/state";
import createViewmodel from "client/functions/items/create_viewmodel";
import { Bobbing } from "client/render_pipelines/nodes/bobbing";
import { Sway } from "client/render_pipelines/nodes/sway";
import { RenderPipeline } from "client/render_pipelines/render_pipeline";
import { Modifier } from "client/controllers/camera";

import { Alphas, Springs, EquippedItem, ViewmodelWithItem, Item, UpdatedSprings, Offsets, Actions } from "client/types/items";

export class BaseItem {
	static camera = Workspace.CurrentCamera;

	private states: string[] = ["equip", "unequip"];
	private blockingStates: string[] = ["equip", "unequip"];
	private springs: Springs = {
		Recoil: new Spring(1, 1, 1, 1),
		Sway: new Spring(1, 1, 1, 1),
	};

	private idle: AnimationTrack | undefined;
	private equipanim: AnimationTrack | undefined;
	private renderPipeline: RenderPipeline;
	private cameraModifier: Modifier;
	public character: Model | undefined;

	protected state: State;
	protected equippedItem: EquippedItem;

	//Inputs
	private testAction = (inputState: boolean) => {
		if (!inputState) return;

		print("testAction fired!");
	};

	private actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([[Enum.KeyCode.F, this.testAction]]);

	private getUpdatedSprings(dt: number) {
		const updatedSprings: UpdatedSprings = {};

		for (const [springName, springObject] of pairs(this.springs)) {
			updatedSprings[springName] = springObject.getOffset(dt);
		}

		return updatedSprings;
	}

	private createOffsets = (viewmodel: ViewmodelWithItem) => ({
		HumanoidRootPartToCameraBoneDistance: viewmodel.Torso.Position.Y - viewmodel.CameraBone.Position.Y,
	});

	private createAlphas = () => ({
		testAlpha: 0,
	});

	private createEquippedItem = (itemName: string) => {
		const viewmodel: ViewmodelWithItem = createViewmodel(itemName);
		const item: Item = viewmodel.item;
		const alphas: Alphas = this.createAlphas();
		const offsets: Offsets = this.createOffsets(viewmodel);

		return {
			viewmodel,
			item,
			alphas,
			offsets,
		};
	};

	private destroyEquippedItem = () => {
		this.equippedItem!.viewmodel.Destroy();
	};

	private bindActions = () => {
		this.actions.forEach((keycodeAction: (inputState: boolean) => void, keyCode: Enum.KeyCode) => {
			this.input.bindInput("Actions", keyCode.Name, keycodeAction, keyCode);
		});
	};

	public isAnyBlockingStateActive = (): boolean => {
		return this.state.isAnyActive(this.blockingStates);
	};

	constructor(
		private input: Input,
		private itemName: string,
		states: string[] = [],
		blockingStates: string[] = [],
		springs: Springs = {},
		actions: Actions = new Map(),
	) {
		this.states = [...this.states, ...states];
		this.blockingStates = [...this.blockingStates, ...blockingStates];
		this.springs = { ...this.springs, ...springs };
		this.state = new State(this.states);
		this.actions = new Map([...this.actions, ...actions]);
		this.renderPipeline = new RenderPipeline([Bobbing, Sway]);
		this.cameraModifier = Modifier.create("test", true);

		this.bindActions();
		this.equippedItem = this.createEquippedItem(this.itemName);

		task.spawn(() => {
			this.state.activateState("equip");

			const animator: Animator = this.equippedItem.viewmodel.AnimationController!.Animator;

			const idle = new Instance("Animation");
			idle.AnimationId = `rbxassetid://${14375693467}`;

			const humanoid = Players.LocalPlayer.Character!.WaitForChild("Humanoid") as Humanoid;
			const animatorhum = humanoid.FindFirstChild("Animator") as Animator;

			this.idle = animator.LoadAnimation(idle);
			const idle2 = animatorhum.LoadAnimation(idle);
			// this.equipanim = animator.LoadAnimation(equip);

			// this.equipanim.Play(0, 10, 1);
			this.idle.Play(0);
			idle2.Play(0);
			// this.equipanim.Stopped.Wait();

			this.state.disableState("equip");
		});
	}

	public destroy = (): void => {
		this.state.activateState("unequip");

		this.idle!.Stop(0);
		// this.equipanim!.Play(0, 10, -1);
		this.cameraModifier.destroy();
		this.destroyEquippedItem();

		this.state.disableState("unequip");
	};

	onRender = (dt: number): void => {
		// const updatedSprings: UpdatedSprings = this.getUpdatedSprings(dt);
		const baseCFrame = BaseItem.camera!.CFrame.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0));
		const humanoidRootPart = this.character !== undefined ? (this.character.FindFirstChild("HumanoidRootPart") as BasePart) : undefined;
		const velocity = humanoidRootPart !== undefined ? humanoidRootPart.AssemblyLinearVelocity.Magnitude : 0;

		const camCF = BaseItem.camera!.CFrame;

		this.equippedItem.viewmodel.PivotTo(baseCFrame);
		this.renderPipeline.preUpdate(dt, velocity, camCF);

		this.equippedItem.viewmodel.PivotTo(this.renderPipeline.update(dt, baseCFrame, velocity, camCF));
	};
}
