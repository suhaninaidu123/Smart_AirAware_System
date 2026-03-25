const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';

async function findPune() {
  try {
    const headers = {
      'X-API-Key': OPENAQ_TOKEN,
      'Accept': 'application/json'
    };

    console.log(`Searching near Pune coordinates...`);
    const bbox = [73.8, 18.5, 74.0, 18.6];
    const locUrl = `https://api.openaq.org/v3/locations?bbox=${bbox.join(',')}&limit=1`;
    const locRes = await fetch(locUrl, { headers });
    const locJson = await locRes.json();
    
    if (locJson.results && locJson.results.length > 0) {
        const l = locJson.results[0];
        console.log(`Name: ${l.name} | ID: ${l.id} | City: ${l.city?.name || 'N/A'}`);
    } else {
        console.log('No locations found.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

findPune();
