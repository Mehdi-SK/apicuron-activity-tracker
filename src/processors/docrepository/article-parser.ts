import matter from 'gray-matter'
import { Logger } from '../../logger.js'
import { Result } from '../../types/result.type.js'
import { DefaultsConfig } from './article-iterator.js'

export type ArticleFrontMatter = DefaultsConfig
export type ArticleMetadata = {
  frontMatter: ArticleFrontMatter
  content: string
}

export class ArticleParser {
  private logger = new Logger('ArticleParser')
  constructor() {}

  /**
   * Parse a Markdown file and extract its YAML front matter.
   * Merges Jekyll defaults with the front matter (front matter takes precedence).
   */
  parse(
    fileContent: string,
    defaults?: DefaultsConfig
  ): Result<ArticleMetadata, Error> {
    try {
      const parsed = matter(fileContent)

      return {
        success: true,
        data: {
          frontMatter: {
            ...defaults,
            ...parsed.data
          },
          content: parsed.content
        }
      }
    } catch (error) {
      this.logger.error(`Error parsing article: ${error}`)
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }
}
