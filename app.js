/**
 * WORDSMITH ULTIMATE PERFORMANCE ENGINE v8.0
 * Features: Dual-Action Execute (Tap/Hold), Positional Pivot, 
 * Appearance Sorting, Voice-Icon Peak, and Full Page Scrape.
 */

// --- 1. CLOCK LOGIC ---
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) {
        meta.innerHTML = `Today ${time} &nbsp;No category <svg style="width:12px;fill:#8d8d8d" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
    }
}
setInterval(updateTime, 10000);
updateTime();

// --- 2. STATE & DATA ---
let dictionary = {};
let inputSequence = "";
let currentArticle = "READY";
let possibleWords = [];
let wordOrderMap = [];
let noCount = 0;
let longPressTimer;
let isLongPressAction = false;

const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

const fillerPool = {
    'A': {4:['AREA','ALSO'], 5:['APPLE','ALIVE'], 7:['AGAINST','AIRPORT'], 12:['ARCHITECTURE']},
    'B': {4:['BLUE','BACK'], 5:['BOARD','BASIC'], 7:['BETWEEN','BELIEVE'], 12:['BREAKTHROUGH']},
    'C': {4:['CASE','CITY'], 5:['CLOUD','CLEAR'], 7:['CONTROL','COUNTRY'], 12:['CONSTRUCTION']},
    'D': {4:['DARK','DATA'], 5:['DREAM','DRIVE'], 7:['DISPLAY','DRIVING'], 12:['DISTRIBUTION']},
    'E': {4:['EAST','ELSE'], 5:['EARTH','EVERY'], 7:['EVENING','EXAMPLE'], 12:['EXPECTATIONS']},
    'F': {4:['FIRE','FACT'], 5:['FIELD','FORCE'], 7:['FRIENDS','FINALLY'], 12:['FRAGMENTEDLY']},
    'G': {4:['GOLD','GIVE'], 5:['GHOST','GREAT'], 7:['GENERAL','GARDEN'], 12:['GLOBALIZATION']},
    'H': {4:['HIGH','HERE'], 5:['HEART','HOUSE'], 7:['HOSPITAL','HAPPEN'], 12:['HOMELESSNESS']},
    'I': {4:['IRON','INTO'], 5:['IMAGE','INDEX'], 7:['INSTEAD','IMPROVE'], 12:['INTELLIGENCE']},
    'J': {4:['JUST','JOIN'], 5:['JOINT','JUDGE'], 6:['JORDAN','JUNGLE'], 7:['JOURNEY','JACKETS'], 12:['JUDICIOUSNESS']},
    'K': {4:['KEEP','KNEW'], 5:['KNOWN','KNOCK'], 6:['KNIGHT','KANSAS'], 7:['KITCHEN','KINGDOM'], 12:['KINDHEARTEDLY']},
    'L': {4:['LONG','LAST'], 5:['LIGHT','LARGE'], 6:['LISTEN','LITTLE'], 7:['LIBRARY','LOOKING'], 12:['LONGSTANDING']},
    'M': {4:['MOON','MAIN'], 5:['MUSIC','MODEL'], 6:['MEMORY','MOTHER'], 7:['MESSAGE','MORNING'], 12:['MANUFACTURING']},
    'N': {4:['NEXT','NEAR'], 5:['NIGHT','NEVER'], 6:['NATURE','NUMBER'], 7:['NETWORK','NOTHING'], 12:['NOTIFICATION']},
    'O': {4:['OPEN','ONLY'], 5:['OCEAN','ORDER'], 6:['OBJECT','OFFICE'], 7:['OFFICER','OUTSIDE'], 12:['ORGANIZATION']},
    'P': {4:['PAST','PART'], 5:['POWER','PAPER'], 6:['PLAYER','PUBLIC'], 7:['PROJECT','PERHAPS'], 12:['PARTICIPATION']},
    'Q': {4:['QUIT','QUIZ'], 5:['QUITE','QUERY'], 6:['QUARTZ','QUOTAS'], 7:['QUALITY','QUARTER'], 12:['QUANTIFIABLE']},
    'R': {4:['ROAD','REAL'], 5:['RIVER','ROUND'], 6:['REPORT','REASON'], 7:['RESULTS','RUNNING'], 12:['RELATIONSHIP']},
    'S': {4:['STAR','SIDE'], 5:['STONE','SMALL'], 6:['STREET','SECOND'], 7:['STATION','SERVICE'], 12:['SATISFACTION']},
    'T': {4:['TIME','THIS'], 5:['TRAIN','THESE'], 6:['THINGS','THOUGH'], 8:['TOGETHER','THINKING'], 12:['TRANSLATION']},
    'U': {4:['UPON','UNIT'], 5:['UNDER','UNTIL'], 6:['UNIQUE','UNITED'], 7:['UNKNOWN','USUALLY'], 12:['UNDERSTANDING']},
    'V': {4:['VIEW','VERY'], 5:['VOICE','VALUE'], 6:['VISUAL','VOLUME'], 7:['VILLAGE','VARIOUS'], 12:['VOLUNTARILY']},
    'W': {4:['WEST','WITH'], 5:['WATER','WORLD'], 6:['WINDOW','WITHIN'], 7:['WEATHER','WITHOUT'], 12:['WITHSTANDING']},
    'X': {4:['XRAY'], 5:['XYLYL'], 7:['XYLITOL'], 8:['XYLOGRAPH'], 12:['XYLOGRAPHERS']},
    'Y': {4:['YEAR','YOUR'], 5:['YOUTH','YOUNG'], 6:['YELLOW','YESTER'], 7:['YARDAGE','YANKEE'], 12:['YELLOWJACKET']},
    'Z': {4:['ZERO'], 5:['ZONES'], 6:['ZEBRAS'], 7:['ZOOLOGY'], 8:['ZEALOUSLY'], 12:['ZIGZAGGING']}
};

// --- 3. DOM ELEMENTS ---
const debugLog = document.getElementById('debug-log');
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const btnSearch = document.getElementById('btn-search');
const btnExecute = document.getElementById('execute-btn');
const btnVoice = document.getElementById('btn-voice');

// --- 4. PEAK HIGHLIGHT (Voice Icon) ---
btnVoice.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    debugLog.classList.add('highlight'); 
});
btnVoice.addEventListener('touchend', () => { 
    debugLog.classList.remove('highlight'); 
});
debugLog.addEventListener('touchstart', (e) => { 
    e.stopPropagation(); 
    debugLog.classList.add('highlight'); 
});

// --- 5. LONG PRESS SELECTORS (No=1, Yes=2, Search=3, Execute=4) ---
const setupLongPress = (el, index) => {
    el.addEventListener('touchstart', (e) => {
        isLongPressAction = false;
        longPressTimer = setTimeout(() => {
            if (possibleWords.length >= index + 1) {
                isLongPressAction = true;
                if (navigator.vibrate) navigator.vibrate(100);
                generateAcrostic(possibleWords[index]);
            }
        }, 700);
    });
    el.addEventListener('touchend', () => clearTimeout(longPressTimer));
};

setupLongPress(btnNo, 0); 
setupLongPress(btnYes, 1); 
setupLongPress(btnSearch, 2); 
setupLongPress(btnExecute, 3);

// --- 6. SCRAPER ---
document.querySelector('.ai-magic').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text.includes("/wiki/")) fetchWiki(text.split("/wiki/")[1].split(/[#?]/)[0]);
    } catch (e) { 
        const link = prompt("Paste wiki link:"); 
        if (link && link.includes("/wiki/")) fetchWiki(link.split("/wiki/")[1].split(/[#?]/)[0]); 
    }
});

async function fetchWiki(slug) {
    debugLog.innerText = "SYNCING...";
    try {
        const api = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${slug}&explaintext=1&format=json&origin=*`;
        const response = await fetch(api);
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];
        const fullText = page.extract.toUpperCase();
        const allWords = fullText.match(/[A-Z]{4,15}/g) || [];
        wordOrderMap = [...new Set(allWords)];
        dictionary = {};
        allWords.forEach(word => {
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[word.length]) dictionary[word.length] = {};
            if (!dictionary[word.length][hash]) dictionary[word.length][hash] = [];
            if (!dictionary[word.length][hash].includes(word)) dictionary[word.length][hash].push(word);
        });
        for (let l in dictionary) {
            for (let h in dictionary[l]) dictionary[l][h].sort((a,b) => wordOrderMap.indexOf(a) - wordOrderMap.indexOf(b));
        }
        currentArticle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        debugLog.innerText = currentArticle;
    } catch (e) { debugLog.innerText = "OFFLINE"; }
}

