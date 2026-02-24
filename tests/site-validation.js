/**
 * Katla Intel - Comprehensive Site Validation Script
 *
 * Self-contained Node.js script that:
 *   1. Starts a local HTTP server serving the project root
 *   2. Launches Playwright (Chromium) and runs all test suites
 *   3. Prints a structured report and exits with 0 (pass) or 1 (fail)
 *
 * Run:  node tests/site-validation.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');

const ROUTES = [
  { path: '/',              label: 'Home' },
  { path: '/about',         label: 'About' },
  { path: '/services',      label: 'Services' },
  { path: '/contact',       label: 'Contact' },
  { path: '/blog',          label: 'Blog' },
  { path: '/blog-post',     label: 'Blog Post' },
  { path: '/careers',       label: 'Careers' },
  { path: '/case-studies',  label: 'Case Studies' },
  { path: '/case-study',    label: 'Case Study' },
  { path: '/research',      label: 'Research' },
  { path: '/research-post', label: 'Research Post' },
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.map':  'application/json',
  '.txt':  'text/plain',
};

// Wait time (ms) after page load to let JS components inject (navbar, footer)
const COMPONENT_WAIT = 800;

// ---------------------------------------------------------------------------
// Results tracking
// ---------------------------------------------------------------------------

let totalPassed = 0;
let totalFailed = 0;
const report = [];

function pass(suite, message) {
  totalPassed++;
  report.push({ suite, status: 'pass', message });
}

function fail(suite, message) {
  totalFailed++;
  report.push({ suite, status: 'fail', message });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to a page and wait for JS components to inject */
async function loadPage(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 10000 });
  await page.waitForTimeout(COMPONENT_WAIT);
}

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------

function createServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);

      // Resolve file path
      let filePath = path.join(PROJECT_ROOT, urlPath);

      // Directory request: try index.html
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
      } catch (_) {
        // If path does not exist, try appending index.html for clean URLs
        const withIndex = path.join(filePath, 'index.html');
        if (fs.existsSync(withIndex)) {
          filePath = withIndex;
        }
        // Also try appending .html
        else if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        }
      }

      // Security: prevent directory traversal above PROJECT_ROOT
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(PROJECT_ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    // Listen on random available port
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------

async function testRouteValidation(page, baseUrl) {
  const suite = 'Route Validation';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = response.status();
      const title = await page.title();
      if (status === 200) {
        pass(suite, `${route.path} (${status}) - "${title}"`);
      } else {
        fail(suite, `${route.path} (${status}) - expected 200`);
      }
    } catch (err) {
      fail(suite, `${route.path} - navigation error: ${err.message}`);
    }
  }
}

async function testAssetLoading(page, baseUrl) {
  const suite = 'Asset Loading';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    const failedAssets = [];

    const responseHandler = (response) => {
      const reqUrl = response.url();
      // Only check local resources (same origin)
      if (reqUrl.startsWith(baseUrl)) {
        const ext = path.extname(new URL(reqUrl).pathname).toLowerCase();
        if (['.css', '.js'].includes(ext) && response.status() >= 400) {
          failedAssets.push({ url: reqUrl, status: response.status() });
        }
      }
    };

    page.on('response', responseHandler);

    try {
      await loadPage(page, url);
    } catch (_) {
      // page load may fail; that is caught in route validation
    }

    page.removeListener('response', responseHandler);

    if (failedAssets.length === 0) {
      pass(suite, `${route.path} - all CSS/JS loaded`);
    } else {
      for (const asset of failedAssets) {
        const relative = asset.url.replace(baseUrl, '');
        fail(suite, `${relative} failed (${asset.status}) on ${route.path}`);
      }
    }
  }
}

