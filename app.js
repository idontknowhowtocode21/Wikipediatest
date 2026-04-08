/**
 * Wikipedia Divination Engine (Android Optimized)
 * Features: Deep Scraping, Shape Hashing, Acrostic Reveal, and Text HUD
 */

// --- CONFIGURATION ---
let dictionary = {};
let currentWordLength = 0;
let inputSequence = "";

// Mapping for Capital Letter Shapes
// 0: Straight | 1: Curved | 2: Mixed
const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

// Wordsmith-style Acrostic Filler Words
const fillers = {
    'A': 'Apple', 'B': 'Blue', 'C': 'Cold', 'D': 'Dark', 'E': 'East', 'F': 'Fire', 'G': 'Gold',
    'H': 'High', 'I': 'Iron', 'J': 'Just', 'K': 'Kind', 'L': 'Long', 'M': 'Moon', 'N': 'Next',
    'O': 'Open', 'P': 'Past', 'Q': 'Quiet', 'R': 'Red', 'S': 'Star', 'T': 'Time', 'U': 'Under',
    'V': 'View', 'W': 'West', 'X': 'Xray', 'Y': 'Year', 'Z': 'Zero'
};

// --- 1. WIKIPEDIA SCRAPER ---
async function fetchWiki(url) {
    const log = document.getElementById('debug-log');
    log.innerText = "Indexing...";

    try {
        // Extract the title from the URL
        const title = url.split('wiki/')[1].split('#')[0];
        const api = `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json&origin=*`;
        
        const response = await fetch(api);
        const data = await response.json();
        
        if (data.error) throw new Error("Page not found");

        const rawHtml = data.parse.text["*"];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;
        
        // Remove junk elements that mess up the word count
        const toRemove = tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style, .reflist');
        toRemove.forEach(el => el.remove());

        const cleanText = tempDiv.innerText.toUpperCase();
        const words = cleanText.match(/[A-Z]{3,}/g); // Only words 3 letters or longer

        dictionary = {}; // Reset previous session
        words.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            
            if (!dictionary[len]) dictionary[len] = {};
            // We store the FIRST instance of this shape sequence found on the page
            if (!dictionary[len][hash]) dictionary[len][hash] = word;
        });

        // Visual confirmation of success
        document.getElementById('status-dot').style.background = "#4CAF50"; 
        log.innerText = "Ready";
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]); 

    } catch (e) {
        log.innerText = "Error!";
        alert("Failed to index page. Ensure it's a valid Wikipedia link.");
    }
}

// --- 2. UI HANDLERS ---

// Secret Input: Long press the back arrow to trigger the prompt
document.getElementById('back-icon').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const url = prompt("Paste Wikipedia Article Link:");
    if (url) fetchWiki(url);
});

// Title Input: Typing a number sets the length and enables tap zones
document.getElementById('title-input').addEventListener('input', (e) => {
    const val = e.target.value;
    const overlay = document.getElementById('tap-overlay');
    const body = document.getElementById('note-body');
    const log = document.getElementById('debug-log');

    if (!isNaN(val) && val !== "") {
        currentWordLength = parseInt(val);
        overlay.style.display = "flex";
        body.value = ""; // Clear notes area for performance
        inputSequence = "";
        log.innerText = "Listening...";
    } else {
        overlay.style.display = "none";
    }
});

// --- 3. TAP ZONE LOGIC ---

function updateHUD(type) {
    const log = document.getElementById('debug-log');
    const labels = ['S', 'C', 'M']; // Straight, Curved, Mixed
    
    if (inputSequence.length === 0) {
        log.innerText = labels[type];
    } else {
        log.innerText += " " + labels[type];
    }

    if (navigator.vibrate) navigator.vibrate(25);
}

document.querySelectorAll('.zone').forEach((zone, index) => {
    zone.addEventListener('click', () => {
        if (currentWordLength === 0) return;

        // Provide visual and haptic feedback
        updateHUD(index);
        
        // Append tap index (0, 1, or 2) to our sequence
        inputSequence += index; 

        // Auto-reveal once sequence length matches title number
        if (inputSequence.length === currentWordLength) {
            setTimeout(revealResult, 300);
        }
    });
});

// --- 4. THE REVEAL ---

function revealResult() {
    const wordFound = dictionary[currentWordLength]?.[inputSequence];
    const body = document.getElementById('note-body');
    const title = document.getElementById('title-input');
    const log = document.getElementById('debug-log');
    
    log.innerText = "Processing...";

    if (wordFound) {
        // Map each letter of the found word to a filler word
        const acrostic = wordFound.split('').map(letter => {
            return fillers[letter] || letter;
        }).join('\n');

        body.value = `Possibilities:\n\n${acrostic}\n\n(None of these correct?)`;
    } else {
        body.value = "I'm having trouble focusing. Let's try visualizing the letters again.";
    }
    
    // Cleanup UI
    document.getElementById('tap-overlay').style.display = "none";
    title.value = "My Guesses"; // Overwrite the number to mask method
    currentWordLength = 0; // Reset for next use
    
    setTimeout(() => { log.innerText = "Ready"; }, 3000);
}
