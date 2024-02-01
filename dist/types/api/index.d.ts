import V3Health from "./v3/health";
import V3DirContent from "./v3/dir/content";
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
    };
}
export default API;
