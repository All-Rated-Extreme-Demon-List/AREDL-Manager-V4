import { Client } from "discord.js";
import { Sequelize } from "sequelize-typescript";

export const db = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: "file:./data/database.sqlite",
  models: [__dirname + "/db/models"]
});

const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});
export default client;
