let dictionary = {};
let inputSequence = "";
let currentArticle = "READY";
let possibleWords = [];
let wordOrderMap = [];
let noCount = 0;
let longPressTimer;

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
    'T': {4:['TIME','THIS'], 5:['TRAIN','THESE'], 6:['THROUGH','THOUGHT'], 8:['TOGETHER','THINKING'], 12:['TRANSLATION']},
    'U': {4:['UPON','UNIT'], 5:['UNDER','UNTIL'], 6:['UNIQUE','UNITED'], 7:['UNKNOWN','USUALLY'], 12:['UNDERSTANDING']},
    'V': {4:['VIEW','VERY'], 5:['VOICE','VALUE'], 6:['VISUAL','VOLUME'], 7:['VILLAGE','VARIOUS'], 12:['VOLUNTARILY']},
    'W': {4:['WEST','WITH'], 5:['WATER','WORLD'], 6:['WINDOW','WITHIN'], 7:['WEATHER','WITHOUT'], 12:['WITHSTANDING']},
    'X': {4:['XRAY'], 5:['XYLYL'], 7:['XYLITOL'], 12:['XYLOGRAPHERS']},
    'Y': {4:['YEAR','YOUR'], 5:['YOUTH','YOUNG'], 7:['YARDAGE','YANKEE'], 12:['YELLOWJACKET']},
    'Z': {4:['ZERO'], 5:['ZONES'], 7:['ZOOLOGY'], 12:['ZIGZAGGING']}
};

const debugLog = document.getElementById('debug-log');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnSearch = document.getElementById('btn-search');
const btnExecute = document.getElementById('execute-btn');

// --- PEAK HIGHLIGHT ---
document.body.addEventListener('touchstart', (e) => {
    if (e.target.closest('.nav-icon') || e.target.closest('.tool-svg')) return;
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.id === 'note-body') return;
    debugLog.classList.add('highlight');
});
document.body.addEventListener('touchend', () => debugLog.classList.remove('highlight'));
debugLog.addEventListener('touchstart', (e) => { e.stopPropagation(); debugLog.classList.add('highlight'); });

// --- SCRAPER ---
async function fetchWiki(slug) {
    debugLog.innerText = "SYNCING...";
    try {
        const api = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${slug}&explaintext=1&format=json&origin=*`;
        const response = await fetch(api);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const fullText = pages[pageId].extract.toUpperCase();
        
        const allWords = fullText.match(/[A-Z]{4,15}/g) || [];
        wordOrderMap = [...new Set(allWords)];

        dictionary = {}; 
        allWords.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[len]) dictionary[len] = {};
            if (!dictionary[len][hash]) dictionary[len][hash] = [];
            if (!dictionary[len][hash].includes(word)) dictionary[len][hash].push(word);
        });

        for (let l in dictionary) {
            for (let h in dictionary[l]) {
                dictionary[l][h].sort((a,b) => wordOrderMap.indexOf(a) - wordOrderMap.indexOf(b));
            }
        }
        currentArticle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        debugLog.innerText = currentArticle;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } catch (e) { debugLog.innerText = "OFFLINE"; }
}

// --- LONG PRESS FORCES ---
const setupLongPress = (el, index) => {
    el.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
            if (possibleWords.length >= index + 1) {
                if (navigator.vibrate) navigator.vibrate(100);
                generateAcrostic(possibleWords[index]);
            }
        }, 700);
    });
    el.addEventListener('touchend', () => clearTimeout(longPressTimer));
};

setupLongPress(btnYes, 0); 
setupLongPress(btnNo, 1); 
setupLongPress(btnSearch, 2); 
setupLongPress(btnExecute, 3);

// --- FISHING ---
btnYes.addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') possibleWords = possibleWords.filter(w => w[action.pos] === action.letter);
        else possibleWords = possibleWords.filter(w => w.includes(action.letter));
        noCount = 0;
        handleAnagramStep();
    }
});

btnNo.addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') possibleWords = possibleWords.filter(w => w[action.pos] !== action.letter);
        else possibleWords = possibleWords.filter(w => !w.includes(action.letter));
        noCount++;
        handleAnagramStep();
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

// --- CORE UI ---
document.querySelector('.ai-magic').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text.includes("wikipedia.org/wiki/")) {
            const slug = text.split("/wiki/")[1].split(/[#?]/)[0];
            fetchWiki(slug);
        }
    } catch (e) { debugLog.innerText = "CLIPBOARD ERROR"; }
});

document.getElementById('btn-straight').addEventListener('click', () => handleInput(0));
document.getElementById('btn-curved').addEventListener('click', () => handleInput(1));
document.getElementById('btn-mixed').addEventListener('click', () => handleInput(2));
document.getElementById('btn-backspace').addEventListener('click', () => { inputSequence = inputSequence.slice(0, -1); updateHUD(); });
document.getElementById('back-icon').addEventListener('click', () => {
    inputSequence = "";
    document.getElementById('note-body').innerHTML = "";
    document.getElementById('title-input').value = "";
    debugLog.innerText = currentArticle;
    possibleWords = [];
});
btnExecute.addEventListener('click', revealResult);

function handleInput(val) { inputSequence += val; if (navigator.vibrate) navigator.vibrate(25); updateHUD(); }
function updateHUD() { debugLog.innerText = currentArticle + " | " + inputSequence.split('').map(i => ['S','C','M'][i]).join(' '); }

function revealResult() {
    const len = inputSequence.length;
    noCount = 0;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else if (possibleWords.length > 1) startProgressiveAnagram();
    else document.getElementById('note-body').innerHTML = "Weak connection...";
}

function startProgressiveAnagram() {
    const listStr = possibleWords.join(' | ');
    if (possibleWords.length <= 3 || (noCount >= 2 && possibleWords.length === 4)) {
        debugLog.innerText = `CHOICE: ${listStr}`;
        return;
    }
    if (noCount >= 2) {
        let bestPos = -1, bestChar = "", maxOverlap = 0;
        for (let i = 0; i < possibleWords[0].length; i++) {
            let counts = {};
            possibleWords.forEach(w => counts[w[i]] = (counts[w[i]] || 0) + 1);
            for (let char in counts) {
                if (counts[char] >= 2 && counts[char] < possibleWords.length && counts[char] > maxOverlap) {
                    maxOverlap = counts[char]; bestChar = char; bestPos = i + 1;
                }
            }
        }
        if (bestChar) { debugLog.innerText = `POSITION ${bestPos}: ${bestChar} | [${listStr}]`; return; }
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

function generateAcrostic(wordFound) {
    const body = document.getElementById('note-body');
    let usedWords = new Set();
    const html = wordFound.split('').map(letter => {
        const list = fillerPool[letter]?.[wordFound.length] || [letter + ".".repeat(wordFound.length - 1)];
        let chosen = list.find(w => !usedWords.has(w) && w !== wordFound) || list[0];
        usedWords.add(chosen);
        return `<div class="reveal-line"><span>${letter}</span>${chosen.slice(1).toLowerCase()}</div>`;
    }).join('');
    body.innerHTML = html + '<span class="caret"></span>';
    document.getElementById('title-input').value = "My Guesses";
    debugLog.innerText = ""; inputSequence = "";
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) meta.innerHTML = `Today ${time} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
}
updateTime();
