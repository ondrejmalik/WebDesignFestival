// js/artist-detail.js - Dedicated artist detail document engine
// Supports breadcrumbs with exact-spot return navigation, full bios, audio previews, and bilingual reactivity.

(function() {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    const ARTIST_BIOS_EN = {

    "perf-01": "Atmospheric post-rock ensemble from Prague combining sweeping cinematic crescendos with ambient soundscapes and textured guitar delays.",
    "perf-02": "Bratislava-based dream pop four-piece known for shimmering jangle guitars, ethereal vocal harmonies, and nostalgic reverb-soaked arrangements.",
    "perf-03": "Stockholm indie rock quintet delivering driving rhythm sections, melodic riffs, and anthemic choruses influenced by 90s alternative rock.",
    "perf-04": "Energetic Czech indie pop collective blending sparkling synth hooks with infectious upbeat acoustic grooves and catchy vocal hooks.",
    "perf-05": "Vintage synthesizer aficionados crafting warm analogue synthpop driven by Roland Juno pulses and retro-futuristic drum machines.",
    "perf-06": "Viennese duo fusing traditional Alpine acoustic instruments with contemporary electronic beats, sub-bass, and organic textures.",
    "perf-07": "British four-piece playing gritty, guitar-driven alternative rock with soaring hooks, distorted basslines, and passionate lyrics.",
    "perf-08": "Berlin production outfit crafting irresistible nu-disco grooves, slap-bass lines, brass flourishes, and danceable funk rhythms.",
    "perf-09": "Parisian producer combining cinematic French Touch synths with emotive indie songwriting and lush electronic textures.",
    "perf-10": "High-octane Prague electro rock band blending aggressive guitar distortion with massive dance beats and hypnotic vocal lines.",
    "perf-11": "Modular synthesizer purist performing generative live ambient patches with eurorack systems and tape delay units.",
    "perf-12": "Warsaw sound designer exploring intricate micro-rhythms, glitch percussion, and warm nostalgic synthesizer textures.",
    "perf-13": "Berlin underground producer crafting cavernous dub techno soundscapes with echoing chord stabs and deep sub-bass frequencies.",
    "perf-14": "Brno electronic artist crafting hypnotic minimal techno driven by subtle groove modulations and percussive precision.",
    "perf-15": "Slovak dark ambient composer building immersive acoustic drones, monastic field recordings, and visceral low-frequency rumbles.",
    "perf-16": "Budapest club staple delivering relentless, hypnotic deep techno sets built around rolling basslines and dark modular loops.",
    "perf-17": "Live electronic act using drum machines and hardware synthesizers to construct raw, improvised peak-time techno.",
    "perf-18": "Amsterdam industrial techno heavyweight delivering pulverizing kick drums, distorted industrial textures, and metallic percussion.",
    "perf-19": "London underground live act pushing Roland TB-303 acid basslines into blistering, saturated distortion territories.",
    "perf-20": "Czech ambient sound artist creating calming dawn soundscapes utilizing singing bowls, hydrophone nature recordings, and gentle drone pads.",
    "perf-21": "Prague acoustic indie trio crafting delicate vocal harmonies, fingerpicked acoustic guitars, and organic percussion grooves.",
    "perf-22": "Valencia-based surf rock outfit delivering reverb-drenched guitar lines, driving drum beats, and sun-soaked Mediterranean melodies.",
    "perf-23": "London soulful indie collective blending warm Rhodes piano chords with passionate soul vocals and modern indie instrumentation.",
    "perf-24": "Bratislava indie pop quartet producing bright melodic synth lines, danceable drum rhythms, and sparkling vocal harmonies.",
    "perf-25": "Atmospheric shoegaze band from Brno submerging driving melodies underneath dense walls of fuzz, reverb, and shimmering modulation.",
    "perf-26": "Swedish electronic pop project blending Scandinavian crystalline synthesizer textures with polished dance-pop production.",
    "perf-27": "Hamburg post-punk revivalists featuring driving angular basslines, urgent drum rhythms, and raw expressive baritone vocals.",
    "perf-28": "French indie dance producer crafting upbeat electronic grooves with live bass, vocoder hooks, and energetic disco rhythms.",
    "perf-29": "Brighton nu-electro live outfit fusing electroclash energy with modern breaks and razor-sharp synthesizer leads.",
    "perf-30": "Czech progressive dance veterans crafting soaring melodic trance synth lines over driving 132 BPM club grooves.",
    "perf-31": "Czech drone pioneer utilizing layered cello bowings and tape loops to produce meditative, resonant acoustic drone fields.",
    "perf-32": "Vienna microhouse producer known for quirky percussion clicks, minimalist sub-bass grooves, and warm jazzy chord samples.",
    "perf-33": "Slovak organic house collective blending tribal percussion recordings with lush field atmospheres and deep melodic grooves.",
    "perf-34": "Bristol bass music producer delivering bone-shaking sub-bass frequencies, half-step rhythms, and atmospheric dub echoes.",
    "perf-35": "Frankfurt techno DJ renowned for high-energy peak-time sets with driving 138 BPM percussion and warehouse synth stabs.",
    "perf-36": "Lyon electro producer weaving classic 808 breakbeats with dark acid synth sequences and vocoded robotic vocal cuts.",
    "perf-37": "Prague DJ blending gothic dark wave synth melodies with driving four-to-the-floor techno rhythms and shadowy atmospheres.",
    "perf-38": "Krakow hard techno producer delivering punishing 150 BPM industrial kick drums and relentless warehouse energy.",
    "perf-39": "Brussels live acid outfit driving twin TB-303 synthesizers into hyper-speed sonic territory with live percussion sequencing.",
    "perf-40": "Czech chillout producer crafting restorative downtempo soundscapes with soft acoustic guitars and gentle ocean ambient pads.",
    "perf-41": "South Bohemian folk indie ensemble featuring acoustic instruments, acoustic violin, warm double bass, and lyrical storytelling.",
    "perf-42": "Bratislava chamber pop group incorporating orchestral strings, grand piano, and intimate acoustic melodies.",
    "perf-43": "Manchester psychedelic rock quartet known for sprawling organ passages, fuzz guitar freakouts, and hypnotic motorik rhythms.",
    "perf-44": "Cologne dream indie band pairing lush reverb guitars with melancholic synthesizer layers and contemplative lyrics.",
    "perf-45": "Prague art pop project blending avant-garde vocal arrangements with unconventional song structures and rich electroacoustic production.",
    "perf-46": "Milan indie funk collective delivering infectious rhythmic guitar strumming, vibrant horn arrangements, and danceable basslines.",
    "perf-47": "Gothenburg space rock unit crafting cosmic synth textures, driving krautrock basslines, and expansive sonic journeys.",
    "perf-48": "Leeds dance punk quartet combining post-punk bass urgency with frantic four-on-the-floor disco drum beats.",
    "perf-49": "Copenhagen headlining electropop powerhouse with chart-topping synth hooks, massive electronic drops, and dazzling visual live shows.",
    "perf-50": "Prague orchestral electronic ensemble pairing an 8-piece classical string section with massive modular electronic beats for the festival grand finale.",
    "perf-51": "Czech acoustic researcher creating immersive soundscapes built from binaural field recordings of ancient Bohemian forests.",
    "perf-52": "Graz deep ambient composer utilizing modular reverberation units to sculpt expansive, suspended acoustic chambers.",
    "perf-53": "Polish sound artist using vintage reel-to-reel tape decks to create decaying loops, tape saturation warmth, and nostalgic hiss.",
    "perf-54": "Berlin micro techno producer crafting subtle rhythmic textures with pinpoint sound design and warm dub echoes.",
    "perf-55": "Prague progressive club producer weaving deep hypnotic basslines with rolling melodic arpeggios and atmospheric pads.",
    "perf-56": "Tel Aviv psy techno innovator blending rolling hypnotic basslines with sharp psychedelic leads and relentless tribal propulsion.",
    "perf-57": "Rome melodic techno duo crafting emotionally charged synthesizer chords over driving, polished club rhythms.",
    "perf-58": "London sound system selector exploring unconventional halftime bass music, dub echoes, and leftfield low-end experiments.",
    "perf-59": "Amsterdam trance techno specialist bringing uplifting euphoric arpeggios, crisp percussion, and soaring climaxes.",
    "perf-60": "Prague downtempo pioneer performing the official festival sunrise farewell set with warm ambient chords and gentle rhythmic pulses."

    };

    const ARTIST_BIOS_CS = {

        "perf-01": "Atmosférická post-rocková formace z Prahy kombinující mohutné filmové gradace s ambientními plochami a vrstvenými kytarovými efekty.",
        "perf-02": "Bratislavský dream popový kvartet známý třpytivými kytarovými tóny, éterickými vokálními harmoniemi a nostalgickými reverby.",
        "perf-03": "Stockholmský indie rockový kvintet přinášející energickou rytmiku, melodické riffy a hymnické refrény inspirované alternativním rockem 90. let.",
        "perf-04": "Energický český indie popový kolektiv propojující jiskřivé syntezátorové melodie s chytlavými akustickými rytmy a vokálními linkami.",
        "perf-05": "Milovníci vintage syntezátorů tvořící hřejivý analogový synthpop poháněný pulzy Roland Juno a retro-futuristickými bicími automaty.",
        "perf-06": "Vídeňské duo propojující tradiční alpské akustické nástroje se současnými elektronickými beaty, sub-basy a organickými texturami.",
        "perf-07": "Britská čtyřčlenná kapela hrající syrový kytarový alternativní rock s gradujícími pasážemi, zkreslenou basou a emotivními texty.",
        "perf-08": "Berlínská produkční sestava servírující neodolatelné nu-disco rytmy, energické slap-basové linky, dechové aranže a taneční funk.",
        "perf-09": "Pařížský producent kombinující filmové syntezátory ve stylu French Touch s emotivním indie písničkářstvím a bohatou elektronikou.",
        "perf-10": "Vysokoenergetická pražská elektro-rocková kapela spojující agresivní kytarové zkreslení s masivními tanečními beaty a hypnotickými vokály.",
        "perf-11": "Purista modulárních syntezátorů předvádějící živé generativní ambientní patche za pomoci systémů eurorack a páskových delayů.",
        "perf-12": "Varšavský zvukový designér zkoumající propracované mikrorytmy, glitchovou perkusní texturu a hřejivě nostalgické syntezátory.",
        "perf-13": "Berlínský undergroundový producent tvořící monumentální dub techno zvukové krajiny s ozvěnami akordů a hlubokými sub-basovými frekvencemi.",
        "perf-14": "Brněnský elektronický tvůrce produkující hypnotické minimalistické techno postavené na jemných modulacích a precizní rytmice.",
        "perf-15": "Slovenský dark ambientní skladatel budující pohlcující akustické drony, klášterní terénní nahrávky a hluboké vibrace.",
        "perf-16": "Stálice budapešťské klubové scény přinášející nekompromisní hypnotické deep techno sety s valivou basou a modulárními smyčkami.",
        "perf-17": "Živý elektronický projekt využívající bicí automaty a hardwarové syntezátory k improvizaci syrového peak-time techna.",
        "perf-18": "Těžká váha amsterodamského industriálního techna servírující drtivé kopáky, zkreslené tovární textury a kovové perkuse.",
        "perf-19": "Londýnský undergroundový live act posouvající acidové basové linky Roland TB-303 do oblastí agresivní saturace a zkreslení.",
        "perf-20": "Český ambientní zvukový umělec tvořící uklidňující ranní zvukové scenérie pomocí tibetských mís, hydrofonních nahrávek a jemných dronů.",
        "perf-21": "Pražské akustické indie trio s jemnými vokálními harmoniemi, vybrnkávanými kytarami a organickým perkusním doprovodem.",
        "perf-22": "Valencijská surf rocková formace přinášející reverbem prosycené kytarové linky, svižné tempo a sluncem zalité středomořské melodie.",
        "perf-23": "Londýnský oduševnělý indie kolektiv mísící hřejivé piano Rhodes s procítěným soulovým vokálem a moderním aranžmá.",
        "perf-24": "Bratislavský indie popový kvartet tvořící jasné melodické syntezátorové linky, taneční rytmy a jiskřivé vícehlasy.",
        "perf-25": "Atmosférická shoegaze formace z Brna nořící podmanivé melodie pod mohutné kytarové stěny fuzzu, reverbu a modulací.",
        "perf-26": "Švédský elektronický projekt spojující skandinávsky křišťálové syntezátory s precizní tanečně-popovou produkcí.",
        "perf-27": "Hamburští post-punkoví revivalisté s dravou basovou linkou, nekompromisními bicími a naléhavým barytonovým zpěvem.",
        "perf-28": "Francouzský producent indie dance hudby tvořící pozitivní elektronické groovy s živou baskytarou, vokodéry a disco rytmy.",
        "perf-29": "Živá sestava z Brightonu spojující syrovost electroclashe s moderními breaky a břitkými syntezátorovými linkami.",
        "perf-30": "Zkušení čeští matadoři progresivní taneční scény servírující melodický trance v energickém tempu 132 BPM.",
        "perf-31": "Průkopník českého dronu pracující s vrstvenými tahy smyčce violoncella a magnetofonovými smyčkami k navození meditativních ploch.",
        "perf-32": "Vídeňský microhouse producent pověstný originálními zvukovými kliky, minimalistickou basou a hřejivými jazzovými samply.",
        "perf-33": "Slovenský organic house kolektiv propojující kmenové perkuse s přírodními terénními nahrávkami a hlubokými melodiemi.",
        "perf-34": "Bristolský basový inovátor přinášející seismické sub-basy, zlámané rytmy a atmosférické dubové ozvěny.",
        "perf-35": "Frankfurtský techno DJ proslulý energickými sety v tempu 138 BPM, neúnavnou perkusí a industriálními syntezátorovými údery.",
        "perf-36": "Lyonský electro producent proplétající klasické breakbeaty automatu 808 s temným acidem a robotickými vokodéry.",
        "perf-37": "Pražský DJ kombinující gothic dark wave syntezátorové linky s rovným techno beatem a temnou klubovou atmosférou.",
        "perf-38": "Krakovský producent tvrdého industriálního techna s drtivými kopáky v tempu 150 BPM a nekompromisní energií skladištních parties.",
        "perf-39": "Bruselský acidový live projekt ženoucí dva syntezátory TB-303 do závratných rychlostí doplněných živým sekvencováním perkusí.",
        "perf-40": "Český chilloutový producent vytvářející uklidňující downtempo zvukové plochy s akustickou kytarou a zvuky mořských vln.",
        "perf-41": "Jihočeské folkově-indie těleso s akustickými nástroji, houslemi, kontrabasem a poetickým textařským rukopisem.",
        "perf-42": "Bratislavská chamber popová skupina využívající smyčcový orchestr, koncertní křídlo a intimní akustické melodie.",
        "perf-43": "Manchesterské psychedelické kvarteto s táhlými varhanními pasážemi, fuzzovými sóly a hypnotickým motorik rytmem.",
        "perf-44": "Kolínská dream indie kapela propojující kytarový reverb s melancholickými syntezátorovými vrstvami a přemýšlivými texty.",
        "perf-45": "Pražský art popový projekt experimentující s nekonvenčními písňovými strukturami, bohatou elektroakustikou a vrstvenými vokály.",
        "perf-46": "Milánský indie funkový orchestr nabízející chytlavé kytarové doprovody, živou dechovou sekci a neodolatelné basové linky.",
        "perf-47": "Göteborská space rocková jednotka s kosmickými syntezátory, krautrockovým drivem a dalekosáhlými zvukovými výpravami.",
        "perf-48": "Dance punkové kvarteto z Leedsu spojující syrovost post-punku se zběsilým tanečním čtyřdobým disko beatem.",
        "perf-49": "Kodaňská hvězda elektropopu s virálními syntezátorovými melodiemi, masivními dropy a velkolepou vizuální pódiovou show.",
        "perf-50": "Pražské orchestrální těleso spojující osmičlenný smyčcový ansámbl s monumentální modulární elektronikou pro velkolepé finále festivalu.",
        "perf-51": "Český zvukový výzkumník představující prostorové binaurální nahrávky hvozdů starých českých lesů přetavené do ambientní hudby.",
        "perf-52": "Štýrskohradecký skladatel deep ambientu modelující rozsáhlé dozvukové prostory pomocí modulárních reverbových jednotek.",
        "perf-53": "Polský zvukový umělec pracující s historickými kotoučovými magnetofony, páskovou saturací a melancholickým praskáním.",
        "perf-54": "Berlínský producent precizního micro techna tvořící delikátní rytmické textury s chirurgickým zvukovým designem a dubovými echami.",
        "perf-55": "Pražský producent progresivní klubové hudby proplétající hypnotické basové linky s klenutými melodickými arpeggii.",
        "perf-56": "Telavivský inovátor spojující psychedelické syntezátorové vyhrávky s valivým kmenovým rytmem a neúprosným tanečním tahem.",
        "perf-57": "Římské melodické techno duo tvořící emotivně nabité akordy nad leštěným, energickým klubovým rytmem.",
        "perf-58": "Londýnský sound system selektor objevující netradiční halftime basovou hudbu, dubové ozvěny a experimentální hloubky.",
        "perf-59": "Amsterodamský trance techno specialista přinášející povznášející euforická arpeggia, krystalické perkuse a gradující momenty.",
        "perf-60": "Průkopník českého downtempa odehrávající oficiální festivalový ranní set při východu slunce s hřejivými ambientními akordy."
    
    };

    const COUNTRY_NAMES = {
        "CZ": {
                "en": "Czech Republic (CZ)",
                "cs": "Česká republika (CZ)"
        },
        "SK": {
                "en": "Slovakia (SK)",
                "cs": "Slovensko (SK)"
        },
        "SE": {
                "en": "Sweden (SE)",
                "cs": "Švédsko (SE)"
        },
        "AT": {
                "en": "Austria (AT)",
                "cs": "Rakousko (AT)"
        },
        "UK": {
                "en": "United Kingdom (UK)",
                "cs": "Velká Británie (UK)"
        },
        "DE": {
                "en": "Germany (DE)",
                "cs": "Německo (DE)"
        },
        "FR": {
                "en": "France (FR)",
                "cs": "Francie (FR)"
        },
        "PL": {
                "en": "Poland (PL)",
                "cs": "Polsko (PL)"
        },
        "HU": {
                "en": "Hungary (HU)",
                "cs": "Maďarsko (HU)"
        },
        "NL": {
                "en": "Netherlands (NL)",
                "cs": "Nizozemsko (NL)"
        },
        "ES": {
                "en": "Spain (ES)",
                "cs": "Španělsko (ES)"
        },
        "IT": {
                "en": "Italy (IT)",
                "cs": "Itálie (IT)"
        },
        "DK": {
                "en": "Denmark (DK)",
                "cs": "Dánsko (DK)"
        },
        "IL": {
                "en": "Israel (IL)",
                "cs": "Izrael (IL)"
        },
        "BE": {
                "en": "Belgium (BE)",
                "cs": "Belgie (BE)"
        }
};
    const DAY_MAP = {
        "Friday, July 10": {
                "en": "Friday, July 10, 2026 (Day 1)",
                "cs": "Pátek 10. července 2026 (1. den)",
                "key": "day1"
        },
        "Saturday, July 11": {
                "en": "Saturday, July 11, 2026 (Day 2)",
                "cs": "Sobota 11. července 2026 (2. den)",
                "key": "day2"
        },
        "Sunday, July 12": {
                "en": "Sunday, July 12, 2026 (Day 3)",
                "cs": "Neděle 12. července 2026 (3. den)",
                "key": "day3"
        }
};
    const STAGE_MAP = {
        "Solar Horizon Stage": {
                "id": "stage-solar",
                "en": "Solar Horizon Stage (Open-air Amphitheater)",
                "cs": "Solar Horizon Stage (Přírodní otevřený amfiteátr)"
        },
        "Lunar Forest Dome": {
                "id": "stage-lunar",
                "en": "Lunar Forest Dome (Covered Dome – Rain Shelter)",
                "cs": "Lunar Forest Dome (Krytá kupole – úkryt před deštěm)"
        }
};

    const ARTISTS_CATALOG = [
        {
                "id": "perf-01",
                "name": "Echoes of Light",
                "genre": "Post-Rock / Ambient",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "14:00 – 14:45",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-02",
                "name": "Velvet Morning",
                "genre": "Dream Pop",
                "origin": "SK",
                "day": "Friday, July 10",
                "time": "15:00 – 15:45",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-03",
                "name": "Nordic Wave",
                "genre": "Indie Rock",
                "origin": "SE",
                "day": "Friday, July 10",
                "time": "16:00 – 16:50",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-04",
                "name": "The Daylight Project",
                "genre": "Indie Pop",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "17:05 – 17:55",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-05",
                "name": "Prague Synth Collective",
                "genre": "Synthpop",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "18:15 – 19:05",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-06",
                "name": "Electric Meadow",
                "genre": "Electro-Folk",
                "origin": "AT",
                "day": "Friday, July 10",
                "time": "19:25 – 20:20",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-07",
                "name": "Mirage Horizon",
                "genre": "Alternative Rock",
                "origin": "UK",
                "day": "Friday, July 10",
                "time": "20:40 – 21:40",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-08",
                "name": "Solar Flare",
                "genre": "Nu-Disco / Funk",
                "origin": "DE",
                "day": "Friday, July 10",
                "time": "22:00 – 23:10",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-09",
                "name": "Starlight Odyssey",
                "genre": "Electronic Indie",
                "origin": "FR",
                "day": "Friday, July 10",
                "time": "23:30 – 00:45",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-10",
                "name": "Midnight Pulse",
                "genre": "Electro Rock",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "01:00 – 02:00",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-11",
                "name": "Subtle Resonances",
                "genre": "Modular Ambient",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "15:00 – 15:50",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-12",
                "name": "Binary Fields",
                "genre": "IDM / Glitch",
                "origin": "PL",
                "day": "Friday, July 10",
                "time": "16:05 – 17:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-13",
                "name": "Deep Texture",
                "genre": "Dub Techno",
                "origin": "DE",
                "day": "Friday, July 10",
                "time": "17:15 – 18:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-14",
                "name": "Oscillator Shift",
                "genre": "Minimal Techno",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "18:30 – 19:30",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-15",
                "name": "Echo Chamber",
                "genre": "Dark Ambient",
                "origin": "SK",
                "day": "Friday, July 10",
                "time": "19:45 – 20:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-16",
                "name": "Krypton DJ",
                "genre": "Hypnotic Techno",
                "origin": "HU",
                "day": "Friday, July 10",
                "time": "21:00 – 22:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-17",
                "name": "Modular Horizon",
                "genre": "Live Hardware Techno",
                "origin": "DE",
                "day": "Friday, July 10",
                "time": "22:30 – 23:50",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-18",
                "name": "Analog Void",
                "genre": "Industrial Techno",
                "origin": "NL",
                "day": "Friday, July 10",
                "time": "00:05 – 01:25",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-19",
                "name": "Frequency 404",
                "genre": "Raw Acid Techno",
                "origin": "UK",
                "day": "Friday, July 10",
                "time": "01:40 – 03:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-20",
                "name": "Dawn Ritual",
                "genre": "Atmospheric Ambient",
                "origin": "CZ",
                "day": "Friday, July 10",
                "time": "03:10 – 04:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-21",
                "name": "Sunburst Trio",
                "genre": "Acoustic Indie",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "13:30 – 14:15",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-22",
                "name": "Coastline Drift",
                "genre": "Surf Rock",
                "origin": "ES",
                "day": "Saturday, July 11",
                "time": "14:30 – 15:15",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-23",
                "name": "The Urban Poets",
                "genre": "Indie Soul",
                "origin": "UK",
                "day": "Saturday, July 11",
                "time": "15:30 – 16:20",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-24",
                "name": "Neon Youth",
                "genre": "Indie Pop",
                "origin": "SK",
                "day": "Saturday, July 11",
                "time": "16:35 – 17:25",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-25",
                "name": "Silver Tides",
                "genre": "Shoegaze",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "17:45 – 18:40",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-26",
                "name": "Horizon Glow",
                "genre": "Electronic Pop",
                "origin": "SE",
                "day": "Saturday, July 11",
                "time": "19:00 – 20:00",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-27",
                "name": "Wild Horizon",
                "genre": "Post-Punk Revival",
                "origin": "DE",
                "day": "Saturday, July 11",
                "time": "20:20 – 21:20",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-28",
                "name": "Magnetic River",
                "genre": "Indie Dance",
                "origin": "FR",
                "day": "Saturday, July 11",
                "time": "21:40 – 22:50",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-29",
                "name": "Vortex Motion",
                "genre": "Nu-Electro",
                "origin": "UK",
                "day": "Saturday, July 11",
                "time": "23:10 – 00:25",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-30",
                "name": "Aura Soundsystem",
                "genre": "Progressive Dance",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "00:45 – 02:00",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-31",
                "name": "Dronescape",
                "genre": "Drone Music",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "14:30 – 15:20",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-32",
                "name": "Glitch Garden",
                "genre": "Microhouse",
                "origin": "AT",
                "day": "Saturday, July 11",
                "time": "15:35 – 16:30",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-33",
                "name": "Forest Whispers",
                "genre": "Organic House",
                "origin": "SK",
                "day": "Saturday, July 11",
                "time": "16:45 – 17:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-34",
                "name": "Low Frequency Unit",
                "genre": "Deep Dubstep",
                "origin": "UK",
                "day": "Saturday, July 11",
                "time": "18:00 – 19:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-35",
                "name": "Monolith Audio",
                "genre": "Peak Time Techno",
                "origin": "DE",
                "day": "Saturday, July 11",
                "time": "19:15 – 20:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-36",
                "name": "Sine Wave Syndicate",
                "genre": "Electro Techno",
                "origin": "FR",
                "day": "Saturday, July 11",
                "time": "20:30 – 21:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-37",
                "name": "Shadowplay DJ",
                "genre": "Dark Wave Techno",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "22:00 – 23:20",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-38",
                "name": "Circuit Overload",
                "genre": "Hard Techno",
                "origin": "PL",
                "day": "Saturday, July 11",
                "time": "23:35 – 00:55",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-39",
                "name": "Neural Network Live",
                "genre": "Acid Techno",
                "origin": "BE",
                "day": "Saturday, July 11",
                "time": "01:10 – 02:30",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-40",
                "name": "Solar Wind",
                "genre": "Chillout Ambient",
                "origin": "CZ",
                "day": "Saturday, July 11",
                "time": "02:40 – 04:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-41",
                "name": "Morning Breeze",
                "genre": "Folk Indie",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "13:00 – 13:45",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-42",
                "name": "Silent Pines",
                "genre": "Chamber Pop",
                "origin": "SK",
                "day": "Sunday, July 12",
                "time": "14:00 – 14:45",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-43",
                "name": "Sunken Ship",
                "genre": "Psych Rock",
                "origin": "UK",
                "day": "Sunday, July 12",
                "time": "15:00 – 15:50",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-44",
                "name": "Amber Boulevard",
                "genre": "Dream Indie",
                "origin": "DE",
                "day": "Sunday, July 12",
                "time": "16:05 – 16:55",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-45",
                "name": "Urban Echo",
                "genre": "Art Pop",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "17:15 – 18:10",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-46",
                "name": "Luminous Band",
                "genre": "Indie Funk",
                "origin": "IT",
                "day": "Sunday, July 12",
                "time": "18:30 – 19:30",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-47",
                "name": "The Velvet Trails",
                "genre": "Space Rock",
                "origin": "SE",
                "day": "Sunday, July 12",
                "time": "19:50 – 20:50",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-48",
                "name": "Prismatics",
                "genre": "Dance Punk",
                "origin": "UK",
                "day": "Sunday, July 12",
                "time": "21:10 – 22:15",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-49",
                "name": "Starlight Runners",
                "genre": "Electropop Headliner",
                "origin": "DK",
                "day": "Sunday, July 12",
                "time": "22:35 – 23:55",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-50",
                "name": "Final Cascade",
                "genre": "Orchestral Electronic",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "00:10 – 01:15",
                "stage": "Solar Horizon Stage"
        },
        {
                "id": "perf-51",
                "name": "Static Drift",
                "genre": "Field Recording / Ambient",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "14:00 – 14:50",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-52",
                "name": "Resonance Space",
                "genre": "Deep Ambient",
                "origin": "AT",
                "day": "Sunday, July 12",
                "time": "15:05 – 16:00",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-53",
                "name": "Tape Loop Experiment",
                "genre": "Tape Ambient",
                "origin": "PL",
                "day": "Sunday, July 12",
                "time": "16:15 – 17:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-54",
                "name": "Minimal Horizon",
                "genre": "Micro Techno",
                "origin": "DE",
                "day": "Sunday, July 12",
                "time": "17:30 – 18:30",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-55",
                "name": "Dark Matter",
                "genre": "Deep Progressive",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "18:45 – 19:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-56",
                "name": "Hyperspace DJ",
                "genre": "Psy Techno",
                "origin": "IL",
                "day": "Sunday, July 12",
                "time": "20:00 – 21:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-57",
                "name": "Galactic Orbit",
                "genre": "Melodic Techno",
                "origin": "IT",
                "day": "Sunday, July 12",
                "time": "21:30 – 22:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-58",
                "name": "Bass Distortion",
                "genre": "Leftfield Bass",
                "origin": "UK",
                "day": "Sunday, July 12",
                "time": "23:00 – 00:15",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-59",
                "name": "Cosmic Pulse",
                "genre": "Uplifting Trance Techno",
                "origin": "NL",
                "day": "Sunday, July 12",
                "time": "00:30 – 01:45",
                "stage": "Lunar Forest Dome"
        },
        {
                "id": "perf-60",
                "name": "Equinox Farewell",
                "genre": "Down-tempo Ambient",
                "origin": "CZ",
                "day": "Sunday, July 12",
                "time": "02:00 – 03:00",
                "stage": "Lunar Forest Dome"
        }
];

    function getActiveLang() {
        if (typeof window.getFestivalLang === 'function') {
            return window.getFestivalLang();
        }
        try {
            return localStorage.getItem('festival_language') || 'en';
        } catch (e) {
            return 'en';
        }
    }

    function getFavorites() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
            window.dispatchEvent(new CustomEvent('favoritesUpdated'));
            if (typeof window.updateNavBadge === 'function') {
                window.updateNavBadge();
            }
        } catch (e) {
            console.error('LocalStorage write failed:', e);
        }
    }

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        let id = params.get('id');
        let from = params.get('from') || '';

        if (!id && window.location.hash) {
            id = window.location.hash.replace('#', '');
        }

        if (!id || !ARTISTS_CATALOG.some(a => a.id === id)) {
            id = 'perf-01';
        }

        return { id, from };
    }

    function renderArtistDetail() {
        const { id, from } = getQueryParams();
        const artist = ARTISTS_CATALOG.find(a => a.id === id) || ARTISTS_CATALOG[0];
        const lang = getActiveLang();
        const isCs = lang === 'cs';

        // Update page title
        document.title = `${artist.name} | Festival of Darkness 2`;

        // 1. Breadcrumbs & Return Navigation
        const breadcrumbsEl = document.getElementById('detail-breadcrumbs');
        const backBtnEl = document.getElementById('detail-back-btn');
        const backLabelEl = document.getElementById('detail-back-label');

        let originName = isCs ? 'Program' : 'Program';
        let originUrl = `program.html#${artist.id}`;
        let backText = isCs ? '[ ← Zpět do Programu ]' : '[ ← Back to Program ]';
        let originIcon = '📅';

        if (from === 'artists') {
            originName = isCs ? 'Účinkující' : 'Artists';
            originUrl = `artists.html#${artist.id}`;
            backText = isCs ? '[ ← Zpět k Účinkujícím ]' : '[ ← Back to Artists ]';
            originIcon = '🎤';
        } else if (from === 'myschedule') {
            originName = isCs ? 'Můj program' : 'My Schedule';
            originUrl = `my-schedule.html#${artist.id}`;
            backText = isCs ? '[ ← Zpět do Mého plánu ]' : '[ ← Back to My Schedule ]';
            originIcon = '★';
        }

        if (breadcrumbsEl) {
            breadcrumbsEl.innerHTML = `
                <a href="index.html" data-i18n="nav_home">${isCs ? '🏠 [ Úvod ]' : '🏠 [ Home ]'}</a>
                <span class="sep">&gt;</span>
                <a href="${originUrl}">${originIcon} [ ${originName} ]</a>
                <span class="sep">&gt;</span>
                <span class="current"><strong>[ ${artist.name} ]</strong></span>
            `;
        }

        if (backBtnEl) {
            backBtnEl.href = originUrl;
        }
        if (backLabelEl) {
            backLabelEl.textContent = backText;
        }

        // 2. Favorite State
        const favs = getFavorites();
        const isFav = favs.some(f => f.id === artist.id);

        const countryObj = COUNTRY_NAMES[artist.origin] || { en: artist.origin, cs: artist.origin };
        const countryText = isCs ? countryObj.cs : countryObj.en;

        const dayObj = DAY_MAP[artist.day] || { en: artist.day, cs: artist.day, key: 'day1' };
        const dayText = isCs ? dayObj.cs : dayObj.en;

        const stageObj = STAGE_MAP[artist.stage] || { id: 'stage-solar', en: artist.stage, cs: artist.stage };
        const stageText = isCs ? stageObj.cs : stageObj.en;
        const stageId = stageObj.id;

        const bio = isCs ? (ARTIST_BIOS_CS[artist.id] || ARTIST_BIOS_EN[artist.id]) : (ARTIST_BIOS_EN[artist.id] || '');

        const favBtnText = isFav 
            ? (isCs ? '★ Uloženo v mém programu' : '★ Saved in My Schedule') 
            : (isCs ? '☆ Přidat do mého programu' : '☆ Add to My Schedule');
        const favBtnStyle = isFav ? 'background: #28a745; color: #fff; border-color: #1e7e34;' : 'background: #eee; color: #000; border-color: #333;';

        const stageSpecsText = stageId === 'stage-lunar'
            ? (isCs 
                ? 'Geodetická krytá kupole s kapacitou 1 800 návštěvníků. Kompletně zastřešená a odolná proti dešti. Vybavena prostorovým zvukovým systémem a 360° projekcí pro pohlcující audiovizuální show.'
                : 'Geodesic covered dome with a capacity of 1,800 visitors. Completely sheltered and rainproof. Features immersive surround audio and 360-degree light projections for experimental performances.')
            : (isCs
                ? 'Přírodní otevřený amfiteátr s kapacitou 4 500 návštěvníků. Centrální scéna pro živé kapely s mohutným ozvučením line-array a panoramatickým výhledem na historické panorama Kutné Hory.'
                : 'Natural open-air amphitheater with a capacity of 4,500 visitors. Central festival stage for live bands with powerful line-array sound and panoramic views of historic Kutna Hora.');

        // 3. Render Profile Container
        const container = document.getElementById('artist-profile-content');
        if (!container) return;

        container.innerHTML = `
            <!-- Main Profile Header -->
            <section class="wf-box">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h2 style="font-size: 1.55rem; margin-bottom: 6px;">[ ${artist.name} (${artist.origin}) ]</h2>
                        <p class="artist-detail-meta-text" style="color: #111; font-size: 0.95rem;">
                            <strong>${isCs ? 'Žánr:' : 'Genre:'}</strong> ${artist.genre} | 
                            <strong>${isCs ? 'Původ:' : 'Origin:'}</strong> ${countryText}
                        </p>
                    </div>
                    <div>
                        <button id="profile-star-btn" class="btn-box" type="button" style="font-size: 0.95rem; font-weight: bold; padding: 6px 14px; cursor: pointer; ${favBtnStyle}">
                            ${favBtnText}
                        </button>
                    </div>
                </div>

                <hr>

                <!-- Performance Schedule Highlight Box -->
                <div class="artist-detail-meta-grid">
                    <div>
                        <strong>${isCs ? '📅 Den vystoupení:' : '📅 Performance Day:'}</strong><br>
                        ${dayText}
                    </div>
                    <div>
                        <strong>${isCs ? '⏰ Časový slot:' : '⏰ Time Slot:'}</strong><br>
                        ${artist.time}
                    </div>
                    <div>
                        <strong>${isCs ? '⛺ Festivalová scéna:' : '⛺ Stage:'}</strong><br>
                        <a href="stages.html#${stageId}" class="stage-link" style="color: #111; font-weight: bold; text-decoration: underline;" title="${isCs ? 'Zobrazit informace o scéně' : 'View Stage Details'}">
                            ${stageText} &rarr;
                        </a>
                    </div>
                </div>

                <!-- 2-Column Wireframe Body -->
                <div class="artist-detail-columns">
                    <!-- Left: Media & Audio Wireframe -->
                    <div class="artist-detail-media-col">
                        <div class="wf-box-sub" style="height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 12px; background: #fafafa; border: 1px solid #777;">
                            <div style="font-size: 2rem; margin-bottom: 6px;">📷</div>
                            <span style="font-size: 0.85rem; color: #555;">
                                ${isCs ? `[ Oficiální festivalová fotografie:<br><strong>${artist.name}</strong> ]` : `[ Official Press Kit Photo:<br><strong>${artist.name}</strong> ]`}
                            </span>
                        </div>

                        <!-- Audio Sample Box -->
                        <div class="audio-preview-box">
                            <h4 style="font-size: 0.9rem; margin-bottom: 6px;">[ ${isCs ? '♫ Zvuková ukázka tvorby' : '♫ Audio Sample Preview'} ]</h4>
                            <p style="font-size: 0.78rem; color: #555; margin-bottom: 6px;">
                                <em>${artist.name} – Live Session (4:18)</em>
                            </p>
                            <div class="audio-player-wireframe">
                                <button type="button" id="preview-play-btn" class="btn-box" style="font-size: 0.8rem; padding: 4px 8px; font-weight: bold;">
                                    [ ▶ ${isCs ? 'Přehrát' : 'Play'} ]
                                </button>
                                <div class="audio-progress-bar">
                                    <div class="audio-progress-fill"></div>
                                </div>
                                <span style="font-size: 0.75rem; font-family: monospace;">01:38 / 04:18</span>
                            </div>
                            <p style="font-size: 0.76rem; color: #666; margin-top: 8px;">
                                ${isCs ? 'Odkazy na diskografii: Bandcamp • Spotify • Soundcloud' : 'Discography streaming: Bandcamp • Spotify • Soundcloud'}
                            </p>
                        </div>
                    </div>

                    <!-- Right: Biography & Stage Specs -->
                    <div class="artist-detail-content-col">
                        <h3 style="font-size: 1.15rem; margin-bottom: 8px;">[ ${isCs ? 'Biografie a hudební profil' : 'Biography & Musical Profile'} ]</h3>
                        <p class="artist-detail-bio-text" style="font-size: 0.95rem; line-height: 1.6; color: #050505; margin-bottom: 14px;">
                            ${bio}
                        </p>

                        <hr>

                        <h4 style="font-size: 1.02rem; margin: 12px 0 6px;">[ ${isCs ? 'Technické informace & specifikace scény' : 'Stage Environment & Technical Specs'} ]</h4>
                        <p class="artist-detail-stage-text" style="font-size: 0.88rem; line-height: 1.5; color: #111; margin-bottom: 14px;">
                            ${stageSpecsText}
                        </p>

                        <hr>

                        <!-- Action Buttons -->
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;">
                            <a href="program.html#${artist.id}" class="btn-box" style="font-weight: bold;">
                                ${isCs ? '[ 📅 Zobrazit v harmonogramu → ]' : '[ 📅 View in Timetable → ]'}
                            </a>
                            <a href="stages.html#${stageId}" class="btn-box">
                                ${isCs ? '[ ⛺ Detaily scény → ]' : '[ ⛺ Stage Details → ]'}
                            </a>
                            <a href="my-schedule.html#${artist.id}" class="btn-box">
                                ${isCs ? '[ ★ Přejít do Mého plánu → ]' : '[ ★ Go to My Schedule → ]'}
                            </a>
                            <a href="${originUrl}" class="btn-box" style="margin-left: auto; background: #222; color: #fff; font-weight: bold;">
                                ${backText}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Artist Quick Selector Dropdown -->
            <section class="wf-box" style="margin-top: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong>${isCs ? '[ Přejít na jiného ze 60 interpretů: ]' : '[ Jump to Another of the 60 Performers: ]'}</strong>
                    </div>
                    <div style="flex: 1; min-width: 220px; max-width: 400px;">
                        <select id="artist-quick-select" class="input-box" style="width: 100%; padding: 5px 8px; font-size: 0.88rem;">
                            ${ARTISTS_CATALOG.map(a => `
                                <option value="${a.id}" ${a.id === artist.id ? 'selected' : ''}>
                                    ${a.name} (${a.origin}) – ${a.genre}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </section>
        `;

        // Attach Star toggle listener
        const starBtn = document.getElementById('profile-star-btn');
        if (starBtn) {
            starBtn.addEventListener('click', () => {
                const currentFavs = getFavorites();
                const idx = currentFavs.findIndex(f => f.id === artist.id);
                if (idx > -1) {
                    currentFavs.splice(idx, 1);
                } else {
                    currentFavs.push({
                        id: artist.id,
                        artist: artist.name,
                        stage: artist.stage,
                        day: artist.day,
                        time: artist.time,
                        genre: artist.genre
                    });
                }
                saveFavorites(currentFavs);
                renderArtistDetail();
            });
        }

        // Attach Quick Select listener
        const selectEl = document.getElementById('artist-quick-select');
        if (selectEl) {
            selectEl.addEventListener('change', (e) => {
                const newId = e.target.value;
                const newUrl = `artist-detail.html?id=${newId}&from=${encodeURIComponent(from)}#${newId}`;
                window.location.href = newUrl;
            });
        }

        // Attach Audio Preview button
        const audioBtn = document.getElementById('preview-play-btn');
        if (audioBtn) {
            let isPlaying = false;
            audioBtn.addEventListener('click', () => {
                isPlaying = !isPlaying;
                audioBtn.textContent = isPlaying 
                    ? (isCs ? '[ ❚❚ Pozastavit ]' : '[ ❚❚ Pause ]')
                    : (isCs ? '[ ▶ Přehrát ]' : '[ ▶ Play ]');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderArtistDetail();
    });

    window.addEventListener('languageChanged', () => {
        renderArtistDetail();
    });

    window.addEventListener('popstate', () => {
        renderArtistDetail();
    });

})();
