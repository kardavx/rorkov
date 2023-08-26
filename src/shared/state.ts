import { log } from "./log_message";
import { generateUUID, UUID } from "./uuid";
import { Signal } from "@rbxts/beacon";
import { validateType } from "./utilities/types_utility";
import object from "./object";
import { States, ChangedSignals, StateName, SignalConnections, SignalWithConnetions, SignalReturn, ChangedCallback } from "./types/state";

import loggerLocalizations from "./localization/log/state";
import errorLocalizations from "./localization/error/state";

export default class State {
	private states: States = [];
	private changedSignals: ChangedSignals = {};

	/**
	 * State Machine
	 *
	 * @param statesAllowed Defines the states that can be set as active, allows all states if not defined
	 */
	constructor(private statesAllowed?: States) {}

	private formatLogMessage(messageFormat: string, stateName?: StateName) {
		return stateName !== undefined ? string.format(messageFormat, stateName as StateName) : messageFormat;
	}

	private sendToLogger(localization: LoggerLocalization, stateName?: StateName) {
		log(localization[0], this.formatLogMessage(localization[1], stateName));
	}

	private getOrCreateChangedSignal(stateName: StateName): SignalWithConnetions {
		if (!this.changedSignals[stateName]) {
			this.changedSignals[stateName] = { signal: new Signal<SignalReturn>(), connections: {} };
		}

		return this.changedSignals[stateName] as SignalWithConnetions;
	}

	private throwError(errorMessage: ErrorMessage, stateName?: StateName) {
		throw this.formatLogMessage(errorMessage, stateName);
	}

	private isStateValid(stateName: StateName): boolean {
		if (!this.statesAllowed) return true;

		const isAllowed = this.statesAllowed.find((allowedState: StateName) => allowedState === stateName) !== undefined;

		return isAllowed;
	}

	private getSignalWithConnectionsFromUUID(UUID: UUID): [StateName, SignalWithConnetions] | undefined {
		for (const [stateName, signalWithConnections] of pairs(this.changedSignals)) {
			if (signalWithConnections.connections![UUID] !== undefined) {
				return [stateName, signalWithConnections];
			}
		}

		return undefined;
	}

	isStateActive = (stateName: StateName): boolean => {
		if (!this.isStateValid(stateName)) {
			this.sendToLogger(loggerLocalizations.tryingToCheckForStateThatIsntAllowed, stateName);
		}

		return this.states.find((activeState: StateName) => activeState === stateName) !== undefined;
	};

	isAnyActive = (stateNames: StateName[]): boolean => {
		for (const stateName of stateNames) {
			if (this.isStateActive(stateName)) {
				return true;
			}
		}

		return false;
	};

	activateState = (stateName: StateName) => {
		if (!this.isStateValid(stateName)) {
			this.throwError(errorLocalizations.stateNotAllowed, stateName);
		}

		if (this.isStateActive(stateName)) {
			this.sendToLogger(loggerLocalizations.stateAlreadyEnabled, stateName);
			return;
		}

		if (this.changedSignals[stateName] !== undefined) {
			this.changedSignals[stateName]!.signal.Fire(true);
		}

		this.states.push(stateName);
	};

	disableState = (stateName: StateName) => {
		if (!this.isStateValid(stateName)) {
			this.throwError(errorLocalizations.stateNotAllowed, stateName);
		}

		if (!this.isStateActive(stateName)) {
			this.sendToLogger(loggerLocalizations.stateIsNotEnabled, stateName);
			return;
		}

		if (this.changedSignals[stateName] !== undefined) {
			this.changedSignals[stateName]!.signal.Fire(false);
		}

		this.states.remove(this.states.indexOf(stateName));
	};

	bindToStateChanged = (stateName: StateName, callback: ChangedCallback): UUID => {
		const changedSignal = this.getOrCreateChangedSignal(stateName);
		const callbackUUID = generateUUID();
		const connection = changedSignal.signal.Connect(callback);

		print("state binded");

		changedSignal.connections![callbackUUID] = connection;
		return callbackUUID;
	};

	unbindFromStateChanged = (UUID: UUID) => {
		const stateNameAndSignalWithConnections = this.getSignalWithConnectionsFromUUID(UUID);
		if (stateNameAndSignalWithConnections === undefined) {
			throw this.formatLogMessage(errorLocalizations.UUIDNotFound);
		}

		const [stateName, signalWithConnections] = stateNameAndSignalWithConnections;
		const validatedSignalWithConnections = validateType<SignalWithConnetions>(signalWithConnections);
		const validatedSignalConnections = validateType<SignalConnections>(validatedSignalWithConnections.connections);

		validatedSignalConnections[UUID]!.Disconnect();
		validatedSignalConnections[UUID]!.Destroy();
		validatedSignalConnections[UUID] = undefined;

		if (object.length(validatedSignalConnections) === 0) {
			validatedSignalWithConnections.signal.Destroy();
			this.changedSignals[stateName] = undefined;
		}
	};
}
