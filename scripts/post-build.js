import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '../dist');
const indexPath = join(distPath, 'index.html');
const joinPath = join(distPath, 'join');
const joinIndexPath = join(joinPath, 'index.html');
const sitemapPath = join(distPath, 'sitemap.xml');

const DOMAIN = 'https://deenly.milhamdedi.com';

// ========================================
// 1. Create join/index.html with invite-specific metadata
// ========================================
console.log('📦 Post-build: Creating join/index.html with invite-specific OpenGraph tags...');

try {
  // Read the built index.html
  let html = readFileSync(indexPath, 'utf-8');

  // Replace OpenGraph tags with invite-specific ones
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    '<meta property="og:title" content="Join me on Deenly - Complete the Quran Together!" />'
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    '<meta property="og:description" content="Let\'s track our Quran reading journey together! Join this reading group and help us complete all 6,236 verses as a community. 📖✨" />'
  );

  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${DOMAIN}/join" />`
  );

  // Replace Twitter tags with invite-specific ones
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    '<meta name="twitter:title" content="Join me on Deenly - Complete the Quran Together!" />'
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    '<meta name="twitter:description" content="Let\'s track our Quran reading journey together! Join this reading group and help us complete all 6,236 verses as a community. 📖✨" />'
  );

  html = html.replace(
    /<meta name="twitter:url" content="[^"]*" \/>/,
    `<meta name="twitter:url" content="${DOMAIN}/join" />`
  );

  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${DOMAIN}/join" />`
  );

  // Replace page title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    '<title>Join me on Deenly - Complete the Quran Together!</title>'
  );

  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    '<meta name="title" content="Join me on Deenly - Complete the Quran Together!" />'
  );

  // Create join directory and write the modified HTML
  mkdirSync(joinPath, { recursive: true });
  writeFileSync(joinIndexPath, html);

  console.log('✅ Successfully created dist/join/index.html with invite-specific metadata');
} catch (error) {
  console.error('❌ Error creating join/index.html:', error);
  process.exit(1);
}

// ========================================
// 2. Generate sitemap.xml
// ========================================
console.log('📦 Post-build: Generating sitemap.xml...');

try {
  const today = new Date().toISOString().split('T')[0];

  // Define all public routes for the sitemap
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/login', priority: '0.8', changefreq: 'monthly' },
    { path: '/signup', priority: '0.8', changefreq: 'monthly' },
    { path: '/join', priority: '0.9', changefreq: 'weekly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  writeFileSync(sitemapPath, sitemap);

  console.log('✅ Successfully generated sitemap.xml');
} catch (error) {
  console.error('❌ Error generating sitemap.xml:', error);
  process.exit(1);
}
