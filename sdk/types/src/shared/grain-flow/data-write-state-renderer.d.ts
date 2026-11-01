import { type ReactNode } from 'react';
import { type DialogSession } from '../components/use-dialog-lifecycle';
import { useEdit, useSaveScope } from './edit';
import { useOperation } from './react';
import { type DataWriteFeedback } from './write-state';
export type { DataWriteFeedback } from './write-state';
export type DataWriteContentProps = {
    'aria-busy'?: true;
    className?: string;
};
export type DataWriteCallbacks<T> = {
    onSuccess?: (value: T) => void;
    onError?: (error: unknown) => void;
};
export type DataWriteRenderData<T, I> = {
    input: I | undefined;
    contentProps: DataWriteContentProps;
    disabled: boolean;
    set: (value: T, options?: DataWriteCallbacks<void>) => void;
    edit: (value: I | ((previous: I) => I)) => void;
    save: () => void;
    run: (input: I, options?: DataWriteCallbacks<T>) => void;
};
export type DataWriteResult<T = unknown, I = T> = ReturnType<typeof useEdit<T, I>> | ReturnType<typeof useOperation<I, T>> | ReturnType<typeof useSaveScope>;
export type DataWriteStateRendererProps<T, I = T> = ({
    result: DataWriteResult<T, I>;
    path?: never;
    options?: never;
} | {
    result?: never;
    path: string | null;
    options?: {
        continuous?: boolean;
    };
}) & {
    renderData: (value: DataWriteRenderData<T, I>) => ReactNode;
    renderFeedback?: (feedback: DataWriteFeedback) => ReactNode;
    loading?: ReactNode;
    empty?: ReactNode;
    onSuccess?: () => void;
    session?: DialogSession;
};
/** One local renderer; no wrapper, status placeholder, or success notification. */
export declare function DataWriteStateRenderer<T = unknown, I = T>(props: DataWriteStateRendererProps<T, I>): import("react/jsx-runtime").JSX.Element;
