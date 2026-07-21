const url = 'https://docs.google.com/forms/d/e/1FAIpQLSdyME-p9fqHgYJ-YAjNuM-bbenTWZc6PnYj1csIQr81Z-kQUg/viewform';
fetch(url)
  .then(r => r.text())
  .then(text => {
    const match = text.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\n/);
    if (match) {
      const data = JSON.parse(match[1]);
      const fields = data[1][1];
      fields.forEach(f => {
        const title = f[1];
        const entryId = f[4][0][0];
        console.log(`Field: ${title} -> entry.${entryId}`);
      });
    } else {
      console.log('Could not find data.');
    }
  });
