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
    Logger.debug(`Found ${addedFiles.length} Files added in commits: ${addedFiles.join(', ')}`)
    return []
  }


  async processAll(input: DocRepositoryProcessorInput): Promise<Report[] | Promise<Report[]>> {

    Logger.info(`Starting to process all articles in repository at: ${this.repoRoot}`)
    for await (const { filePath, defaults } of ArticleIterator({basePath: `${this.repoRoot}`})){
      Logger.info(`Processing file: ${filePath} with defaults: ${JSON.stringify(defaults)}`)
      const rawFileContent = readFileSync(`${this.repoRoot}/${filePath}`, 'utf-8')
      const {frontMatter: fileFrontMatter, content } = this.articleParser.parse(rawFileContent, defaults)


      Logger.info(`Parsed front matter: ${JSON.stringify(fileFrontMatter)}`)
      Logger.info(`Parsed content length: ${content.length} characters`)
      Logger.info(`--- Finished processing file: ${filePath} ---\n\n`)
      
    }



    return []
  }

  private getFilesAddedInCommits(githubPayload: GithubPayload): string[] {
    return githubPayload.commits.flatMap((commit: { added: string[] }) => {
      return commit.added
    })
  }
}
