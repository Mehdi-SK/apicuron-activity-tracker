// ...existing code...

import { SLogger } from '../logger.js'
import { ApicuronConfig } from '../types/input.types.js'
import { Report } from '../types/report.schema.js'

export class APICURONClient {
  private endpoint: string
  private token: string

  constructor(config: ApicuronConfig) {
    const endpoints = {
      prod: 'https://apicuron.org/api/reports',
      dev: 'https://dev.apicuron.org/api/reports'
    }
    this.endpoint = endpoints[config.environment]
    this.token = config.apicuron_token
  }

  async sendReports(reports: Report[]): Promise<void> {
    try {
      SLogger.info(`Sending ${reports.length} reports to ${this.endpoint}`)

      const requestBody = { reports }

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
        SLogger.error(`API Error: ${response.status} ${response.statusText}`)
        SLogger.error(`Response body: ${JSON.stringify(responseBody)}`)
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        )
      }

      SLogger.info(`Successfully sent ${reports.length} reports`)
      SLogger.debug(`API Response: ${JSON.stringify(responseBody)}`)
    } catch (error) {
      SLogger.error('Failed to send reports')
      if (error instanceof Error) {
        SLogger.error(error.stack || error.message)
      }
      throw error
    }
  }
}
