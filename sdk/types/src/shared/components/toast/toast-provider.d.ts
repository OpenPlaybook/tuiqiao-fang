import { type ReactNode } from 'react';
export type ToastKind = 'info' | 'success' | 'error' | 'warning';
export type ShowToastOptions = {
    kind?: ToastKind;
    durationMs?: number;
};
/** The platform API delegates storage, lifetime, accessibility and rendering to Appica. */
export declare function ToastProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useToast(): {
    showToast: (message: string, options?: ShowToastOptions) => void;
};
