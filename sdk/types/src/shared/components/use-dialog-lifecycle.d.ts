/** UI completion permission, independent of a request's data lifetime. */
export type DialogSession = {
    capture: () => () => boolean;
};
export declare const DialogSessionContext: import("react").Context<DialogSession | undefined>;
/** An on-demand business session stays mounted until Appica finishes closing. */
export declare function useDialogSession(onClosed: () => void): {
    close: () => void;
    finish: (afterClose: () => void) => void;
    session: DialogSession;
    rootProps: {
        open: boolean;
        onOpenChangeComplete: (isOpen: boolean) => void;
    };
};
/** Keep the displayed payload through exit; a reopened dialog gets a new completion lifetime. */
export declare function useDialogPresence<T>(requested: T | null): {
    value: T | null;
    close: () => void;
    finish: (afterClose: () => void) => void;
    session: DialogSession;
    rootProps: {
        open: boolean;
        onOpenChangeComplete: (isOpen: boolean) => void;
    };
};
export type DialogLifecycleProps = ReturnType<typeof useDialogSession>["rootProps"];
