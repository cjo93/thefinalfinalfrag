import fetch from 'node-fetch';

const USERNAME = 'chadowen93@gmail.com';
const TOKEN = '84f40776bf68d809bfec5531afe27ae2c6d4dea5';
const DOMAIN = 'defrag.app';
const API_URL = 'https://api.name.com/v4';

// Records to add
const RECORDS = [
  { type: 'CNAME', host: 'www', answer: 'defragmentation1.gitlab.io', ttl: 300 }
];

async function updateDNS() {
  const auth = 'Basic ' + Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64');
  console.log(`Configuring www.${DOMAIN}...`);

  try {
    // 1. Get existing records
    const listRes = await fetch(`${API_URL}/domains/${DOMAIN}/records`, {
      headers: { 'Authorization': auth }
    });

    if (!listRes.ok) {
       console.error('Failed to list:', await listRes.text());
       return;
    }
    const data = await listRes.json();
    const existing = (data as any).records || [];

    // 2. Clear old www/apex records to avoid conflicts
    const conflicts = existing.filter((r: any) => r.host === 'www');
    for (const c of conflicts) {
        console.log(`Deleting old ${c.type} www record (id: ${c.id})...`);
        await fetch(`${API_URL}/domains/${DOMAIN}/records/${c.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': auth }
        });
    }

    // 3. Add fresh CNAME for www
    for (const rec of RECORDS) {
        console.log(`Adding ${rec.type} ${rec.host} -> ${rec.answer}`);
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
           console.log(`✓ Created ${rec.host}`);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateDNS();
