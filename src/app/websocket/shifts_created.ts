import {
    guildId,
    staffGuildId,
    enableSeparateStaffServer,
    shiftsStartedID,
} from "@/../config.json";
import { WebsocketShift } from "@/types/shift";
import { Logger } from "commandkit";
import { Client, TextChannel } from "discord.js";
import { db } from "@/app";
import { shiftNotificationsTable } from "@/db/schema";
import { sendShiftNotif } from "@/util/shiftNotifs";

export default {
    notification_type: "SHIFTS_CREATED",
    handle: async (client: Client, data: WebsocketShift[]) => {
        Logger.info("Received shifts created notification:");
        Logger.info(data);

        if (!shiftsStartedID) return;

        const guild = await client.guilds.fetch(guildId);
        const staffGuild = enableSeparateStaffServer
            ? await client.guilds.fetch(staffGuildId)
            : guild;
        const channel = staffGuild.channels.cache.get(shiftsStartedID);
        if (!channel || !channel.isSendable()) {
            Logger.error("Shifts started channel not found or not sendable.");
        }
        const currentTime = new Date().getTime();

        for (const shift of data) {
            try {
                const dbShift = await db
                    .insert(shiftNotificationsTable)
                    .values({
                        user_id: shift.user_id,
                        start_at: shift.start_at,
                        end_at: shift.end_at,
                        target_count: shift.target_count,
                    })
                    .returning()
                    .get();

                const startAt = new Date(shift.start_at).getTime();
                setTimeout(
                    async () => {
                        await sendShiftNotif(
                            channel as TextChannel,
                            dbShift
                        ).catch((err: unknown) => {
                            Logger.error("Failed to send shift notification:");
                            Logger.error(err);
                        });
                    },
                    Math.max(startAt - currentTime, 0)
                );
            } catch (err) {
                Logger.error(
                    "Failed to create shift notification in database:"
                );
                Logger.error(err);
            }
        }
    },
};
