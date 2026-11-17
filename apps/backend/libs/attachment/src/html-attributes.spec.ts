import { expect } from 'chai'
import { readHtmlAttributes } from './html-attributes'

const read = (html: string) => [...readHtmlAttributes(html)]

describe('readHtmlAttributes', () => {
  it('should read quoted, unquoted and valueless attributes of start tags', () => {
    expect(read(`<img src="a b" alt='x' width=400 hidden>`)).to.deep.equal([
      { name: 'src', value: 'a b' },
      { name: 'alt', value: 'x' },
      { name: 'width', value: '400' },
      { name: 'hidden', value: '' }
    ])
  })

  it('should treat quotes inside unquoted values as text', () => {
    expect(read(`<img alt=don't data-attachment-id="F">`)).to.deep.equal([
      { name: 'alt', value: "don't" },
      { name: 'data-attachment-id', value: 'F' }
    ])
  })

  it('should keep ">" and attribute-like text inside quoted values', () => {
    expect(
      read(`<img alt="a > b data-attachment-id='X'" data-attachment-id="F">`)
    ).to.deep.equal([
      { name: 'alt', value: "a > b data-attachment-id='X'" },
      { name: 'data-attachment-id', value: 'F' }
    ])
  })

  it('should lowercase names and allow spaces around "="', () => {
    expect(read(`<IMG Data-Attachment-Id = "F">`)).to.deep.equal([
      { name: 'data-attachment-id', value: 'F' }
    ])
  })

  it('should skip comments, end tags, declarations and text "<"', () => {
    expect(
      read(
        `<!doctype html><!-- <img data-attachment-id="X"> --><p>1 < 2</p></p a="X"><img a="F">`
      )
    ).to.deep.equal([{ name: 'a', value: 'F' }])
  })

  it('should end comments where browsers do and read the following tag', () => {
    const image = `<img data-attachment-id="0f8fad5b-d9cb-469f-a165-70867728950e">`
    const expected = [
      {
        name: 'data-attachment-id',
        value: '0f8fad5b-d9cb-469f-a165-70867728950e'
      }
    ]
    for (const comment of [
      '<!-->',
      '<!--->',
      '<!-- note --!>',
      '<!-- ends at the first --!> text -->',
      '<!-- ends at the first --> text --!>'
    ]) {
      expect(read(`${comment}${image}`)).to.deep.equal(expected)
    }
    expect(read(`<!-- <img a="X"> --!>${image}`)).to.deep.equal(expected)
  })

  it('should stop at a tag or comment the browser would drop as unterminated', () => {
    expect(read(`<img a="F"><img b="G"`)).to.deep.equal([
      { name: 'a', value: 'F' }
    ])
    expect(read(`<img a="F"><img b="G><p>text</p>`)).to.deep.equal([
      { name: 'a', value: 'F' }
    ])
    expect(read(`<img a="F"><!-- <img b="G">`)).to.deep.equal([
      { name: 'a', value: 'F' }
    ])
  })

  it('should run in linear time on adversarial input', () => {
    const started = Date.now()
    read('<a'.repeat(200_000))
    read('<a"<a"'.repeat(100_000))
    read(`<a ${'b='.repeat(200_000)}>`)
    read('<!-- x -->'.repeat(50_000))
    read('<!-- x --!>'.repeat(50_000))
    expect(Date.now() - started).to.be.below(500)
  })
})
