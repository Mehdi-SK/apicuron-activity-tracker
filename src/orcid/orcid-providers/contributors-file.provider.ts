import { readFileSync } from 'fs'
import * as yaml from 'yaml'
import { Logger } from '../../logger.js'

export class ContributorsFileProvider {
  constructor(private filePath: string) {
    this.filePath = filePath
    this.build()
  }

  private logger = new Logger('ContributorsFileProvider')

  // Full name: Orcid
  public contributorsMap: Map<string, string> = new Map()

  build(): void {
    try {
      const fileContent = readFileSync(this.filePath, 'utf-8')
      const contributors: Record<string, { orcid?: string }> =
        yaml.parse(fileContent)

      for (const [name, details] of Object.entries(contributors)) {
        if (details.orcid) {
          this.contributorsMap.set(name, details.orcid)
        } else {
          this.logger.warning(
            `ORCID not found for '${name}' in contributors file. They will not be credited unless you add their ORCID.`
          )
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to read or parse contributors file at ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getOrcidByName(name: string): string {
     const orcid = this.contributorsMap.get(name)
     if (!orcid) {
       throw new Error(`ORCID not found for contributor: ${name}`)
     }
     return orcid
  }
}
