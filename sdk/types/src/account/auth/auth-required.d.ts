export declare const AUTH_REQUIRED = "AUTH_REQUIRED";
export declare const AUTH_REQUIRED_MESSAGE = "\u767B\u5F55\u72B6\u6001\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002";
export declare const authRequiredResult: {
    readonly ok: false;
    readonly error: "AUTH_REQUIRED";
    readonly message: "登录状态已失效，请重新登录。";
};
export declare class AuthRequiredError extends Error {
    readonly status = 401;
    readonly error = "AUTH_REQUIRED";
    readonly code = "AUTH_REQUIRED";
    constructor();
}
export declare function isAuthRequired(value: unknown): value is typeof authRequiredResult;
/** Only platform authentication failures are handled by the global login surface. */
export declare function isGlobalAuthError(value: unknown): boolean;
export declare function localRequestError(value: unknown): unknown;
