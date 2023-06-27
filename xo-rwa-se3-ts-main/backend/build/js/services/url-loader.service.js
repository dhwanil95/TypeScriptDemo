import puppeteer from 'puppeteer';
import { domExtractHyperlinks, domExtractText, pageEval } from './page-eval.service.js';
export class UrlLoaderService {
    constructor(browser) {
        this.browser = browser;
    }
    static async getInstance() {
        if (UrlLoaderService.instance === undefined) {
            const browser = await puppeteer.launch();
            UrlLoaderService.instance = new UrlLoaderService(browser);
        }
        return UrlLoaderService.instance;
    }
    async loadUrlTextAndLinks(url) {
        const page = await this.browser.newPage();
        await page.goto(url);
        await page.waitForSelector('body');
        const [text, links] = await Promise.all([await pageEval(page, domExtractText), await pageEval(page, domExtractHyperlinks)]);
        return { text, links };
    }
    async loadUrlsBFS(startUrl, word, maxDepth) {
        let count = 0;
        const visitedUrls = {};
        const queue = [{ url: startUrl, depth: 0 }];
        while (queue.length > 0) {
            const queueItem = queue.shift();
            if (queueItem !== null && queueItem !== undefined) {
                const { url, depth } = queueItem;
                if (!visitedUrls[url] && depth <= maxDepth) {
                    visitedUrls[url] = true;
                    try {
                        const { text, links } = await this.loadUrlTextAndLinks(url);
                        count += (text.match(new RegExp(word, 'g')) ?? []).length;
                        links.forEach((link) => queue.push({ url: link, depth: depth + 1 }));
                    }
                    catch (error) {
                        console.error(error);
                        return 0;
                    }
                }
            }
        }
        return count;
    }
}
