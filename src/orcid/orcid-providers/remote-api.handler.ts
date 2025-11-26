import * as core from '@actions/core'
import { OrcidLookupServiceConfig } from '../../types/input.types.js'
import { CacheableOrcidProvider } from '../../utils/cache.js'
import { OrcidProvider } from './orcid-provider.abstract.js'

export class RemoteHandler extends CacheableOrcidProvider(OrcidProvider) {
  constructor(private remoteServiceApiConfig: OrcidLookupServiceConfig) {
    super()
  }

  async getUserOrcid(username: string): Promise<string | undefined> {
    if (this.getCache(username)) {
      core.debug(`Cache hit for user '${username}'`)
      return this.getCache(username)!
    }

    try {
      const response = await this.fetchUserOrcid(username)

      const data = (await response?.json()) as { orcid_id?: string }

      if (!data || !data?.orcid_id) {
        core.notice(`No ORCID found for user '${username}' in API response`)
      } else {
        this.setCache(username, data.orcid_id)
        return data.orcid_id
      }
    } catch (error) {
      core.error(
        `Failed to fetch user info for ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return 'unknown'
    }
  }

  private async fetchUserOrcid(
    username: string
  ): Promise<Response | undefined> {
    const url = new URL(
      this.remoteServiceApiConfig.orcid_lookup_service_endpoint
    )
    url.searchParams.append('profileName', username)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    const token = this.remoteServiceApiConfig.orcid_lookup_service_token
    if (token) {
      headers.Authorization = `tokenKey ${token}`
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    if (!response.ok) {
      if (response.status >= 400) {
        core.warning(
          `User '${username}' won't be credited - no ORCID associated with their github account`
        )
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }
    return response
  }
}
