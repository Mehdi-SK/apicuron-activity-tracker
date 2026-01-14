import matter from 'gray-matter'
import { DefaultsConfig } from './article-iterator.js'
import { Logger } from '../../logger.js'

export type ArticleMetadata = {
  frontMatter: Record<string, any>
  content: string
}

export class ArticleParser {
  constructor() {}

  /**
   * Parse a Markdown file and extract its YAML front matter.
   * Merges Jekyll defaults with the front matter (front matter takes precedence).
   */
  parse(fileContent: string, defaults?: DefaultsConfig): ArticleMetadata {
    try {
      const parsed = matter(fileContent)

      return {
        frontMatter: {
          ...defaults,
          ...parsed.data
        },
        content: parsed.content
      }
    } catch (error) {
      Logger.error(`Error parsing article content: ${error}`)
      throw error
    }
  }
}
