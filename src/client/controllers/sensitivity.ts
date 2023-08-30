import { Controller, OnTick } from "@flamework/core";

export class Modifier {}

@Controller({})
export class Sensitivity implements OnTick {
	onTick(dt: number): void {}
}
