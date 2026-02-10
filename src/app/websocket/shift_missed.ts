import {
	guildId,
	staffGuildId,
	maxPointsOnShiftMiss,
	enableSeparateStaffServer,
	missedShiftsID,
	maxPoints,
	defaultPoints,
} from "@/../config.json";
import { api } from "@/api";
import { Shift, WebsocketShift } from "@/types/shift";
import { User } from "@/types/user";
import { Logger } from "commandkit";
import { Client, EmbedBuilder } from "discord.js";
import { db } from "@/app";
import { eq } from "drizzle-orm";
import { staffPointsTable } from "@/db/schema";

export const notification_type = "SHIFTS_MISSED";
interface ShiftMissedData {
	aredl: WebsocketShift[];
}

export const handle = async (
	client: Client,
	db: any,
	config: any,
	data: ShiftMissedData
) => {
	Logger.info("Received shift missed notification:");
	Logger.info(data);

	const guild = await client.guilds.fetch(guildId);
	const staffGuild = enableSeparateStaffServer
		? await client.guilds.fetch(staffGuildId)
		: guild;
	const foundReviewers: User[] = [];
	const embeds = [];

	// AREDL
	for (const shift of data.aredl) {
		let reviewer = foundReviewers.find((rev) => rev.id == shift.user_id);
		if (!reviewer) {
			const reviewerResponse = await api.send<User>(
				`/users/${shift.user_id}`,
				"GET"
			);
			if (reviewerResponse.error) {
				Logger.error(
					`Error fetching reviewer data: ${reviewerResponse.data.message}`
				);
				continue;
			}
			reviewer = reviewerResponse.data;
			foundReviewers.push(reviewer);
		}

		let newPoints = null;
		if (reviewer.discord_id) {
			const points = await db
				.insert(staffPointsTable)
				.values({
					user: reviewer.discord_id,
					points: defaultPoints,
				})
				.onConflictDoNothing()
				.returning()
				.get();

			const recordsDone = shift.completed_count / shift.target_count;

			if (recordsDone >= 2 / 3) {
				newPoints = Math.max(
					points.points - (maxPointsOnShiftMiss * 1) / 3,
					0
				);
			} else if (recordsDone >= 1 / 3) {
				newPoints = Math.max(
					points.points - (maxPointsOnShiftMiss * 2) / 3,
					0
				);
			} else {
				newPoints = Math.max(points.points - maxPointsOnShiftMiss, 0);
			}
			if (newPoints) {
				await db
					.update(staffPointsTable)
					.set({
						points: newPoints,
					})
					.where(eq(staffPointsTable.user, reviewer.discord_id));
			}
		} else {
			Logger.warn(
				`Shift Missed - Reviewer ${shift.user_id} has no Discord ID, skipping points decrement.`
			);
		}
		// unix epochs
		const startDate = Math.floor(new Date(shift.start_at).getTime() / 1000);
		const shiftEmbed = new EmbedBuilder()
			.setColor(0xcc0000)
			.setTitle(`:x: (AREDL) Shift missed...`)
			.setDescription(
				`${reviewer.discord_id ? `<@${reviewer.discord_id}>` : reviewer.global_name}`
			)
			.addFields([
				{
					name: "Count",
					value: `${shift.completed_count}/${shift.target_count}`,
					inline: true,
				},
				{ name: "Time", value: `<t:${startDate}>`, inline: true },
				{
					name: "Points",
					value: `${newPoints ? Math.round(newPoints * 100) / 100 : "N/A"}`,
					inline: true,
				},
			])
			.setTimestamp();

		embeds.push(shiftEmbed);
	}

	if (embeds.length > 0) {
		for (let i = 0; i < embeds.length; i += 10) {
			const embedBatch = embeds.slice(i, i + 10);
			const channel = await staffGuild.channels.cache.get(missedShiftsID);
			if (channel && channel.isSendable()) {
				channel.send({ embeds: embedBatch });
			}
		}
	}
};
