/** Account-scoped protocol resources shared by reads and writes. */
export declare class ProtocolServices {
    private entries;
    get: <T>(key: object, create: () => {
        value: T;
        dispose?: () => void | Promise<void>;
    }) => T;
    dispose(): Promise<void>;
}
