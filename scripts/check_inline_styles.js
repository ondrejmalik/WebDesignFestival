const fs = require('fs');
const files = [
    'index.html',
    'program.html',
    'artists.html',
    'artist-detail.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'search.html',
    'components/nav.html',
    'components/footer.html'
];
if (fs.existsSync('web')) {
    const webHtml = fs.readdirSync('web').filter(f => f.endsWith('.html')).map(f => 'web/' + f);
    files.push(...webHtml);
}
let total = 0;
files.forEach(f => {
    if (fs.existsSync(f)) {
        const content = fs.readFileSync(f, 'utf8');
        // Match style="..." or style='...' on HTML tags (ignore within script/svg attributes if needed)
        const matches = content.match(/style\s*=\s*["'][^"']*["']/gi) || [];
        console.log(`${f}: ${matches.length} inline styles`);
        total += matches.length;
    }
});
console.log('Total inline styles:', total);
