type NewTabWindow = {
    opener: unknown;
};
type NewTabHost = {
    open: (url: string, target: string) => NewTabWindow | null;
    location: {
        href: string;
    };
};
export declare function openInNewTabOrCurrent(href: string, host?: NewTabHost): void;
export {};
