import { type FileResponse } from './http';
export declare function downloadFile(file: FileResponse, fallbackName: string): void;
/** Fetch inside the current frame so partitioned sessions survive the download.
 * Navigating an attachment URL can lose the iframe's cookie partition. */
export declare function downloadRemoteFile(url: string, fallbackName: string): Promise<void>;
