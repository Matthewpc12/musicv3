const fetch = require('node-fetch');

async function listFiles(prefix) {
  const res = await fetch('https://smijcwocgnygwnpbmelx.supabase.co/storage/v1/object/list/Music', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaWpjd29jZ255Z3ducGJtZWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjc0ODQsImV4cCI6MjA4NTcwMzQ4NH0.ASlu4Fkaah9cOHDRy21OYJWTxioyJwkam8gaC74irkI',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prefix, limit: 100 })
  });
  const data = await res.json();
  console.log(prefix, data);
}

listFiles('Hip hop/');
listFiles('Niche/');
listFiles('Hits/');
