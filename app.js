/** * WORDSMITH ENGINE v8.2 
 * Tiered Fishing (Standard -> Positional -> Array List)
 */

let dictionary = {};
let inputSequence = "";
let currentArticle = "READY";
let possibleWords = [];
let noCount = 0;
let longPressTimer;
let isLongPressAction = false;

const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

const debugLog = document.getElementById('debug-log');
const btnBackExec = document.getElementById('btn-backspace-exec');

const vibrate = (ms = 30) => { if (navigator.vibrate) navigator.vibrate(ms); };

// --- UI RESET & TIME ---
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    document.getElementById('meta-row').innerHTML = `Today ${time} &nbsp;No category`;
}
updateTime();

// Back Arrow Reset (Retains Wiki)
document.getElementById('btn-reset').addEventListener('touchstart', (e) => {
    e.preventDefault();
    inputSequence = ""; possibleWords = []; noCount = 0;
    document.getElementById('note-body').innerHTML = "";
    document.getElementById('title-input').value = "";
    debugLog.innerText = currentArticle;
    vibrate(60);
});

// --- INPUT LOGIC ---
const handleIn = (v) => { vibrate(); inputSequence += v; updateHUD(); };
document.getElementById('btn-straight').addEventListener('touchstart', (e) => { e.preventDefault(); handleIn('0'); });
document.getElementById('btn-curved').addEventListener('touchstart', (e) => { e.preventDefault(); handleIn('1'); });
document.getElementById('btn-mixed').addEventListener('touchstart', (e) => { e.preventDefault(); handleIn('2'); });

function updateHUD() {
    const display = inputSequence.replace(/0/g,'S').replace(/1/g,'C').replace(/2/g,'M');
    debugLog.innerText = `${currentArticle} | ${display}`;
}

// Checkmark: Tap=Backspace, Hold=Execute
btnBackExec.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isLongPressAction = false;
    longPressTimer = setTimeout(() => {
        isLongPressAction = true;
        vibrate(80);
        executeSearch();
    }, 700);
});

btnBackExec.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    if (!isLongPressAction && inputSequence.length > 0) {
        inputSequence = inputSequence.slice(0, -1);
        updateHUD();
        vibrate(20);
    }
});

