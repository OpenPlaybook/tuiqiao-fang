export declare class RequestError extends Error {
    readonly kind: "http" | "network" | "parse" | "preflight";
    readonly status?: number | undefined;
    readonly code?: string | undefined;
    readonly retryAfterMs?: number | undefined;
    constructor(kind: "http" | "network" | "parse" | "preflight", message: string, status?: number | undefined, code?: string | undefined, retryAfterMs?: number | undefined);
}
export type FileResponse = {
    blob: Blob;
    fileName?: string;
};
/** Raw auth/form callers preserve HTTP classification before decoding an error page. */
export declare function readResponseJson(response: Response): Promise<any>;
export declare function requestJson<T>(url: string, init?: RequestInit, options?: {
    fetcher?: typeof fetch;
    onHttpError?: (body: unknown) => void;
    response?: "stream" | "file";
    managedServiceErrors?: boolean;
}): Promise<T>;
export declare function privateReadDenied(error: unknown): boolean;
