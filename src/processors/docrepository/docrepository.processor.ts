import { readFileSync } from 'fs'
import { Logger } from '../../logger.js'
import { GithubPayload } from '../../types/github.types.js'
import { Report } from '../../types/report.schema.js'
import { ApicuronProcessor } from '../processor.interface.js'
import { ArticleIterator } from './article-iterator.js'
import { ArticleParser } from './article-parser.js'
import { ContributorsFileProvider } from '../../orcid/orcid-providers/contributors-file.provider.js'

type DocRepositoryProcessorInput = {
  githubPayload: GithubPayload
}

export class DocRepositoryProcessor
  implements ApicuronProcessor<DocRepositoryProcessorInput>
{
  private readonly articleParser = new ArticleParser()
  private readonly contribuotrsFileProvider = new ContributorsFileProvider(
    '_data/CONTRIBUTORS.yaml'
  )

  constructor() {}

  get repoRoot(): string {
    return process.env.GITHUB_WORKSPACE ?? process.cwd()
  }

  async process(input: DocRepositoryProcessorInput): Promise<Report[]> {
    Logger.info('Building contributors map from contributors file...')
    await this.contribuotrsFileProvider.build()
    Logger.info(`Processing all articles in repository at: ${this.repoRoot}`)

    await this.processArticles()

    return []
  }

  private async processArticles() {
    const errors: { file: string; error: unknown }[] = []
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
          return frontMatter['contributors'] as string[]
        } else {
          Logger.info(
            `No contributors found for file ${filePath}, using defaults: ${JSON.stringify(defaults?.contributors)}`
          )
        }
        Logger.logProcessingErrors(errors)
      }
    }
  }

  async buildReportsForArticle(): Promise<Report[] | null> {
    return [
      {
        activity_term: 'get from input',
        curator_orcid: '',
        entity_uri: 'article_uri',
        league: 'get from input',
        resource_id: 'get from input',
        timestamp: 'get from commit'
      }
    ]
  }
}
