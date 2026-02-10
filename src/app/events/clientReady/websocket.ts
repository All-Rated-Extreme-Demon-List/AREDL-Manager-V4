import { Logger, type EventHandler } from "commandkit";
import { initWebsocket, initAPIWebsocket } from "../../../util/initWebsocket";
import { db } from "../../../app";
import config from "../../../../config.json" assert { type: "json" };

const handler: EventHandler<"clientReady"> = async (client) => {
	try {
		// Load WebSocket handlers
		await initWebsocket(client);

		// Connect to API WebSocket
		await initAPIWebsocket(client, db, config);
	} catch (error) {
		Logger.error(`[WebSocket] Failed to initialize:`);
		Logger.error(error);
	}
};

export default handler;
