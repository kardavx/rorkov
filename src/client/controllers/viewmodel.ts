import { Controller, OnInit } from "@flamework/core";
import { Canim } from "@rbxts/canim";
import { ReplicatedStorage as shared } from "@rbxts/services";

@Controller({})
export class Viewmodel implements OnInit {
	private viewmodel: Model | undefined;
	private temp: Folder = new Instance("Folder");

	private getViewmodel = (): Model => {
		const data = shared.FindFirstChild("data") as Folder;
		if (!data) throw `no data????`;

		const viewmodel = data.FindFirstChild("viewmodel") as Model;
		if (!viewmodel) throw `cos`;

		return viewmodel;
	};

	onInit() {
		this.temp.Name = "viewmodel_temp";

		this.viewmodel = this.getViewmodel().Clone();
		this.viewmodel.Name = "viewmodel";
		this.viewmodel.Parent = this.temp;
	}
}
