import { readFileSync } from 'fs'
import { Logger } from '../../logger.js'
import { ContributorsFileProvider } from '../../orcid/orcid-providers/contributors-file.provider.js'
import { GithubContext } from '../../types/github.types.js'
import { Report } from '../../types/report.schema.js'
import { ApicuronProcessor } from '../processor.interface.js'
import { ArticleIterator } from './article-iterator.js'
import { ArticleParser } from './article-parser.js'

type DocRepositoryProcessorInput = {
  actionContext: GithubContext
  apicuronResourceId: string
}

export class DocRepositoryProcessor
  implements ApicuronProcessor<DocRepositoryProcessorInput>
{
  private readonly articleParser = new ArticleParser()
  private readonly contribuotrsFileProvider = new ContributorsFileProvider(
    '_data/CONTRIBUTORS.yaml'
  )
  private logger = new Logger('DocRepositoryProcessor')

  private repoUrl!: string
  private commitSha!: string
  private apicuronResourceId!: string

  get repoRoot(): string {
    return process.env.GITHUB_WORKSPACE ?? process.cwd()
  }

  async process(input: DocRepositoryProcessorInput): Promise<Report[]> {
    const { repo, owner } =
      input.actionContext.repo ||
      (() => {
        throw new Error('Repository URL not found in payload')
      })()

    this.repoUrl = `https://github.com/${owner}/${repo}`
    this.commitSha =
      input.actionContext.sha ||
      (() => {
        throw new Error('Commit SHA not found in payload')
      })()

    this.apicuronResourceId = input.apicuronResourceId
    this.logger.info('Building contributors map from contributors file...')

    this.logger.info(
      `Processing all articles in repository at: ${this.repoRoot}`
    )

    const contributions = await this.extractContributorsFromArticles()
    if (contributions.length > 0) {
      const allReports: Report[] = []
      for (const { filePath, contributors } of contributions) {
        const { reports, missingOrcids } = this.processOneArticle({
          filepath: filePath,
          contributions: contributors
        })
        allReports.push(...reports)
        if (missingOrcids.length > 0) {
          this.logger.warning(
            `Missing ORCIDs for contributors: ${missingOrcids.join(', ')} in file: ${filePath}`
          )
        }
      }
      return allReports
    }

    return []
  }

  private async extractContributorsFromArticles() {
    const errors: { file: string; error: unknown }[] = []
    const contributions: Array<{ filePath: string; contributors: string[] }> =
      []
    for await (const { filePath, defaults } of ArticleIterator({
      basePath: `${this.repoRoot}`
    })) {
      this.logger.info(
        `Processing file: ${filePath} with defaults: ${JSON.stringify(defaults)}`
      )
      const rawFileContent = readFileSync(
        `${this.repoRoot}/${filePath}`,
        'utf-8'
      )
      const parsed = this.articleParser.parse(rawFileContent, defaults)

      // Parsing Error
      if (!parsed.success) {
        errors.push({ file: filePath, error: parsed.error })
        continue
      }

      // No Contributors Found
      const { frontMatter } = parsed.data

      if (
        !frontMatter.contributors ||
        (frontMatter.contributors.length === 0 &&
          defaults?.contributors?.length === 0)
      ) {
        errors.push({
          file: filePath,
          error: 'No contributors found in file front matter or defaults.'
        })
        continue
      }
      // Contributors Found in front matter
      if (frontMatter.contributors && frontMatter.contributors.length > 0) {
        contributions.push({
          filePath,
          contributors: Array.isArray(frontMatter.contributors)
            ? frontMatter.contributors
            : [frontMatter.contributors]
        })
      } else {
        contributions.push({
          filePath,
          contributors: Array.isArray(defaults.contributors)
            ? defaults.contributors!
            : [defaults.contributors!]
        })
      }
    }
    this.logger.logProcessingErrors(errors)

    return contributions
  }

  mapNamesToOrcids(contributors: string[]) {
    const orcids: string[] = []
    const missingOrcids: string[] = []

    for (const name of contributors) {
      try {
        const orcid = this.contribuotrsFileProvider.getOrcidByName(name)
        orcids.push(orcid)
      } catch (error) {
        missingOrcids.push(name)
      }
    }
    return { orcids, missingOrcids }
  }

  processOneArticle({
    filepath,
    contributions
  }: {
    filepath: string
    contributions: string[]
  }) {
    const { orcids, missingOrcids } = this.mapNamesToOrcids(contributions)

    const entity_uri = `${this.repoUrl}/blob/${this.commitSha}/${filepath}`

    const reports = orcids.map((orcid) => ({
      activity_term: 'contribution',
      curator_orcid: orcid,
      entity_uri: entity_uri,
      league: 'default',
      resource_id: this.apicuronResourceId,
      timestamp: new Date().toISOString()
    }))

    return { reports, missingOrcids }
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
