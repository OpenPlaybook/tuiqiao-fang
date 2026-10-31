import type { ViewSnapshot } from './derived';
export type DataReadFailure = {
    message: string;
    denied: boolean;
    stale: boolean;
    append?: boolean;
    retry: () => Promise<unknown>;
};
export type DataReadPresentation<T> = {
    kind: 'data';
    value: NonNullable<T>;
    failure?: DataReadFailure;
} | {
    kind: 'loading' | 'empty';
} | {
    kind: 'error';
    failure: DataReadFailure;
};
/** One priority for read UI. Operation, draft and module states are separate. */
export declare function resolveDataReadState<T>(result: ViewSnapshot<unknown>, value: T): DataReadPresentation<T>;
