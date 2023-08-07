import { RunService } from "@rbxts/services";
const isStudio = RunService.IsStudio();

const formatMessage = (logMessage: LogMessage) => `[SENT FROM LOGGER] ${logMessage}`;

/**
 * Logger, allows for logging messages that are supposed to be information for the developer - things that its logging pose no real danger for the game
 *
 * @param logType defines if the log should be shown as a print, or as a warning
 */
export const log = (logType: LogType, logMessage: LogMessage) => {
	if (!isStudio) return;

	if (logType === "verbose") print(formatMessage(logMessage));
	if (logType === "warning") warn(formatMessage(logMessage));
};
