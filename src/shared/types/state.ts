import { UUID } from "shared/uuid";
import { Connection } from "@rbxts/beacon";
import { Signal } from "@rbxts/beacon";

export type StateName = string;
export type SignalReturn = boolean;

export type States = StateName[];
export type ChangedCallback = (state: boolean) => void;
export type ChangedSignals = { [stateName in StateName]: SignalWithConnetions | undefined };

export interface SignalWithConnetions {
	signal: Signal<SignalReturn>;
	connections: SignalConnections;
}

export interface SignalConnections {
	[UUID: UUID]: Connection<SignalReturn> | undefined;
}
