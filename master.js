import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CONFIG = {
    USER: "masquedelapeste",
    START: "2024-10-01",
    END: "2025-12-04",
    OUT_DIR: "./data_temp"
};

function getNextDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}

if (!fs.existsSync(CONFIG.OUT_DIR)) {
    fs.mkdirSync(CONFIG.OUT_DIR);
}

(async () => {
    let currentCursor = CONFIG.START;

    console.log(`Starting daily scrape for ${CONFIG.USER} from ${CONFIG.START} to ${CONFIG.END}`);

    while (new Date(currentCursor) < new Date(CONFIG.END)) {
        const nextCursor = getNextDay(currentCursor);
        const filename = `${CONFIG.USER}_${currentCursor}.json`;
        const filePath = path.join(CONFIG.OUT_DIR, filename);

        if (fs.existsSync(filePath)) {
            currentCursor = nextCursor;
            continue;
        }

        console.log(`Processing: ${currentCursor}`);

        try {
            execSync(
                `node scraper.js ${CONFIG.USER} --json "${filePath}" --since ${currentCursor} --until ${nextCursor}`, 
                { stdio: 'inherit' }
            );

            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
                if (data.length === 0) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (err) {
            console.error(`Failed to process ${currentCursor}`);
        }

        currentCursor = nextCursor;
        const delay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Merge results
    const files = fs.readdirSync(CONFIG.OUT_DIR).filter(f => f.endsWith(".json"));
    if (files.length === 0) process.exit(0);

    const tweetMap = new Map();
    files.forEach(file => {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(CONFIG.OUT_DIR, file), "utf8"));
            content.forEach(t => tweetMap.set(t.url, t));
        } catch (e) {}
    });

    const sortedTweets = Array.from(tweetMap.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const finalJson = `${CONFIG.USER}_COMPLETE.json`;
    const finalCsv = `${CONFIG.USER}_COMPLETE.csv`;
    
    fs.writeFileSync(finalJson, JSON.stringify(sortedTweets, null, 2));

    const csvContent = "url,date,text\n" + sortedTweets.map(r => {
        const safeText = (r.text || "").replace(/"/g, '""').replace(/[\r\n]+/g, " ");
        return `"${r.url}","${r.date}","${safeText}"`;
    }).join("\n");

    fs.writeFileSync(finalCsv, csvContent);
    console.log(`Done. Total tweets: ${sortedTweets.length}`);
})();