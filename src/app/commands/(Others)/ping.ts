import type {
    ChatInputCommand,
    MessageCommand,
    CommandData,
    CommandMetadata,
} from "commandkit";
import { guildId, staffGuildId } from "@/../config.json";
import { commandGuilds } from "@/util/commandGuilds";

export const metadata = commandGuilds();

export const command: CommandData = {
    name: "ping",
    description: "Ping the bot to check if it's online.",
};

export const chatInput: ChatInputCommand = async (ctx) => {
    const latency = (ctx.client.ws.ping ?? -1).toString();
    const response = `Pong! Latency: ${latency}ms`;

    await ctx.interaction.reply(response);
};

export const message: MessageCommand = async (ctx) => {
    const latency = (ctx.client.ws.ping ?? -1).toString();
    const response = `Pong! Latency: ${latency}ms`;

    await ctx.message.reply(response);
};
