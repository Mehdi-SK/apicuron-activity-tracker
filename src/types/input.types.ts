export const ExecutionMode = {
  commits: 'per-commit',
  ett: 'ETT'
} as const

export type ExecutionMode = (typeof ExecutionMode)[keyof typeof ExecutionMode]

export type ApicuronConfig = {
  environment: 'dev' | 'prod'
  apicuron_token: string
  resource_id: string
}

export type OrcidLookupServiceConfig = {
  orcid_lookup_service_endpoint: string
  orcid_lookup_service_token?: string
}

export type ActionInputs = {
  mode: ExecutionMode
  apicuron: ApicuronConfig
  orcid_lookup_service: OrcidLookupServiceConfig
}
