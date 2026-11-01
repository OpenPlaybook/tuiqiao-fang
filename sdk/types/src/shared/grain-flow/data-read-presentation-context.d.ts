import { type ComponentType, type ReactNode } from 'react';
import type { DataReadFailure, DataReadPresentation } from './read-state';
import type { ViewSnapshot } from './derived';
/** A containing UI supplies appearances; read priority remains in the renderer. */
export declare const DataReadPresentationContext: import("react").Context<{
    loading: ReactNode;
    empty: ReactNode;
    renderError: (failure: DataReadFailure) => ReactNode;
    renderFeedback: (failure: DataReadFailure) => ReactNode;
    Observer: ComponentType<{
        state: DataReadPresentation<unknown>;
        result: ViewSnapshot<unknown>;
    }>;
} | null>;
