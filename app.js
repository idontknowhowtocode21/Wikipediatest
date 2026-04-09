/**
 * WORDSMITH PERFORMANCE ENGINE v5.0
 * Features: Full-Page Query, Positional Fishing, Appearance Sorting, 
 * 4-Way Long-Press Divination, and Exact-Length Acrostic.
 */

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

// --- DICTIONARY (Lengths 4-15) ---
const fillerPool = {
    'A': {4:['AREA','ALSO'],5:['APPLE','ALIVE'],6:['ACTION','AROUND'],7:['AGAINST','AIRPORT'],8:['ABSOLUTE','ACADEMIC'],9:['ADVENTURE','AUTHORITY'],10:['APPEARANCE','ADDITIONAL'],11:['AGRICULTURE','ALTERNATIVE'],12:['ARCHITECTURE','APPRECIATION'],13:['ACCOMMODATION','APPROPRIATELY'],14:['ADMINISTRATION','ACCOUNTABILITY'],15:['ACKNOWLEDGEABLE','ACCOMPLISHMENTS']},
    'B': {4:['BLUE','BACK'],5:['BOARD','BASIC'],6:['BEYOND','BEFORE'],7:['BETWEEN','BELIEVE'],8:['BOUNDARY','BUSINESS'],9:['BEAUTIFUL','BROADCAST'],10:['BACKGROUND','BENEFACTOR'],11:['BENEFICIARY','BELLIGERENT'],12:['BREAKTHROUGH','BIBLIOGRAPHY'],13:['BREATHSTAKING','BUILDINGBLOCK'],14:['BIOREMEDIATION','BUSINESSPERSON'],15:['BIOLUMINESCENCE','BLOODTHIRSTINESS']},
    'C': {4:['CASE','CITY'],5:['CLOUD','CLEAR'],6:['CHURCH','CENTER'],7:['CONTROL','COUNTRY'],8:['CAPACITY','CHEMICAL'],9:['CHARACTER','COMMUNITY'],10:['CONFERENCE','COLLECTION'],11:['COMBINATION','CHAMPIONSHIP'],12:['CONSTRUCTION','CONTRIBUTION'],13:['COMMUNICATION','CONSIDERATION'],14:['CHARACTERISTIC','CLASSIFICATION'],15:['CONGRATULATIONS','CONFIDENTIALITY']},
    'D': {4:['DARK','DATA'],5:['DREAM','DRIVE'],6:['DEVICE','DURING'],7:['DISPLAY','DRIVING'],8:['DISTANCE','DOCUMENT'],9:['DIFFERENT','DIRECTION'],10:['DEPARTMENT','DEFINITION'],11:['DESCRIPTION','DEVELOPMENT'],12:['DISTRIBUTION','DISADVANTAGE'],13:['DETERMINATION','DISCONTINUITY'],14:['DIFFERENTIATED','DISCRIMINATION'],15:['DECENTRALIZATON','DIFFERENTIATION']},
    'E': {4:['EAST','ELSE'],5:['EARTH','EVERY'],6:['ENERGY','ENOUGH'],7:['EVENING','EXAMPLE'],8:['EVIDENCE','EXCHANGE'],9:['EQUIPMENT','EDUCATION'],10:['EXPERIENCE','EXPRESSION'],11:['ENVIRONMENT','EXPLANATION'],12:['EXPECTATIONS','EXPERIMENTAL'],13:['ENLIGHTENMENT','ENTERTAINMENT'],14:['ESTABLISHMENTS','EXTRAORDINARY'],15:['ELECTRIFICATION','EXTERMINATION']},
    'F': {4:['FIRE','FACT'],5:['FIELD','FORCE'],6:['FUTURE','FOLLOW'],7:['FRIENDS','FINALLY'],8:['FACILITY','FUNCTION'],9:['FINANCIAL','FREQUENTLY'],10:['FOUNDATION','FRIENDSHIP'],11:['FLUCTUATION','FORESIGHTED'],12:['FRAGMENTEDLY','FOREFATHERS'],13:['FUNCTIONALITY','FORESIGHTNESS'],14:['FEARLESSNESSES','FLAMBOYANTNESS'],15:['FORESIGHTEDNESS','FRIGHTFULNESSES']},
    'G': {4:['GOLD','GIVE'],5:['GHOST','GREAT'],6:['GROUND','GROWTH'],7:['GENERAL','GARDEN'],8:['GRADUATE','GOVERNOR'],9:['GUARANTEE','GATHERING'],10:['GENERATION','GOVERNMENT'],11:['GOVERNMENTAL','GRACIOUSNESS'],12:['GLOBALIZATION','GEOGRAPHICAL'],13:['GENTLEMANLINESS','GRANDCHILDREN'],14:['GENERALIZATION','GEOMETRICALNESS'],15:['GALLIVANTINGNESS','GRANDMOTHERNESS']},
    'H': {4:['HIGH','HERE'],5:['HEART','HOUSE'],6:['HISTORY','HEALTH'],7:['HOSPITAL','HAPPEN'],8:['HEIGHTS','HANDLING'],9:['HAPPINESS','HIGHLIGHT'],10:['HISTORICAL','HOUSEHOLDS'],11:['HIGHLIGHTED','HOMOGENEOUS'],12:['HOMELESSNESS','HEREDITARILY'],13:['HETEROGENEOUS','HEARTBREAKING'],14:['HYPOTHETICALLY','HARDHEADEDNESS'],15:['HETEROGENEOUSLY','HYPERCRITICALNESS']},
    'I': {4:['IRON','INTO'],5:['IMAGE','INDEX'],6:['ISLAND','INSIDE'],7:['INSTEAD','IMPROVE'],8:['INTERNAL','IDENTITY'],9:['IMPORTANT','INVENTORY'],10:['INVESTMENT','INSTRUMENT'],11:['INFORMATION','INDEPENDENT'],12:['INTELLIGENCE','INTERACTIONS'],13:['INTERNATIONAL','INVESTIGATION'],14:['IDENTIFICATION','INFRASTRUCTURE'],15:['INTERPRETATIONS','INTERDEPENDENCE']},
    'J': {4:['JUST','JOIN'],5:['JOINT','JUDGE'],6:['JORDAN','JUNGLE'],7:['JOURNEY','JACKETS'],8:['JUNCTION','JUDICIAL'],9:['JUDGEMENT','JUSTIFIED'],10:['JOURNALISM','JUSTIFYING'],11:['JUSTIFIABLE','JURISDICTION'],12:['JUDICIOUSNESS','JOURNALISTIC'],13:['JUXTAPOSITION','JUSTIFICATION'],14:['JOCULARNESSES','JUDICIOUSNESSES'],15:['JOURNEYMANSHIPS','JURISDICTIONAL']},
    'K': {4:['KEEP','KNEW'],5:['KNOWN','KNOCK'],6:['KNIGHT','KANSAS'],7:['KITCHEN','KINGDOM'],8:['KEYBOARD','KINDNESS'],9:['KNOWLEDGE','KINETICAL'],10:['KINDNESSES','KIDNAPPERS'],11:['KALEIDOSCOP','KINDHEARTED'],12:['KINDHEARTEDN','KNIGHTHOODS'],13:['KINDHEARTEDLY','KALEIDOSCOPIC'],14:['KINDHEARTEDNES','KITCHENWARE'],15:['KINDHEARTEDNESS','KALEIDOSCOPICAL']},
    'L': {4:['LONG','LAST'],5:['LIGHT','LARGE'],6:['LISTEN','LITTLE'],7:['LIBRARY','LOOKING'],8:['LOCATION','LANGUAGE'],9:['LANDSCAPE','LISTENING'],10:['LEADERSHIP','LITERATURE'],11:['LEGISLATION','LIMITATIONS'],12:['LONGSTANDING','LUMINESCENCE'],13:['LOGARITHMICALLY','LIBERALIZATION'],14:['LONGITUDINALLY','LEGITIMIZATION'],15:['LEXICOGRAPHICAL','LEVELHEADEDNESS']},
    'M': {4:['MOON','MAIN'],5:['MUSIC','MODEL'],6:['MEMORY','MOTHER'],7:['MESSAGE','MORNING'],8:['MOUNTAIN','MATERIAL'],9:['MARKETING','MECHANISM'],10:['MANAGEMENT','MEMBERSHIP'],11:['MATHEMATICS','MAINTENANCE'],12:['MANUFACTURING','METROPOLITAN'],13:['MICROBIOLOGY','MISUNDERSTOOD'],14:['MULTICULTURAL','METAMORPHOSIS'],15:['MISINTERPRETATION','MICROORGANISMS']},
    'N': {4:['NEXT','NEAR'],5:['NIGHT','NEVER'],6:['NATURE','NUMBER'],7:['NETWORK','NOTHING'],8:['NEGATIVE','NORTHERN'],9:['NEIGHBOR','NECESSARY'],10:['NEWSPAPER','NOMINATION'],11:['NATIONALITY','NEGOTIATION'],12:['NOTIFICATION','NEIGHBORHOOD'],13:['NONCONFORMITY','NORMALLYFOUND'],14:['NORTHEASTERNER','NEARSIGHTEDNES'],15:['NIGHTMAREISHNES','NORTHEASTERNERS']},
    'O': {4:['OPEN','ONLY'],5:['OCEAN','ORDER'],6:['OBJECT','OFFICE'],7:['OFFICER','OUTSIDE'],8:['OPPOSITE','ORDINARY'],9:['OPERATION','OTHERWISE'],10:['OCCASIONAL','OVERCOMING'],11:['OBSERVATION','ORIENTATION'],12:['ORGANIZATION','OVERWHELMING'],13:['OBJECTIONABLE','OBSERVATIONAL'],14:['OVERPRODUCTION','OPERATIONALIZE'],15:['OVEREMPHASIZING','OVERCOMPENSATION']},
    'P': {4:['PAST','PART'],5:['POWER','PAPER'],6:['PLAYER','PUBLIC'],7:['PROJECT','PERHAPS'],8:['PHYSICAL','PRESSURE'],9:['PRESIDENT','PRINCIPLE'],10:['POPULATION','PRODUCTION'],11:['PREPARATION','PERFORMANCE'],12:['PARTICIPATION','PROFESSIONAL'],13:['POSSIBILITIES','PARLIAMENTARY'],14:['PHOTOGRAPHICAL','PROPORTIONALITY'],15:['PHOSPHORESCENCE','PERSONIFICATION']},
    'Q': {4:['QUIT','QUIZ'],5:['QUITE','QUERY'],6:['QUARTZ','QUOTAS'],7:['QUALITY','QUARTER'],8:['QUESTION','QUANTITY'],9:['QUALIFIED','QUICKNESS'],10:['QUOTATIONS','QUALIFYING'],11:['QUALITATIVE','QUARRELSOME'],12:['QUANTIFIABLE','QUEASINESSES'],13:['QUESTIONNAIRE','QUINTESSENTIAL'],14:['QUANTIFICATION','QUARTERMASTERS'],15:['QUINTESSENTIALLY','QUARRELSOMENESS']},
    'R': {4:['ROAD','REAL'],5:['RIVER','ROUND'],6:['REPORT','REASON'],7:['RESULTS','RUNNING'],8:['REACTION','RESOURCE'],9:['RELIGIOUS','REFERENCE'],10:['REFLECTION','RECOGNITION'],11:['RESPONSIBLE','RESTRICTION'],12:['RELATIONSHIP','REPRODUCTION'],13:['REPRESENTATIVE','RESTRUCTURING'],14:['REHABILITATION','REPRESENTATION'],15:['RECOMMENDATIONS','REPRODUCIBILITY']},
    'S': {4:['STAR','SIDE'],5:['STONE','SMALL'],6:['STREET','SECOND'],7:['STATION','SERVICE'],8:['STANDARD','STRATEGY'],9:['SITUATION','STRUCTURE'],10:['SUCCESSFUL','SPECIALIST'],11:['SIGNIFICANT','STIMULATION'],12:['SATISFACTION','SURROUNDINGS'],13:['SPECIFICATION','SOPHISTICATED'],14:['SIMULTANEOUSLY','SUSTAINABILITY'],15:['STANDARDIZATION','SOPHISTICATION']},
    'T': {4:['TIME','THIS'],5:['TRAIN','THESE'],6:['THINGS','THOUGH'],7:['THROUGH','THOUGHT'],8:['TOGETHER','THINKING'],9:['TRANSPORT','TECHNICAL'],10:['TECHNOLOGY','TELEVISION'],11:['TEMPERATURE','TRANSACTION'],12:['TRANSLATION','TRANSMISSION'],13:['THEORETICALLY','TRANSFORMATION'],14:['TRANSPORTATION','THERMODYNAMICS'],15:['TELECOMMUNICATION','TRADITIONALISM']},
    'U': {4:['UPON','UNIT'],5:['UNDER','UNTIL'],6:['UNIQUE','UNITED'],7:['UNKNOWN','USUALLY'],8:['UNIVERSE','ULTIMATE'],9:['UNIVERSAL','UPDATING'],10:['UNIVERSITY','UNDERSTOOD'],11:['UTILIZATION','UNCERTAINTY'],12:['UNDERSTANDING','UNEMPLOYMENT'],13:['UNCONDITIONAL','UNFORTUNATELY'],14:['UNINTENTIONALLY','UNCONSTITUTIONAL'],15:['UNDERDEVELOPMENT','UNCONDITIONALLY']},
    'V': {4:['VIEW','VERY'],5:['VOICE','VALUE'],6:['VISUAL','VOLUME'],7:['VILLAGE','VARIOUS'],8:['VACATION','VALUABLE'],9:['VARIATION','VIEWPOINT'],10:['VOCABULARY','VEGETATION'],11:['VEGETARIAN','VALIDATIONS'],12:['VOLUNTARILY','VERIFICATION'],13:['VULNERABILITY','VISUALIZATION'],14:['VENTILATIONARY','VALUABLENESSES'],15:['VOCABULARYWORDS','VOLUNTARINESSES']},
    'W': {4:['WEST','WITH'],5:['WATER','WORLD'],6:['WINDOW','WITHIN'],7:['WEATHER','WITHOUT'],8:['WILDLIFE','WESTERN'],9:['WONDERFUL','WHOLETIME'],10:['WELLNESS','WIDESPREAD'],11:['WILLINGNESS','WEATHERWISE'],12:['WITHSTANDING','WATCHFULNESS'],13:['WEATHERBEATEN','WHOLEHEARTEDLY'],14:['WEIGHTLESSNESS','WEATHERPROOFED'],15:['WHOLEHEARTEDNES','WEATHERPROOFING']},
    'X': {4:['XRAY'],5:['XYLYL'],6:['XENONS'],7:['XYLITOL'],8:['XYLOGRAPH'],9:['XENOPHOBE'],10:['XEROXING'],11:['XEROGRAPHIC'],12:['XYLOGRAPHERS'],13:['XENOPHOBICALLY'],14:['XEROGRAPHICALY'],15:['XENOPHILEWORDS']},
    'Y': {4:['YEAR','YOUR'],5:['YOUTH','YOUNG'],6:['YELLOW','YESTER'],7:['YARDAGE','YANKEE'],8:['YEARBOOK','YOUTHFUL'],9:['YESTERDAY','YOUTHFULLY'],10:['YOUTHFULLY','YACHTSMAN'],11:['YACHTSWOMAN','YEARLONGTIME'],12:['YELLOWJACKET','YOUTHFULNESS'],13:['YESTERMORNING','YACHTSMANSHIPS'],14:['YESTERDAYNIGHT','YELLOWJACKETS'],15:['YOUTHFULLYWORDS','YELLOWJACKETING']},
    'Z': {4:['ZERO'],5:['ZONES'],6:['ZEBRAS'],7:['ZOOLOGY'],8:['ZEALOUSLY'],9:['ZEALOTRY'],10:['ZOOLOGICAL'],11:['ZEALOUSNESS'],12:['ZIGZAGGING'],13:['ZINCIFICATION'],14:['ZOOLOGICALLY'],15:['ZOOMORPHICWORDS']}
};

