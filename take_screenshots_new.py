import sys
import os
import subprocess

os.makedirs('tmp/previews', exist_ok=True)

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # 1. Desktop Homepage
    desktop = browser.new_page(viewport={'width': 1440, 'height': 900})
    desktop.goto('http://localhost:8000')
    desktop.wait_for_timeout(2000)
    desktop.screenshot(path='tmp/previews/home-desktop.png')
    
    # Check computed hero_focus
    hero_focus = desktop.evaluate("window.getComputedStyle(document.querySelector('.hero')).getPropertyValue('--hero-focus')")
    
    # 2. Mobile Homepage
    mobile_context = browser.new_context(
        viewport={'width': 393, 'height': 852},
        is_mobile=True,
        has_touch=True
    )
    mobile_home = mobile_context.new_page()
    mobile_home.goto('http://localhost:8000')
    mobile_home.wait_for_timeout(2000)
    mobile_home.screenshot(path='tmp/previews/home-mobile.png')
    
    # 3. Mobile Articles
    mobile_articles = mobile_context.new_page()
    mobile_articles.goto('http://localhost:8000/articles.html')
    mobile_articles.wait_for_timeout(2000)
    mobile_articles.screenshot(path='tmp/previews/articles-mobile.png')

    date_count = mobile_home.locator('.card-date').count()
    
    browser.close()

    print(f"HERO_FOCUS:{hero_focus}")
    print(f"DATE_COUNT:{date_count}")
