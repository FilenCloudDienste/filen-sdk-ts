import { APIError } from "..";
import { v4 as uuidv4 } from "uuid";
/**
 * User
 * @date 2/1/2024 - 2:44:47 AM
 *
 * @export
 * @class User
 * @typedef {User}
 */
export class User {
    api;
    sdkConfig;
    sdk;
    /**
     * Creates an instance of User.
     * @date 2/9/2024 - 5:54:11 AM
     *
     * @constructor
     * @public
     * @param {UserConfig} params
     */
    constructor(params) {
        this.api = params.api;
        this.sdkConfig = params.sdkConfig;
        this.sdk = params.sdk;
    }
    /**
     * Fetch the user's info.
     * @date 2/20/2024 - 6:39:47 AM
     *
     * @public
     * @async
     * @returns {Promise<UserInfoResponse>}
     */
    async info() {
        return await this.api.v3().user().info({ apiKey: undefined });
    }
    /**
     * Fetch the user's base folder UUID.
     * @date 2/20/2024 - 6:40:17 AM
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    async baseFolder() {
        return (await this.api.v3().user().baseFolder({ apiKey: undefined })).uuid;
    }
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
    async publicKey({ email }) {
        return (await this.api.v3().user().publicKey({ email })).publicKey;
    }
    /**
     * Fetch the user's settings.
     * @date 2/20/2024 - 6:41:53 AM
     *
     * @public
     * @async
     * @returns {Promise<UserSettingsResponse>}
     */
    async settings() {
        return await this.api.v3().user().settings();
    }
    /**
     * Fetch user account.
     * @date 2/20/2024 - 6:42:45 AM
     *
     * @public
     * @async
     * @returns {Promise<UserAccountResponse>}
     */
    async account() {
        return await this.api.v3().user().account();
    }
    /**
     * Fetch GDPR info.
     * @date 2/20/2024 - 6:43:36 AM
     *
     * @public
     * @async
     * @returns {Promise<UserGDPRResponse>}
     */
    async gdpr() {
        return await this.api.v3().user().gdpr();
    }
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
    async uploadAvatar({ buffer }) {
        const base64 = buffer.toString("base64");
        const hash = await this.sdk.getWorker().crypto.utils.bufferToHash({
            buffer: Buffer.from(base64, "utf-8"),
            algorithm: "sha512"
        });
        await this.api.v3().user().avatar({
            base64,
            hash
        });
    }
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
    async changeEmail({ email, password }) {
        const authInfo = await this.api.v3().auth().info({ email: this.sdkConfig.email });
        const derived = await this.sdk.getWorker().crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
            rawPassword: password,
            authVersion: this.sdkConfig.authVersion,
            salt: authInfo.salt
        });
        await this.api
            .v3()
            .user()
            .settingsEmail()
            .change({ email, password: derived.derivedPassword, authVersion: this.sdkConfig.authVersion });
    }
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
    async updatePersonalInformation({ city = "__NONE__", companyName = "__NONE__", country = "__NONE__", firstName = "__NONE__", lastName = "__NONE__", postalCode = "__NONE__", street = "__NONE__", streetNumber = "__NONE__", vatId = "__NONE__" }) {
        if (city.length <= 0) {
            city = "__NONE__";
        }
        if (companyName.length <= 0) {
            companyName = "__NONE__";
        }
        if (country.length <= 0) {
            country = "__NONE__";
        }
        if (firstName.length <= 0) {
            firstName = "__NONE__";
        }
        if (lastName.length <= 0) {
            lastName = "__NONE__";
        }
        if (postalCode.length <= 0) {
            postalCode = "__NONE__";
        }
        if (street.length <= 0) {
            street = "__NONE__";
        }
        if (streetNumber.length <= 0) {
            streetNumber = "__NONE__";
        }
        if (vatId.length <= 0) {
            vatId = "__NONE__";
        }
        await this.api
            .v3()
            .user()
            .personal()
            .change({ city, companyName, country, firstName, lastName, postalCode, street, streetNumber, vatId });
    }
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
    async delete({ twoFactorCode = "XXXXXX" }) {
        await this.api.v3().user().delete({ twoFactorCode });
    }
    /**
     * Delete all versioned files.
     * @date 2/20/2024 - 6:54:57 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async deleteAllVersionedFiles() {
        await this.api.v3().user().deleteVersions();
    }
    /**
     * Delete all files and directories.
     * @date 2/20/2024 - 6:55:20 AM
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async deleteEverything() {
        await this.api.v3().user().deleteAll();
    }
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
    async changePassword({ currentPassword, newPassword }) {
        const authInfo = await this.api.v3().auth().info({ email: this.sdkConfig.email });
        const derivedCurrent = await this.sdk.getWorker().crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
            rawPassword: currentPassword,
            authVersion: this.sdkConfig.authVersion,
            salt: authInfo.salt
        });
        const newSalt = await this.sdk.getWorker().crypto.utils.generateRandomString({ length: 256 });
        const derivedNew = await this.sdk.getWorker().crypto.utils.generatePasswordAndMasterKeyBasedOnAuthVersion({
            rawPassword: newPassword,
            authVersion: this.sdkConfig.authVersion,
            salt: newSalt
        });
        const newMasterKeys = [
            ...this.sdkConfig.masterKeys.filter(key => key !== derivedNew.derivedMasterKeys),
            derivedNew.derivedMasterKeys
        ];
        const newMasterKeysEncrypted = await this.sdk.getWorker().crypto.encrypt.metadata({
            metadata: newMasterKeys.join("|"),
            key: derivedNew.derivedMasterKeys
        });
        const response = await this.api.v3().user().settingsPassword().change({
            password: derivedNew.derivedPassword,
            currentPassword: derivedCurrent.derivedPassword,
            authVersion: this.sdkConfig.authVersion,
            salt: newSalt,
            masterKeys: newMasterKeysEncrypted
        });
        return response.newAPIKey;
    }
    /**
     * Mark the current master keys as exported.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    async didExportMasterKeys() {
        return await this.api.v3().user().didExportMasterKeys();
    }
    /**
     * Check if the current API key is valid.
     *
     * @public
     * @async
     * @returns {Promise<boolean>}
     */
    async checkAPIKeyValidity() {
        try {
            await this.api.v3().user().account();
            return true;
        }
        catch (e) {
            if (e instanceof APIError && (e.code === "api_key_not_found" || e.code === "invalid_api_key")) {
                return false;
            }
            if (e instanceof Error && e.message.toLowerCase().includes("api") && e.message.toLowerCase().includes("key")) {
                return false;
            }
            throw e;
        }
    }
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
    async enableTwoFactorAuthentication({ twoFactorCode }) {
        return (await this.api.v3().user().twoFactorAuthentication().enable({ code: twoFactorCode })).recoveryKeys;
    }
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
    async disableTwoFactorAuthentication({ twoFactorCode }) {
        return await this.api.v3().user().twoFactorAuthentication().disable({ code: twoFactorCode });
    }
    /**
     * Fetch events based on timestamp and filter. Timestamp can be used for pagination.
     *
     * @public
     * @async
     * @param {?{ timestamp?: number; filter?: "all" }} [params]
     * @returns {Promise<UserEvent[]>}
     */
    async events(params) {
        const result = await this.api
            .v3()
            .user()
            .events({
            lastTimestamp: params && params.timestamp ? params.timestamp : Math.floor(Date.now() / 1000) + 60,
            filter: params && params.filter ? params.filter : "all"
        });
        return await Promise.all(result.map(event => this.sdk.getWorker().crypto.decrypt.event({ event })));
    }
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
    async event({ uuid }) {
        return await this.sdk.getWorker().crypto.decrypt.event({ event: await this.api.v3().user().event({ uuid }) });
    }
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
    async cancelSubscription({ uuid }) {
        await this.api.v3().user().sub().cancel({ uuid });
    }
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
    async createSubscription({ planId, paymentMethod }) {
        return (await this.api.v3().user().sub().create({ planId, method: paymentMethod })).url;
    }
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
    async generateInvoice({ uuid }) {
        return await this.api.v3().user().invoice({ uuid });
    }
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
    async requestAffiliatePayout({ method, address }) {
        await this.api.v3().user().affiliate().payout({ address, method });
    }
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
    async versioning({ enabled }) {
        await this.api.v3().user().versioning({ enable: enabled });
    }
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
    async loginAlerts({ enabled }) {
        await this.api.v3().user().loginAlerts({ enable: enabled });
    }
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
    async updateNickname({ nickname }) {
        await this.api.v3().user().nickname({ nickname });
    }
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
    async appearOffline({ enabled }) {
        await this.api.v3().user().appearOffline({ appearOffline: enabled });
    }
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
    async profile({ id }) {
        return await this.api.v3().user().profile({ id });
    }
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
    async updateDesktopLastActive({ timestamp }) {
        await this.api.v3().user().lastActive().desktop({ timestamp });
    }
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
    async acquireResourceLock({ resource, lockUUID, maxTries = 86400, tryTimeout = 1000 }) {
        let tries = 0;
        while (tries < maxTries) {
            tries += 1;
            const response = await this.api.v3().user().lock({
                uuid: lockUUID,
                resource,
                type: "acquire"
            });
            if (response.acquired) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, tryTimeout));
        }
        throw new Error(`Could not acquire lock for resource ${resource}. Max tries of ${maxTries} reached.`);
    }
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
    async releaseResourceLock({ resource, lockUUID }) {
        const response = await this.api.v3().user().lock({
            uuid: lockUUID,
            resource,
            type: "release"
        });
        if (!response.released) {
            throw new Error(`Could not release lock for resource ${resource} with lockUUID ${lockUUID}.`);
        }
    }
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
    async refreshResourceLock({ resource, lockUUID }) {
        const response = await this.api.v3().user().lock({
            uuid: lockUUID,
            resource,
            type: "refresh"
        });
        if (!response.refreshed) {
            throw new Error(`Could not refresh lock for resource ${resource} with lockUUID ${lockUUID}.`);
        }
    }
    /**
     * Fetch resource lock status.
     *
     * @public
     * @async
     * @param {{ resource: string }} param0
     * @param {string} param0.resource
     * @returns {Promise<UserLockStatus>}
     */
    async resourceLockStatus({ resource }) {
        const response = await this.api.v3().user().lock({
            uuid: uuidv4(),
            resource,
            type: "status"
        });
        return response.status;
    }
}
export default User;
//# sourceMappingURL=index.js.map