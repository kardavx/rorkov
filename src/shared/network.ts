import { Networking } from "@flamework/networking";

interface ServerEvents {}

interface ClientEvents {}

interface ServerFunctions {
	getCurrentTop(): Model;
	getCurrentBottom(): Model;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
