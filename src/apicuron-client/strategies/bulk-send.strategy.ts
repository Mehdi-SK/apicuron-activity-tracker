import { Report } from "../../types/report.schema.js";
import { EndpointMap } from "../const.js";
import { SendContext, SendStrategy } from "./send-strategy.interface.js";

export class BulkSendStrategy extends SendStrategy{
    private endpoint: string;
    constructor(context: SendContext) {
        super(context);
        this.endpoint = EndpointMap[context.environment] + "reports/bulk";
    }
    async sendReports(reports: Report[]): Promise<Response> {
        const fileContent = JSON.stringify({ reports }, null, 2)
        const file = new Blob([fileContent], { type: "application/json" })
        const formData = new FormData()
        formData.append("reports", file, "reports.json")

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
                version: "2"
            },
            body: formData
        })

        const contentType = response.headers.get("content-type") || ""
        const isJson = contentType.includes("application/json")
        const responseBody = isJson ? await response.json() : await response.text()

        if (!response.ok) {
            this.logger.error(`API Error: ${response.status} ${response.statusText}`)
            this.logger.error(`Response body: ${JSON.stringify(responseBody)}`)
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        return response
    }
}