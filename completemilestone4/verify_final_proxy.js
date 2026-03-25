async function verify() {
  const cities = ['Pune', 'Delhi'];
  for (const city of cities) {
    console.log(`\nVerifying ${city}...`);
    try {
      const res = await fetch(`http://localhost:5000/history?city=${city}`);
      const json = await res.json();
      if (res.ok) {
        console.log(`Success: Found ${json.data.length} data points at station "${json.station}". Stale: ${json.isStale}`);
        if (json.data.length > 0) {
          console.log(`Sample: ${JSON.stringify(json.data[0])}`);
        }
      } else {
        console.error(`Error (${res.status}): ${json.error}`);
      }
    } catch (e) {
      console.error(`Fetch failed: ${e.message}`);
    }
  }
}

verify();
