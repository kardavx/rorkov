import { UUID } from "shared/uuid";
import { Signal, Connection } from "@rbxts/beacon";

type StateName = string;
type SignalReturn = boolean;

type States = StateName[];
type ChangedCallback = (state: boolean) => void;
type ChangedSignals = { [stateName in StateName]: SignalWithConnetions | undefined };

interface SignalWithConnetions {
	signal: Signal<SignalReturn>;
	connections: SignalConnections;
}

interface SignalConnections {
	[UUID: UUID]: Connection<SignalReturn> | undefined;
}
