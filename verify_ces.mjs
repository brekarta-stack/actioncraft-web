import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const OUT = 'C:/tmp/ces_screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`📸 ${name}.png`);
}

// 1. Home
await page.goto('http://localhost:3000/');
await page.waitForLoadState('networkidle');
await shot('01_home');
const navText = await page.locator('nav').first().innerText();
console.log('nav:', navText.replace(/\n/g, ' | '));

// 2. Portfolio page
await page.goto('http://localhost:3000/portfolio');
await page.waitForLoadState('networkidle');
await shot('02_portfolio');
const tab팝업북 = await page.locator('button').filter({ hasText: '팝업북' }).count();
const tab전체 = await page.locator('button').filter({ hasText: '전체' }).count();
const emptyMsg = await page.locator('text=아직 등록된 작품이 없습니다').count();
console.log('portfolio tabs(팝업북):', tab팝업북, '전체:', tab전체, 'emptyState:', emptyMsg);

// 3. Blog
await page.goto('http://localhost:3000/blog');
await page.waitForLoadState('networkidle');
await shot('03_blog');

// 4. Admin → should redirect to login
await page.goto('http://localhost:3000/admin');
await page.waitForLoadState('networkidle');
const adminUrl = page.url();
await shot('04_admin_redirect');
console.log('admin redirect url:', adminUrl);

// 5. Admin login page
await page.goto('http://localhost:3000/admin/login');
await page.waitForLoadState('networkidle');
await shot('05_admin_login');
const googleBtn = await page.locator('text=Google로 로그인').count();
console.log('Google login button:', googleBtn);

// 6. API portfolio returns []
await page.goto('http://localhost:3000/api/portfolio');
const apiBody = await page.locator('body').innerText();
console.log('api/portfolio response:', apiBody.trim());

await browser.close();
