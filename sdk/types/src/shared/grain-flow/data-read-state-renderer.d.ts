import { type ReactNode } from 'react';
import type { ViewSnapshot } from './derived';
import { useData } from './react';
import { type DataReadFailure } from './read-state';
export type { DataReadFailure } from './read-state';
type ReadInput<T> = {
    result: ViewSnapshot<T>;
    path?: never;
    options?: never;
} | {
    result?: never;
    path: string | null;
    options?: Parameters<typeof useData>[1];
};
export type DataReadStateRendererProps<T, V = T> = ReadInput<T> & {
    select?: (value: NonNullable<T>) => V;
    renderData: (value: NonNullable<V>) => ReactNode;
    loading?: ReactNode;
    empty?: ReactNode;
    renderError?: (failure: DataReadFailure) => ReactNode;
    /** Called only on refresh failure; normal content has no additional DOM. */
    renderFeedback?: (failure: DataReadFailure) => ReactNode;
};
/** Complete hook result OR useData parameters; neither mode changes read priority. */
export declare function DataReadStateRenderer<T, V = T>(props: DataReadStateRendererProps<T, V>): import("react/jsx-runtime").JSX.Element;
