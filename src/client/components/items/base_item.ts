import { Component, BaseComponent } from "@flamework/components";

interface Attributes {}

@Component({})
export class BaseItem extends BaseComponent<Attributes> {
	onStart() {}
}
