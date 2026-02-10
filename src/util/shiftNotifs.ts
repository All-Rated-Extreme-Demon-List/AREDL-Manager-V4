import { EmbedBuilder, TextChannel } from "discord.js";
import { shiftsStartedID } from "@/../config.json";
import { Logger } from "commandkit";
import { User } from "@/types/user";
import { api } from "@/api";
import { db } from "@/app";
import { shiftNotificationsTable, settingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const sendShiftNotif = async (
    channel: TextChannel,
    shift: typeof shiftNotificationsTable.$inferSelect
) => {
    if (!shiftsStartedID) return 0;
    try {
        const reviewerResponse = await api.send<User>(
            `/users/${shift.user_id}`,
            "GET"
        );
        if (reviewerResponse.error) {
            Logger.error(
                `Shift Notification - Error fetching reviewer ${shift.user_id}: ${reviewerResponse.data.message}`
            );
            await db
                .delete(shiftNotificationsTable)
                .where(eq(shiftNotificationsTable.id, shift.id));
            return 1;
        }
        let pingStr;
        if (reviewerResponse.data.discord_id) {
            const settings = await db
                .select()
                .from(settingsTable)
                .where(eq(settingsTable.user, reviewerResponse.data.discord_id))
                .limit(1)
                .get();
            if (!settings || settings.shiftPings === true) {
                pingStr = `<@${reviewerResponse.data.discord_id}>`;
            }
        }
        // Get unix timestamps for the Discord embed
        const startDate = Math.floor(new Date(shift.start_at).getTime() / 1000);
        const endDate = Math.floor(new Date(shift.end_at).getTime() / 1000);

        const archiveEmbed = new EmbedBuilder()
            .setColor(0x8fce00)
            .setTitle(`:white_check_mark: Shift started!`)
            .setDescription(
                `${reviewerResponse.data.discord_id ? `<@${reviewerResponse.data.discord_id}>` : reviewerResponse.data.global_name}`
            )
            .addFields([
                { name: "Count", value: `${shift.target_count} records` },
                { name: "Starts at", value: `<t:${startDate}>` },
                { name: "Ends at", value: `<t:${endDate}>, <t:${endDate}:R>` },
            ])
            .setTimestamp();

        await channel.send({ content: pingStr, embeds: [archiveEmbed] });
        await db
            .delete(shiftNotificationsTable)
            .where(eq(shiftNotificationsTable.id, shift.id));
        Logger.info(
            `Successfully sent and deleted shift notification (ID: ${shift.id})`
        );
        return 0;
    } catch (e) {
        Logger.error(
            `Shift Notification - Error sending shift notification: ${e}`
        );
        Logger.error(shift);
        try {
            await db
                .delete(shiftNotificationsTable)
                .where(eq(shiftNotificationsTable.id, shift.id));
            Logger.info(
                `Deleted shift notification after error (ID: ${shift.id})`
            );
        } catch (deleteErr) {
            Logger.error(
                `Failed to delete shift notification (ID: ${shift.id}) after error:`
            );
            Logger.error(deleteErr);
        }
        return 1;
    }
};
