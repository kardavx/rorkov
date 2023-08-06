import { log, LogMessage, LogType } from "./log_message";
import { generateUUID, UUID } from "./uuid";
import { Signal, Connection } from "@rbxts/beacon";

type StateName = string;
type ErrorMessage = string;
type LogName = string;
type ErrorName = string;
type SignalReturn = boolean;

type States = StateName[];
type LoggerLocalization = [logType: LogType, logMessage: LogMessage];
type ChangedCallback = (state: boolean) => void;

interface LoggerLocalizations {
	[logName: LogName]: LoggerLocalization;
}

interface ErrorLocalizations {
	[errorName: ErrorName]: ErrorMessage;
}

interface SignalConnections {
	[UUID: UUID]: Connection<SignalReturn> | undefined;
}

interface SignalWithConnetions {
	signal: Signal<SignalReturn>;
	connections: SignalConnections;
}

interface ChangedSignals {
	[stateName: StateName]: SignalWithConnetions;
}

export default class State {
	static loggerLocalizations: LoggerLocalizations = {
		stateEnabled: ["verbose", "State of name %s was enabled"],
		stateAlreadyEnabled: ["warning", "State of name %s is already enabled!"],
		stateDisabled: ["verbose", "State of name %s was disabled"],
		stateIsNotEnabled: ["warning", "State of name %s is not enabled!"],
		tryingToCheckForStateThatIsntAllowed: ["warning", "State of name %s isnt allowed in this State Machine"],
		changedSignalsIsEmpty: ["warning", "Changed signals is empty!"],
	};

	static errorLocalizations: ErrorLocalizations = {
		stateNotAllowed: "State of name %s isnt allowed on this State Machine!",
	};

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

		const isAllowed =
			this.statesAllowed.find((allowedState: StateName) => allowedState === stateName) !== undefined;

		return isAllowed;
	}

	getStateActive(stateName: StateName): boolean {
		if (!this.isStateValid(stateName)) {
			this.sendToLogger(State.loggerLocalizations.tryingToCheckForStateThatIsntAllowed, stateName);
		}

		return this.states.find((activeState: StateName) => activeState === stateName) !== undefined;
	}

	activateState(stateName: StateName) {
		if (!this.isStateValid(stateName)) {
			this.throwError(State.errorLocalizations.stateNotAllowed, stateName);
		}

		if (this.getStateActive(stateName)) {
			this.sendToLogger(State.loggerLocalizations.stateAlreadyEnabled, stateName);
			return;
		}

		this.states.push(stateName);
	}

	disableState(stateName: StateName) {
		if (!this.isStateValid(stateName)) {
			this.throwError(State.errorLocalizations.stateNotAllowed, stateName);
		}

		if (!this.getStateActive(stateName)) {
			this.sendToLogger(State.loggerLocalizations.stateIsNotEnabled, stateName);
			return;
		}

		this.states.remove(this.states.indexOf(stateName));
	}

	bindToStateChanged(stateName: StateName, callback: ChangedCallback): UUID {
		const changedSignal = this.getOrCreateChangedSignal(stateName);
		const callbackUUID = generateUUID();
		const connection = changedSignal.signal.Connect(callback);

		changedSignal.connections[callbackUUID] = connection;
		return callbackUUID;
	}

	unbindFromStateChanged(UUID: UUID) {}
}
