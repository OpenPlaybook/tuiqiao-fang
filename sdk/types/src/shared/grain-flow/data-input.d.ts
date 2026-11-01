/** Data intents cannot own files, streams, editor instances or executable callbacks. */
export declare function assertDataInput(value: unknown, ancestors?: Set<object>): void;
