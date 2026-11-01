export declare const READ_RECOVERY_HINT_MS = 30000;
export declare const READ_ATTEMPT_TIMEOUT_MS = 10000;
export declare const READ_RECOVERY_MESSAGE = "\u6682\u65F6\u65E0\u6CD5\u8FDE\u63A5\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u8BD5";
export declare function isRecoverableReadError(error: unknown): boolean;
export declare function backgroundReadDelay(attempt: number): number;
export declare function readRecoveryDelay(attempt: number): number;
export declare function waitReadRecovery(ms: number, signal: AbortSignal): Promise<void>;
/** A caller has a bounded attempt budget; active demand owns later background recovery. */
export declare function readAttemptRetryLimit(error: unknown): 0 | 3;
