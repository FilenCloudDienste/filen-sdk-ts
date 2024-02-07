export type APIConfig = {
    apiKey: string;
};
/**
 * API
 * @date 2/1/2024 - 4:46:43 PM
 *
 * @export
 * @class API
 * @typedef {API}
 */
export declare class API {
    private readonly config;
    private readonly apiClient;
    private readonly _v3;
    /**
     * Creates an instance of API.
     * @date 2/1/2024 - 4:46:38 PM
     *
     * @constructor
     * @public
     * @param {APIConfig} params
     */
    constructor(params: APIConfig);
    v3(): {
        health: () => Promise<"OK">;
        dir: () => {
            content: (params_0: {
                uuid: string;
                dirsOnly?: boolean | undefined;
            }) => Promise<import("./v3/dir/content").DirContentResponse>;
            download: (params_0: {
                uuid: string;
                type?: import("./v3/dir/download").DirDownloadType | undefined;
                linkUUID?: string | undefined;
                linkHasPassword?: boolean | undefined;
                linkPassword?: string | undefined;
                linkSalt?: string | undefined;
            }) => Promise<import("./v3/dir/download").DirDownloadResponse>;
            shared: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/shared").DirSharedResponse>;
            linked: (params_0: {
                uuid: string;
            }) => Promise<import("./v3/dir/linked").DirLinkedResponse>;
        };
        auth: () => {
            info: (params_0: {
                email: string;
            }) => Promise<import("./v3/auth/info").AuthInfoResponse>;
        };
        login: (params_0: {
            email: string;
            password: string;
            twoFactorCode?: string | undefined;
            authVersion: import("../types").AuthVersion;
        }) => Promise<import("./v3/login").LoginResponse>;
        user: () => {
            info: () => Promise<import("./v3/user/info").UserInfoResponse>;
            baseFolder: () => Promise<import("./v3/user/baseFolder").UserBaseFolderResponse>;
        };
        shared: () => {
            in: (params?: {
                uuid?: string | undefined;
            } | undefined) => Promise<import("./v3/shared/in").SharedInResponse>;
            out: (params?: {
                uuid?: string | undefined;
                receiverId?: number | undefined;
            } | undefined) => Promise<import("./v3/shared/out").SharedOutResponse>;
        };
        upload: () => {
            done: (params_0: {
                uuid: string;
                name: string;
                nameHashed: string;
                size: string;
                chunks: number;
                mime: string;
                rm: string;
                metadata: string;
                version: import("../types").FileEncryptionVersion;
                uploadKey: string;
            }) => Promise<import("./v3/upload/done").UploadDoneResponse>;
        };
    };
}
export default API;
