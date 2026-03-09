import requests
from bs4 import BeautifulSoup
import json

AUTHOR_URL = "https://timesofindia.indiatimes.com/toireporter/author-Manya-Jain-479276813.cms"

def fetch():
    headers = {"User-Agent": "Mozilla/5.0 (compatible; ArticleFetcher/1.0; +https://example.com)"}
    r = requests.get(AUTHOR_URL, headers=headers, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    articles = []
    # Look for article links; selectors may need tuning when TOI changes layout
    for a in soup.select("a[href]"):
        href = a.get('href')
        text = a.get_text(strip=True)
        if not text or not href: continue
        if '/articles/' in href or '/story/' in href or 'timesofindia' in href:
            if href.startswith('/'):
                href = 'https://timesofindia.indiatimes.com' + href
            if href.startswith('http'):
                articles.append({'title': text, 'url': href})

    # deduplicate
    seen = set(); unique = []
    for it in articles:
        if it['url'] in seen: continue
        seen.add(it['url']); unique.append(it)
    return unique

if __name__ == '__main__':
    items = fetch()
    print(f'Found {len(items)} items')
    with open('../data/articles.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)