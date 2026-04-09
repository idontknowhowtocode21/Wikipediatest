/**
 * WORDSMITH ULTIMATE ENGINE
 * Restored: Positional Search, 4-Way Long Press, Appearance Sort, and Global Highlight.
 */

// 1. CLOCK LOGIC
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

// 2. STATE & DATA
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
    'A': {4:['AREA','ALSO'],5:['APPLE','ALIVE'],6:['ACTION','AROUND'],7:['AGAINST','AIRPORT'],8:['ABSOLUTE'],9:['ADVENTURE'],10:['APPEARANCE'],11:['AGRICULTURE'],12:['ARCHITECTURE'],13:['ACCOMMODATION'],14:['ADMINISTRATION'],15:['ACKNOWLEDGEABLE']},
    'B': {4:['BLUE','BACK'],5:['BOARD','BASIC'],6:['BEYOND','BEFORE'],7:['BETWEEN','BELIEVE'],8:['BOUNDARY'],9:['BEAUTIFUL'],10:['BACKGROUND'],11:['BENEFICIARY'],12:['BREAKTHROUGH'],13:['BREATHSTAKING'],14:['BIOREMEDIATION'],15:['BIOLUMINESCENCE']},
    'C': {4:['CASE','CITY'],5:['CLOUD','CLEAR'],6:['CHURCH','CENTER'],7:['CONTROL','COUNTRY'],8:['CAPACITY'],9:['CHARACTER'],10:['CONFERENCE'],11:['COMBINATION'],12:['CONSTRUCTION'],13:['COMMUNICATION'],14:['CHARACTERISTIC'],15:['CONGRATULATIONS']},
    'D': {4:['DARK','DATA'],5:['DREAM','DRIVE'],6:['DEVICE','DURING'],7:['DISPLAY','DRIVING'],8:['DISTANCE'],9:['DIFFERENT'],10:['DEPARTMENT'],11:['DESCRIPTION'],12:['DISTRIBUTION'],13:['DETERMINATION'],14:['DIFFERENTIATED'],15:['DECENTRALIZATON']},
    'E': {4:['EAST','ELSE'],5:['EARTH','EVERY'],6:['ENERGY','ENOUGH'],7:['EVENING','EXAMPLE'],8:['EVIDENCE'],9:['EQUIPMENT'],10:['EXPERIENCE'],11:['ENVIRONMENT'],12:['EXPECTATIONS'],13:['ENLIGHTENMENT'],14:['ESTABLISHMENTS'],15:['ELECTRIFICATION']},
    'F': {4:['FIRE','FACT'],5:['FIELD','FORCE'],6:['FUTURE','FOLLOW'],7:['FRIENDS','FINALLY'],8:['FACILITY'],9:['FINANCIAL'],10:['FOUNDATION'],11:['FLUCTUATION'],12:['FRAGMENTEDLY'],13:['FUNCTIONALITY'],14:['FEARLESSNESSES'],15:['FORESIGHTEDNESS']},
    'G': {4:['GOLD','GIVE'],5:['GHOST','GREAT'],6:['GROUND','GROWTH'],7:['GENERAL','GARDEN'],8:['GRADUATE'],9:['GUARANTEE'],10:['GENERATION'],11:['GOVERNMENTAL'],12:['GLOBALIZATION'],13:['GENTLEMANLINESS'],14:['GENERALIZATION'],15:['GALLIVANTINGNESS']},
    'H': {4:['HIGH','HERE'],5:['HEART','HOUSE'],6:['HISTORY','HEALTH'],7:['HOSPITAL','HAPPEN'],8:['HEIGHTS'],9:['HAPPINESS'],10:['HISTORICAL'],11:['HIGHLIGHTED'],12:['HOMELESSNESS'],13:['HETEROGENEOUS'],14:['HYPOTHETICALLY'],15:['HETEROGENEOUSLY']},
    'I': {4:['IRON','INTO'],5:['IMAGE','INDEX'],6:['ISLAND','INSIDE'],7:['INSTEAD','IMPROVE'],8:['INTERNAL'],9:['IMPORTANT'],10:['INVESTMENT'],11:['INFORMATION'],12:['INTELLIGENCE'],13:['INTERNATIONAL'],14:['IDENTIFICATION'],15:['INTERPRETATIONS']},
    'J': {4:['JUST','JOIN'],5:['JOINT','JUDGE'],6:['JORDAN','JUNGLE'],7:['JOURNEY','JACKETS'],8:['JUNCTION'],9:['JUDGEMENT'],10:['JOURNALISM'],11:['JUSTIFIABLE'],12:['JUDICIOUSNESS'],13:['JUXTAPOSITION'],14:['JOCULARNESSES'],15:['JOURNEYMANSHIPS']},
    'K': {4:['KEEP','KNEW'],5:['KNOWN','KNOCK'],6:['KNIGHT','KANSAS'],7:['KITCHEN','KINGDOM'],8:['KEYBOARD'],9:['KNOWLEDGE'],10:['KINDNESSES'],11:['KALEIDOSCOP'],12:['KINDHEARTEDN'],13:['KINDHEARTEDLY'],14:['KINDHEARTEDNES'],15:['KINDHEARTEDNESS']},
    'L': {4:['LONG','LAST'],5:['LIGHT','LARGE'],6:['LISTEN','LITTLE'],7:['LIBRARY','LOOKING'],8:['LOCATION'],9:['LANDSCAPE'],10:['LEADERSHIP'],11:['LITERATURE'],12:['LONGSTANDING'],13:['LOGARITHMICALLY'],14:['LONGITUDINALLY'],15:['LEXICOGRAPHICAL']},
    'M': {4:['MOON','MAIN'],5:['MUSIC','MODEL'],6:['MEMORY','MOTHER'],7:['MESSAGE','MORNING'],8:['MOUNTAIN'],9:['MARKETING'],10:['MANAGEMENT'],11:['MATHEMATICS'],12:['MANUFACTURING'],13:['MICROBIOLOGY'],14:['MULTICULTURAL'],15:['MISINTERPRETATION']},
    'N': {4:['NEXT','NEAR'],5:['NIGHT','NEVER'],6:['NATURE','NUMBER'],7:['NETWORK','NOTHING'],8:['NEGATIVE'],9:['NEIGHBOR'],10:['NEWSPAPER'],11:['NATIONALITY'],12:['NOTIFICATION'],13:['NONCONFORMITY'],14:['NORTHEASTERNER'],15:['NIGHTMAREISHNES']},
    'O': {4:['OPEN','ONLY'],5:['OCEAN','ORDER'],6:['OBJECT','OFFICE'],7:['OFFICER','OUTSIDE'],8:['OPPOSITE'],9:['OPERATION'],10:['OCCASIONAL'],11:['OBSERVATION'],12:['ORGANIZATION'],13:['OBJECTIONABLE'],14:['OVERPRODUCTION'],15:['OVEREMPHASIZING']},
    'P': {4:['PAST','PART'],5:['POWER','PAPER'],6:['PLAYER','PUBLIC'],7:['PROJECT','PERHAPS'],8:['PHYSICAL'],9:['PRESIDENT'],10:['POPULATION'],11:['PREPARATION'],12:['PARTICIPATION'],13:['POSSIBILITIES'],14:['PHOTOGRAPHICAL'],15:['PHOSPHORESCENCE']},
    'Q': {4:['QUIT','QUIZ'],5:['QUITE','QUERY'],6:['QUARTZ','QUOTAS'],7:['QUALITY','QUARTER'],8:['QUESTION'],9:['QUALIFIED'],10:['QUOTATIONS'],11:['QUALITATIVE'],12:['QUANTIFIABLE'],13:['QUESTIONNAIRE'],14:['QUANTIFICATION'],15:['QUINTESSENTIALLY']},
    'R': {4:['ROAD','REAL'],5:['RIVER','ROUND'],6:['REPORT','REASON'],7:['RESULTS','RUNNING'],8:['REACTION'],9:['RELIGIOUS'],10:['REFLECTION'],11:['RESPONSIBLE'],12:['RELATIONSHIP'],13:['REPRESENTATIVE'],14:['REHABILITATION'],15:['RECOMMENDATIONS']},
    'S': {4:['STAR','SIDE'],5:['STONE','SMALL'],6:['STREET','SECOND'],7:['STATION','SERVICE'],8:['STANDARD'],9:['SITUATION'],10:['SUCCESSFUL'],11:['SIGNIFICANT'],12:['SATISFACTION'],13:['SPECIFICATION'],14:['SIMULTANEOUSLY'],15:['STANDARDIZATION']},
    'T': {4:['TIME','THIS'],5:['TRAIN','THESE'],6:['THINGS','THOUGH'],7:['THROUGH','THOUGHT'],8:['TOGETHER'],9:['TRANSPORT'],10:['TECHNOLOGY'],11:['TEMPERATURE'],12:['TRANSLATION'],13:['THEORETICALLY'],14:['TRANSPORTATION'],15:['TELECOMMUNICATION']},
    'U': {4:['UPON','UNIT'],5:['UNDER','UNTIL'],6:['UNIQUE','UNITED'],7:['UNKNOWN','USUALLY'],8:['UNIVERSE'],9:['UNIVERSAL'],10:['UNIVERSITY'],11:['UTILIZATION'],12:['UNDERSTANDING'],13:['UNCONDITIONAL'],14:['UNINTENTIONALLY'],15:['UNDERDEVELOPMENT']},
    'V': {4:['VIEW','VERY'],5:['VOICE','VALUE'],6:['VISUAL','VOLUME'],7:['VILLAGE','VARIOUS'],8:['VACATION'],9:['VARIATION'],10:['VOCABULARY'],11:['VEGETARIAN'],12:['VOLUNTARILY'],13:['VULNERABILITY'],14:['VENTILATIONARY'],15:['VOCABULARYWORDS']},
    'W': {4:['WEST','WITH'],5:['WATER','WORLD'],6:['WINDOW','WITHIN'],7:['WEATHER','WITHOUT'],8:['WILDLIFE'],9:['WONDERFUL'],10:['WELLNESS'],11:['WILLINGNESS'],12:['WITHSTANDING'],13:['WEATHERBEATEN'],14:['WEIGHTLESSNESS'],15:['WHOLEHEARTEDNES']},
    'X': {4:['XRAY'],5:['XYLYL'],6:['XENONS'],7:['XYLITOL'],8:['XYLOGRAPH'],9:['XENOPHOBE'],10:['XEROXING'],11:['XEROGRAPHIC'],12:['XYLOGRAPHERS'],13:['XENOPHOBICALLY'],14:['XEROGRAPHICALY'],15:['XENOPHILEWORDS']},
    'Y': {4:['YEAR','YOUR'],5:['YOUTH','YOUNG'],6:['YELLOW','YESTER'],7:['YARDAGE','YANKEE'],8:['YEARBOOK'],9:['YESTERDAY'],10:['YOUTHFULLY'],11:['YACHTSWOMAN'],12:['YELLOWJACKET'],13:['YESTERMORNING'],14:['YESTERDAYNIGHT'],15:['YOUTHFULLYWORDS']},
    'Z': {4:['ZERO'],5:['ZONES'],6:['ZEBRAS'],7:['ZOOLOGY'],8:['ZEALOUSLY'],9:['ZEALOTRY'],10:['ZOOLOGICAL'],11:['ZEALOUSNESS'],12:['ZIGZAGGING'],13:['ZINCIFICATION'],14:['ZOOLOGICALLY'],15:['ZOOMORPHICWORDS']}
};

