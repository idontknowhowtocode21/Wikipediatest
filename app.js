/**
 * WORDSMITH ULTIMATE PERFORMANCE ENGINE v8.1
 */

// --- 1. STATE ---
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

// --- 2. HELPERS ---
const updateTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) meta.innerHTML = `Today ${time} &nbsp;No category <svg style="width:12px;fill:#8d8d8d" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
};
setInterval(updateTime, 10000); updateTime();

const vibrate = (ms = 25) => { if (navigator.vibrate) navigator.vibrate(ms); };

// --- 3. DOM & UI ---
const debugLog = document.getElementById('debug-log');
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const btnVoice = document.getElementById('btn-voice');
const btnBack = document.getElementById('back-icon');

// Peak Reveal
btnVoice.addEventListener('touchstart', (e) => { e.preventDefault(); debugLog.classList.add('highlight'); });
btnVoice.addEventListener('touchend', () => { debugLog.classList.remove('highlight'); });

// --- 4. INPUT LOGIC ---
const handleInput = (val) => {
    vibrate();
    inputSequence += val;
    debugLog.innerText = `${currentArticle} | ${inputSequence.replace(/0/g,'S').replace(/1/g,'C').replace(/2/g,'M')}`;
};

// Use touchstart to prevent double-firing and lag
document.getElementById('btn-straight').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('0'); });
document.getElementById('btn-curved').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('1'); });
document.getElementById('btn-mixed').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('2'); });

// Dual Action Back Button (Tap = Backspace, Hold = Reset)
btnBack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isLongPressAction = false;
    longPressTimer = setTimeout(() => {
        isLongPressAction = true;
        inputSequence = ""; possibleWords = []; noCount = 0;
        document.getElementById('note-body').innerHTML = "";
        document.getElementById('title-input').value = "";
        debugLog.innerText = currentArticle;
        vibrate(100);
    }, 800);
});

btnBack.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    if (!isLongPressAction && inputSequence.length > 0) {
        inputSequence = inputSequence.slice(0, -1);
        debugLog.innerText = `${currentArticle} | ${inputSequence}`;
        vibrate(40);
    }
});

// --- 5. SCRAPER ---
document.querySelector('.ai-magic').addEventListener('click', async () => {
    let link = "";
    try { link = await navigator.clipboard.readText(); } catch(e) {}
    if (!link.includes("/wiki/")) link = prompt("Paste Wiki Link:");
    if (link && link.includes("/wiki/")) {
        const slug = link.split("/wiki/")[1].split(/[#?]/)[0];
        fetchWiki(slug);
    }
});

async function fetchWiki(slug) {
    debugLog.innerText = "SYNCING...";
    try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${slug}&explaintext=1&format=json&origin=*`);
        const data = await res.json();
        const page = Object.values(data.query.pages)[0];
        if (!page.extract) throw new Error();
        
        const cleanText = page.extract.toUpperCase().replace(/[^A-Z\s]/g, ' ');
        const allWords = cleanText.match(/[A-Z]{4,15}/g) || [];
        
        wordOrderMap = [...new Set(allWords)];
        dictionary = {};
        
        allWords.forEach(word => {
            const hash = word.split('').map(c => shapeMap[c] ?? '').join('');
            if (!dictionary[word.length]) dictionary[word.length] = {};
            if (!dictionary[word.length][hash]) dictionary[word.length][hash] = [];
            if (!dictionary[word.length][hash].includes(word)) dictionary[word.length][hash].push(word);
        });

        currentArticle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        debugLog.innerText = currentArticle;
        vibrate([50, 30, 50]);
    } catch (e) { debugLog.innerText = "ERROR SYNCING"; }
}

// --- 6. FISHING ENGINE ---
const getBestDiscriminator = (words) => {
    const alpha = "ETAOINSRHDLUCMFYWGPBVKXQJZ"; // Commonality order
    let bestChar = "";
    let closestToHalf = words.length;

    for (let char of alpha) {
        const count = words.filter(w => w.includes(char)).length;
        if (count > 0 && count < words.length) {
            const dist = Math.abs((words.length / 2) - count);
            if (dist < closestToHalf) {
                closestToHalf = dist;
                bestChar = char;
            }
        }
    }
    return bestChar;
};

const updateFishingUI = () => {
    if (possibleWords.length === 1) return generateAcrostic(possibleWords[0]);
    if (possibleWords.length === 0) return debugLog.innerText = "NO MATCHES";

    const list = possibleWords.slice(0, 4).join(' | ');
    
    if (noCount >= 2) {
        debugLog.innerText = `LIST: ${list}`;
    } else {
        const char = getBestDiscriminator(possibleWords);
        debugLog.innerText = char ? `FISH: ${char} | [${list}]` : `LIST: ${list}`;
    }
};

btnYes.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (possibleWords.length <= 1) return;
    const char = debugLog.innerText.split('FISH: ')[1]?.split(' |')[0];
    if (char) possibleWords = possibleWords.filter(w => w.includes(char));
    noCount = 0;
    updateFishingUI();
});

btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (possibleWords.length <= 1) return;
    const char = debugLog.innerText.split('FISH: ')[1]?.split(' |')[0];
    if (char) possibleWords = possibleWords.filter(w => !w.includes(char));
    noCount++;
    updateFishingUI();
});

document.getElementById('execute-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    const len = inputSequence.length;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    noCount = 0;
    updateFishingUI();
});

// --- 7. REVEAL ---
function generateAcrostic(word) {
    const body = document.getElementById('note-body');
    const fillerPool = {
        'A':['AREA','ALSO','ABLE'], 'B':['BACK','BLUE','BEST'], 'C':['CASE','CITY','COME'],
        'D':['DATA','DARK','DONE'], 'E':['EAST','ELSE','EVEN'], 'F':['FACT','FIRE','FROM'],
        'G':['GOLD','GIVE','GOOD'], 'H':['HIGH','HERE','HAVE'], 'I':['IRON','INTO','ITEM'],
        'J':['JUST','JOIN','JUNE'], 'K':['KEEP','KIND','KNOW'], 'L':['LONG','LAST','LIKE'],
        'M':['MAIN','MOON','MAKE'], 'N':['NEXT','NEAR','NAME'], 'O':['ONLY','OPEN','OVER'],
        'P':['PART','PAST','PLAN'], 'Q':['QUIT','QUIZ','QUITE'], 'R':['REAL','ROAD','REST'],
        'S':['SIDE','STAR','SOME'], 'T':['TIME','THIS','TAKE'], 'U':['UPON','UNIT','USER'],
        'V':['VERY','VIEW','VOTE'], 'W':['WITH','WEST','WORK'], 'X':['XRAY','XBOX'],
        'Y':['YOUR','YEAR','YET'], 'Z':['ZERO','ZONE','ZOO']
    };

    const html = word.split('').map(letter => {
        const choices = fillerPool[letter] || [letter + "..."];
        const chosen = choices[Math.floor(Math.random() * choices.length)];
        return `<div class="reveal-line"><span>${letter}</span>${chosen.slice(1).toLowerCase()}</div>`;
    }).join('');
    
    body.innerHTML = html;
    document.getElementById('title-input').value = "My Thoughts";
    debugLog.innerText = "";
    inputSequence = "";
    vibrate([100, 50, 100]);
}
