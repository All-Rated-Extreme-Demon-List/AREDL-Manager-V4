import { User } from "./user";

type ShiftStatus = "Running" | "Completed" | "Expired";

export interface Shift {
	id: string;
	user: User;
	target_count: number;
	completed_count: number;
	start_at: Date;
	end_at: Date;
	status: ShiftStatus;
}