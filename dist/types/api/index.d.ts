import V3Health from "./v3/health";
import V3DirContent from "./v3/dir/content";
import V3AuthInfo from "./v3/auth/info";
import V3Login from "./v3/login";
import V3UserInfo from "./v3/user/info";
import V3UserBaseFolder from "./v3/user/baseFolder";
import V3SharedIn from "./v3/shared/in";
export type APIConfig = {
    apiKey: string;
};
export declare class API {
    private readonly config;
    private apiClient;
    constructor(params: APIConfig);
    v3(): {
        health: () => V3Health;
        dir: () => {
            content: () => V3DirContent;
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
        };
    };
}
export default API;
