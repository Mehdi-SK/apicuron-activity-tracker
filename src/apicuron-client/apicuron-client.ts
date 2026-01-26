// ...existing code...

import { Logger } from '../logger.js'
import { ApicuronConfig } from '../types/input.types.js'
import { Report } from '../types/report.schema.js'

export class APICURONClient {
  private endpoint: string
  private token: string
  private logger = new Logger('APICURONClient')
  constructor(config: ApicuronConfig) {
    const endpoints = {
      prod: 'https://apicuron.org/api/reports',
      dev: 'https://dev.apicuron.org/api/reports'
    }
    this.endpoint = endpoints[config.environment]
    this.token = config.apicuron_token
  }

  async sendReports(reports: Report[]): Promise<void> {
    if (reports.length === 0) {
      this.logger.info('No valid commits to process')
      return
    }

    try {
      this.logger.info(`Sending ${reports.length} reports to ${this.endpoint}`)

      const requestBody = { reports }
      // In your frontend code before sending
      await this.measurePayloadSize(reports)
      const response = await fetch(this.endpoint, {
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

      this.logger.info(`Successfully sent ${reports.length} reports`)
      this.logger.debug(`API Response: ${JSON.stringify(responseBody)}`)
    } catch (error) {
      this.logger.error('Failed to send reports')
      if (error instanceof Error) {
        this.logger.error(error.stack || error.message)
      }
      throw error
    }
  }

  async bulkSendJsonReports(reports: Report[]): Promise<void> {}

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
