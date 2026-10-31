/** Counts available-service time; connection recovery must not consume result deadlines. */
export declare class ReadDeadline {
    private expire;
    private disposed;
    private remaining;
    private started?;
    private timer?;
    constructor(ms: number, expire: () => void);
    setPaused(paused: boolean): void;
    dispose(): void;
}
