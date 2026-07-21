const fs = require('fs');
const html = fs.readFileSync('form.html', 'utf8');

// The data is usually inside a script tag like:
// var FB_PUBLIC_LOAD_DATA_ = [ ... ];
const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\s*<\/script>/s);
if (match) {
    try {
        const data = JSON.parse(match[1]);
        const fields = data[1][1];
        fields.forEach(f => {
            if(f && f[1] && f[4] && f[4][0]) {
                console.log(`Field: ${f[1]} -> entry.${f[4][0][0]}`);
            }
        });
    } catch(e) {
        console.error("Error parsing", e);
    }
} else {
    console.log("No FB_PUBLIC_LOAD_DATA_ found.");
}
