import fetch from 'node-fetch';

const USERNAME = 'chadowen93@gmail.com';
const TOKEN = '84f40776bf68d809bfec5531afe27ae2c6d4dea5';
const DOMAIN = 'defrag.app';
const API_URL = 'https://api.name.com/v4';

// TXT record from user
const RECORDS = [
  { type: 'TXT', host: '_gitlab-pages-verification-code', answer: 'gitlab-pages-verification-code=306866547d2a4c8a072461f0ff059800', ttl: 300 }
];

async function updateDNS() {
  const auth = 'Basic ' + Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64');
  console.log(`Adding verification TXT for ${DOMAIN}...`);

  try {
    for (const rec of RECORDS) {
        console.log(`Adding ${rec.type} ${rec.host} -> ${rec.answer.substring(0, 20)}...`);
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
