let dictionary = {};
let inputSequence = "";
let currentArticle = "READY";
let possibleWords = [];

const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

// Add words for lengths 4-15 here. 
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
    'J': {4:['JUST','JOIN'], 5:['JOINT','JUDGE'], 7:['JOURNEY','JACKETS'], 12:['JUDICIOUSNESS']},
    'K': {4:['KEEP','KNEW'], 5:['KNOWN','KNOCK'], 7:['KITCHEN','KINGDOM'], 12:['KINDHEARTEDLY']},
    'L': {4:['LONG','LAST'], 5:['LIGHT','LARGE'], 7:['LIBRARY','LOOKING'], 12:['LONGSTANDING']},
    'M': {4:['MOON','MAIN'], 5:['MUSIC','MODEL'], 7:['MESSAGE','MORNING'], 12:['MANUFACTURING']},
    'N': {4:['NEXT','NEAR'], 5:['NIGHT','NEVER'], 7:['NATURE','NUMBER'], 12:['NOTIFICATION']},
    'O': {4:['OPEN','ONLY'], 5:['OCEAN','ORDER'], 7:['OFFICER','OUTSIDE'], 12:['ORGANIZATION']},
    'P': {4:['PAST','PART'], 5:['POWER','PAPER'], 7:['PROJECT','PERHAPS'], 12:['PARTICIPATION']},
    'Q': {4:['QUIT','QUIZ'], 5:['QUITE','QUERY'], 7:['QUALITY','QUARTER'], 12:['QUANTIFIABLE']},
    'R': {4:['ROAD','REAL'], 5:['RIVER','ROUND'], 7:['RESULTS','RUNNING'], 12:['RELATIONSHIP']},
    'S': {4:['STAR','SIDE'], 5:['STONE','SMALL'], 7:['STATION','SERVICE'], 12:['SATISFACTION']},
    'T': {4:['TIME','THIS'], 5:['TRAIN','THESE'], 7:['THROUGH','THOUGHT'], 12:['TRANSLATION']},
    'U': {4:['UPON','UNIT'], 5:['UNDER','UNTIL'], 7:['UNKNOWN','USUALLY'], 12:['UNDERSTANDING']},
    'V': {4:['VIEW','VERY'], 5:['VOICE','VALUE'], 7:['VILLAGE','VARIOUS'], 12:['VOLUNTARILY']},
    'W': {4:['WEST','WITH'], 5:['WATER','WORLD'], 7:['WINDOW','WITHIN'], 12:['WITHSTANDING']},
    'X': {4:['XRAY'], 5:['XYLYL'], 7:['XYLITOL'], 12:['XYLOGRAPHERS']},
    'Y': {4:['YEAR','YOUR'], 5:['YOUTH','YOUNG'], 7:['YARDAGE','YANKEE'], 12:['YELLOWJACKET']},
    'Z': {4:['ZERO'], 5:['ZONES'], 7:['ZOOLOGY'], 12:['ZIGZAGGING']}
};

// Clipboard Snatch (🪄 Magic Wand)
document.querySelector('.ai-magic').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text.includes("wikipedia.org/wiki/")) {
            const slug = text.split("/wiki/")[1].split(/[#?]/)[0];
            fetchWiki(slug);
        }
    } catch (e) { console.log("Clipboard Error"); }
});

async function fetchWiki(slug) {
    const log = document.getElementById('debug-log');
    currentArticle = slug;
    log.innerText = "SYNCING...";
    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${slug}&prop=text&format=json&origin=*`);
        const data = await response.json();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.parse.text["*"];
        tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style').forEach(el => el.remove());
        const words = tempDiv.innerText.toUpperCase().match(/[A-Z]{4,15}/g); 
        dictionary = {};
        words.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[len]) dictionary[len] = {};
            if (!dictionary[len][hash]) dictionary[len][hash] = [];
            if (!dictionary[len][hash].includes(word)) dictionary[len][hash].push(word);
        });
        currentArticle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        log.innerText = currentArticle;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } catch (e) { log.innerText = "OFFLINE"; }
}

// Button Mapping
document.getElementById('btn-straight').addEventListener('click', () => handleInput(0));
document.getElementById('btn-curved').addEventListener('click', () => handleInput(1));
document.getElementById('btn-mixed').addEventListener('click', () => handleInput(2));

// RESET (‹ Back Arrow)
document.getElementById('back-icon').addEventListener('click', () => {
    inputSequence = "";
    document.getElementById('note-body').innerHTML = "";
    document.getElementById('title-input').value = "";
    document.getElementById('debug-log').innerText = currentArticle;
});

// BACKSPACE (🎙️ Mic)
document.getElementById('btn-backspace').addEventListener('click', () => {
    inputSequence = inputSequence.slice(0, -1);
    updateHUD();
});

document.getElementById('execute-btn').addEventListener('click', revealResult);

// UNDO (Left Arrow) = NO
document.getElementById('btn-no').addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const letter = document.getElementById('debug-log').innerText.split(': ')[1];
        possibleWords = possibleWords.filter(w => !w.includes(letter));
        handleAnagramStep();
    }
});

// REDO (Right Arrow) = YES
document.getElementById('btn-yes').addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const letter = document.getElementById('debug-log').innerText.split(': ')[1];
        possibleWords = possibleWords.filter(w => w.includes(letter));
        handleAnagramStep();
    }
});

function handleInput(val) {
    inputSequence += val;
    if (navigator.vibrate) navigator.vibrate(25);
    updateHUD();
}

function updateHUD() {
    const labels = ['S', 'C', 'M'];
    const visual = inputSequence.split('').map(i => labels[i]).join(' ');
    document.getElementById('debug-log').innerText = currentArticle + " | " + visual;
}

// REVEAL LOGIC
function revealResult() {
    const len = inputSequence.length;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    if (possibleWords.length === 1) {
        generateAcrostic(possibleWords[0]);
    } else if (possibleWords.length > 1) {
        startProgressiveAnagram();
    } else {
        document.getElementById('note-body').innerHTML = "Connection weak...<span class='caret'></span>";
    }
}

function startProgressiveAnagram() {
    const log = document.getElementById('debug-log');
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let testLetter = "";
    for (let char of alphabet) {
        let count = possibleWords.filter(w => w.includes(char)).length;
        if (count > 0 && count < possibleWords.length) {
            testLetter = char;
            break;
        }
    }
    if (testLetter) {
        log.innerText = `FISHING: ${testLetter}`;
        if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    } else {
        generateAcrostic(possibleWords[0]);
    }
}

function handleAnagramStep() {
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else startProgressiveAnagram();
}

function generateAcrostic(wordFound) {
    const body = document.getElementById('note-body');
    const log = document.getElementById('debug-log');
    const len = wordFound.length;
    let usedWords = new Set();
    const html = wordFound.split('').map(letter => {
        const list = fillerPool[letter]?.[len] || [letter + ".".repeat(len - 1)];
        let chosen = list.find(w => !usedWords.has(w) && w !== wordFound) || list[0];
        usedWords.add(chosen);
        return `<div class="reveal-line"><span>${letter}</span>${chosen.slice(1).toLowerCase()}</div>`;
    }).join('');
    body.innerHTML = html + '<span class="caret"></span>';
    document.getElementById('title-input').value = "My Guesses";
    log.innerText = ""; 
    inputSequence = "";
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) meta.innerHTML = `Today ${time} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
}
updateTime();
