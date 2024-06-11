import type APIClient from "../../client";
export type UserAccountPlan = {
    cost: number;
    endTimestamp: number;
    id: number;
    lengthType: string;
    name: string;
    storage: number;
};
export type UserAccountSubsInvoices = {
    gateway: string;
    id: string;
    planCost: number;
    planName: string;
    subId: string;
    timestamp: number;
};
export type UserAccountSubs = {
    id: string;
    planId: number;
    planName: string;
    planCost: number;
    gateway: string;
    storage: number;
    activated: number;
    cancelled: number;
    startTimestamp: number;
    cancelTimestamp: number;
};
export type UserAccountResponse = {
    affBalance: number;
    affCount: number;
    affEarnings: number;
    affId: string;
    affRate: number;
    avatarURL: string;
    email: string;
    invoices: [];
    isPremium: 0 | 1;
    maxStorage: number;
    personal: {
        city: string | null;
        companyName: string | null;
        country: string | null;
        firstName: string | null;
        lastName: string | null;
        postalCode: string | null;
        street: string | null;
        streetNumber: string | null;
        vatId: string | null;
    };
    plans: UserAccountPlan[];
    refId: string;
    refLimit: number;
    refStorage: number;
    referCount: number;
    referStorage: number;
    storage: number;
    nickName: string;
    displayName: string;
    appearOffline: boolean;
    subs: UserAccountSubs[];
    subsInvoices: UserAccountSubsInvoices[];
    didExportMasterKeys: boolean;
};
/**
 * UserAccount
 * @date 2/1/2024 - 8:16:35 PM
 *
 * @export
 * @class UserAccount
 * @typedef {UserAccount}
 */
export declare class UserAccount {
    private readonly apiClient;
    /**
     * Creates an instance of UserAccount.
     * @date 2/1/2024 - 8:16:39 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }: {
        apiClient: APIClient;
    });
    /**
     * Get the user's account information.
     * @date 2/10/2024 - 1:25:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserAccountResponse>}
     */
    fetch(): Promise<UserAccountResponse>;
}
export default UserAccount;
