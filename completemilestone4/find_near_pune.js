const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function findNearPune() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    console.log(`Searching for active sensors near Pune (100km radius)...`);
    // Pune: 18.52, 73.85
    // 100km is roughly 1 degree
    const bbox = [72.8, 17.5, 74.8, 19.5];
    const locUrl = `https://api.openaq.org/v3/locations?bbox=${bbox.join(',')}&limit=100`;
    const locRes = await fetch(locUrl, { headers });
    const locJson = await locRes.json();
    
    if (locJson.results && locJson.results.length > 0) {
        const active = locJson.results.filter(l => l.datetimeLast && new Date(l.datetimeLast.utc) > new Date('2026-03-01'));
        console.log(`Found ${active.length} active locations near Pune.`);
        active.forEach(l => {
            console.log(` - ${l.name} | Last: ${l.datetimeLast.utc}`);
        });
    } else {
        console.log('No locations found near Pune.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

findNearPune();
