import fs from "fs";
import minimist from "minimist";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const argv = minimist(process.argv.slice(2));
const targetUser = argv._[0];
const outputFile = argv.json;
const sinceDate = argv.since;
const untilDate = argv.until;

if (!targetUser) {
    console.error("Error: No target user specified.");
    process.exit(1);
}

if (!fs.existsSync("cookies.json")) {
    console.error("Error: cookies.json not found.");
    process.exit(1);
}

async function loadCookies(page) {
    const content = fs.readFileSync("cookies.json", "utf8");
    if (!content || content.trim() === "[]") throw new Error("Empty cookie file");
    const cookies = JSON.parse(content);
    await page.setCookie(...cookies);
}

async function scrapeFeed(page) {
    const uniqueTweets = new Map();
    let staleCount = 0;
    let lastHeight = 0;
    
    for (let i = 0; i < 50; i++) {
        const batch = await page.evaluate(() => {
            const articles = document.querySelectorAll("article[data-testid='tweet']");
            return Array.from(articles).map(article => {
                try {
                    const linkEl = article.querySelector("a[href*='/status/']");
                    const timeEl = article.querySelector("time");
                    const textEl = article.querySelector("div[data-testid='tweetText']");
                    if (!linkEl) return null;
                    return {
                        url: "https://x.com" + linkEl.getAttribute("href").split('?')[0],
                        text: textEl ? textEl.innerText.replace(/\n/g, " ") : "",
                        date: timeEl ? timeEl.getAttribute("datetime") : null
                    };
                } catch (e) { return null; }
            }).filter(t => t !== null);
        });

        batch.forEach(t => uniqueTweets.set(t.url, t));

        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
        await new Promise(r => setTimeout(r, 1500));

        const newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === lastHeight) staleCount++;
        else staleCount = 0;
        
        lastHeight = newHeight;
        if (staleCount >= 3) break;
    }
    return Array.from(uniqueTweets.values());
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await loadCookies(page);

        let url = `https://x.com/${targetUser}`;
        if (sinceDate && untilDate) {
            const query = `from:${targetUser} since:${sinceDate} until:${untilDate}`;
            url = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
        }

        await page.goto(url, { waitUntil: "networkidle2" });
        await new Promise(r => setTimeout(r, 3000));

        const emptyState = await page.$("div[data-testid='emptyState']");
        if (emptyState) {
            if (outputFile) fs.writeFileSync(outputFile, "[]");
            process.exit(0);
        }

        const tweets = await scrapeFeed(page);
        
        if (outputFile) {
            fs.writeFileSync(outputFile, JSON.stringify(tweets, null, 2));
        }
        
        console.log(`Fetched ${tweets.length} tweets.`);

    } catch (err) {
        console.error("Runtime Error:", err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();