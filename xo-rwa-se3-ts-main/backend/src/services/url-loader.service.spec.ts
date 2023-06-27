import { Browser, Page } from 'puppeteer'
import { mock } from 'jest-mock-extended'

import { UrlLoaderService } from './url-loader.service'

const testUrl = 'https://test.com/'

const pageMock = mock<Page>()
const mockBrowser = mock<Browser>()
mockBrowser.newPage.mockResolvedValue(pageMock)

jest.mock('puppeteer', () => ({
  launch: () => mockBrowser
}))

const pageValue = 'Hello World'
describe('UrlLoaderService', () => {
  it('should return singleton', async () => {
    // when
    const instance1 = await UrlLoaderService.getInstance()
    const instance2 = await UrlLoaderService.getInstance()

    // then
    expect(instance1).toBe(instance2)
  })

  it('should load website text and links', async () => {
    // given
    pageMock.evaluate.mockResolvedValueOnce(pageValue)
    pageMock.evaluate.mockResolvedValueOnce(['test.html'])
    // when

    const instance = await UrlLoaderService.getInstance()
    const stringPromise = instance.loadUrlTextAndLinks(testUrl)

    // then
    await expect(stringPromise).resolves.toEqual({ text: pageValue, links: ['test.html'] })
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1)
    expect(pageMock.goto).toHaveBeenCalledTimes(1)
    expect(pageMock.goto).toHaveBeenCalledWith(testUrl)
  })

  it('should handle an empty list of links', async () => {
    // given
    const startUrl = 'https://start.com/'
    const word = 'test'
    const maxDepth = 2
    const instance = await UrlLoaderService.getInstance()
    const loadUrlTextAndLinksMock = jest.spyOn(instance, 'loadUrlTextAndLinks').mockResolvedValueOnce({ text: 'This is a test', links: [] })
    // when
    const count = await instance.loadUrlsBFS(startUrl, word, maxDepth)
    // then
    expect(loadUrlTextAndLinksMock).toHaveBeenCalledTimes(1)
    expect(count).toBe(1) // Only counts the startUrl itself
  })

  it('should handle an error when loading a URL', async () => {
    // given
    const startUrl = 'http://example.com'
    const word = 'test'
    const maxDepth = 2
    const instance = await UrlLoaderService.getInstance()
    const loadUrlTextAndLinksMock = jest.spyOn(instance, 'loadUrlTextAndLinks').mockRejectedValueOnce(new Error('Failed to load URL'))
    // Suppress error logging in this test
    const originalConsoleError = console.error
    console.error = jest.fn()
    // when
    const count = await instance.loadUrlsBFS(startUrl, word, maxDepth)
    // Restore the original console.error
    console.error = originalConsoleError
    // then
    expect(loadUrlTextAndLinksMock).toHaveBeenCalledTimes(1)
    expect(count).toBe(0) // Returns 0 if there's an error loading the URL
  })
  it('should process URLs in the queue', async () => {
    // given
    const startUrl = 'https://example.com/'
    const word = 'test'
    const maxDepth = 2
    const instance = await UrlLoaderService.getInstance()
    const visitedUrls: { [key: string]: boolean } = {}
    visitedUrls[startUrl] = false
    jest.spyOn(instance, 'loadUrlTextAndLinks')
      .mockResolvedValueOnce({ text: 'This is a test', links: ['https://example.com/page1', 'https://example.com/page2'] })
      .mockResolvedValueOnce({ text: '', links: [] })
      .mockResolvedValueOnce({ text: '', links: [] })
    // when
    const count = await instance.loadUrlsBFS(startUrl, word, maxDepth)
    // then
    expect(instance.loadUrlTextAndLinks).toHaveBeenCalledTimes(3)
    expect(instance.loadUrlTextAndLinks).toHaveBeenCalledWith(startUrl)
    expect(instance.loadUrlTextAndLinks).toHaveBeenCalledWith('https://example.com/page1')
    expect(instance.loadUrlTextAndLinks).toHaveBeenCalledWith('https://example.com/page2')
    expect(count).toBe(1) // Only counts the startUrl itself
  })
})
