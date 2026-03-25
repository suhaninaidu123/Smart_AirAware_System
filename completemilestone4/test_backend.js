async function testBackend() {
    try {
        const url = 'http://localhost:5000/history?city=Pune';
        const res = await fetch(url);
        const json = await res.json();
        console.log('Status Code:', res.status);
        if (res.ok) {
            console.log('Success! Data points:', json.data.length);
            console.log('Station:', json.station);
            console.log('Is Stale:', json.isStale);
        } else {
            console.log('Error:', json.error);
        }
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testBackend();
