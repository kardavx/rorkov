import { Controller, OnStart } from "@flamework/core";
import { DataStoreService } from "@rbxts/services";
import { Players } from "@rbxts/services";

const dataStore = DataStoreService.GetDataStore("GameData");

@Controller({})
export class DataStore {}
