import matter from 'gray-matter'
import { DefaultsConfig } from './article-iterator.js'

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
    const parsed = matter(fileContent)

    return {
      frontMatter: {
        ...defaults,
        ...parsed.data
      },
      content: parsed.content
    }
  }
}
