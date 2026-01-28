import { BaseUser } from "./user";
import { ProfileRecord } from "./record";

export interface BaseLevel {
    id: string;
    name: string;
}

export interface Level extends BaseLevel {
    position: number;
    publisher_id: string;
    points: number;
    legacy: boolean;
    level_id: number;
    two_player: boolean;
    tags: string[];
    description: string;
}

export interface ExtendedLevel extends Level {
    song: number;
    edel_enjoyment: number;
    is_edel_pending: boolean;
    gddl_tier: number;
    nlw_tier: number;
    publisher: BaseUser;
    verifications: ProfileRecord[]
}
