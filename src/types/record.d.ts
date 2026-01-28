import { PaginatedResponse } from "./api";
import { BaseLevel } from "./level";
import { BaseUser, Clan, User } from "./user";

export interface ProfileRecordBase<U> {
    id: string;
    submitted_by: U;
    mobile: boolean;
    video_url: string;
    hide_video: boolean;
    achieved_at: string;
}

export type ProfileRecord = ProfileRecordBase<BaseUser>;
export type ProfileRecordExtended = ProfileRecordBase<User>;

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