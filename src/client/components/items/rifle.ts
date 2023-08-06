import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { BaseItem } from "./base_item";

@Component({})
export class Rifle extends BaseItem implements OnStart {
	onStart() {}
}