// --- INSTANT SCRAPER (ORDER PRESERVING) ---
async function fetchWiki(slug) {
    const log = document.getElementById('debug-log');
    currentArticle = slug;
    log.innerText = "SYNCING...";
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

        // Sort dictionary by appearance order
        for (let l in dictionary) {
            for (let h in dictionary[l]) {
                dictionary[l][h].sort((a,b) => wordOrderMap.indexOf(a) - wordOrderMap.indexOf(b));
            }
        }

        const cleanTitle = decodeURIComponent(slug).replace(/_/g, ' ').toUpperCase();
        log.innerText = cleanTitle;
        currentArticle = cleanTitle;
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } catch (e) { log.innerText = "OFFLINE"; }
}

// --- CONTROLS & LONG PRESS ---
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnSearch = document.querySelector('.header-right svg:nth-child(3)');
const btnExecute = document.getElementById('execute-btn');

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

setupLongPress(btnYes, 0);       // Hold Redo = Word 1
setupLongPress(btnNo, 1);        // Hold Undo = Word 2
setupLongPress(btnSearch, 2);    // Hold Search = Word 3
setupLongPress(btnExecute, 3);   // Hold Tick = Word 4

document.querySelector('.ai-magic').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text.includes("wikipedia.org/wiki/")) {
            const slug = text.split("/wiki/")[1].split(/[#?]/)[0];
            fetchWiki(slug);
        }
    } catch (e) { console.log("Clipboard Error"); }
});

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
    const raw = document.getElementById('debug-log').innerText;
    if (raw.includes("POSITION")) {
        const letter = raw.split(': ')[1].split(' |')[0];
        const pos = parseInt(raw.split('POSITION ')[1].split(':')[0]) - 1;
        return { letter, pos, type: 'positional' };
    }
    return { letter: raw.split(': ')[1].split(' |')[0], type: 'standard' };
}

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
    document.getElementById('debug-log').innerText = currentArticle;
    possibleWords = [];
});

