import { Controller, OnStart, OnInit } from "@flamework/core";
import { Canim } from "@rbxts/canim";

@Controller({})
export class Viewmodel implements OnStart, OnInit {
	private viewmodelAnimator = new Canim();
	private characterAnimator = new Canim();

	onInit() {}

	onStart() {}
}