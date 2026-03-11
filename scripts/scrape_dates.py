import json
import requests
from bs4 import BeautifulSoup
import re
import os

with open("data/articles.json", "r") as f:
    articles = json.load(f)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for article in articles:
    url = article['url']
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Look for schema.org datePublished or meta property
            published_time = soup.find('meta', property='article:published_time')
            if published_time and published_time.get('content'):
                dt = published_time['content']
                article['date'] = dt.split('T')[0]
                print(f"Updated {article['id']} to {article['date']}")
                continue
            
            time_tag = soup.find('time', attrs={'datetime': True})
            if time_tag:
                dt = time_tag['datetime']
                article['date'] = dt.split('T')[0]
                print(f"Updated {article['id']} to {article['date']}")
                continue
            
            print(f"Could not find date for {article['id']}")
        else:
            print(f"Failed to fetch {url} - Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching {url}: {e}")

with open("data/articles.json", "w") as f:
    json.dump(articles, f, indent=2)

print("Finished updating dates.")
