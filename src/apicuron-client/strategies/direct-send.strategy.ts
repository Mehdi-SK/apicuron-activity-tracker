import { Report } from '../../types/report.schema.js'
import { EndpointMap } from '../const.js'
import { SendContext, SendStrategy } from './send-strategy.interface.js'

export class DirectSendStrategy extends SendStrategy {
    private apiUrl: string
    constructor(context: SendContext) {
        super(context)
        this.apiUrl = EndpointMap[context.environment] + 'reports'
    }
    async sendReports(reports: Report[]): Promise<Response> {
        const requestBody = { reports }
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
                version: '2'
            },
            body: JSON.stringify(requestBody)
        })

        const contentType = response.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const responseBody = isJson
            ? await response.json()
            : await response.text()

        if (!response.ok) {
            this.logger.error(
                `API Error: ${response.status} ${response.statusText}`
            )
            this.logger.error(`Response body: ${JSON.stringify(responseBody)}`)
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            )
        }
        return response
    }
}