// --- DOM ELEMENTS ---
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
        const page = Object.values(data.query.pages)[0];
        const fullText = page.extract.toUpperCase();
        
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

// --- LONG PRESS LOGIC (RESTORED) ---
const setupLongPress = (el, index) => {
    el.addEventListener('touchstart', () => {
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

// --- FISHING ENGINE (RESTORED POSITIONAL LOGIC) ---
btnYes.addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') {
            possibleWords = possibleWords.filter(w => w[action.pos] === action.letter);
        } else {
            possibleWords = possibleWords.filter(w => w.includes(action.letter));
        }
        noCount = 0;
        handleAnagramStep();
    }
});

btnNo.addEventListener('click', () => {
    if (possibleWords.length > 1) {
        const action = getActiveAction();
        if (action.type === 'positional') {
            possibleWords = possibleWords.filter(w => w[action.pos] !== action.letter);
        } else {
            possibleWords = possibleWords.filter(w => !w.includes(action.letter));
        }
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
    } catch (e) {
        const manualLink = prompt("Paste Wikipedia link:");
        if (manualLink && manualLink.includes("/wiki/")) {
            const slug = manualLink.split("/wiki/")[1].split(/[#?]/)[0];
            fetchWiki(slug);
        }
    }
});

document.getElementById('btn-straight').addEventListener('click', () => handleInput(0));
document.getElementById('btn-curved').addEventListener('click', () => handleInput(1));
document.getElementById('btn-mixed').addEventListener('click', () => handleInput(2));
document.getElementById('btn-backspace').addEventListener('click', () => {
    inputSequence = inputSequence.slice(0, -1);
    updateHUD();
});
document.getElementById('back-icon').addEventListener('click', () => {
    inputSequence = "";
    document.getElementById('note-body').innerHTML = "";
    document.getElementById('title-input').value = "";
    debugLog.innerText = currentArticle;
    possibleWords = [];
});
btnExecute.addEventListener('click', revealResult);

function handleInput(val) {
    inputSequence += val;
    if (navigator.vibrate) navigator.vibrate(25);
    updateHUD();
}

function updateHUD() {
    const labels = ['S', 'C', 'M'];
    const visual = inputSequence.split('').map(i => labels[i]).join(' ');
    debugLog.innerText = currentArticle + " | " + visual;
}

// --- FISHING MODE RE-RESTORED ---
function revealResult() {
    const len = inputSequence.length;
    noCount = 0;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else if (possibleWords.length > 1) startProgressiveAnagram();
    else document.getElementById('note-body').innerHTML = "No matches found.";
}

function startProgressiveAnagram() {
    const listStr = possibleWords.join(' | ');

    // Pivot to Choice Mode
    if (possibleWords.length <= 3 || (noCount >= 2 && possibleWords.length === 4)) {
        debugLog.innerText = `CHOICE: ${listStr}`;
        if (navigator.vibrate) navigator.vibrate([80, 80]);
        return;
    }

    // Positional Elimination logic
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
        if (bestChar) {
            debugLog.innerText = `POSITION ${bestPos}: ${bestChar} | [${listStr}]`;
            return;
        }
    }

    // Standard Fishing
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", testLetter = "";
    for (let char of alphabet) {
        let count = possibleWords.filter(w => w.includes(char)).length;
        if (count > 0 && count < possibleWords.length) {
            testLetter = char;
            break;
        }
    }
    if (testLetter) debugLog.innerText = `FISHING: ${testLetter} | [${listStr}]`;
    else generateAcrostic(possibleWords[0]);
}

function handleAnagramStep() {
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else startProgressiveAnagram();
}

function generateAcrostic(wordFound) {
    const body = document.getElementById('note-body');
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
    debugLog.innerText = ""; 
    inputSequence = "";
}
