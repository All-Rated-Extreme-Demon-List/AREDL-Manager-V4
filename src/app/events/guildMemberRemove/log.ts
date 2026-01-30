import { Events } from 'discord.js';
import { guildId } from '@/../config.json';
import { EventHandler, Logger } from 'commandkit';
import { DailyStats } from '@/db/models';

const handler: EventHandler<'guildMemberRemove'> = async (member) => {
	if (member.guild.id != guildId) return;
	Logger.info(`Member left: ${member.id}`);

	const [entry, created] = await DailyStats.findOrCreate({
		where: { date: Date.now() },
	});
	entry.dataValues.mbMembersLeft += 1;
	await entry.save();
}

export default handler;