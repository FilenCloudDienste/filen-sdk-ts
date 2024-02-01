import V3Health from "./v3/health";
import V3DirContent from "./v3/dir/content";
import V3AuthInfo from "./v3/auth/info";
import V3Login from "./v3/login";
import V3UserInfo from "./v3/user/info";
import V3UserBaseFolder from "./v3/user/baseFolder";
import V3SharedIn from "./v3/shared/in";
import V3SharedOut from "./v3/shared/out";
import V3UploadDone from "./v3/upload/done";
import V3DirDownload from "./v3/dir/download";
import V3DirShared from "./v3/dir/shared";
import V3DirLinked from "./v3/dir/linked";
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
        health: () => V3Health;
        dir: () => {
            content: () => V3DirContent;
            download: () => V3DirDownload;
            shared: () => V3DirShared;
            linked: () => V3DirLinked;
        };
        auth: () => {
            info: () => V3AuthInfo;
        };
        login: () => V3Login;
        user: () => {
            info: () => V3UserInfo;
            baseFolder: () => V3UserBaseFolder;
        };
        shared: () => {
            in: () => V3SharedIn;
            out: () => V3SharedOut;
        };
        upload: () => {
            done: () => V3UploadDone;
        };
    };
}
export default API;
