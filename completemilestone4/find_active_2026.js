const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function findActive() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    console.log(`Searching for active sensors in India (2026)...`);
    const locUrl = `https://api.openaq.org/v3/locations?countries_id=9&limit=100`;
    const locRes = await fetch(locUrl, { headers });
    const locJson = await locRes.json();
    
    if (locJson.results && locJson.results.length > 0) {
        const active = locJson.results.filter(l => l.datetimeLast && new Date(l.datetimeLast.utc) > new Date('2026-03-01'));
        console.log(`Found ${active.length} active locations.`);
        active.forEach(l => {
            const pm25 = l.sensors.find(s => s.parameter.name === 'pm25');
            console.log(` - ${l.name} | ID: ${l.id} | Last: ${l.datetimeLast.utc} | PM2.5 Sensor: ${pm25 ? pm25.id : 'N/A'}`);
        });
    } else {
        console.log('No locations found.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

findActive();
