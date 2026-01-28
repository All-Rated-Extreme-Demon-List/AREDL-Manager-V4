export interface BaseUser {
    id: string;
    username: string;
    global_name: string;
}

export interface User extends BaseUser {
    country?: number;
    discord_id?: string;
    discord_avatar?: string;
}

export interface Clan {
    id: string;
    global_name: string;
    tag: string;
    description?: string;
}