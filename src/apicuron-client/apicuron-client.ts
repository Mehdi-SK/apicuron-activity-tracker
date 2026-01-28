// ...existing code...

import { Logger } from '../logger.js'
import { ApicuronConfig } from '../types/input.types.js'
import { Report } from '../types/report.schema.js'
import { Environment } from './const.js'
import { BulkSendStrategy } from './strategies/bulk-send.strategy.js'
import { SendStrategy } from './strategies/send-strategy.interface.js'

export class APICURONClient {
    private environment: Environment
    private token: string
    private logger = new Logger('APICURONClient')

    private config: ApicuronConfig
    constructor(config: ApicuronConfig) {
        this.environment = config.environment
        this.token = config.apicuron_token
        this.config = config
    }

    async sendReports(reports: Report[]): Promise<void> {
        if (reports.length === 0) {
            this.logger.info('No valid commits to process')
            return
        }
        const strategy = this.selectSendStrategy(reports)

        try {
            this.logger.info(
                `Sending ${reports.length} reports to ${this.environment}`
            )
            strategy.sendReports(reports, this.config.resource_id)
            this.logger.info(`Successfully sent ${reports.length} reports`)
        } catch (error) {
            this.logger.error('Failed to send reports')
            if (error instanceof Error) {
                this.logger.error(error.stack || error.message)
            }
            throw error
        }
    }

    selectSendStrategy(reports: Report[]): SendStrategy {
        return new BulkSendStrategy({
            environment: this.environment,
            apiToken: this.token
        })
    }

    private async measurePayloadSize(reports: Report[]): Promise<number> {
        const payload = { reports: [...reports] } // your 415 reports
        const payloadString = JSON.stringify(payload)
        const sizeInBytes = new Blob([payloadString]).size
        const sizeInKB = sizeInBytes / 1024
        const sizeInMB = sizeInKB / 1024

        this.logger.info(
            `Payload size: ${sizeInBytes} bytes (${sizeInKB.toFixed(2)} KB, ${sizeInMB.toFixed(2)} MB)`
        )

        return sizeInKB
    }
}
