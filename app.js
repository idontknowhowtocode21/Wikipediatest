/**
 * WORDSMITH ENGINE v3.0
 * Features: Deep Wiki Scraping, Clipboard Auto-Snatch, 
 * Physical Icon Mapping, and 4-12 Length Acrostic Engine.
 */

let dictionary = {};
let inputSequence = "";
let currentArticle = "Ready";

// Shape Mapping (0: Straight, 1: Curved, 2: Mixed)
const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

// --- THE MASTER DICTIONARY (Lengths 4-12) ---
// Note: Only a sample is shown here for space, but you should expand this 
// so every letter has a word for every length (4,5,6,7,8,9,10,11,12).
const fillerWords = {
    'A': {4:'AREA', 5:'APPLE', 6:'ACTION', 7:'AGAINST', 8:'ABSOLUTE', 9:'ADVENTURE', 10:'APPEARANCE', 11:'AGRICULTURE', 12:'ARCHITECTURE'},
    'B': {4:'BLUE', 5:'BOARD', 6:'BEYOND', 7:'BETWEEN', 8:'BOUNDARY', 9:'BEAUTIFUL', 10:'BACKGROUND', 11:'BENEFICIARY', 12:'BREAKTHROUGH'},
    'C': {4:'CASE', 5:'CLOUD', 6:'CHURCH', 7:'CONTROL', 8:'CAPACITY', 9:'CHARACTER', 10:'CONFERENCE', 11:'COMBINATION', 12:'CONSTRUCTION'},
    'D': {4:'DARK', 5:'DREAM', 6:'DEVICE', 7:'DISPLAY', 8:'DISTANCE', 9:'DIFFERENT', 10:'DEPARTMENT', 11:'DESCRIPTION', 12:'DISTRIBUTION'},
    'E': {4:'EAST', 5:'EARTH', 6:'ENERGY', 7:'EVENING', 8:'EVIDENCE', 9:'EQUIPMENT', 10:'EXPERIENCE', 11:'ENVIRONMENT', 12:'EXPECTATIONS'},
    'F': {4:'FIRE', 5:'FIELD', 6:'FUTURE', 7:'FRIENDS', 8:'FACILITY', 9:'FINANCIAL', 10:'FOUNDATION', 11:'FLUCTUATION', 12:'FRAGMENTED'},
    'G': {4:'GOLD', 5:'GHOST', 6:'GROUND', 7:'GENERAL', 8:'GRADUATE', 9:'GUARANTEE', 10:'GENERATION', 11:'GOVERNMENTAL', 12:'GLOBALIZATION'},
    'H': {4:'HIGH', 5:'HEART', 6:'HISTORY', 7:'HOSPITAL', 8:'HEIGHTS', 9:'HAPPINESS', 10:'HISTORICAL', 11:'HIGHLIGHTED', 12:'HOMELESSNESS'},
    'I': {4:'IRON', 5:'IMAGE', 6:'ISLAND', 7:'INSTEAD', 8:'INTERNAL', 9:'IMPORTANT', 10:'INVESTMENT', 11:'INFORMATION', 12:'INTELLIGENCE'},
    'J': {4:'JUST', 5:'JOINT', 6:'JORDAN', 7:'JOURNEY', 8:'JUNCTION', 9:'JUDGEMENT', 10:'JOURNALISM', 11:'JUSTIFIABLE', 12:'JURISDICTION'},
    'K': {4:'KEEP', 5:'KNOWN', 6:'KNIGHT', 7:'KITCHEN', 8:'KEYBOARD', 9:'KNOWLEDGE', 10:'KINDNESSES', 11:'KALEIDOSCOPE', 12:'KINDHEARTED'},
    'L': {4:'LONG', 5:'LIGHT', 6:'LISTEN', 7:'LIBRARY', 8:'LOCATION', 9:'LANDSCAPE', 10:'LEADERSHIP', 11:'LEGISLATION', 12:'LONGSTANDING'},
    'M': {4:'MOON', 5:'MUSIC', 6:'MEMORY', 7:'MESSAGE', 8:'MOUNTAIN', 9:'MARKETING', 10:'MANAGEMENT', 11:'MATHEMATICS', 12:'MANUFACTURING'},
    'N': {4:'NEXT', 5:'NIGHT', 6:'NATURE', 7:'NETWORK', 8:'NEGATIVE', 9:'NEIGHBOR', 10:'NEWSPAPER', 11:'NATIONALITY', 12:'NOTIFICATION'},
    'O': {4:'OPEN', 5:'OCEAN', 6:'OBJECT', 7:'OFFICER', 8:'OPPOSITE', 9:'OPERATION', 10:'OCCASIONAL', 11:'OBSERVATION', 12:'ORGANIZATION'},
    'P': {4:'PAST', 5:'POWER', 6:'PLAYER', 7:'PROJECT', 8:'PHYSICAL', 9:'PRESIDENT', 10:'POPULATION', 11:'PREPARATION', 12:'PARTICIPATION'},
    'Q': {4:'QUIT', 5:'QUITE', 6:'QUARTZ', 7:'QUALITY', 8:'QUESTION', 9:'QUANTITY', 10:'QUOTATIONS', 11:'QUALITATIVE', 12:'QUANTIFIABLE'},
    'R': {4:'ROAD', 5:'RIVER', 6:'REPORT', 7:'RESULTS', 8:'REACTION', 9:'RELIGIOUS', 10:'REFLECTION', 11:'RECOGNITION', 12:'RELATIONSHIP'},
    'S': {4:'STAR', 5:'STONE', 6:'STREET', 7:'STATION', 8:'STANDARD', 9:'SITUATION', 10:'SUCCESSFUL', 11:'SIGNIFICANT', 12:'SATISFACTION'},
    'T': {4:'TIME', 5:'TRAIN', 6:'THINGS', 7:'THROUGH', 8:'TOGETHER', 9:'TRANSPORT', 10:'TECHNOLOGY', 11:'TEMPERATURE', 12:'TRANSLATION'},
    'U': {4:'UPON', 5:'UNDER', 6:'UNIQUE', 7:'UNKNOWN', 8:'UNIVERSE', 9:'UNIVERSAL', 10:'UNIVERSITY', 11:'UTILIZATION', 12:'UNDERSTANDING'},
    'V': {4:'VIEW', 5:'VOICE', 6:'VISUAL', 7:'VILLAGE', 8:'VACATION', 9:'VARIATION', 10:'VOCABULARY', 11:'VEGETARIAN', 12:'VOLUNTARILY'},
    'W': {4:'WEST', 5:'WATER', 6:'WINDOW', 7:'WEATHER', 8:'WILDLIFE', 9:'WONDERFUL', 10:'WELLNESS', 11:'WILLINGNESS', 12:'WITHSTANDING'},
    'X': {4:'XRAY', 5:'XYLYL', 6:'XENONS', 7:'XYLITOL', 8:'XYLOGRAPH', 9:'XENOPHOBE', 10:'XEROXING', 11:'XEROGRAPHIC', 12:'XYLOGRAPHERS'},
    'Y': {4:'YEAR', 5:'YOUTH', 6:'YELLOW', 7:'YARDAGE', 8:'YEARBOOK', 9:'YESTERDAY', 10:'YOUTHFULLY', 11:'YACHTSWOMAN', 12:'YELLOWJACKET'},
    'Z': {4:'ZERO', 5:'ZONES', 6:'ZEBRAS', 7:'ZOOLOGY', 8:'ZEALOUSLY', 9:'ZEALOTRY', 10:'ZOOLOGICAL', 11:'ZEALOUSNESS', 12:'ZIGZAGGING'}
};

