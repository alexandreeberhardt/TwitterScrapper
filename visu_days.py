import json
import os
from collections import Counter
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

TARGET_FILE = './tweets/masquedelapeste_COMPLETE.json'

def main():
    if not os.path.exists(TARGET_FILE):
        return

    days = []
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            for tweet in data:
                raw_date = tweet.get('date')
                if raw_date:
                    if raw_date.endswith('Z'):
                        raw_date = raw_date.replace('Z', '+00:00')
                    try:
                        days.append(datetime.fromisoformat(raw_date).date())
                    except ValueError:
                        continue
        except json.JSONDecodeError:
            return

    if not days:
        return

    counts = Counter(days)
    sorted_dates = sorted(counts.keys())
    values = [counts[d] for d in sorted_dates]
    
    plt.figure(figsize=(14, 7))
    plt.bar(sorted_dates, values, color='skyblue', edgecolor='navy', alpha=0.7)

    ax = plt.gca()
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m/%Y'))
    plt.gcf().autofmt_xdate()

    plt.ylabel("Tweet Count")
    plt.title("Daily Activity")
    plt.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()