// WebSocket handlers - manually imported to work correctly in bundled environments
import * as shiftCompleted from "./shift_completed";
import * as shiftMissed from "./shift_missed";
import * as shiftsCreated from "./shifts_created";
import * as submissionAccept from "./submission_accept";
import * as submissionDenied from "./submission_denied";
import * as submissionUc from "./submission_uc";

export const handlers = [
	shiftCompleted,
	shiftMissed,
	shiftsCreated,
	submissionAccept,
	submissionDenied,
	submissionUc,
];
