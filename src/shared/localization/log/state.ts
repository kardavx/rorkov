const localization: LoggerLocalizations = {
	stateEnabled: ["verbose", "State of name %s was enabled"],
	stateAlreadyEnabled: ["warning", "State of name %s is already enabled!"],
	stateDisabled: ["verbose", "State of name %s was disabled"],
	stateIsNotEnabled: ["warning", "State of name %s is not enabled!"],
	tryingToCheckForStateThatIsntAllowed: ["warning", "State of name %s isnt allowed in this State Machine"],
	multipleBindsAtSamePriority: ["warning", "KeyCode %s with modifierKeys [%s] and type %s has multiple bindings: [%s]"],
};

export default localization;
