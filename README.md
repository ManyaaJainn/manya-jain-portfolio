# Manya Jain — Portfolio

Production-ready journalist portfolio deployed to GitHub Pages.

## Live Site

**[manyajain15.github.io/manya-jain-portfolio](https://manyajain15.github.io/manya-jain-portfolio/)**

## Project Structure

```
manya-jain-portfolio/
├── index.html            # Home — hero with face-aware cropping
├── articles.html         # Full article listing with search & filters
├── styles.css            # Editorial design system (CSS custom properties)
├── script.js             # Article loader, search, filters, animations
├── scripts/
│   └── generate_crops.py # Python script for face-aware cropping
├── focal_points.json     # Metadata for image focal points
├── assets/
│   ├── original_photo1.jpg  # Hero source
│   ├── original_photo2.jpg  # Portrait source
│   ├── photo1-*.webp        # Responsive hero variants (16:9)
│   ├── photo2-*.webp        # Responsive portrait variants (1:1)
│   └── Manya_Jain_Resume.pdf
└── README.md
```

## Hero Image Focal Point

The hero image uses a face-aware cropping system to ensure Manya's face is always visible.

### How it works
1. `scripts/generate_crops.py` uses either `face_recognition` or a heuristic to detect the subject's face.
2. It generates responsive crops and writes `assets/focal_points.json`.
3. `script.js` loads this JSON at runtime and sets the CSS `--hero-focus` variable.

### Regenerating crops
If you replace the source images, run:
```bash
python scripts/generate_crops.py
```

### Manual override
If the face is still slightly off, you can edit the `data-focus-x` and `data-focus-y` attributes on the `#hero` element in `index.html` (values are percentages, e.g., `48` and `42`).

## Local Preview

```bash
# Start a local server (Python 3)
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial: manya-jain-portfolio — production build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/manya-jain-portfolio.git
git push -u origin main
```

Then in the GitHub repository → **Settings → Pages → Source**: select `main` branch, `/ (root)`. The site will deploy at `https://YOUR_USERNAME.github.io/manya-jain-portfolio/`.

## How to Update Content

### Adding new articles

Edit `data/articles.json` and add a new entry:

```json
{
  "id": "slug-for-article",
  "title": "Article Title",
  "url": "https://...",
  "date": "2025-04-01",
  "publication": "Times of India",
  "excerpt": "Brief 20–25 word summary of the article.",
  "tags": ["tag1", "tag2"]
}
```

The site renders articles dynamically — no HTML changes needed.

### Updating photos

Replace `assets/photo1.jpg` or `assets/photo2.jpg` with new images. Keep filenames identical.

### Updating resume

Replace `assets/Manya_Jain_Resume.pdf`. Keep the filename identical.

## Scraping Notes

Article metadata in `data/articles.json` was extracted from the public TOI author page:  
`https://timesofindia.indiatimes.com/toireporter/author-Manya-Jain-479276813.cms`

- Single-page fetch only — no recursive crawling
- Respectful User-Agent header used
- Only article links authored by Manya Jain were retained (site-wide trending links excluded)
- Excerpts are editorially generated summaries from article titles, not scraped content
- Full article text is **not** reproduced — each card links to the original TOI page

**Please respect the Times of India's terms of service when re-scraping.**

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no frameworks)
- Google Fonts: Playfair Display, Inter
- Hosted on GitHub Pages (static)

## Credits

Built by Manya Jain. Design system inspired by editorial publications.
