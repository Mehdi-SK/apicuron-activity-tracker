import { Logger } from '../../logger.js'
import { GithubPayload } from '../../types/github.types.js'
import { Report } from '../../types/report.schema.js'
import { ApicuronProcessor } from '../processor.interface.js'

type DocRepositoryProcessorInput = {
  githubPayload: GithubPayload
}

export class DocRepositoryProcessor
  implements ApicuronProcessor<DocRepositoryProcessorInput>
{
  process(input: DocRepositoryProcessorInput): Report[] | Promise<Report[]> {
    // Parse through the md files, exclude files that have "search_exclude" set to true
    // Fllowing structure here: https://jekyllrb.com/docs/structure/ We can skip the known jekyll non-page files
    const repoRoot = process.env.GITHUB_WORKSPACE ?? process.cwd()
    Logger.info(`GitHub workspace path: ${repoRoot}`)

    const addedFiles = this.getFilesAddedInCommits(input.githubPayload)
    Logger.info(`Files added in commits: ${addedFiles.join(', ')}`)
    return []
  }

  private getFilesAddedInCommits(githubPayload: GithubPayload): string[] {
    return githubPayload.commits.flatMap((commit: { added: string[] }) => {
      return commit.added
    })
  }
}
