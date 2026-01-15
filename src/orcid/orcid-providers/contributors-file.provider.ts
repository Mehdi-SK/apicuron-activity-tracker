import { readFileSync } from 'fs'
import * as yaml from 'yaml'
import { Logger } from '../../logger.js'

export class ContributorsFileProvider {
  constructor(private filePath: string) {
    this.filePath = filePath
  }

  // Full name: Orcid
  public contributorsMap: Map<string, string> = new Map()

  async build(): Promise<void> {
    try{
        const fileContent = await readFileSync(this.filePath, 'utf-8')
        const contributors: Record<string, { orcid?: string }> =
          yaml.parse(fileContent)
    
        for (const [name, details] of Object.entries(contributors)) {
          if (details.orcid) {
            this.contributorsMap.set(name, details.orcid)
          } else {
            Logger.warning(
              `ORCID not found for '${name}' in contributors file. They will not be credited unless you add their ORCID.`
            )
          }
        }

    }catch(error){
        Logger.error(`Failed to read or parse contributors file at ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


    getOrcidByName(name: string): string | undefined {
    return this.contributorsMap.get(name)
  }
}
