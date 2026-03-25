const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function explore() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    console.log(`Fetching 50 locations in India...`);
    const locUrl = `https://api.openaq.org/v3/locations?countries_id=9&limit=50`;
    const locRes = await fetch(locUrl, { headers });
    const locJson = await locRes.json();
    
    if (locJson.results && locJson.results.length > 0) {
        console.log(`Found ${locJson.results.length} locations.`);
        const recent = locJson.results.filter(l => l.datetimeLast && new Date(l.datetimeLast.utc) > new Date('2026-01-01'));
        console.log(`${recent.length} locations are active in 2026.`);
        
        if (recent.length > 0) {
            recent.slice(0, 3).forEach(l => {
                console.log(` - ${l.name} | Last: ${l.datetimeLast.utc}`);
                const pm25 = l.sensors.find(s => s.parameter.name === 'pm25');
                if (pm25) console.log(`   - PM2.5 Sensor ID: ${pm25.id}`);
            });
        } else {
            console.log('Sample of found locations:');
            locJson.results.slice(0, 5).forEach(l => console.log(` - ${l.name} | Last: ${l.datetimeLast?.utc || 'N/A'}`));
        }
    } else {
        console.log('No locations found.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

explore();
