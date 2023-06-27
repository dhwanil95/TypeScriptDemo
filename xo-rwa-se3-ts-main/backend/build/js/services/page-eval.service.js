export async function pageEval(page, pageFunction) {
    return await page.evaluate(pageFunction);
}
// istanbul ignore next - this function is running in dom context of headless browser
export function domExtractText() {
    return document?.body?.innerText ?? '';
}
// istanbul ignore next - this function is running in dom context of headless browser
export function domExtractHyperlinks() {
    return Array.from(document.getElementsByTagName('a'), a => a.href);
}
