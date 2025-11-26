import * as core from '@actions/core'
import * as github from '@actions/github'
import { APICURONClient } from './apicuron-client/apicuron-client.js'
import { RemoteHandler } from './orcid/orcid-providers/remote-api.handler.js'
import { CommitProcessor } from './processors/commit.processor.js'

import { ExecutionMode } from './types/input.types.js'
import { Report } from './types/report.schema.js'
import { loadActionInputs } from './utils/loadActionInputs.js'

export async function run(): Promise<void> {
  try {
    const inputs = loadActionInputs()

    // setup orcid provider service
    const orcidProvider = new RemoteHandler(inputs.orcid_lookup_service)

    // setup processor
    const githubPayload = github.context.payload
    let reports: Array<Report> = []
    if (inputs.mode === ExecutionMode.commits) {
      const commitProcessor = new CommitProcessor(orcidProvider)
      reports = await commitProcessor.process({
        githubPayload,
        apicuronResourceId: inputs.apicuron.resource_id
      })
    } else if (inputs.mode === ExecutionMode.ett) {
      throw new Error('ETT mode not implemented yet')
    }

    if (reports.length === 0) {
      core.info('No valid commits to process')
      return
    }
    core.info(`Generated ${reports.length} reports`)
    core.info(`sending reports to APICURON: ${inputs.apicuron.environment}`)
    console.log(JSON.stringify(reports, null, 2))

    const apicuronClient = new APICURONClient(inputs.apicuron)
    await apicuronClient.sendReports(reports)
    core.setOutput('reports sent:', JSON.stringify(reports))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