// --- 7. FISHING ACTIONS ---
btnYes.addEventListener('click', () => {
    if (isLongPressAction) return; 
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') possibleWords = possibleWords.filter(w => w[action.pos] === action.letter);
        else possibleWords = possibleWords.filter(w => w.includes(action.letter));
        noCount = 0; handleAnagramStep();
    }
});

btnNo.addEventListener('click', () => {
    if (isLongPressAction) return;
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') possibleWords = possibleWords.filter(w => w[action.pos] !== action.letter);
        else possibleWords = possibleWords.filter(w => !w.includes(action.letter));
        noCount++; handleAnagramStep();
    }
});

function getActiveAction() {
    const raw = debugLog.innerText;
    if (raw.includes("POSITION")) {
        const letter = raw.split(': ')[1].split(' |')[0];
        const pos = parseInt(raw.split('POSITION ')[1].split(':')[0]) - 1;
        return { letter, pos, type: 'positional' };
    }
    return { letter: raw.split(': ')[1].split(' |')[0], type: 'standard' };
}

// --- 8. UI HANDLERS ---
document.getElementById('btn-straight').addEventListener('click', () => handleInput(0));
document.getElementById('btn-curved').addEventListener('click', () => handleInput(1));
document.getElementById('btn-mixed').addEventListener('click', () => handleInput(2));
document.getElementById('btn-backspace').addEventListener('click', () => { inputSequence = inputSequence.slice(0, -1); updateHUD(); });
document.getElementById('back-icon').addEventListener('click', () => {
    inputSequence = ""; document.getElementById('note-body').innerHTML = ""; 
    document.getElementById('title-input').value = ""; debugLog.innerText = currentArticle; possibleWords = [];
});

