import { Controller, OnStart, OnRender } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { RunService } from "@rbxts/services";
import { Lighting } from "@rbxts/services";

@Controller({})
export class Przycisk implements OnStart, OnRender {
	onRender(dt: number): void {}
	onStart(): void {}
}
