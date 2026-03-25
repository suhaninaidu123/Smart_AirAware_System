const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function findLatest() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    console.log(`Searching for latest updated locations in India...`);
    // countries_id=9 is India
    const locUrl = `https://api.openaq.org/v3/locations?countries_id=9&limit=10&order_by=last_updated&sort=desc`;
    const locRes = await fetch(locUrl, { headers });
    const locJson = await locRes.json();
    
    if (locJson.results && locJson.results.length > 0) {
        locJson.results.forEach(l => {
            console.log(` - ${l.name} | Last Updated: ${l.datetimeLast?.utc || 'N/A'}`);
        });
    } else {
        console.log('No locations found in India.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

findLatest();