async function testNavbarPresence(page, baseUrl) {
  const suite = 'Navbar Presence';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      await loadPage(page, url);
    } catch (_) {
      fail(suite, `${route.path} - page failed to load`);
      continue;
    }

    const navbar = await page.$('#navbar');
    if (!navbar) {
      fail(suite, `${route.path} - #navbar element not found`);
      continue;
    }

    const hasLinks = await page.$$eval('#navbar a.navbar__link', (links) => links.length > 0);
    if (!hasLinks) {
      fail(suite, `${route.path} - #navbar has no navigation links`);
      continue;
    }

    const hasLogo = await page.$('#navbar .navbar__logo img');
    if (!hasLogo) {
      fail(suite, `${route.path} - #navbar missing Katla Intel logo`);
      continue;
    }

    pass(suite, `${route.path} - navbar with links and logo`);
  }
}

async function testFooterPresence(page, baseUrl) {
  const suite = 'Footer Presence';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      await loadPage(page, url);
    } catch (_) {
      fail(suite, `${route.path} - page failed to load`);
      continue;
    }

    const footer = await page.$('.footer');
    if (!footer) {
      fail(suite, `${route.path} - .footer element not found`);
      continue;
    }

    const hasLinks = await page.$$eval('.footer a', (links) => links.length > 0);
    if (!hasLinks) {
      fail(suite, `${route.path} - .footer has no company links`);
      continue;
    }

    pass(suite, `${route.path} - footer with company links`);
  }
}

async function testNavigation(page, baseUrl) {
  const suite = 'Navigation Testing';

  try {
    await loadPage(page, baseUrl);
  } catch (_) {
    fail(suite, 'Homepage failed to load');
    return;
  }

  // Collect navbar links from the desktop menu
  const navLinks = await page.$$eval('#navMenu a.navbar__link', (links) =>
    links.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
  );

  for (const link of navLinks) {
    if (!link.href || link.href === '#') continue;

    try {
      // Navigate back to home first
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(COMPONENT_WAIT);

      // Click the navbar link matching this href
      const selector = `#navMenu a.navbar__link[href="${link.href}"]`;
      await page.click(selector, { timeout: 5000 });

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      const title = await page.title();

      if (title && !title.includes('Not Found')) {
        pass(suite, `Click "${link.text}" -> ${link.href} (title: "${title}")`);
      } else {
        fail(suite, `Click "${link.text}" -> ${link.href} - page did not load correctly`);
      }
    } catch (err) {
      fail(suite, `Click "${link.text}" -> ${link.href} - error: ${err.message}`);
    }
  }
}

async function testConsoleErrors(page, baseUrl) {
  const suite = 'Console Errors';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    const errors = [];

    const consoleHandler = (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Exclude Firebase errors (expected in local dev without Firebase config)
        const isFirebase = /firebase|firestore|firebaseapp|googleapis\.com\/identitytoolkit/i.test(text);
        // Exclude failed network resource loads (covered by asset loading suite)
        const isNetErr = /net::ERR_/i.test(text);
        if (!isFirebase && !isNetErr) {
          errors.push(text);
        }
      }
    };

    page.on('console', consoleHandler);

    try {
      await loadPage(page, url);
    } catch (_) {
      // page load failure handled elsewhere
    }

    page.removeListener('console', consoleHandler);

    if (errors.length === 0) {
      pass(suite, `${route.path} - no JS console errors`);
    } else {
      for (const err of errors) {
        const truncated = err.length > 120 ? err.substring(0, 120) + '...' : err;
        fail(suite, `${route.path} - console error: ${truncated}`);
      }
    }
  }
}

async function testCrossLinks(page, baseUrl) {
  const suite = 'Cross-Link Validation';

  const allLinks = new Set();

  // Collect internal links from every page
  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      await loadPage(page, url);
    } catch (_) {
      continue;
    }

    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map((a) => a.getAttribute('href')).filter(Boolean)
    );

    for (const href of links) {
      // Only internal links (starting with / but not //)
      if (href.startsWith('/') && !href.startsWith('//')) {
        // Strip hash fragments for resolution check
        const clean = href.split('#')[0];
        if (clean) {
          allLinks.add(clean);
        }
      }
    }
  }

  // Verify each unique internal link resolves via HTTP HEAD-style GET
  for (const link of allLinks) {
    const url = `${baseUrl}${link}`;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = response.status();
      if (status === 200) {
        pass(suite, `${link} -> 200`);
      } else {
        fail(suite, `${link} -> ${status} (broken link)`);
      }
    } catch (err) {
      fail(suite, `${link} -> error: ${err.message}`);
    }
  }
}

