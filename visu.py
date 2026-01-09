import json
import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

TARGET_FILE = './tweets/masquedelapeste_COMPLETE.json'

def main():
    if not os.path.exists(TARGET_FILE):
        return

    dates = []
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            for tweet in data:
                raw_date = tweet.get('date')
                if raw_date:
                    if raw_date.endswith('Z'):
                        raw_date = raw_date.replace('Z', '+00:00')
                    try:
                        dates.append(datetime.fromisoformat(raw_date))
                    except ValueError:
                        continue
        except json.JSONDecodeError:
            return

    if not dates:
        return

    dates.sort()
    hours = [d.hour + d.minute / 60 for d in dates]

    plt.figure(figsize=(14, 7))
    plt.scatter(dates, hours, alpha=0.5, s=15, c='blue', edgecolors='none')

    ax = plt.gca()
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m/%Y'))
    plt.gcf().autofmt_xdate()

    plt.ylim(0, 24)
    plt.yticks(range(0, 25, 2), [f"{h}h" for h in range(0, 25, 2)])
    plt.ylabel("Hour")
    plt.title(f"Time Distribution ({len(dates)} tweets)")
    plt.grid(True, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()