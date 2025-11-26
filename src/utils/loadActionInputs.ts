import { getInput } from '@actions/core'
import { ActionInputs, ExecutionMode } from '../types/input.types.js'

export function loadActionInputs(): ActionInputs {
  return {
    mode: (getInput('MODE') || 'per-commit') as ExecutionMode,

    apicuron: {
      environment: (getInput('APICURON_ENVIRONMENT') || 'dev') as
        | 'dev'
        | 'prod',
      apicuron_token: getInput('APICURON_TOKEN', { required: true }),
      resource_id: getInput('RESOURCE_ID', { required: true })
    },
    orcid_lookup_service: {
      orcid_lookup_service_endpoint: getInput('ORCID_LOOKUP_SERVICE_ENDPOINT', {
        required: true
      }),
      orcid_lookup_service_token: getInput('ORCID_LOOKUP_SERVICE_TOKEN')
    }
  }
}