async function testImageValidation(page, baseUrl) {
  const suite = 'Image Validation';

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      await loadPage(page, url);
    } catch (_) {
      fail(suite, `${route.path} - page failed to load`);
      continue;
    }

    // Evaluate image load status in the browser context
    const imageResults = await page.$$eval('img', (imgs) =>
      imgs.map((img) => {
        const src = img.getAttribute('src') || '';
        // SVGs rendered as <img> may report naturalWidth=0 in some engines,
        // so check the response via complete + error event tracking.
        // For a reliable check, we rely on complete && naturalWidth > 0,
        // but treat SVGs with complete=true as valid since they render differently.
        const isSvg = src.endsWith('.svg');
        const loaded = img.complete && (img.naturalWidth > 0 || isSvg);
        return { src, loaded };
      })
    );

    let routePass = true;
    for (const img of imageResults) {
      if (!img.loaded) {
        // Only report local images as failures, not external CDN images
        const isLocal = img.src.startsWith('/') || img.src.startsWith('./') || img.src.startsWith('../') || img.src.startsWith(baseUrl);
        if (isLocal) {
          const displaySrc = img.src.startsWith(baseUrl) ? img.src.replace(baseUrl, '') : img.src;
          fail(suite, `${route.path} - image failed to load: ${displaySrc}`);
          routePass = false;
        }
      }
    }

    if (routePass) {
      const imgCount = imageResults.length;
      pass(suite, `${route.path} - ${imgCount} image(s) loaded`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printReport() {
  console.log('\n=== Katla Intel Site Validation ===\n');

  // Group by suite preserving insertion order
  const suiteOrder = [];
  const suites = {};
  for (const entry of report) {
    if (!suites[entry.suite]) {
      suites[entry.suite] = [];
      suiteOrder.push(entry.suite);
    }
    suites[entry.suite].push(entry);
  }

  for (const suite of suiteOrder) {
    const entries = suites[suite];
    console.log(`${suite}:`);
    for (const entry of entries) {
      const icon = entry.status === 'pass' ? '  \u2713' : '  \u2717';
      console.log(`${icon} ${entry.message}`);
    }
    console.log('');
  }

  const total = totalPassed + totalFailed;
  console.log(`Summary: ${totalPassed}/${total} passed, ${totalFailed} failed`);
  console.log('');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Starting Katla Intel site validation...\n');

  // Start server
  const { server, baseUrl } = await createServer();
  console.log(`Local server running at ${baseUrl}`);

  let browser;
  try {
    // Launch Playwright
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 800 },
    });

    // Run test suites sequentially with a fresh page per suite
    console.log('Running route validation...');
    let page = await context.newPage();
    await testRouteValidation(page, baseUrl);
    await page.close();

    console.log('Running asset loading checks...');
    page = await context.newPage();
    await testAssetLoading(page, baseUrl);
    await page.close();

    console.log('Running navbar presence checks...');
    page = await context.newPage();
    await testNavbarPresence(page, baseUrl);
    await page.close();

    console.log('Running footer presence checks...');
    page = await context.newPage();
    await testFooterPresence(page, baseUrl);
    await page.close();

    console.log('Running navigation testing...');
    page = await context.newPage();
    await testNavigation(page, baseUrl);
    await page.close();

    console.log('Running console error checks...');
    page = await context.newPage();
    await testConsoleErrors(page, baseUrl);
    await page.close();

    console.log('Running cross-link validation...');
    page = await context.newPage();
    await testCrossLinks(page, baseUrl);
    await page.close();

    console.log('Running image validation...');
    page = await context.newPage();
    await testImageValidation(page, baseUrl);
    await page.close();

  } catch (err) {
    console.error('Fatal error during testing:', err.message);
    totalFailed++;
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
  }

  // Print report and exit
  printReport();
  process.exit(totalFailed > 0 ? 1 : 0);
}

main();
