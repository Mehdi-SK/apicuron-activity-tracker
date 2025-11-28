import { Logger } from '../../logger.js'
import { Report } from '../../types/report.schema.js'
import { ApicuronProcessor } from '../processor.interface.js'

export class DocRepositoryProcessor implements ApicuronProcessor<unknown> {
  process(input: unknown): Report[] | Promise<Report[]> {
    // Parse through the md files, exclude files that have "search_exclude" set to true
    // Fllowing structure here: https://jekyllrb.com/docs/structure/ We can skip the known jekyll non-page files
    const repoRoot = process.env.GITHUB_WORKSPACE ?? process.cwd()

    Logger.info(`GitHub workspace path: ${repoRoot}`)
    return []
  }
}
