import * as core from '@actions/core'
import * as github from '@actions/github'
import { APICURONClient } from './apicuron-client/apicuron-client.js'
import { RemoteHandler } from './orcid/orcid-providers/remote-api.handler.js'

import { CommitProcessor } from './processors/commit/commit.processor.js'
import { DocRepositoryProcessor } from './processors/docrepository/docrepository.processor.js'
import { ExecutionMode } from './types/input.types.js'
import { Report } from './types/report.schema.js'
import { loadActionInputs } from './utils/loadActionInputs.js'
import { Logger } from './logger.js'

export async function run(): Promise<void> {
  try {
    const logger = new Logger('Main')
    const inputs = loadActionInputs()

    // setup orcid provider service
    const orcidProvider = new RemoteHandler(inputs.orcid_lookup_service)

    // setup processor
    const githubPayload = github.context.payload

    if (!githubPayload.commits || githubPayload.commits.length === 0) {
      logger.info('No commits found in the GitHub payload. Exiting.')
      return
    }

    let reports: Array<Report> = []
    if (inputs.mode === ExecutionMode.commits) {
      const commitProcessor = new CommitProcessor(orcidProvider)
      reports = await commitProcessor.process({
        githubPayload,
        apicuronResourceId: inputs.apicuron.resource_id
      })
    } else if (inputs.mode === ExecutionMode.ett) {
      logger.info('Processing ETT documents...')
      const ettProcessor = new DocRepositoryProcessor()
      reports = await ettProcessor.process({
        actionContext: github.context,
        apicuronResourceId: inputs.apicuron.resource_id
      })
    }

    
    logger.info(`sending reports to APICURON: ${inputs.apicuron.environment}`)
    const apicuronClient = new APICURONClient(inputs.apicuron)
    await apicuronClient.sendReports(reports)
    core.setOutput('reports sent:', JSON.stringify(reports))

    
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
