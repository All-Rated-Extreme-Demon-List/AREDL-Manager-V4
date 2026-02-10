import type { Client, Collection } from "discord.js";

export interface WebsocketHandler {
	notification_type: string;
	handle: (
		client: Client,
		db: any,
		config: any,
		data: any
	) => Promise<void> | void;
}

export function isWebsocketHandler(obj: any): obj is WebsocketHandler {
	return (
		obj &&
		typeof obj === "object" &&
		typeof obj.notification_type === "string" &&
		typeof obj.handle === "function"
	);
}
