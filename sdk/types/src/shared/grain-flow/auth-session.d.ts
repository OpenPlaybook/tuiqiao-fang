import { type HttpFetcher } from './http-source';
import type { GrainFlow } from './core';
/** Only the authenticated application runtime uses this transport. Student
 * credentials, public readers and the login form have independent lifetimes. */
export declare function platformSessionFetcher(fetcher?: HttpFetcher, ownerUserId?: string): HttpFetcher;
/** Pause observations without disposing the runtime or its local drafts. */
export declare function bindBrowserDataSession(flow: GrainFlow, requiresPlatformSession: boolean): () => void;
