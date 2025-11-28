import { ArticleParser } from '../../src/processors/docrepository/article-parser.js'

describe('ArticleParser', () => {
  let articleParser: ArticleParser
  let fileContent: string

  beforeEach(() => {
    articleParser = new ArticleParser()
    fileContent = `---
title: Hello
slug: home
---
Content.`
  })

  it('should parse markdown without defaults', () => {
    const result = articleParser.parse(fileContent)
    console.log(`parsed result: ${JSON.stringify(result)}`)
    expect(result.frontMatter.title).toBe('Hello')
    expect(result.content).toBe('Content.') // Corrected to match the actual content
  })

  it('should merge defaults with front matter', () => {
    const defaults = { author: 'Default Author' }

    const result = articleParser.parse(fileContent, defaults)

    expect(result.frontMatter.title).toBe('Hello')
    expect(result.frontMatter.author).toBe('Default Author')
  })

  it('should let front matter override defaults', () => {
    const defaults = { title: 'Default Title', author: 'Default Author' }

    const result = articleParser.parse(fileContent, defaults)

    expect(result.frontMatter.title).toBe('Hello') // from front matter
    expect(result.frontMatter.author).toBe('Default Author') // from defaults
  })
})