// Dual Action Execute
btnExecute.addEventListener('click', () => {
    if (!isLongPressAction) {
        revealResult();
    }
    isLongPressAction = false; 
});

function handleInput(val) { inputSequence += val; if (navigator.vibrate) navigator.vibrate(25); updateHUD(); }
function updateHUD() { debugLog.innerText = currentArticle + " | " + inputSequence.split('').map(i => ['S','C','M'][i]).join(' '); }

// --- 9. FISHING ENGINE ---
function revealResult() {
    const len = inputSequence.length; noCount = 0;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else if (possibleWords.length > 1) startProgressiveAnagram();
}

function startProgressiveAnagram() {
    const listStr = possibleWords.join(' | ');

    if (noCount >= 3) {
        debugLog.innerText = `CHOICE: ${listStr}`; return;
    }

    if (noCount >= 2) {
        let bestPos = -1, bestChar = "", maxOverlap = 0;
        for (let i = 0; i < possibleWords[0].length; i++) {
            let counts = {}; possibleWords.forEach(w => counts[w[i]] = (counts[w[i]] || 0) + 1);
            for (let char in counts) {
                if (counts[char] >= 2 && counts[char] < possibleWords.length && counts[char] > maxOverlap) {
                    maxOverlap = counts[char]; bestChar = char; bestPos = i + 1;
                }
            }
        }
        if (bestChar) { debugLog.innerText = `POSITION ${bestPos}: ${bestChar} | [${listStr}]`; return; }
        else { debugLog.innerText = `CHOICE: ${listStr}`; return; }
    }

    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", testLetter = "";
    for (let char of alphabet) {
        let count = possibleWords.filter(w => w.includes(char)).length;
        if (count > 0 && count < possibleWords.length) { testLetter = char; break; }
    }
    if (testLetter) debugLog.innerText = `FISHING: ${testLetter} | [${listStr}]`;
    else generateAcrostic(possibleWords[0]);
}

function handleAnagramStep() { if (possibleWords.length === 1) generateAcrostic(possibleWords[0]); else startProgressiveAnagram(); }

// --- 10. ACROSTIC GENERATION ---
function generateAcrostic(wordFound) {
    const body = document.getElementById('note-body');
    const len = wordFound.length; let usedWords = new Set();
    const html = wordFound.split('').map(letter => {
        const list = fillerPool[letter]?.[len] || [letter + ".".repeat(len - 1)];
        let chosen = list.find(w => !usedWords.has(w) && w !== wordFound) || list[0];
        usedWords.add(chosen);
        return `<div class="reveal-line"><span>${letter}</span>${chosen.slice(1).toLowerCase()}</div>`;
    }).join('');
    body.innerHTML = html + '<span class="caret"></span>';
    document.getElementById('title-input').value = "My Guesses";
    debugLog.innerText = ""; inputSequence = "";
}
