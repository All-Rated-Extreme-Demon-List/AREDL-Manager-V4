
import { CommandMetadataFunction } from "commandkit"
import { guildId, staffGuildId } from "@/../config.json";
export const commandGuilds: CommandMetadataFunction = () => {
	return {
		guilds: [guildId, staffGuildId],
	}
}