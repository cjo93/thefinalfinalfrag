import fetch from 'node-fetch';

const USERNAME = 'chadowen93@gmail.com';
const TOKEN = '84f40776bf68d809bfec5531afe27ae2c6d4dea5'; // Using 'Gpt' production token
const DOMAIN = 'defrag.app';
const API_URL = 'https://api.name.com/v4';

// Records to add
const RECORDS = [
  { type: 'A', host: '', answer: '35.185.44.232', ttl: 300 },
  { type: 'CNAME', host: 'www', answer: 'defragmentation1.gitlab.io', ttl: 300 }
  // TXT records require values from GitLab UI - skipping for now as user needs to provide them
];

async function updateDNS() {
  const auth = 'Basic ' + Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64');

  console.log(`Checking records for ${DOMAIN}...`);

  try {
    // 1. Get existing records
    const listRes = await fetch(`${API_URL}/domains/${DOMAIN}/records`, {
      headers: { 'Authorization': auth }
    });

    if (!listRes.ok) {
      const err = await listRes.text();
      throw new Error(`Failed to list records: ${listRes.status} ${err}`);
    }

    const data = await listRes.json();
    const existing = (data as any).records || [];
    console.log(`Found ${existing.length} existing records.`);

    // 2. Add new records
    for (const rec of RECORDS) {
      // Check if exists
      const conflict = existing.find((e: any) => e.type === rec.type && e.host === rec.host);

      if (conflict) {
        console.log(`Record ${rec.type} ${rec.host || '@'} already exists (ID: ${conflict.id}). Skipping/Updating...`);
        // Ideally verify value match, for safety just logging.
        // To force update: delete conflict.id then create new.
      } else {
        console.log(`Adding ${rec.type} ${rec.host || '@'} -> ${rec.answer}`);
        const createRes = await fetch(`${API_URL}/domains/${DOMAIN}/records`, {
          method: 'POST',
          headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domainName: DOMAIN,
            type: rec.type,
            host: rec.host,
            answer: rec.answer,
            ttl: rec.ttl
          })
        });

        if (!createRes.ok) {
          console.error(`Failed to create ${rec.host}:`, await createRes.text());
        } else {
          console.log(`✓ Created ${rec.host || '@'}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDNS();
