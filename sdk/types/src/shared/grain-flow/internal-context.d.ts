import type { GrainFlow } from './core';
/** Infrastructure/data adapters only. Consumers use the public read/edit hooks. */
export declare const GrainFlowContext: import("react").Context<GrainFlow | null>;
export declare function useGrainFlow(): GrainFlow;
