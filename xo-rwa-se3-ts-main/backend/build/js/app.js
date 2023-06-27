import { Command } from 'commander';
export const DEFAULT_URL = 'https://www.kayako.com/';
export const DEFAULT_WORD = 'kayako';
export const DEFAULT_DEPTH = 2;
export class App {
    /* istanbul ignore next */
    constructor(urlLoader, command = new Command()) {
        this.urlLoader = urlLoader;
        this.command = command;
    }
    async run() {
        const appParameters = this.parseCli();
        await this.process(appParameters);
    }
    async process(appParameters) {
        const extractedText = await this.urlLoader.loadUrlTextAndLinks(appParameters.url);
        const count = (extractedText.text.toLocaleLowerCase().match(/kayako/ig) ?? []).length;
        console.log(`Found ${count} instances of 'kayako' in the body of the page`);
        const count1 = await this.urlLoader.loadUrlsBFS(appParameters.url, appParameters.word, appParameters.depth);
        console.log(`Found ${count1} instances of '${appParameters.word}' in the body of the page and its subpages.`);
    }
    parseCli(argv = process.argv) {
        this.command
            .requiredOption('-u, --url <url>', 'URL to load', DEFAULT_URL)
            .requiredOption('-w, --word <word>', 'Word to search for', DEFAULT_WORD)
            .requiredOption('-d, --depth <depth>', 'Maximum depth to crawl', DEFAULT_DEPTH.toString());
        this.command.parse(argv);
        const options = this.command.opts();
        return { url: options.url, word: options.word, depth: Number(options.depth) };
    }
}
