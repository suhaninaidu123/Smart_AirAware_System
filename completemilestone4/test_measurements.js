const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function testM() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    const sensorId = 8171; // Mhada Colony, Pune
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching daily measurements for sensor ${sensorId} from ${dateFrom} to ${dateTo}...`);
    const mUrl = `https://api.openaq.org/v3/sensors/${sensorId}/measurements/daily?date_from=${dateFrom}&date_to=${dateTo}&limit=100`;
    const mRes = await fetch(mUrl, { headers });
    const mJson = await mRes.json();
    
    if (mJson.results && mJson.results.length > 0) {
        console.log(`Found ${mJson.results.length} daily results.`);
        console.log('Latest daily result:', JSON.stringify(mJson.results[0], null, 2));
    } else {
        console.log('No daily results found. Trying raw measurements...');
        const rawUrl = `https://api.openaq.org/v3/sensors/${sensorId}/measurements?limit=5`;
        const rawRes = await fetch(rawUrl, { headers });
        const rawJson = await rawRes.json();
        console.log(`Found ${rawJson.results?.length || 0} raw results.`);
        if (rawJson.results?.length > 0) {
            console.log('Latest raw result:', JSON.stringify(rawJson.results[0], null, 2));
        }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testM();
