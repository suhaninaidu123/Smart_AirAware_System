const OPENAQ_TOKEN = 'b590e813cc01928caf2e17f4e6dc48ae4605022cd71d5f3a496833406dc65cb8';
const city = 'Pune';

async function testOpenAQ() {
    const url = `https://api.openaq.org/v3/locations?countries_id=9&parameters_id=2&monitor=true&limit=1000`;
    const headers = { "X-API-Key": OPENAQ_TOKEN, "Accept": "application/json" };
    
    try {
        console.log('Fetching locations...');
        const res = await fetch(url, { headers });
        const json = await res.json();
        
        if (!json.results) {
            console.log('Error: No results in response', json);
            return;
        }
        
        console.log('Total locations found:', json.results.length);
        
        const matches = json.results.filter(l => 
            (l.name && l.name.toLowerCase().includes(city.toLowerCase())) || 
            (l.locality && l.locality.toLowerCase().includes(city.toLowerCase()))
        );
        
        console.log('Matches for Pune:', matches.length);
        if (matches.length > 0) {
            console.log('Best match:', matches[0].name, 'Last updated:', matches[0].datetimeLast?.utc);
            const sensor = matches[0].sensors.find(s => s.parameter.name === 'pm25');
            if (sensor) {
                console.log('Sensor ID:', sensor.id);
                const historyUrl = `https://api.openaq.org/v3/sensors/${sensor.id}/measurements/daily?limit=30`;
                const hRes = await fetch(historyUrl, { headers });
                const hJson = await hRes.json();
                console.log('History data points:', hJson.results?.length);
                if (hJson.results && hJson.results.length > 0) {
                    console.log('First data point:', JSON.stringify(hJson.results[0], null, 2));
                }
            } else {
                console.log('No PM2.5 sensor found for this location.');
                console.log('Available sensors:', matches[0].sensors.map(s => s.parameter.name).join(', '));
            }
        } else {
            console.log('No matches found for Pune in India locations list.');
            // Try global search fallback
            const fallbackUrl = `https://api.openaq.org/v3/locations?q=${encodeURIComponent(city)}&limit=10`;
            const fRes = await fetch(fallbackUrl, { headers });
            const fJson = await fRes.json();
            console.log('Fallback results count:', fJson.results?.length);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testOpenAQ();
