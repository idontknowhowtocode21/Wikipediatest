// --- NEW: TIME UPDATER FUNCTION ---
function updateNoteTime() {
    const now = new Date();
    
    // Format: "Today 8:20 am"
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    const timeString = `Today ${formattedHours}:${formattedMinutes} ${ampm}`;
    
    // Look for the text node in the meta-row
    const metaRow = document.querySelector('.meta-row');
    if (metaRow) {
        // This preserves the SVG dropdown while updating the text
        metaRow.innerHTML = `${timeString} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
    }
}

// Call once on load
updateNoteTime();

// --- REST OF THE LOGIC ---
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
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } catch (e) { log.innerText = "Error!"; }
}

document.getElementById('back-icon').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const url = prompt("Enter Wikipedia URL:");
    if (url) fetchWiki(url);
});

document.getElementById('title-input').addEventListener('input', (e) => {
    const val = e.target.value;
    updateNoteTime(); // Update time when you type
    
    if (!isNaN(val) && val !== "") {
        currentWordLength = parseInt(val);
        document.getElementById('tap-overlay').style.display = "flex";
        document.getElementById('note-body').value = "";
        inputSequence = "";
    } else {
        document.getElementById('tap-overlay').style.display = "none";
    }
});

function handleTap(type) {
    const log = document.getElementById('debug-log');
    const labels = ['S', 'C', 'M'];
    inputSequence += type;
    log.innerText = (inputSequence.length === 1) ? labels[type] : log.innerText + " " + labels[type];
    if (navigator.vibrate) navigator.vibrate(25);
    if (inputSequence.length === currentWordLength) setTimeout(revealResult, 300);
}

// Add event listeners to the zones if not already in HTML
document.querySelectorAll('.zone').forEach((zone, index) => {
    zone.addEventListener('click', () => handleTap(index));
});

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
    updateNoteTime();
}
