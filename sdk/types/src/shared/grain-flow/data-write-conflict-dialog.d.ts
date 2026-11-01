import type { DialogLifecycleProps } from '../components/use-dialog-lifecycle';
import type { DataWriteFeedback } from './write-state';
/** The only draft conflict UI. Closing never discards input or grants future overwrite. */
export declare function DataWriteConflictDialog({ conflict, onClose, lifecycle }: {
    lifecycle: DialogLifecycleProps;
    conflict: NonNullable<DataWriteFeedback['conflict']>;
    onClose: () => void;
}): import("react/jsx-runtime").JSX.Element;
