const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

// ── Config ──────────────────────────────────────────────────────────────────
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SITE_URL      = process.env.SITE_URL;
const POST_FILE     = process.env.NEW_POST_FILE; // e.g. "_essays/at-the-crossroads.md"
const SUBSCRIBERS   = 'subscribers-repo/subscribers.csv';
const SENDER_EMAIL  = 'fusionwalkersg@gmail.com'; 
const SENDER_NAME   = 'An Archive of Small Thoughts';
const EXCERPT_WORDS = 60;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseCSV(filepath) {
  const lines = fs.readFileSync(filepath, 'utf8').trim().split('\n');
  return lines.slice(1).map(line => {
    const [name, email] = line.split(',').map(s => s.trim());
    return { name, email };
  }).filter(s => s.name && s.email);
}

function getExcerpt(content, wordCount) {
  const plain = content
    .replace(/---[\s\S]*?---/, '')   // strip front matter if any
    .replace(/[#*_`>]/g, '')         // strip markdown symbols
    .replace(/\s+/g, ' ')
    .trim();
  const words = plain.split(' ');
  if (words.length <= wordCount) return plain;
  return words.slice(0, wordCount).join(' ') + '…';
}

function getPostURL(filepath) {
  // "_essays/at-the-crossroads.md" → "/essays/at-the-crossroads/"
  const parts  = filepath.replace(/^_/, '').replace(/\.md$/, '');
  return `${SITE_URL}/${parts}/`;
}

function getCollection(filepath) {
  if (filepath.startsWith('_essays'))  return 'Essay';
  if (filepath.startsWith('_stories')) return 'Story';
  if (filepath.startsWith('_poems'))   return 'Poem';
  return 'Post';
}

function buildEmailHTML(name, title, collection, excerpt, postURL) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&family=Cormorant+Garamond:wght@300;400&display=swap');
    body        { background:#f5f0e8; margin:0; padding:0; font-family:'EB Garamond',Georgia,serif; color:#2c2416; }
    .wrap       { max-width:560px; margin:40px auto; background:#f5f0e8; border:1px solid #d6ccb4; padding:40px 48px; }
    .site-name  { font-family:'Cormorant Garamond',serif; font-weight:300; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; color:#9a8e78; text-align:center; margin-bottom:32px; }
    .divider    { text-align:center; color:#c4763a; font-size:13px; letter-spacing:0.4em; margin:24px 0; opacity:0.6; }
    .label      { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#9a8e78; text-align:center; margin-bottom:8px; }
    h1          { font-family:'Cormorant Garamond',serif; font-weight:400; font-size:28px; text-align:center; margin:0 0 24px; line-height:1.2; color:#2c2416; }
    .greeting   { font-size:16px; margin-bottom:16px; }
    .excerpt    { font-size:16px; line-height:1.8; font-style:italic; color:#5a4e38; border-left:2px solid #c4763a; padding-left:16px; margin:24px 0; }
    .cta-wrap   { text-align:center; margin:32px 0; }
    .cta        { display:inline-block; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#7a3b1e; text-decoration:none; border-bottom:1px solid #c4763a; padding-bottom:2px; }
    .footer     { font-size:12px; color:#9a8e78; text-align:center; margin-top:40px; font-style:italic; }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="site-name">An Archive of Small Thoughts</p>
    <div class="divider">· · ·</div>
    <p class="label">${collection}</p>
    <h1>${title}</h1>
    <p class="greeting">Dear ${name},</p>
    <p style="font-size:16px;line-height:1.8;">A new ${collection.toLowerCase()} has been added to the archive.</p>
    <div class="excerpt">${excerpt}</div>
    <div class="cta-wrap">
      <a class="cta" href="${postURL}">Read the full piece →</a>
    </div>
    <div class="divider">❧</div>
    <p class="footer">You're receiving this because you subscribed to An Archive of Small Thoughts.</p>
  </div>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!POST_FILE) {
    console.log('No new post file specified. Exiting.');
    process.exit(0);
  }

  // Parse the post
  const raw        = fs.readFileSync(POST_FILE, 'utf8');
  const { data, content } = matter(raw);
  const title      = data.title || path.basename(POST_FILE, '.md');
  const excerpt    = getExcerpt(content, EXCERPT_WORDS);
  const postURL    = getPostURL(POST_FILE);
  const collection = getCollection(POST_FILE);

  console.log(`Sending newsletter for: "${title}" (${collection})`);
  console.log(`URL: ${postURL}`);

  // Load subscribers
  const subscribers = parseCSV(SUBSCRIBERS);
  console.log(`Subscribers: ${subscribers.length}`);

  if (subscribers.length === 0) {
    console.log('No subscribers yet. Exiting.');
    process.exit(0);
  }

  // Send via Brevo
  let sent = 0, failed = 0;

  for (const { name, email } of subscribers) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender:  { name: SENDER_NAME, email: SENDER_EMAIL },
        to:      [{ name, email }],
        subject: `New ${collection}: ${title}`,
        htmlContent: buildEmailHTML(name, title, collection, excerpt, postURL),
      }, {
        headers: {
          'api-key':      BREVO_API_KEY,
          'Content-Type': 'application/json',
        }
      });
      console.log(`✓ Sent to ${email}`);
      sent++;
    } catch (err) {
      console.error(`✗ Failed for ${email}:`, err.response?.data || err.message);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
