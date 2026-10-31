/** Only page addresses belong on the shell. Assets, auth callbacks and print pages stay on the app. */
export declare function shellPagePath(value: unknown): string | null;
export declare function coursewarePagePath(value: unknown): string | null;
/** A same-origin host can observe even previously cached, independent HTML. */
export declare function shellFrameUrl(path: string, appOrigin: string): string;
export declare function parseShellOrigins(value: string | undefined): string[];
export declare function toShellPageUrl(href: string, appHref: string, shellOrigin: string | null): string;
