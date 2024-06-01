/**
 * ConfirmationSend
 * @date 2/1/2024 - 3:10:50 PM
 *
 * @export
 * @class ConfirmationSend
 * @typedef {ConfirmationSend}
 */
export class ConfirmationSend {
    apiClient;
    /**
     * Creates an instance of ConfirmationSend.
     * @date 2/1/2024 - 3:19:15 PM
     *
     * @constructor
     * @public
     * @param {{ apiClient: APIClient }} param0
     * @param {APIClient} param0.apiClient
     */
    constructor({ apiClient }) {
        this.apiClient = apiClient;
    }
    /**
     * Send a registration confirmation email.
     *
     * @public
     * @async
     * @param {{
     * 		email: string
     * 	}} param0
     * @param {string} param0.email
     * @returns {Promise<void>}
     */
    async fetch({ email }) {
        await this.apiClient.request({
            method: "POST",
            endpoint: "/v3/confirmation/send",
            data: {
                email
            }
        });
    }
}
export default ConfirmationSend;
//# sourceMappingURL=confirmationSend.js.map