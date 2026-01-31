import { Logger } from "commandkit";
import { REST, Routes } from "discord.js";
import config from "./config.json" with { type: "json" };
const { clientId, guildId: mainGuildId, staffGuildId } = config;
import "dotenv/config";

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN!);
(async () => {
	try {
		Logger.info(`Started refreshing application (/) commands.`);

		for (const guildId of [mainGuildId, staffGuildId]) {
			if (guildId) {
				const guildCommands: any = await rest.get(
					Routes.applicationGuildCommands(clientId, guildId),
				);
				if (guildCommands) {
					for (const command of guildCommands) {
						await rest.delete(
							Routes.applicationGuildCommand(
								clientId,
								guildId,
								command.id,
							),
						);
					}
				}
			}
		}

		const commands: any = await rest.get(
			Routes.applicationCommands(clientId),
		);
		if (commands) {
			for (const command of commands) {
				await rest.delete(
					Routes.applicationCommand(clientId, command.id),
				);
			}
		}

		Logger.info(`Successfully reloaded all application (/) commands.`);
	} catch (error) {
		Logger.error(error);
	}
})();
