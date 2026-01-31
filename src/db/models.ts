import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { defaultPoints } from "@/../config.json"


export const dailyStatsTable = sqliteTable("daily_stats", {
	id: int().primaryKey({ autoIncrement: true }),
	date: int({ mode: "timestamp" }),
	nbMembersJoined: int().notNull().default(0),
	nbMembersLeft: int().notNull().default(0),
})

export const embedsTable = sqliteTable("embeds", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	guild: text().notNull(),
	channel: text().notNull(),
	discordid: text().notNull(),
	title: text(),
	description: text(),
	color: text(),
	image: text(),
})

export const messagesTable = sqliteTable("messages", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	guild: text().notNull(),
	channel: text().notNull(),
	discordid: text().notNull(),
})

export const settingsTable = sqliteTable("settings", {
	id: int().primaryKey({ autoIncrement: true }),
	user: text().notNull(),
	shiftPings: int({ mode: "boolean" }).notNull().default(true),
})

export const sentUcRemindersTable = sqliteTable("sent_uc_reminders", {
	id: text().primaryKey(),
})

export const shiftNotificationsTable = sqliteTable("shift_notifications", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: text().notNull(),
	start_at: int({ mode: "timestamp" }).notNull(),
	end_at: int({ mode: "timestamp" }).notNull(),
	target_count: int().notNull(),
})

export const infoMessagesTable = sqliteTable("info_messages", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	guild: text().notNull(),
	channel: text().notNull(),
	discordid: text().notNull(),
})

export const staffPointsTable = sqliteTable("staff_points", {
	user: text().primaryKey(),
	points: int().notNull().default(defaultPoints),
})

export const weeklyMissedShiftsTable = sqliteTable("weekly_missed_shifts", {
	user: text().primaryKey(),
	missed_all: int({ mode: "boolean" }).notNull(),
})

export const noPingListTable = sqliteTable("no_ping_list", {
	userId: text().primaryKey(),
	notes: text(),
	banned: int({ mode: "boolean" }).notNull().default(false),
})

export const ucThreadsTable = sqliteTable("uc_threads", {
	submission_id: text().primaryKey(),
	message_id: text().notNull(),
	thread_id: text().notNull(),
})