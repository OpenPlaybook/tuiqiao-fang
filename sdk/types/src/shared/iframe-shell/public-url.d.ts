export declare function getShellOrigin(): string | null;
export declare function subscribeShellOrigin(listener: () => void): () => void;
export declare function setShellOrigin(origin: string | null): void;
/** Use for user-facing page links only, never transport or attachment URLs. */
export declare function publicPageUrl(href: string): string;
