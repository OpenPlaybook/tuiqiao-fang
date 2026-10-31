import type {EnsembleApiRequest} from './types/src/ensemble';
export {readStore,maintainStore,appendStoreOperation,withStoreWriteLock} from './types/packages/json-store/src';
export declare function startLessonApplication(handler:(input:EnsembleApiRequest)=>Promise<Response>):void;
export declare function withLessonRequest<T>(root:string,signal:AbortSignal,task:()=>T):T;
export declare function runOpusTask<T>(root:string,task:(signal:AbortSignal)=>Promise<T>):Promise<T>;
export declare function throwIfOpusCancelled():void;
