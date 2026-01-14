import { ArticleParser } from '../../src/processors/docrepository/article-parser.js'

describe('ArticleParser', () => {
  let articleParser: ArticleParser
  let fileContent: string

  beforeEach(() => {
    articleParser = new ArticleParser()
    fileContent = `---
title: Hello
slug: home
contributors: [John Doe, Jane Smith, Johnny Bravo, Mary Alice]
---
Content.`
  })

  it('should parse markdown without defaults', () => {
    const result = articleParser.parse(fileContent)
    console.log(`parsed result: ${JSON.stringify(result)}`)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Parsing failed unexpectedly')
    }
    expect(result.data.frontMatter.title).toBe('Hello')
    expect(result.data.frontMatter.slug).toBe('home')
    expect(result.data.frontMatter.contributors).toEqual([
      'John Doe',
      'Jane Smith',
      'Johnny Bravo',
      'Mary Alice'
    ])
    expect(result.data.content).toBe('Content.') // Corrected to match the actual content
  })

  it('should merge defaults with front matter', () => {
    const defaults = { author: 'Default Author' }

    const result = articleParser.parse(fileContent, defaults)

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Parsing failed unexpectedly')
    }
    const { data: resultData } = result

    expect(resultData.frontMatter.title).toBe('Hello')
    expect(resultData.frontMatter.author).toBe('Default Author')
  })

  it('should let front matter override defaults', () => {
    const defaults = {
      title: 'Default Title',
      contributors: ['Default Author'],
      affiliation: 'unipd'
    }

    const result = articleParser.parse(fileContent, defaults)
    console.log(`parsed result: ${JSON.stringify(result)}`)

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Parsing failed unexpectedly')
    }
    expect(result.data.frontMatter.title).toBe('Hello') // from front matter
    expect(result.data.frontMatter.contributors).toEqual([
      'John Doe',
      'Jane Smith',
      'Johnny Bravo',
      'Mary Alice'
    ]) // from front matter
    expect(result.data.frontMatter.affiliation).toBe('unipd') // from defaults
  })
})