btnExecute.addEventListener('click', revealResult);

// --- PERFORMANCE LOGIC ---
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

function revealResult() {
    const len = inputSequence.length;
    noCount = 0;
    possibleWords = dictionary[len]?.[inputSequence] || [];
    if (possibleWords.length === 1) generateAcrostic(possibleWords[0]);
    else if (possibleWords.length > 1) startProgressiveAnagram();
    else document.getElementById('note-body').innerHTML = "Weak connection...<span class='caret'></span>";
}

function startProgressiveAnagram() {
    const log = document.getElementById('debug-log');
    const listStr = possibleWords.join(' | ');

    // 1. FEELING MODE (3-4 words or failed search)
    if (possibleWords.length <= 3 || (noCount >= 2 && possibleWords.length === 4)) {
        log.innerText = `CHOICE: ${listStr}`;
        if (navigator.vibrate) navigator.vibrate([80, 80]);
        return;
    }

    // 2. POSITIONAL ELIMINATION (4+ words after 2 "Nos")
    if (noCount >= 2) {
        let bestPos = -1, bestChar = "", maxOverlap = 0;
        for (let i = 0; i < possibleWords[0].length; i++) {
            let counts = {};
            possibleWords.forEach(w => counts[w[i]] = (counts[w[i]] || 0) + 1);
            for (let char in counts) {
                if (counts[char] >= 2 && counts[char] < possibleWords.length) {
                    if (counts[char] > maxOverlap) {
                        maxOverlap = counts[char];
                        bestChar = char;
                        bestPos = i + 1;
                    }
                }
            }
        }
        if (bestChar) {
            log.innerText = `POSITION ${bestPos}: ${bestChar} | [${listStr}]`;
            return;
        }
    }

    // 3. STANDARD FISHING
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", testLetter = "";
    for (let char of alphabet) {
        let count = possibleWords.filter(w => w.includes(char)).length;
        if (count > 0 && count < possibleWords.length) {
            testLetter = char;
            break;
        }
    }

    if (testLetter) log.innerText = `FISHING: ${testLetter} | [${listStr}]`;
    else generateAcrostic(possibleWords[0]);
}

function handleAnagramStep() {
    if (navigator.vibrate) navigator.vibrate(20);
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
    document.getElementById('debug-log').innerText = ""; 
    inputSequence = "";
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) meta.innerHTML = `Today ${time} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
}
updateTime();
