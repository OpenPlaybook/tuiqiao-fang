export declare const AUTH_SESSION_CHANGED = "rdfz-auth-session-changed";
export declare const AUTH_REQUIRED_EVENT = "rdfz-auth-required";
export declare function setAuthUserId(userId: string | null): void;
export declare const authGeneration: () => number;
export declare const needsAuthentication: () => boolean;
export declare function notifyAuthRequired(requestGeneration?: number): void;
export declare const authUserId: () => string | null;
/** Fence old account writes before a request can change the browser cookie. */
export declare function beginAuthTransition(): {
    cancel(): void;
    complete(userId?: string): void;
};
export declare function notifyAuthSessionChanged(userId?: string): void;
export declare function subscribeAuthRequired(listener: () => void): () => void;
export declare function inspectAuthFailure(status: number, body: unknown, requestGeneration: number): void;
export declare function runAuthAction<T>(action: () => Promise<T>): Promise<Exclude<T, {
    readonly error: "AUTH_REQUIRED";
}>>;
export declare function authFormAction(action: (formData: FormData) => Promise<unknown>, onSuccess?: () => void): (formData: FormData) => Promise<void>;
export declare function isSameOriginRequest(input: RequestInfo | URL): boolean;
export declare function apiFetch(input: RequestInfo | URL, init?: RequestInit, managedServiceErrors?: boolean, fetcher?: typeof fetch): Promise<Response>;
/** Explicit account-owned fetch; preserve HTTP bodies for the caller's receipt handling. */
export declare function platformApiFetch(input: RequestInfo | URL, init?: RequestInit, managedServiceErrors?: boolean, fetcher?: typeof fetch): Promise<Response>;
