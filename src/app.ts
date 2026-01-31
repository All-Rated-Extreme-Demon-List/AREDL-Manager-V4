import { Client } from "discord.js";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle(process.env.DB_FILE_NAME!);

const client = new Client({
	intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});
export default client;
