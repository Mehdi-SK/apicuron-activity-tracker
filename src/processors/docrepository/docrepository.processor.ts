import { readFileSync } from 'fs'
import { Logger } from '../../logger.js'
import { GithubPayload } from '../../types/github.types.js'
import { Report } from '../../types/report.schema.js'
import { ApicuronProcessor } from '../processor.interface.js'
import { ArticleIterator } from './article-iterator.js'
import { ArticleParser } from './article-parser.js'

type DocRepositoryProcessorInput = {
  githubPayload: GithubPayload
}

export class DocRepositoryProcessor
  implements ApicuronProcessor<DocRepositoryProcessorInput>
{
  private readonly articleParser = new ArticleParser()

  get repoRoot(): string {
    return process.env.GITHUB_WORKSPACE ?? process.cwd()
  }

  process(input: DocRepositoryProcessorInput): Report[] | Promise<Report[]> {
    // Parse through the md files, exclude files that have "search_exclude" set to true
    // Fllowing structure here: https://jekyllrb.com/docs/structure/ We can skip the known jekyll non-page files
    const repoRoot = process.env.GITHUB_WORKSPACE ?? process.cwd()
    Logger.debug(`Checking GitHub workspace path: ${repoRoot}`)

    const addedFiles = this.getFilesAddedInCommits(input.githubPayload)
    Logger.debug(
      `Found ${addedFiles.length} Files added in commits: ${addedFiles.join(', ')}`
    )
    return []
  }

  async processAll(
    input: DocRepositoryProcessorInput
  ): Promise<Report[] | Promise<Report[]>> {
    Logger.info(
      `Starting to process all articles in repository at: ${this.repoRoot}`
    )
    const errors: { file: string; error: any }[] = []

    for await (const { filePath, defaults } of ArticleIterator({
      basePath: `${this.repoRoot}`
    })) {
      Logger.info(
        `Processing file: ${filePath} with defaults: ${JSON.stringify(defaults)}`
      )
      const rawFileContent = readFileSync(
        `${this.repoRoot}/${filePath}`,
        'utf-8'
      )
      const parsed = this.articleParser.parse(rawFileContent, defaults)

      if (!parsed.success) {
        errors.push({ file: filePath, error: parsed.error })
        continue
      } else {
        const { frontMatter } = parsed.data
        if (
          !frontMatter['contributors'] ||
          (frontMatter['contributors'].length === 0 &&
            defaults?.contributors?.length === 0)
        ) {
          errors.push({
            file: filePath,
            error: 'No contributors found in file front matter or defaults.'
          })
          continue
        } else if (
          frontMatter['contributors'] &&
          frontMatter['contributors'].length > 0
        ) {
          Logger.info(
            `Contributors found for file ${filePath}: ${JSON.stringify(frontMatter['contributors'])}`
          )
        } else {
          Logger.info(
            `No contributors found for file ${filePath}, using defaults: ${JSON.stringify(defaults?.contributors)}`
          )
        }
      }

      Logger.info(`--- Finished processing file: ${filePath} ---\n\n`)
    }

    Logger.warning(
      `Finished processing all articles with ${errors.length} errors. **These articles were not be credited:**`
    )
    errors.forEach((err) => {
      Logger.error(`\tError in file [${err.file}] => ${err.error}`)
    })
    Logger.info(
      `If you wish to credit contributors to these pages, please address the errors and re-run the workflow.`
    )

    return []
  }

  private getFilesAddedInCommits(githubPayload: GithubPayload): string[] {
    return githubPayload.commits.flatMap((commit: { added: string[] }) => {
      return commit.added
    })
  }
}
