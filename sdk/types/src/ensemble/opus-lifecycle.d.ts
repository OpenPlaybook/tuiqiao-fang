export declare function runOpusTask<T>(root:string,task:(signal:AbortSignal)=>Promise<T>):Promise<T>;export declare function throwIfOpusCancelled():void;
