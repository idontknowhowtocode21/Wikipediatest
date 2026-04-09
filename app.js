// Complete application logic for Wikipedia divination engine

// Configuration
let dictionary = {};
let currentWordLength = 0;
let inputSequence = "";

// Capital Shape Mapping
// 0: Straight | 1: Curved | 2: Mixed
const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

// Wordsmith-style filler words for acrostic output
const fillers = {
    'A': 'Action', 'B': 'Blue', 'C': 'Case', 'D': 'Data', 'E': 'East', 'F': 'Field', 'G': 'Gold',
    'H': 'Hold', 'I': 'Image', 'J': 'Join', 'K': 'Keep', 'L': 'Lock', 'M': 'Mode', 'N': 'Next',
    'O': 'Open', 'P': 'Plan', 'Q': 'Quite', 'R': 'Right', 'S': 'Star', 'T': 'Task', 'U': 'User',
    'V': 'Value', 'W': 'Work', 'X': 'Xray', 'Y': 'Year', 'Z': 'Zero'
};

// System Fetcher
async function fetchWiki(url) {
    console.log("Fetching: " + url);
    // You could update a hidden element with "Indexing..." but for now, we just rely on the final vibrate
    try {
        const titleMatch = url.match(/\/wiki\/([^#?]+)/);
        if (!titleMatch) throw new Error("Invalid URL format");
        
        const title = titleMatch[1];
        const api = `https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json&origin=*`;
        
        const response = await fetch(api);
        const data = await response.json();
        
        if (data.error) throw new Error("Page not found on Wikipedia");

        const rawHtml = data.parse.text["*"];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;
        
        // Sanitize the text (citations, tables, scripts)
        const toRemove = tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style');
        toRemove.forEach(el => el.remove());

        const cleanText = tempDiv.innerText.toUpperCase();
        const words = cleanText.match(/[A-Z]{4,}/g); // Words 4+ letters 

        dictionary = {}; // Reset previous session
        words.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[len]) dictionary[len] = {};
            // Keep first instance found
            if (!dictionary[len][hash]) dictionary[len][hash] = word;
        });

        console.log("Index Complete");
        if (navigator.vibrate) navigator.vibrate([100, 30, 100]); // Success buzz
    } catch (e) {
        console.error("Index failed: ", e);
        // Maybe a subtle visual cue or default alert if in a non-performance setting
    }
}

// Event Listeners

// Secret: Long press back icon in the top-left to set URL
document.getElementById('back-icon').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const url = prompt("Paste Wikipedia Link:");
    if (url) fetchWiki(url);
});

// Setting Length: Number in title enables mixed-mode taps
document.getElementById('title-input').addEventListener('input', (e) => {
    const val = e.target.value;
    const tapOverlay = document.getElementById('tap-overlay');
    const noteArea = document.getElementById('note-body');

    if (!isNaN(val) && val !== "" && val !== "Title") {
        currentWordLength = parseInt(val);
        tapOverlay.style.display = "flex";
        noteArea.value = "";
        inputSequence = "";
    } else {
        tapOverlay.style.display = "none";
    }
});

// The Mixed Divination Mode
function provideVibrationHUD(index) {
    // We now rely purely on haptic feedback in a performance setting.
    // Index 0: Straight | 1: Curved | 2: Mixed
    const vibrations = [
        [20], // Short buzz for Straight (S)
        [20, 100, 20], // Pulse for Curved (C)
        [80] // Longer rumble for Mixed (M)
    ];
    if (navigator.vibrate) navigator.vibrate(vibrations[index] || 10);
}

document.querySelectorAll('.zone').forEach((zone, index) => {
    zone.addEventListener('click', () => {
        if (currentWordLength === 0) return;

        // Provide Haptic peak
        provideVibrationHUD(index);
        
        // Append tap index (0, 1, or 2)
        inputSequence += index; 

        // Auto-reveal
        if (inputSequence.length === currentWordLength) {
            // Very short delay to feel the last vibe before the reveal
            setTimeout(revealWordAcrostic, 200);
        }
    });
});

// The Wordsmith-Style Reveal
function revealWordAcrostic() {
    const foundWord = dictionary[currentWordLength]?.[inputSequence];
    const display = document.getElementById('note-body');
    
    if (foundWord) {
        const acrostic = foundWord.split('').map(letter => fillers[letter] || letter).join('\n');
        display.value = `I'm seeing possibilities like...\n\n${acrostic}\n\nNot what you thought of? Check closer...`;
    } else {
        display.value = "Hmm. I'm having difficulty connecting. Visualise the shapes once more.";
    }
    
    document.getElementById('tap-overlay').style.display = "none";
    currentWordLength = 0; // Reset
    if (navigator.vibrate) navigator.vibrate(50); // Small confirm buzz
}
