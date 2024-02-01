import type APIClient from "../client";
export default class Health {
    private readonly apiClient;
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    get(): Promise<string>;
}
