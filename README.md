# Twitter Scraping and Visualization Suite 2025

This project is a hybrid Node.js and Python toolset designed to scrape historical tweets from a specific Twitter/X user, export the data to JSON and CSV formats, and generate visualizations regarding posting habits and frequency.

The system uses **Puppeteer** (Node.js) for the scraping logic to handle dynamic content and scrolling, and **Python** for cookie extraction and data visualization.

## Features

* **Cookie-based Authentication:** Uses real browser cookies to bypass basic login walls.
* **Day-by-Day Scraping:** Iterates through a date range one day at a time to ensure thorough data retrieval and minimize missing tweets.
* **Resume Capability:** Skips days that have already been successfully scraped and saved in the temporary directory.
* **Data Aggregation:** Automatically merges daily JSON files into a single complete dataset (JSON and CSV).
* **Visualization:** Includes Python scripts to analyze tweet distribution by time of day and frequency over time.

## Prerequisites

* **Node.js** (v14 or higher)
* **Python** (v3.8 or higher)
* **Firefox Browser**: The cookie exporter is currently configured to pull credentials from Firefox.
* **Twitter/X Account**: You must be logged into X.com on your Firefox browser.

## Installation

### 1. Install Node.js Dependencies

Navigate to the project root and install the required JavaScript packages:

```bash
npm install
```

### 2. Install Python Dependencies

Install the required Python libraries listed in `requirements.txt`. Note that this project relies on `browser-cookie3` and `matplotlib`.

```bash
pip install -r requirements.txt
```

## Configuration

### Target and Date Range

Open `master.js` in a text editor and modify the configuration section at the top of the file:

```javascript
const TARGET_USER = "masquedelapeste"; // The username to scrape (without @)
const START_DATE = "2024-10-01"; // Format: YYYY-MM-DD
const END_DATE = "2025-12-04"; // Format: YYYY-MM-DD
const OUTPUT_DIR = "./data_temp"; // Directory for temporary daily files
```

## Usage Guide

### Step 1: Export Authentication Cookies

The scraper requires valid session cookies to access X.com search features.

1. Open **Firefox** and log in to [x.com](https://x.com).
2. Run the cookie export script:

```bash
python export_cookies.py
```

This will create a `cookies.json` file in your root directory.

*Note: If you use a browser other than Firefox, you must modify `export_cookies.py` to use `browser_cookie3.chrome()` or `browser_cookie3.edge()`.*

### Step 2: Run the Scraper

Execute the master script to begin the scraping process. This script orchestrates the daily scraping logic.

```bash
node master.js
```

**What happens during this process:**

1. The script calculates the date range.
2. It launches a controlled browser instance (Puppeteer) for each day.
3. Tweets are saved into the `data_temp` folder as individual JSON files (e.g., `username_2024-10-01.json`).
4. If the script is interrupted, re-running it will skip days that typically already exist.
5. Upon completion, it merges all files into `[USERNAME]_COMPLETE.json` and `[USERNAME]_COMPLETE.csv`.

### Step 3: Visualize the Data

Once the `_COMPLETE.json` file is generated, you can run the visualization scripts.

**Important:** The visualization scripts (`visu.py` and `visu_days.py`) currently look for the data file in a `./tweets/` subdirectory. You must either move your generated JSON file into a `tweets` folder or edit the `fichier_cible` variable in the Python scripts to point to your generated file.

**Activity by Time of Day (Scatter Plot):**
Shows at what time of day the user usually tweets.

```bash
python visu.py
```

**Activity by Date (Bar Chart):**
Shows the volume of tweets per day over the scraped period.

```bash
python visu_days.py
```

## Project Structure

* **master.js**: The main entry point. Handles the date loop, error handling, and file merging.
* **scraper.js**: The worker script. Scrapes a specific user for a specific timeframe using Puppeteer.
* **export_cookies.py**: Extracts cookies from the local browser to `cookies.json`.
* **visu.py**: Generates a scatter plot of tweet times (Hour vs Date).
* **visu_days.py**: Generates a bar chart of daily tweet counts.
* **package.json**: Node.js dependencies definition.
* **requirements.txt**: Python dependencies definition.

## Disclaimer

This tool is for educational and research purposes only. Scraping data from Twitter may violate their Terms of Service. Use this tool responsibly and at your own risk. Excessive scraping requests may lead to account suspension or IP blocking. The default settings include random pauses to mitigate rate limiting.