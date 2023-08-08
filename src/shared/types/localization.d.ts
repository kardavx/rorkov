type LogType = "verbose" | "warning";
type LogMessage = string;
type LogName = string;
type LoggerLocalization = [logType: LogType, logMessage: LogMessage];

type ErrorMessage = string;
type ErrorName = string;

interface LoggerLocalizations {
	[logName: LogName]: LoggerLocalization;
}

interface ErrorLocalizations {
	[errorName: ErrorName]: ErrorMessage;
}