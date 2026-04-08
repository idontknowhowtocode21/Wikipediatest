// --- CONFIGURATION ---
let dictionary = {};
let currentWordLength = 0;
let inputSequence = "";

const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

const fillers = {
    'A': 'Apple', 'B': 'Blue', 'C': 'Cold', 'D': 'Dark', 'E': 'East', 'F': 'Fire', 'G': 'Gold',
    'H': 'High', 'I': 'Iron', 'J': 'Just', 'K': 'Kind', 'L': 'Long', 'M': 'Moon', 'N': 'Next',
    'O': 'Open', 'P': 'Past', 'Q': 'Quiet', 'R': 'Red', 'S': 'Star', 'T': 'Time', 'U': 'Under',
    'V': 'View', 'W': 'West', 'X': 'Xray', 'Y': 'Year', 'Z': 'Zero'
};

// --- WIKIPEDIA SCRAPER ---
async function fetchWiki(url) {
    try {
        const title = url.split('wiki/')[1].split('#')[0];
        const api = `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json&origin=*`;
        
        const response = await fetch(api);
        const data = await response.json();
        const rawHtml = data.parse.text["*"];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;
        
        // Clean the text
        const toRemove = tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style');
        toRemove.forEach(el => el.remove());

        const cleanText = tempDiv.innerText.toUpperCase();
        const words = cleanText.match(/[A-Z]{3,}/g); 

        dictionary = {}; // Reset
        words.forEach(word => {
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[word.length]) dictionary[word.length] = {};
            if (!dictionary[word.length][hash]) dictionary[word.length][hash] = word;
        });

        document.getElementById('status-dot').style.background = "#4CAF50"; 
        if (navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
        alert("Scrape failed. Check URL.");
    }
}

// --- UI EVENT LISTENERS ---

// Secret: Long press back icon to input URL
document.getElementById('back-icon').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const url = prompt("Enter Wikipedia URL:");
    if (url) fetchWiki(url);
});

// Title input sets the word length
document.getElementById('title-input').addEventListener('input', (e) => {
    const val = e.target.value;
    if (!isNaN(val) && val !== "") {
        currentWordLength = parseInt(val);
        document.getElementById('tap-overlay').style.display = "flex";
        document.getElementById('note-body').value = "";
        inputSequence = "";
    } else {
        document.getElementById('tap-overlay').style.display = "none";
    }
});

// Tap zones handle the "shapes"
document.querySelectorAll('.zone').forEach((zone, index) => {
    zone.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        inputSequence += index; // 0, 1, or 2

        if (inputSequence.length === currentWordLength) {
            revealResult();
        }
    });
});

// --- THE REVEAL ---
function revealResult() {
    const wordFound = dictionary[currentWordLength]?.[inputSequence];
    const body = document.getElementById('note-body');
    const title = document.getElementById('title-input');
    
    if (wordFound) {
        const acrostic = wordFound.split('').map(letter => fillers[letter] || letter).join('\n');
        body.value = `Possibilities:\n\n${acrostic}\n\n(None of these correct?)`;
    } else {
        body.value = "I'm not getting a clear image. Let's try visualizing the letters again.";
    }
    
    document.getElementById('tap-overlay').style.display = "none";
    title.value = "My Guesses"; // Mask the number
}