// --- SCRAPER ---
document.querySelector('.ai-magic').addEventListener('click', async () => {
    let link = ""; try { link = await navigator.clipboard.readText(); } catch(e){}
    if (!link.includes("/wiki/")) link = prompt("Wiki Link:");
    if (link && link.includes("/wiki/")) fetchWiki(link.split("/wiki/")[1].split(/[#?]/)[0]);
});

async function fetchWiki(slug) {
    debugLog.innerText = "SYNCING...";
    try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${slug}&explaintext=1&format=json&origin=*`);
        const data = await res.json();
        const text = Object.values(data.query.pages)[0].extract.toUpperCase();
        const words = text.match(/[A-Z]{4,15}/g) || [];
        dictionary = {};
        words.forEach(w => {
            const h = w.split('').map(c => shapeMap[c] ?? '').join('');
            if (!dictionary[w.length]) dictionary[w.length] = {};
            if (!dictionary[w.length][h]) dictionary[w.length][h] = [];
            if (!dictionary[w.length][h].includes(w)) dictionary[w.length][h].push(w);
        });
        currentArticle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        debugLog.innerText = currentArticle;
        vibrate([50, 50]);
    } catch(e) { debugLog.innerText = "SYNC ERROR"; }
}

// --- TIERED FISHING ENGINE ---
function executeSearch() {
    const len = inputSequence.length;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    noCount = 0;
    processFishing();
}

function processFishing() {
    if (possibleWords.length === 1) return generateAcrostic(possibleWords[0]);
    if (possibleWords.length === 0) return debugLog.innerText = "NONE";

    const wordList = `[${possibleWords.join(', ')}]`;

    // TIER 3: Array List (If noCount >= 3 or few words left)
    if (noCount >= 3 || possibleWords.length <= 4) {
        debugLog.innerText = `LIST: ${wordList}`;
        return;
    }

    // TIER 2: Positional Pivot (After 2 No's)
    if (noCount === 2) {
        let bestPos = -1, bestChar = "", maxDiff = 0;
        for (let i = 0; i < possibleWords[0].length; i++) {
            let counts = {};
            possibleWords.forEach(w => counts[w[i]] = (counts[w[i]] || 0) + 1);
            for (let char in counts) {
                if (counts[char] > 0 && counts[char] < possibleWords.length) {
                    bestChar = char; bestPos = i + 1; break;
                }
            }
            if (bestChar) break;
        }
        debugLog.innerText = `POS ${bestPos}: ${bestChar} | ${wordList}`;
        return;
    }

    // TIER 1: Standard Split-Half
    const alpha = "ETAOINSRHDLUCMFYWGPBVKXQJZ";
    let bestLetter = "";
    for (let char of alpha) {
        const c = possibleWords.filter(w => w.includes(char)).length;
        if (c > 0 && c < possibleWords.length) { bestLetter = char; break; }
    }
    debugLog.innerText = `FISH: ${bestLetter} | ${wordList}`;
}

// YES/NO Logic
document.getElementById('btn-yes').addEventListener('touchstart', (e) => {
    e.preventDefault(); if (possibleWords.length <= 1) return;
    const raw = debugLog.innerText;
    if (raw.includes("POS")) {
        const pos = parseInt(raw.split("POS ")[1]) - 1;
        const char = raw.split(": ")[1].split(" |")[0];
        possibleWords = possibleWords.filter(w => w[pos] === char);
    } else {
        const char = raw.split("FISH: ")[1]?.split(" |")[0];
        if (char) possibleWords = possibleWords.filter(w => w.includes(char));
    }
    noCount = 0; processFishing();
});

document.getElementById('btn-no').addEventListener('touchstart', (e) => {
    e.preventDefault(); if (possibleWords.length <= 1) return;
    const raw = debugLog.innerText;
    if (raw.includes("POS")) {
        const pos = parseInt(raw.split("POS ")[1]) - 1;
        const char = raw.split(": ")[1].split(" |")[0];
        possibleWords = possibleWords.filter(w => w[pos] !== char);
    } else {
        const char = raw.split("FISH: ")[1]?.split(" |")[0];
        if (char) possibleWords = possibleWords.filter(w => !w.includes(char));
    }
    noCount++; processFishing();
});

// --- REVEAL ---
function generateAcrostic(word) {
    const filler = {
        'A':['AREA','ALSO'], 'B':['BACK','BEST'], 'C':['CITY','CASE'], 'D':['DATA','DARK'],
        'E':['EVEN','ELSE'], 'F':['FACT','FROM'], 'G':['GIVE','GOOD'], 'H':['HERE','HAVE'],
        'I':['INTO','ITEM'], 'J':['JUST','JOIN'], 'K':['KIND','KNOW'], 'L':['LAST','LIKE'],
        'M':['MAIN','MAKE'], 'N':['NEAR','NAME'], 'O':['ONLY','OVER'], 'P':['PART','PLAN'],
        'Q':['QUIT','QUIZ'], 'R':['REAL','REST'], 'S':['SIDE','SOME'], 'T':['TIME','TAKE'],
        'U':['UPON','UNIT'], 'V':['VERY','VIEW'], 'W':['WITH','WORK'], 'X':['XRAY','XBOX'],
        'Y':['YOUR','YEAR'], 'Z':['ZERO','ZONE']
    };
    const html = word.split('').map(L => {
        const pool = filler[L] || [L + "..."];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        return `<div class="reveal-line"><span>${L}</span>${chosen.slice(1).toLowerCase()}</div>`;
    }).join('');
    document.getElementById('note-body').innerHTML = html;
    document.getElementById('title-input').value = "My Thoughts";
    debugLog.innerText = ""; inputSequence = "";
    vibrate([100, 50, 100]);
}

// Peak Trigger (Voice)
document.getElementById('btn-voice').addEventListener('touchstart', (e) => { e.preventDefault(); debugLog.classList.add('highlight'); });
document.getElementById('btn-voice').addEventListener('touchend', () => { debugLog.classList.remove('highlight'); });