// --- CLIPBOARD & SCRAPING ENGINE ---

async function checkClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text.includes("wikipedia.org/wiki/")) {
            const slug = text.split("/wiki/")[1].split(/[#?]/)[0];
            if (slug !== currentArticle) {
                fetchWiki(slug);
            }
        }
    } catch (e) {
        // Silent fail if permission not granted yet
    }
}

// Check every time user taps screen or app is focused
window.addEventListener('focus', checkClipboard);
document.body.addEventListener('click', checkClipboard, { once: false });

async function fetchWiki(slug) {
    const log = document.getElementById('debug-log');
    currentArticle = slug;
    log.innerText = "INDEXING...";

    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${slug}&prop=text&format=json&origin=*`);
        const data = await response.json();
        
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.parse.text["*"];
        tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style').forEach(el => el.remove());

        const words = tempDiv.innerText.toUpperCase().match(/[A-Z]{4,12}/g); 
        dictionary = {};
        
        words.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[len]) dictionary[len] = {};
            if (!dictionary[len][hash]) dictionary[len][hash] = word;
        });

        const cleanTitle = decodeURIComponent(slug).replace(/_/g, ' ');
        log.innerText = cleanTitle;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } catch (e) {
        log.innerText = "ERROR LOADING";
    }
}

// --- BUTTON INTERACTION ---

document.getElementById('btn-straight').addEventListener('click', () => handleInput(0, 'S'));
document.getElementById('btn-curved').addEventListener('click', () => handleInput(1, 'C'));
document.getElementById('btn-mixed').addEventListener('click', () => handleInput(2, 'M'));

document.getElementById('btn-backspace').addEventListener('click', () => {
    inputSequence = inputSequence.slice(0, -1);
    if (navigator.vibrate) navigator.vibrate(10);
    updateHUD();
});

document.getElementById('execute-btn').addEventListener('click', revealResult);

function handleInput(val, label) {
    inputSequence += val;
    if (navigator.vibrate) navigator.vibrate(25);
    updateHUD();
}

function updateHUD() {
    const labels = ['S', 'C', 'M'];
    const visual = inputSequence.split('').map(i => labels[i]).join(' ');
    document.getElementById('debug-log').innerText = (currentArticle + " | " + visual).toUpperCase();
}

// --- REVEAL ENGINE ---

function revealResult() {
    const len = inputSequence.length;
    const wordFound = dictionary[len]?.[inputSequence];
    const body = document.getElementById('note-body');
    const titleField = document.getElementById('title-input');

    if (wordFound) {
        const html = wordFound.split('').map(letter => {
            // Pick word from our expanded list based on length
            const displayWord = fillerWords[letter][len] || (letter + "...");
            return `<div class="reveal-line"><span>${letter}</span>${displayWord.slice(1).toLowerCase()}</div>`;
        }).join('');
        
        body.innerHTML = html;
        titleField.value = "My Guesses";
    } else {
        body.innerText = "The image is blurry. Focus on the letter shapes again...";
    }
    
    // Reset for next round
    inputSequence = "";
}

// Update time display automatically
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) {
        meta.innerHTML = `Today ${time} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
    }
}
updateTime();
