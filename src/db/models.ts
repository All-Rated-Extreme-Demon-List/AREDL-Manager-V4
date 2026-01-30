import { Sequelize, Model, Table } from "sequelize-typescript";
import { DataTypes, Optional } from "sequelize";
import { defaultPoints } from "../../config.json"

interface DailyStatsAttributes {
    id: number;
    date?: number;
    nbMembersJoined: number;
    mbMembersLeft: number;
}

interface DailyStatsCreationAttributes extends Optional<DailyStatsAttributes, "id"> {};

@Table
export class DailyStats extends Model<DailyStatsAttributes, DailyStatsCreationAttributes> {}

interface EmbedsAttributes {
    id: number;
    name: string;
    guild: string;
    channel: string;
    discordid: string;
    title?: string;
    description?: string;
    color?: string;
    image?: string;
}

interface EmbedsCreationAttributes extends Optional<EmbedsAttributes, "id"> {};

@Table
export class Embeds extends Model<EmbedsAttributes, EmbedsCreationAttributes> {}
interface MessagesAttributes {
    id: number;
    name: string;
    guild: string;
    channel: string;
    discordid: string;
}

interface MessagesCreationAttributes extends Optional<MessagesAttributes, "id"> {};

@Table
export class Messages extends Model<MessagesAttributes, MessagesCreationAttributes> {}

interface SettingsAttributes {
    id: number;
    user: string;
    shiftPings: boolean;
}

interface SettingsCreationAttributes extends Optional<SettingsAttributes, "id"> {};

@Table
export class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> {}

interface SentUcRemindersAttributes {
    id: string;
}

interface SentUcRemindersCreationAttributes extends Optional<SentUcRemindersAttributes, "id"> {};

@Table
export class SentUcReminders extends Model<SentUcRemindersAttributes, SentUcRemindersCreationAttributes> {}

interface ShiftNotificationsAttributes {
    id: number;
    user_id: string;
    start_at: Date;
    end_at: Date;
    target_count: number;
}

interface ShiftNotificationsCreationAttributes extends Optional<ShiftNotificationsAttributes, "id"> {};

@Table
export class ShiftNotifications extends Model<ShiftNotificationsAttributes, ShiftNotificationsCreationAttributes> {}

interface InfoMessagesAttributes {
    id: number;
    name: string;
    guild: string;
    channel: string;
    discordid: string;
}

interface InfoMessagesCreationAttributes extends Optional<InfoMessagesAttributes, "id"> {};

@Table
export class InfoMessages extends Model<InfoMessagesAttributes, InfoMessagesCreationAttributes> {}

interface StaffPointsAttributes {
    user: string;
    points: number;
}

interface StaffPointsCreationAttributes extends Optional<StaffPointsAttributes, "user"> {};

@Table
export class StaffPoints extends Model<StaffPointsAttributes, StaffPointsCreationAttributes> {}

interface WeeklyMissedShiftsAttributes {
    user: string;
    missed_all: boolean;
}

interface WeeklyMissedShiftsCreationAttributes extends Optional<WeeklyMissedShiftsAttributes, "user"> {};

@Table
export class WeeklyMissedShifts extends Model<WeeklyMissedShiftsAttributes, WeeklyMissedShiftsCreationAttributes> {}

export interface NoPingListAttributes {
    userId: string;
    notes?: string;
    banned: boolean;
}

interface NoPingListCreationAttributes extends Optional<NoPingListAttributes, "userId"> {};

@Table
export class NoPingList extends Model<NoPingListAttributes, NoPingListCreationAttributes> {}

interface UcThreadsAttributes {
    submission_id: string;
    message_id: string;
    thread_id: string;
}

interface UcThreadsCreationAttributes extends Optional<UcThreadsAttributes, "submission_id"> {};

@Table
export class UcThreads extends Model<UcThreadsAttributes, UcThreadsCreationAttributes> {}