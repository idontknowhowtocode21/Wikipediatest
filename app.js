let dictionary = {};
let inputSequence = "";
let currentArticle = "READY";

const shapeMap = {
    'A':0,'E':0,'F':0,'H':0,'I':0,'K':0,'L':0,'M':0,'N':0,'T':0,'V':0,'W':0,'X':0,'Y':0,'Z':0,
    'C':1,'O':1,'S':1,
    'B':2,'D':2,'G':2,'J':2,'P':2,'Q':2,'R':2,'U':2
};

// Comprehensive filler pool (Lengths 4-15)
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

// Clipboard Snatch (Magic Wand)
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
        // Fetch ALL sections by removing the "lead" restriction
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${slug}&prop=text&format=json&origin=*`);
        const data = await response.json();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.parse.text["*"];
        
        // Comprehensive clean up
        tempDiv.querySelectorAll('sup, .mw-editsection, table, script, style, .reflist, .navbox').forEach(el => el.remove());
        
        const words = tempDiv.innerText.toUpperCase().match(/[A-Z]{4,15}/g); 
        dictionary = {};
        words.forEach(word => {
            const len = word.length;
            const hash = word.split('').map(char => shapeMap[char] ?? '').join('');
            if (!dictionary[len]) dictionary[len] = {};
            if (!dictionary[len][hash]) dictionary[len][hash] = word;
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

// Reset Trigger (‹ Back Arrow)
document.getElementById('back-icon').addEventListener('click', () => {
    inputSequence = "";
    document.getElementById('note-body').innerHTML = "";
    document.getElementById('title-input').value = "";
    document.getElementById('debug-log').innerText = currentArticle;
    if (navigator.vibrate) navigator.vibrate(100);
});

// Backspace (🎙️ Mic)
document.getElementById('btn-backspace').addEventListener('click', () => {
    inputSequence = inputSequence.slice(0, -1);
    updateHUD();
});

document.getElementById('execute-btn').addEventListener('click', revealResult);

function handleInput(val) {
    inputSequence += val;
    if (navigator.vibrate) navigator.vibrate(25);
    updateHUD();
}

function updateHUD() {
    const log = document.getElementById('debug-log');
    const labels = ['S', 'C', 'M'];
    const visual = inputSequence.split('').map(i => labels[i]).join(' ');
    log.innerText = currentArticle + " | " + visual;
}

// THE REVEAL ENGINE
function revealResult() {
    const len = inputSequence.length;
    const body = document.getElementById('note-body');
    const log = document.getElementById('debug-log');
    
    // 1. Try to find the exact word
    let wordFound = dictionary[len]?.[inputSequence];

    // 2. FAILSAFE: Pick first word of that length if no exact match
    if (!wordFound && dictionary[len]) {
        const fallbackKeys = Object.keys(dictionary[len]);
        if (fallbackKeys.length > 0) {
            wordFound = dictionary[len][fallbackKeys[0]];
        }
    }

    let usedWords = new Set();

    if (wordFound) {
        const html = wordFound.split('').map(letter => {
            const list = fillerPool[letter]?.[len] || [letter + ".".repeat(len-1)];
            
            // SECURITY: No repeats, no matches with the target word
            let chosen = list.find(w => !usedWords.has(w) && w !== wordFound) || list[0];
            
            usedWords.add(chosen);
            return `<div class="reveal-line"><span>${letter}</span>${chosen.slice(1).toLowerCase()}</div>`;
        }).join('');
        
        body.innerHTML = html + '<span class="caret"></span>';
        document.getElementById('title-input').value = "My Guesses";
        log.innerText = ""; 
    } else {
        body.innerHTML = "I'm having trouble focusing... focus on the shapes again.<span class='caret'></span>";
    }
    inputSequence = "";
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const meta = document.getElementById('meta-row');
    if (meta) meta.innerHTML = `Today ${time} &nbsp;No category <svg class="dropdown-svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
}
updateTime();
