import { Client as BaseClient, Collection } from "discord.js";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { WebsocketHandler } from "./util/initWebsocket"
import { initAPIWebsocket, initWebsocket } from "./util/initWebsocket";

export const db = drizzle(process.env.DB_FILE_NAME!);

export class Client extends BaseClient<boolean> {
	websockets: Collection<string, WebsocketHandler> = new Collection();
}

const client = new Client({
	intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});

await initWebsocket(client);
await initAPIWebsocket(client);

export default client;