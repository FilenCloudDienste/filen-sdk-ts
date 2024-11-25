/// <reference types="node" />
import type API from "../api";
import { type FilenSDKConfig, FilenSDK } from "..";
import { type UserInfoResponse } from "../api/v3/user/info";
import { type UserSettingsResponse } from "../api/v3/user/settings";
import { type UserAccountResponse } from "../api/v3/user/account";
import { type UserGDPRResponse } from "../api/v3/user/gdpr";
import { type UserEvent } from "../api/v3/user/events";
import { type UserEventResponse } from "../api/v3/user/event";
import { type PaymentMethods } from "../api/v3/user/sub/create";
import { type UserProfileResponse } from "../api/v3/user/profile";
import { type UserLockStatus } from "../api/v3/user/lock";
export type UserConfig = {
    sdkConfig: FilenSDKConfig;
    api: API;
    sdk: FilenSDK;
};
/**
 * User
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class User
 * @typedef {User}
 */
export declare class User {
    private readonly api;
    private readonly sdkConfig;
    private readonly sdk;
    /**
     * Creates an instance of User.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {UserConfig} params
     */
    constructor(params: UserConfig);
    /**
     * Fetch the user's info.
     * @date 2/20/2024 - 6:39:47 AM
     *
     * @public
     * @async
     * @returns {Promise<UserInfoResponse>}
     */
    info(): Promise<UserInfoResponse>;
    /**
     * Fetch the user's base folder UUID.
     * @date 2/20/2024 - 6:40:17 AM
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    baseFolder(): Promise<string>;
    /**
     * Get a user's public key.
     * @date 2/20/2024 - 6:41:01 AM
     *
     * @public
     * @async
     * @param {{email: string}} param0
     * @param {string} param0.email
     * @returns {Promise<string>}
     */
    publicKey({ email }: {
        email: string;
    }): Promise<string>;
    /**
     * Fetch the user's settings.
     * @date 2/20/2024 - 6:41:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserSettingsResponse>}
     */
    settings(): Promise<UserSettingsResponse>;
    /**
     * Fetch user account.
     * @date 2/20/2024 - 6:42:45 AM
     *
     * @public
     * @async
     * @returns {Promise<UserAccountResponse>}
     */
    account(): Promise<UserAccountResponse>;
    /**
     * Fetch GDPR info.
     * @date 2/20/2024 - 6:43:36 AM
     *
     * @public
     * @async
     * @returns {Promise<UserGDPRResponse>}
     */
    gdpr(): Promise<UserGDPRResponse>;
    /**
     * Upload an avatar.
     * @date 2/20/2024 - 6:46:44 AM
     *
     * @public
     * @async
     * @param {{buffer: Buffer}} param0
     * @param {Buffer} param0.buffer
     * @returns {Promise<void>}
     */
    uploadAvatar({ buffer }: {
        buffer: Buffer;
    }): Promise<void>;
    /**
     * Change email.
     * @date 2/20/2024 - 6:50:24 AM
     *
     * @public
     * @async
     * @param {{email: string, password: string}} param0
     * @param {string} param0.email
     * @param {string} param0.password
     * @returns {Promise<void>}
     */
    changeEmail({ email, password }: {
        email: string;
        password: string;
    }): Promise<void>;
    /**
     * Update personal information.
     * @date 2/20/2024 - 6:52:44 AM
     *
     * @public
     * @async
     * @param {{
     * 		city?: string
     * 		companyName?: string
     * 		country?: string
     * 		firstName?: string
     * 		lastName?: string
     * 		postalCode?: string
     * 		street?: string
     * 		streetNumber?: string
     * 		vatId?: string
     * 	}} param0
     * @param {string} [param0.city="__NONE__"]
     * @param {string} [param0.companyName="__NONE__"]
     * @param {string} [param0.country="__NONE__"]
     * @param {string} [param0.firstName="__NONE__"]
     * @param {string} [param0.lastName="__NONE__"]
     * @param {string} [param0.postalCode="__NONE__"]
     * @param {string} [param0.street="__NONE__"]
     * @param {string} [param0.streetNumber="__NONE__"]
     * @param {string} [param0.vatId="__NONE__"]
     * @returns {Promise<void>}
     */
    updatePersonalInformation({ city, companyName, country, firstName, lastName, postalCode, street, streetNumber, vatId }: {
        city?: string;
        companyName?: string;
        country?: string;
        firstName?: string;
        lastName?: string;
        postalCode?: string;
        street?: string;
        streetNumber?: string;
        vatId?: string;
    }): Promise<void>;
    /**
     * Request account deletion.
     * @date 2/20/2024 - 6:54:22 AM
     *
     * @public
     * @async
     * @param {{ twoFactorCode?: string }} param0
     * @param {string} [param0.twoFactorCode="XXXXXX"]
     * @returns {Promise<void>}
     */
    delete({ twoFactorCode }: {
        twoFactorCode?: string;
    }): Promise<void>;
    /**
     * Delete all versioned files.
     * @date 2/20/2024 - 6:54:57 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    deleteAllVersionedFiles(): Promise<void>;
    /**
     * Delete all files and directories.
     * @date 2/20/2024 - 6:55:20 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    deleteEverything(): Promise<void>;
    /**
     * Change password.
     * @date 2/20/2024 - 7:03:26 AM
     *
     * @public
     * @async
     * @param {{ currentPassword: string; newPassword: string }} param0
     * @param {string} param0.currentPassword
     * @param {string} param0.newPassword
     * @returns {Promise<string>}
     */
    changePassword({ currentPassword, newPassword }: {
        currentPassword: string;
        newPassword: string;
    }): Promise<string>;
    /**
     * Mark the current master keys as exported.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    didExportMasterKeys(): Promise<void>;
    /**
     * Check if the current API key is valid.
     *
     * @public
     * @async
     * @returns {Promise<boolean>}
     */
    checkAPIKeyValidity(): Promise<boolean>;
    /**
     * Enable two factor authentication. Returns the recovery keys.
     * @date 2/20/2024 - 7:04:35 AM
     *
     * @public
     * @async
     * @param {{twoFactorCode: string}} param0
     * @param {string} param0.twoFactorCode
     * @returns {Promise<string>}
     */
    enableTwoFactorAuthentication({ twoFactorCode }: {
        twoFactorCode: string;
    }): Promise<string>;
    /**
     * Disable two factor authentication.
     * @date 2/20/2024 - 7:05:03 AM
     *
     * @public
     * @async
     * @param {{ twoFactorCode: string }} param0
     * @param {string} param0.twoFactorCode
     * @returns {Promise<void>}
     */
    disableTwoFactorAuthentication({ twoFactorCode }: {
        twoFactorCode: string;
    }): Promise<void>;
    /**
     * Fetch events based on timestamp and filter. Timestamp can be used for pagination.
     *
     * @public
     * @async
     * @param {?{ timestamp?: number; filter?: "all" }} [params]
     * @returns {Promise<UserEvent[]>}
     */
    events(params?: {
        timestamp?: number;
        filter?: "all";
    }): Promise<UserEvent[]>;
    /**
     * Fetch info about an event.
     * @date 2/20/2024 - 7:10:44 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<UserEventResponse>}
     */
    event({ uuid }: {
        uuid: string;
    }): Promise<UserEventResponse>;
    /**
     * Cancel a subscription.
     * @date 2/20/2024 - 7:12:09 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<void>}
     */
    cancelSubscription({ uuid }: {
        uuid: string;
    }): Promise<void>;
    /**
     * Create a subscription payment flow. Returns the payment gateway URL.
     * @date 2/20/2024 - 7:13:19 AM
     *
     * @public
     * @async
     * @param {{planId: number, paymentMethod: PaymentMethods}} param0
     * @param {number} param0.planId
     * @param {PaymentMethods} param0.paymentMethod
     * @returns {Promise<string>}
     */
    createSubscription({ planId, paymentMethod }: {
        planId: number;
        paymentMethod: PaymentMethods;
    }): Promise<string>;
    /**
     * Generate a PDF invoice. Returns PDF data as a Base64 encoded string.
     * @date 2/20/2024 - 7:14:22 AM
     *
     * @public
     * @async
     * @param {{uuid: string}} param0
     * @param {string} param0.uuid
     * @returns {Promise<string>}
     */
    generateInvoice({ uuid }: {
        uuid: string;
    }): Promise<string>;
    /**
     * Request an affiliate payout.
     * @date 2/20/2024 - 7:15:26 AM
     *
     * @public
     * @async
     * @param {{method: string, address: string}} param0
     * @param {string} param0.method
     * @param {string} param0.address
     * @returns {Promise<void>}
     */
    requestAffiliatePayout({ method, address }: {
        method: string;
        address: string;
    }): Promise<void>;
    /**
     * Toggle file versioning on/off.
     * @date 2/20/2024 - 7:16:11 AM
     *
     * @public
     * @async
     * @param {{enabled: boolean}} param0
     * @param {boolean} param0.enabled
     * @returns {Promise<void>}
     */
    versioning({ enabled }: {
        enabled: boolean;
    }): Promise<void>;
    /**
     * Toggle login alerts on/off.
     * @date 2/20/2024 - 7:16:54 AM
     *
     * @public
     * @async
     * @param {{enabled: boolean}} param0
     * @param {boolean} param0.enabled
     * @returns {Promise<void>}
     */
    loginAlerts({ enabled }: {
        enabled: boolean;
    }): Promise<void>;
    /**
     * Update account nickname.
     * @date 2/20/2024 - 7:17:43 AM
     *
     * @public
     * @async
     * @param {{nickname: string}} param0
     * @param {string} param0.nickname
     * @returns {Promise<void>}
     */
    updateNickname({ nickname }: {
        nickname: string;
    }): Promise<void>;
    /**
     * Toggle appear offline status on/off.
     * @date 2/20/2024 - 7:18:12 AM
     *
     * @public
     * @async
     * @param {{ enabled: boolean }} param0
     * @param {boolean} param0.enabled
     * @returns {Promise<void>}
     */
    appearOffline({ enabled }: {
        enabled: boolean;
    }): Promise<void>;
    /**
     * Fetch a user's public profile.
     * @date 2/20/2024 - 7:19:15 AM
     *
     * @public
     * @async
     * @param {{id: number}} param0
     * @param {number} param0.id
     * @returns {Promise<UserProfileResponse>}
     */
    profile({ id }: {
        id: number;
    }): Promise<UserProfileResponse>;
    /**
     * Update desktop last active timestamp.
     * @date 2/20/2024 - 7:20:56 AM
     *
     * @public
     * @async
     * @param {{timestamp: number}} param0
     * @param {number} param0.timestamp
     * @returns {Promise<void>}
     */
    updateDesktopLastActive({ timestamp }: {
        timestamp: number;
    }): Promise<void>;
    /**
     * Lock a resource.
     *
     * @public
     * @async
     * @param {{
     * 		resource: string
     * 		lockUUID: string
     * 		maxTries?: number
     * 		tryTimeout?: number
     * 	}} param0
     * @param {string} param0.resource
     * @param {string} param0.lockUUID
     * @param {number} [param0.maxTries=86400]
     * @param {number} [param0.tryTimeout=1000]
     * @returns {Promise<void>}
     */
    acquireResourceLock({ resource, lockUUID, maxTries, tryTimeout }: {
        resource: string;
        lockUUID: string;
        maxTries?: number;
        tryTimeout?: number;
    }): Promise<void>;
    /**
     * Unlock a resource.
     *
     * @public
     * @async
     * @param {{ resource: string; lockUUID: string }} param0
     * @param {string} param0.resource
     * @param {string} param0.lockUUID
     * @returns {Promise<void>}
     */
    releaseResourceLock({ resource, lockUUID }: {
        resource: string;
        lockUUID: string;
    }): Promise<void>;
    /**
     * Refresh a resource lock.
     *
     * @public
     * @async
     * @param {{ resource: string; lockUUID: string }} param0
     * @param {string} param0.resource
     * @param {string} param0.lockUUID
     * @returns {Promise<void>}
     */
    refreshResourceLock({ resource, lockUUID }: {
        resource: string;
        lockUUID: string;
    }): Promise<void>;
    /**
     * Fetch resource lock status.
     *
     * @public
     * @async
     * @param {{ resource: string }} param0
     * @param {string} param0.resource
     * @returns {Promise<UserLockStatus>}
     */
    resourceLockStatus({ resource }: {
        resource: string;
    }): Promise<UserLockStatus>;
}
export default User;
