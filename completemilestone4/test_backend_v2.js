async function testImprovedBackend() {
    const cities = ['Pune', 'Pune, India', 'Delhi', 'Mumbai'];
    
    for (const city of cities) {
        try {
            const url = `http://localhost:5000/history?city=${encodeURIComponent(city)}`;
            console.log(`Testing city: "${city}"...`);
            const res = await fetch(url);
            const json = await res.json();
            
            if (res.ok) {
                console.log(`  [Success] Station: ${json.station}, points: ${json.data.length}, isStale: ${json.isStale}`);
            } else {
                console.log(`  [Error] ${json.error}`);
            }
        } catch (err) {
            console.error(`  [Fetch Error] ${err.message}`);
        }
    }
}

testImprovedBackend();
