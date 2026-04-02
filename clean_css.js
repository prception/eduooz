const fs = require('fs');

function removeLines(file, ranges) {
    let lines = fs.readFileSync(file, 'utf8').split('\n');
    
    // Sort ranges descending so splicing doesn't mess up indices
    ranges.sort((a,b) => b[0] - a[0]);
    
    for (let r of ranges) {
        // Line numbers are 1-indexed, so index is line - 1
        let start = r[0] - 1;
        let count = r[1] - r[0] + 1;
        lines.splice(start, count);
    }
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

// 1. Clean index.css
// Header: 178 to 277
// Footer + Mobile + Scroll: 3094 to 3424
removeLines('n:\\#0Brinit\\eduooz\\assets\\css\\index.css', [[178, 277], [3094, 3424]]);

console.log("index.css cleaned");

// 2. Clean contact.css
// Need to find exactly where scroll-to-top is.
let contactCss = fs.readFileSync('n:\\#0Brinit\\eduooz\\assets\\css\\contact.css', 'utf8');
// "/* =========================================\r\n   SCROLL TO TOP BUTTON" to end of file, or just find "SCROLL TO TOP BUTTON"
let scIndex = contactCss.indexOf('/* =========================================\r\n   SCROLL TO TOP BUTTON');
if(scIndex === -1) scIndex = contactCss.indexOf('/* =========================================\n   SCROLL TO TOP BUTTON');

if (scIndex !== -1) {
    let newContactCss = contactCss.substring(0, scIndex).trimEnd();
    fs.writeFileSync('n:\\#0Brinit\\eduooz\\assets\\css\\contact.css', newContactCss, 'utf8');
    console.log("contact.css cleaned");
} else {
    console.log("scroll-to-top not found in contact.css");
}
