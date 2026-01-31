import { Settings } from "@/db/models";
import { ChatInputCommand, CommandData } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const command: CommandData = {
	name: "settings",
	description: "Command to configure some settings",
	options: [
		{
			name: "shift-pings",
			type: ApplicationCommandOptionType.String,
			description: "Get a ping when a shift of yours starts",
			choices: [
				{ name: "On", value: "on" },
				{ name: "Off", value: "off" },
			],
			required: false,
		}
	]
}

export const chatInput: ChatInputCommand = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });
	const shiftPings = interaction.options.getString('shift-pings');
	const [entry, _] = await Settings.findOrCreate({
		where: { user: interaction.user.id },
	});

	if (shiftPings) {
		const enabled = shiftPings === 'on';
		entry.dataValues.shiftPings = enabled;
	}

	entry.save()
	await interaction.editReply(`:white_check_mark: Updated!`);
}