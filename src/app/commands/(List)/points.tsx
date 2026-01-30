import { ChatInputCommand, CommandData } from "commandkit";

import { MessageFlags } from 'discord.js';
import { defaultPoints } from '@/../config.json';
import { StaffPoints } from "@/db/models"

export const command: CommandData = {
    name: "points",
    description: "View your total Pukeko Points"
}

export const chatInput: ChatInputCommand = async ({interaction}) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	const [user, _] = await StaffPoints.findOrCreate({ 
		where: { user: interaction.user.id },
		defaults: { points: defaultPoints },
	});
	return await interaction.editReply(`You have **${Math.round(user.dataValues.points * 100) / 100}** Pukeko Points.`);
}