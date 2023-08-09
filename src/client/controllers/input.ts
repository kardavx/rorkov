import { Controller, OnTick, OnInit } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";

@Controller({})
export class Input implements OnTick, OnInit {
	onInit(): void {
		ContextActionService.UnbindAllActions();
	}

	onTick(dt: number): void {}
}
