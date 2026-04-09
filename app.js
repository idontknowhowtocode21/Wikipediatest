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

// Wikipedia Scraper
async function fetchWiki(url) {
    const log = document.getElementById('debug-log');
    log.innerText = "Indexing...";
    try {
        const title = url.split('wiki/')[1].split('#')[0];
        const api = `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json&origin=*`;
        const response = await fetch(api);
        const data = await response.json();
        const rawHtml = data.parse.text["*"];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;
        const words = tempDiv.innerText.toUpperCase().match(/[A-Z]{3,}/g);
        dictionary = {};
        words.forEach(word => {
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[word.length]) dictionary[word.length] = {};
            if (!dictionary[word.length][hash]) dictionary[word.length][hash] = word;
        });
        document.getElementById('status-dot').style.background = "#4CAF50"; 
        log.innerText = "Ready";
    } catch (e) { log.innerText = "Error!"; }
}

// Secret Trigger
document.getElementById('back-icon').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const url = prompt("Enter Wikipedia URL:");
    if (url) fetchWiki(url);
});

// Length Trigger
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

// Invisible Taps
function handleTap(type) {
    const log = document.getElementById('debug-log');
    const labels = ['S', 'C', 'M'];
    inputSequence += type;
    log.innerText = (inputSequence.length === 1) ? labels[type] : log.innerText + " " + labels[type];
    if (navigator.vibrate) navigator.vibrate(25);
    if (inputSequence.length === currentWordLength) setTimeout(revealResult, 300);
}

function revealResult() {
    const wordFound = dictionary[currentWordLength]?.[inputSequence];
    const body = document.getElementById('note-body');
    const title = document.getElementById('title-input');
    if (wordFound) {
        body.value = wordFound.split('').map(l => fillers[l] || l).join('\n') + "\n\n(None of these?)";
    } else {
        body.value = "Connection lost. Please focus on the letters again.";
    }
    document.getElementById('tap-overlay').style.display = "none";
    title.value = "My Guesses";
    inputSequence = "";
}
