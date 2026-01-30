import { PaginatedResponse } from "./api";
import { BaseLevel, Level } from "./level";
import { BaseUser, Clan, User } from "./user";

export interface RecordBase {
	id: string;
	mobile: boolean;
    video_url: string;
    hide_video: boolean;
}

export interface ProfileRecordBase<U> extends RecordBase {
    submitted_by: U;
}

export type ProfileRecord = ProfileRecordBase<BaseUser>;
export type ProfileRecordExtended = ProfileRecordBase<User>;

export interface LevelRecordBase<L> extends RecordBase {
	is_verification: boolean;
    level: L;
}

export type LevelRecord = LevelRecordBase<BaseLevel>;
export type LevelRecordExtended = LevelRecordBase<Level>;
export interface LeaderboardEntryData {
    rank: number;
    extremes_rank: number;
    raw_rank: number;
    country_rank: number;
    country_extremes_rank: number;
    country_raw_rank: number;
    user: User,
    country?: number;
    total_points: number;
    pack_points: number;
    hardest?: BaseLevel;
    extremes: number;
    clan?: Clan
}

export interface LeaderboardEntry extends PaginatedResponse<LeaderboardEntryData> {
    last_refreshed: string;
}