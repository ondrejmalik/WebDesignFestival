// js/search.js - Interactive Lineup, Timetable & Practical Info Search Engine
// Supports URL ?q= parameters, quick-filter pills, live filtering, and bilingual switching.
(function() {
    'use strict';

    // Comprehensive catalog of 60 festival performers
    const PERFORMERS_DATA = [
        { id: "perf-01", name: "Echoes of Silence", genre: "Atmospheric Post-Rock", origin: "CZ", stage: "Solar Horizon Stage", day: "Friday", time: "13:00 – 14:00", bioEn: "Atmospheric post-rock ensemble from Prague combining sweeping cinematic crescendos with ambient soundscapes.", bioCs: "Atmosférická post-rocková formace z Prahy kombinující filmové gradace a kytarové delaye." },
        { id: "perf-02", name: "Velvet Mirage", genre: "Dream Pop", origin: "SK", stage: "Solar Horizon Stage", day: "Friday", time: "14:15 – 15:15", bioEn: "Bratislava dream pop four-piece known for shimmering jangle guitars and ethereal vocal harmonies.", bioCs: "Bratislavská dream popová čtveřice známá třpytivými kytarami a éterickými vokálními harmoniemi." },
        { id: "perf-03", name: "Northern Lights", genre: "Indie Rock", origin: "SE", stage: "Solar Horizon Stage", day: "Friday", time: "15:30 – 16:30", bioEn: "Stockholm indie rock quintet delivering driving rhythm sections and anthemic choruses.", bioCs: "Stockholmský indie rockový kvintet přinášející hymnické refrény ovlivněné alternativním rockem 90. let." },
        { id: "perf-04", name: "Prague Sunset", genre: "Indie Pop", origin: "CZ", stage: "Solar Horizon Stage", day: "Friday", time: "16:45 – 17:45", bioEn: "Energetic Czech indie pop collective blending sparkling synth hooks with acoustic grooves.", bioCs: "Energický český indie popový kolektiv propojující chytlavé syntezátorové melodie s akustickými rytmy." },
        { id: "perf-05", name: "Analog Dreams", genre: "Synthpop", origin: "CZ", stage: "Solar Horizon Stage", day: "Friday", time: "18:00 – 19:00", bioEn: "Vintage synthesizer aficionados crafting warm analogue synthpop driven by Roland Juno pulses.", bioCs: "Milovníci analogových syntezátorů tvořící hřejivý synthpop poháněný pulzy Roland Juno." },
        { id: "perf-06", name: "Alpine Echo", genre: "Electronic Folk", origin: "AT", stage: "Solar Horizon Stage", day: "Friday", time: "19:15 – 20:30", bioEn: "Viennese duo fusing traditional Alpine acoustic instruments with contemporary electronic beats.", bioCs: "Vídeňské duo propojující tradiční alpské akustické nástroje s moderními elektronickými beaty." },
        { id: "perf-07", name: "Shadows of Grey", genre: "Alternative Rock", origin: "UK", stage: "Solar Horizon Stage", day: "Friday", time: "20:45 – 21:45", bioEn: "British four-piece playing gritty, guitar-driven alternative rock with soaring hooks.", bioCs: "Britská čtveřice hrající syrový kytarový alternativní rock s výraznými melodickými linkami." },
        { id: "perf-08", name: "Neon Horizon", genre: "Nu-Disco / Funk", origin: "DE", stage: "Solar Horizon Stage", day: "Friday", time: "22:00 – 23:15", bioEn: "Berlin production outfit crafting irresistible nu-disco grooves and danceable funk rhythms.", bioCs: "Berlínský producentský projekt tvořící chytlavé nu-disco rytmy s výraznou basovou linkou." },
        { id: "perf-09", name: "Starlight Odyssey", genre: "Electronic Indie", origin: "FR", stage: "Solar Horizon Stage", day: "Friday", time: "23:30 – 00:45", bioEn: "Parisian producer combining cinematic French Touch synths with emotive indie songwriting.", bioCs: "Pařížský producent kombinující filmové syntezátory francouzské vlny s emotivním indie písničkářstvím." },
        { id: "perf-10", name: "Midnight Pulse", genre: "Electro Rock", origin: "CZ", stage: "Solar Horizon Stage", day: "Friday", time: "01:00 – 02:00", bioEn: "High-octane Prague electro rock band blending aggressive guitar distortion with massive dance beats.", bioCs: "Pražská electro rocková formace spojující zkreslené kytary s masivními tanečními beaty." },
        { id: "perf-11", name: "Subtle Resonances", genre: "Modular Ambient", origin: "CZ", stage: "Lunar Forest Dome", day: "Friday", time: "15:00 – 15:50", bioEn: "Modular synthesizer purist performing generative live ambient patches with eurorack systems.", bioCs: "Vyznavač modulárních syntezátorů předvádějící generativní živé ambientní plochy na eurorack systému." },
        { id: "perf-12", name: "Binary Fields", genre: "IDM / Glitch", origin: "PL", stage: "Lunar Forest Dome", day: "Friday", time: "16:05 – 17:00", bioEn: "Warsaw sound designer exploring intricate micro-rhythms and glitch percussion.", bioCs: "Varšavský zvukový designér zkoumající propracované mikrorytmy a hřejivé syntezátory." },
        { id: "perf-13", name: "Deep Texture", genre: "Dub Techno", origin: "DE", stage: "Lunar Forest Dome", day: "Friday", time: "17:15 – 18:15", bioEn: "Berlin underground producer crafting cavernous dub techno soundscapes with echoing chord stabs.", bioCs: "Berlínský undergroundový producent tvořící monumentální dub techno zvukové krajiny s ozvěnami akordů." },
        { id: "perf-14", name: "Oscillator Shift", genre: "Minimal Techno", origin: "CZ", stage: "Lunar Forest Dome", day: "Friday", time: "18:30 – 19:30", bioEn: "Brno electronic artist crafting hypnotic minimal techno driven by subtle groove modulations.", bioCs: "Brněnský elektronický tvůrce produkující hypnotické minimalistické techno s jemnými modulacemi." },
        { id: "perf-15", name: "Echo Chamber", genre: "Dark Ambient", origin: "SK", stage: "Lunar Forest Dome", day: "Friday", time: "19:45 – 20:45", bioEn: "Slovak dark ambient composer building immersive acoustic drones and field recordings.", bioCs: "Slovenský dark ambientní skladatel vytvářející pohlcující drony a klášterní terénní nahrávky." },
        { id: "perf-16", name: "Phase Shift", genre: "Deep Techno", origin: "HU", stage: "Lunar Forest Dome", day: "Friday", time: "21:00 – 22:15", bioEn: "Budapest club staple delivering relentless, hypnotic deep techno sets built around rolling basslines.", bioCs: "Stálice budapešťské klubové scény přinášející nekompromisní hypnotické deep techno sety." },
        { id: "perf-17", name: "Circuit Breaker", genre: "Hardware Live Techno", origin: "CZ", stage: "Lunar Forest Dome", day: "Friday", time: "22:30 – 23:45", bioEn: "Live electronic act using drum machines and hardware synthesizers to construct raw peak-time techno.", bioCs: "Živé elektronické vystoupení s bicími automaty a syntezátory bez použití počítače." },
        { id: "perf-18", name: "Sub-Zero", genre: "Industrial Techno", origin: "NL", stage: "Lunar Forest Dome", day: "Friday", time: "00:00 – 01:15", bioEn: "Amsterdam industrial techno heavyweight delivering pulverizing kick drums and metallic percussion.", bioCs: "Amsterodamská těžká váha industriálního techna s drtivými basovými kopy." },
        { id: "perf-19", name: "Acid Rain", genre: "Acid Techno Live", origin: "UK", stage: "Lunar Forest Dome", day: "Friday", time: "01:30 – 02:45", bioEn: "London underground live act pushing Roland TB-303 acid basslines into blistering distortion.", bioCs: "Londýnský undergroundový projekt ženoucí Roland TB-303 acid linky do zkreslených teritorií." },
        { id: "perf-20", name: "Dawn Chorus", genre: "Organic Ambient", origin: "CZ", stage: "Lunar Forest Dome", day: "Friday", time: "03:00 – 04:00", bioEn: "Czech ambient sound artist creating calming dawn soundscapes utilizing singing bowls and nature recordings.", bioCs: "Český ambientní zvukový tvůrce tvořící uklidňující ranní zvukové krajiny s tibetskými mísami." },
        { id: "perf-21", name: "Solar Wind", genre: "Acoustic Indie", origin: "CZ", stage: "Solar Horizon Stage", day: "Saturday", time: "13:00 – 14:00", bioEn: "Prague acoustic indie trio crafting delicate vocal harmonies and fingerpicked acoustic guitars.", bioCs: "Pražské akustické indie trio tvořící jemné vokální harmonie a vybrnkávané kytary." },
        { id: "perf-22", name: "Coastal Waves", genre: "Surf Rock", origin: "ES", stage: "Solar Horizon Stage", day: "Saturday", time: "14:15 – 15:15", bioEn: "Valencia-based surf rock outfit delivering reverb-drenched guitar lines and driving drum beats.", bioCs: "Surf rocková skupina z Valencie s reverbem nasáklými kytarami a středomořskou energií." },
        { id: "perf-23", name: "Urban Bloom", genre: "Soulful Indie", origin: "UK", stage: "Solar Horizon Stage", day: "Saturday", time: "15:30 – 16:30", bioEn: "London soulful indie collective blending warm Rhodes piano chords with passionate soul vocals.", bioCs: "Londýnský soulový indie kolektiv mísící hřejivé piano Rhodes s procítěným vokálem." },
        { id: "perf-24", name: "Crystal Skies", genre: "Melodic Indie Pop", origin: "SK", stage: "Solar Horizon Stage", day: "Saturday", time: "16:45 – 17:30", bioEn: "Bratislava indie pop quartet producing bright melodic synth lines and danceable drum rhythms.", bioCs: "Bratislavské indie popové kvarteto s jasnými melodickými linkami a tanečními rytmy." },
        { id: "perf-25", name: "Silver Tides", genre: "Shoegaze", origin: "CZ", stage: "Solar Horizon Stage", day: "Saturday", time: "17:45 – 18:40", bioEn: "Atmospheric shoegaze band from Brno submerging driving melodies underneath dense walls of fuzz.", bioCs: "Brněnská shoegaze formace nořící melodie pod mohutné kytarové stěny plné reverbu a fuzzu." },
        { id: "perf-26", name: "Horizon Glow", genre: "Electronic Pop", origin: "SE", stage: "Solar Horizon Stage", day: "Saturday", time: "19:00 – 20:00", bioEn: "Swedish electronic pop project blending Scandinavian crystalline synthesizer textures with dance-pop.", bioCs: "Švédský elektropopový projekt propojující krystalické severské syntezátory s chytlavou produkcí." },
        { id: "perf-27", name: "Wild Horizon", genre: "Post-Punk Revival", origin: "DE", stage: "Solar Horizon Stage", day: "Saturday", time: "20:20 – 21:20", bioEn: "Hamburg post-punk revivalists featuring driving angular basslines and raw expressive baritone vocals.", bioCs: "Hamburští post-punkoví revivalisté s údernými basovými linkami a barytonovým vokálem." },
        { id: "perf-28", name: "Magnetic River", genre: "Indie Dance", origin: "FR", stage: "Solar Horizon Stage", day: "Saturday", time: "21:40 – 22:50", bioEn: "French indie dance producer crafting upbeat electronic grooves with live bass and disco rhythms.", bioCs: "Francouzský indie dance producent tvořící energické groovy s živou baskytarou a vocoderem." },
        { id: "perf-29", name: "Vortex Motion", genre: "Nu-Electro", origin: "UK", stage: "Solar Horizon Stage", day: "Saturday", time: "23:10 – 00:25", bioEn: "Brighton nu-electro live outfit fusing electroclash energy with modern breaks and sharp synth leads.", bioCs: "Projekt z Brightonu propojující energii electroclashe s moderními beaty a ostrými syntezátory." },
        { id: "perf-30", name: "Aura Soundsystem", genre: "Progressive Dance", origin: "CZ", stage: "Solar Horizon Stage", day: "Saturday", time: "00:45 – 02:00", bioEn: "Czech progressive dance veterans crafting soaring melodic trance synth lines over driving club grooves.", bioCs: "Stálice české klubové scény tvořící povznášející melodické linky nad klubovým rytmem 132 BPM." },
        { id: "perf-31", name: "Dronescape", genre: "Drone Music", origin: "CZ", stage: "Lunar Forest Dome", day: "Saturday", time: "14:30 – 15:20", bioEn: "Czech drone pioneer utilizing layered cello bowings and tape loops to produce meditative drone fields.", bioCs: "Průkopník českého dronu využívající smyčcové vrstvy violoncella a páskové smyčky." },
        { id: "perf-32", name: "Glitch Garden", genre: "Microhouse", origin: "AT", stage: "Lunar Forest Dome", day: "Saturday", time: "15:35 – 16:30", bioEn: "Vienna microhouse producer known for quirky percussion clicks and minimalist sub-bass grooves.", bioCs: "Vídeňský microhouse producent známý hravou perkusivní texturou a minimalistickým basem." },
        { id: "perf-33", name: "Forest Floor", genre: "Organic House", origin: "SK", stage: "Lunar Forest Dome", day: "Saturday", time: "16:45 – 17:45", bioEn: "Slovak organic house collective blending tribal percussion recordings with lush field atmospheres.", bioCs: "Slovenský organic house kolektiv spojující kmenové perkuse s přírodními terénními nahrávkami." },
        { id: "perf-34", name: "Submerged", genre: "Leftfield Bass", origin: "UK", stage: "Lunar Forest Dome", day: "Saturday", time: "18:00 – 19:00", bioEn: "Bristol bass music producer delivering bone-shaking sub-bass frequencies and atmospheric dub echoes.", bioCs: "Bristolský producent basové hudby přinášející hluboké frekvence a ozvěny dubu." },
        { id: "perf-35", name: "Pulse Generator", genre: "Peak Techno", origin: "DE", stage: "Lunar Forest Dome", day: "Saturday", time: "19:15 – 20:30", bioEn: "Frankfurt techno DJ renowned for high-energy peak-time sets with driving 138 BPM percussion.", bioCs: "Frankfurtský techno DJ proslulý energickými sety s úderným rytmem 138 BPM." },
        { id: "perf-36", name: "Modulation", genre: "Electro / Breaks", origin: "FR", stage: "Lunar Forest Dome", day: "Saturday", time: "20:45 – 22:00", bioEn: "Lyon electro producer weaving classic 808 breakbeats with dark acid synth sequences.", bioCs: "Elektronický producent z Lyonu kombinující zlomové beaty 808 s temnými acidovými sekvencemi." },
        { id: "perf-37", name: "Dark Orbit", genre: "Darkwave Techno", origin: "CZ", stage: "Lunar Forest Dome", day: "Saturday", time: "22:15 – 23:30", bioEn: "Prague DJ blending gothic dark wave synth melodies with driving four-to-the-floor techno rhythms.", bioCs: "Pražský projekt mísící gothic dark wave synth melodie s rovným techno rytmem." },
        { id: "perf-38", name: "Terminal Velocity", genre: "Hard Techno", origin: "PL", stage: "Lunar Forest Dome", day: "Saturday", time: "23:45 – 01:00", bioEn: "Krakow hard techno producer delivering punishing 150 BPM industrial kick drums and warehouse energy.", bioCs: "Krakovský hard techno producent přinášející nekompromisní 150 BPM energii." },
        { id: "perf-39", name: "Acid Spectrum", genre: "Acid Core Live", origin: "BE", stage: "Lunar Forest Dome", day: "Saturday", time: "01:15 – 02:30", bioEn: "Brussels live acid outfit driving twin TB-303 synthesizers into hyper-speed sonic territory.", bioCs: "Bruselský živý projekt ženoucí dvojici syntezátorů TB-303 do vysokých rychlostí." },
        { id: "perf-40", name: "Oceanic Stillness", genre: "Ambient Downtempo", origin: "CZ", stage: "Lunar Forest Dome", day: "Saturday", time: "02:45 – 03:45", bioEn: "Czech chillout producer crafting restorative downtempo soundscapes with soft acoustic guitars.", bioCs: "Český tvůrce uklidňujícího downtempa s jemnými akustickými kytarami a oceánskými plochami." },
        { id: "perf-41", name: "Bohemian Woods", genre: "Acoustic Folk Indie", origin: "CZ", stage: "Solar Horizon Stage", day: "Sunday", time: "13:00 – 14:00", bioEn: "South Bohemian folk indie ensemble featuring acoustic instruments, violin, and lyrical storytelling.", bioCs: "Jihočeský folkový indie ansámbl s houslemi, kontrabasem a poetickými texty." },
        { id: "perf-42", name: "Mirage Collective", genre: "Chamber Pop", origin: "SK", stage: "Solar Horizon Stage", day: "Sunday", time: "14:15 – 15:15", bioEn: "Bratislava chamber pop group incorporating orchestral strings, grand piano, and intimate acoustic melodies.", bioCs: "Bratislavská chamber popová skupina spojující smyčcové nástroje a klavír." },
        { id: "perf-43", name: "Sundown Reverie", genre: "Psychedelic Rock", origin: "UK", stage: "Solar Horizon Stage", day: "Sunday", time: "15:30 – 16:30", bioEn: "Manchester psychedelic rock quartet known for sprawling organ passages and motorik rhythms.", bioCs: "Manchesterské psychedelické kvarteto známé varhanními pasážemi a hypnotickým rytmem." },
        { id: "perf-44", name: "Echoing Valleys", genre: "Dream Indie", origin: "DE", stage: "Solar Horizon Stage", day: "Sunday", time: "16:45 – 17:45", bioEn: "Cologne dream indie band pairing lush reverb guitars with melancholic synthesizer layers.", bioCs: "Kolínská kapela spojující bohatý kytarový reverb s melancholickými syntezátory." },
        { id: "perf-45", name: "Radiant Path", genre: "Art Pop", origin: "CZ", stage: "Solar Horizon Stage", day: "Sunday", time: "18:00 – 19:00", bioEn: "Prague art pop project blending avant-garde vocal arrangements with unconventional song structures.", bioCs: "Pražský art popový projekt s avantgardními vokálními aranžemi a bohatou produkcí." },
        { id: "perf-46", name: "Solar Flares", genre: "Indie Funk", origin: "IT", stage: "Solar Horizon Stage", day: "Sunday", time: "19:15 – 20:15", bioEn: "Milan indie funk collective delivering infectious rhythmic guitar strumming and danceable basslines.", bioCs: "Milánský indie funkový kolektiv s energickou kytarou a dechovou sekcí." },
        { id: "perf-47", name: "Cosmic Drift", genre: "Space Rock", origin: "SE", stage: "Solar Horizon Stage", day: "Sunday", time: "20:30 – 21:30", bioEn: "Gothenburg space rock unit crafting cosmic synth textures and expansive sonic journeys.", bioCs: "Space rocková jednotka z Göteborgu tvořící kosmické textury a krautrockovou rytmiku." },
        { id: "perf-48", name: "Electric Shadows", genre: "Dance Punk", origin: "UK", stage: "Solar Horizon Stage", day: "Sunday", time: "21:45 – 22:45", bioEn: "Leeds dance punk quartet combining post-punk bass urgency with frantic disco drum beats.", bioCs: "Kvarteto z Leedsu spojující post-punkovou naléhavost s tanečními diskotékovými beaty." },
        { id: "perf-49", name: "Starlight Runners", genre: "Electropop Headliner", origin: "DK", stage: "Solar Horizon Stage", day: "Sunday", time: "23:00 – 00:30", bioEn: "Copenhagen headlining electropop powerhouse with chart-topping synth hooks and massive drops.", bioCs: "Kodaňská elektro-popová hvězda s chytlavými refrény a velkolepou vizuální show." },
        { id: "perf-50", name: "Final Cascade", genre: "Orchestral Electronic", origin: "CZ", stage: "Solar Horizon Stage", day: "Sunday", time: "00:45 – 02:00", bioEn: "Prague orchestral electronic ensemble pairing classical string section with massive modular beats.", bioCs: "Pražský orchestrální elektronický ansámbl spojující smyčce s modulární elektronikou na závěr festivalu." },
        { id: "perf-51", name: "Static Drift", genre: "Field Recording / Ambient", origin: "CZ", stage: "Lunar Forest Dome", day: "Sunday", time: "14:00 – 14:50", bioEn: "Czech acoustic researcher creating immersive soundscapes built from binaural field recordings.", bioCs: "Český akustický výzkumník vytvářející prostorové nahrávky z dávných českých lesů." },
        { id: "perf-52", name: "Resonance Space", genre: "Deep Ambient", origin: "AT", stage: "Lunar Forest Dome", day: "Sunday", time: "15:05 – 16:00", bioEn: "Graz deep ambient composer utilizing modular reverberation units to sculpt expansive chambers.", bioCs: "Skladatel z Grazu využívající dozvukové jednotky k modelování akustických prostorů." },
        { id: "perf-53", name: "Tape Loop Experiment", genre: "Tape Ambient", origin: "PL", stage: "Lunar Forest Dome", day: "Sunday", time: "16:15 – 17:15", bioEn: "Polish sound artist using vintage reel-to-reel tape decks to create decaying loops and tape saturation.", bioCs: "Polský zvukový umělec pracující s kotoučovými magnetofony a hřejivou saturací." },
        { id: "perf-54", name: "Minimal Horizon", genre: "Micro Techno", origin: "DE", stage: "Lunar Forest Dome", day: "Sunday", time: "17:30 – 18:30", bioEn: "Berlin micro techno producer crafting subtle rhythmic textures with pinpoint sound design.", bioCs: "Berlínský producent precizního mikrotechna s jemnými zvukovými texturami." },
        { id: "perf-55", name: "Dark Matter", genre: "Deep Progressive", origin: "CZ", stage: "Lunar Forest Dome", day: "Sunday", time: "18:45 – 19:45", bioEn: "Prague progressive club producer weaving deep hypnotic basslines with rolling melodic arpeggios.", bioCs: "Pražský klubový tvůrce splétající hypnotické basové linky s atmosférickými plochami." },
        { id: "perf-56", name: "Hyperspace DJ", genre: "Psy Techno", origin: "IL", stage: "Lunar Forest Dome", day: "Sunday", time: "20:00 – 21:15", bioEn: "Tel Aviv psy techno innovator blending rolling hypnotic basslines with sharp psychedelic leads.", bioCs: "Inovátor psy techna z Tel Avivu kombinující hypnotický spodek s psychedelickými vyhrávkami." },
        { id: "perf-57", name: "Sine Waves", genre: "Melodic Techno", origin: "IT", stage: "Lunar Forest Dome", day: "Sunday", time: "21:30 – 22:45", bioEn: "Rome melodic techno duo crafting emotionally charged synthesizer chords over polished rhythms.", bioCs: "Římské melodické techno duo s emotivními syntezátorovými plochami a klubovým drivem." },
        { id: "perf-58", name: "Subterranean", genre: "Halftime Bass", origin: "UK", stage: "Lunar Forest Dome", day: "Sunday", time: "23:00 – 00:15", bioEn: "London sound system selector exploring unconventional halftime bass music and leftfield low-end.", bioCs: "Londýnský sound systémový selektor zkoumající basovou hudbu s hlubokými sub-basy." },
        { id: "perf-59", name: "Celestial Body", genre: "Trance Techno", origin: "NL", stage: "Lunar Forest Dome", day: "Sunday", time: "00:30 – 01:45", bioEn: "Amsterdam trance techno specialist bringing uplifting euphoric arpeggios and soaring climaxes.", bioCs: "Amsterodamská specialistka na trance techno s povznášejícími melodickými vrcholy." },
        { id: "perf-60", name: "Equinox Farewell", genre: "Dawn Ambient", origin: "CZ", stage: "Lunar Forest Dome", day: "Sunday", time: "02:00 – 03:00", bioEn: "Prague downtempo pioneer performing the official festival sunrise farewell set with warm ambient chords.", bioCs: "Pražský ambientní tvůrce provádějící oficiální ranní rozloučení s festivalem za východu slunce." }
    ];

    // Practical & Venue information data
    const PRACTICAL_INFO_DATA = [
        {
            id: "info-shuttle",
            titleEn: "🚆 Shuttle Bus Timetable & Route",
            titleCs: "🚆 Kyvadlová doprava (Shuttle Bus) & Jízdní řád",
            descEn: "Free festival shuttle buses operate continuously between Kutná Hora hl.n. main train station and the festival venue every 15–20 minutes from 11:30 to 04:30.",
            descCs: "Bezplatná festivalová kyvadlová doprava jezdí nepřetržitě mezi nádražím Kutná Hora hl.n. a areálem každých 15–20 minut od 11:30 do 04:30.",
            link: "practical-info.html#kyvadlova-doprava",
            linkTextEn: "[ View Shuttle Timetable → ]",
            linkTextCs: "[ Jízdní řád kyvadlové dopravy → ]",
            keywords: "shuttle bus vlak train stanice nadrazi doprava transit bus kutna hora zastavka transfer"
        },
        {
            id: "info-walking",
            titleEn: "🚶 Walking Route & Map (20 min)",
            titleCs: "🚶 Pěší trasa a orientační mapa (20 min)",
            descEn: "Marked walking trail from Kutná Hora hl.n. train station to the festival gate (1.6 km, approx. 20–25 minutes). Illuminated at night.",
            descCs: "Značená pěší trasa z hlavního nádraží Kutná Hora hl.n. k bráně festivalu (1,6 km, cca 20–25 minut). V noci plně osvětlena.",
            link: "practical-info.html#pesi-trasa",
            linkTextEn: "[ View Walking Map → ]",
            linkTextCs: "[ Zobrazit pěší mapu → ]",
            keywords: "walking pesi trasa mapa route foot walk chodci nadrazi kutna hora cesta"
        },
        {
            id: "info-camping",
            titleEn: "⛺ Tent Camp & Showers",
            titleCs: "⛺ Stanové městečko a zázemí",
            descEn: "Fenced campsite with 24/7 security, hot showers, drinking water, and phone charging lockers. Opens Friday 10:00, closes Monday 12:00.",
            descCs: "Oplocené stanové městečko s nepřetržitou ostrahou 24/7, teplými sprchami, pitnou vodou a dobíjecími skříňkami.",
            link: "practical-info.html#camping",
            linkTextEn: "[ Camping Guidelines → ]",
            linkTextCs: "[ Pravidla kempu → ]",
            keywords: "camping kemp stan stanove mestecko sprchy tent ubytovani hygiene"
        },
        {
            id: "info-cashless",
            titleEn: "💳 Cashless Payment System",
            titleCs: "💳 Bezkontaktní platby (Cashless)",
            descEn: "100% cashless festival wristbands. Top up online before the event or at official top-up booths via debit/credit card or cash. Leftover balance refunded online.",
            descCs: "100% cashless festivalové náramky s čipem. Dobíjení online předem i na místě kartou či hotovostí. Zbylý kredit je vrácen na účet.",
            link: "practical-info.html#cashless",
            linkTextEn: "[ Cashless Details → ]",
            linkTextCs: "[ Detaily o cashless → ]",
            keywords: "cashless cip naramky platby payment card money kredit dobijeni nfc"
        },
        {
            id: "info-solar-stage",
            titleEn: "☀️ Solar Horizon Stage (Open-Air Amphitheater)",
            titleCs: "☀️ Solar Horizon Stage (Přírodní amfiteátr)",
            descEn: "Open-air main stage with 4,500 visitor capacity hosting 30 live headline and band performances, massive LED visual rigs, and natural acoustics.",
            descCs: "Hlavní otevřená scéna s kapacitou 4 500 diváků hostící 30 živých kapelních vystoupení s masivními projekčními LED stěnami.",
            link: "stages.html#stage-solar",
            linkTextEn: "[ Stage Profile & Venue Map → ]",
            linkTextCs: "[ Profil scény & Mapa areálu → ]",
            keywords: "solar horizon stage amfiteatr venkovni open air kapely stage main stage"
        },
        {
            id: "info-lunar-stage",
            titleEn: "🌙 Lunar Forest Dome (Covered Rain Shelter & Electronic Stage)",
            titleCs: "🌙 Lunar Forest Dome (Zastřešená scéna & Úkryt před deštěm)",
            descEn: "Weatherproof geodesic dome with 1,800 capacity. 100% covered rain shelter with continuous techno, ambient, and audiovisual showcases.",
            descCs: "Krytá geodetická kupole za každého počasí s kapacitou 1 800 návštěvníků. 100% úkryt před deštěm s nepřetržitým techno a ambient programem.",
            link: "stages.html#stage-lunar",
            linkTextEn: "[ Stage Profile & Shelter Map → ]",
            linkTextCs: "[ Profil scény & Mapa úkrytu → ]",
            keywords: "lunar forest dome kryty stan shelter dest rain shelter destovy stan kupole geodesic techno dome"
        }
    ];

    function getActiveLanguage() {
        if (typeof window.getFestivalLang === 'function') {
            return window.getFestivalLang();
        }
        return localStorage.getItem('festival_language') || 'en';
    }

    function normalizeStr(str) {
        return (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function initSearchEngine() {
        const input = document.getElementById('global-search-input');
        const form = document.getElementById('search-form');
        const pills = document.querySelectorAll('.search-pill-btn');
        const queryTextSpan = document.getElementById('active-query-text');
        const countSpan = document.getElementById('results-count');
        const performersContainer = document.getElementById('performers-results-container');
        const timetableContainer = document.getElementById('timetable-results-container');
        const infoContainer = document.getElementById('info-results-container');
        const emptyMsg = document.getElementById('search-empty-msg');

        const secPerformers = document.getElementById('results-performers');
        const secTimetable = document.getElementById('results-timetable');
        const secInfo = document.getElementById('results-info');

        if (!input) return;

        // Read initial query from URL search params (?q=...)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const q = urlParams.get('q');
            if (q !== null) {
                input.value = q;
            }
        } catch (e) {}

        function executeSearch(query) {
            const cleanQuery = (query || '').toLowerCase().trim();
            const normQuery = normalizeStr(query).trim();
            const lang = getActiveLanguage();
            const isCs = lang === 'cs';

            if (queryTextSpan) {
                queryTextSpan.textContent = query || (isCs ? 'vše' : 'all');
            }

            // Sync URL query without page reload
            try {
                const newUrl = cleanQuery ? `search.html?q=${encodeURIComponent(cleanQuery)}` : 'search.html';
                window.history.replaceState({}, '', newUrl);
            } catch (e) {}

            // Sync active pill state
            pills.forEach(p => {
                const pQuery = (p.getAttribute('data-query') || '').toLowerCase();
                if (pQuery === cleanQuery || (cleanQuery === '' && pQuery === '')) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });

            // 1. Filter Performers
            const matchedPerformers = PERFORMERS_DATA.filter(p => {
                if (normQuery === '') return true;
                const searchHaystack = [
                    p.id,
                    p.name,
                    p.genre,
                    p.origin,
                    p.stage,
                    p.day,
                    p.bioEn,
                    p.bioCs
                ].join(' ');
                return normalizeStr(searchHaystack).includes(normQuery);
            });

            // 2. Filter Timetable Slots
            const matchedTimetable = PERFORMERS_DATA.filter(p => {
                if (normQuery === '') return true;
                const searchHaystack = [
                    p.name,
                    p.time,
                    p.day,
                    p.stage,
                    p.genre
                ].join(' ');
                return normalizeStr(searchHaystack).includes(normQuery);
            });

            // 3. Filter Practical Info
            const matchedInfo = PRACTICAL_INFO_DATA.filter(info => {
                if (normQuery === '') return true;
                const searchHaystack = [
                    info.titleEn,
                    info.titleCs,
                    info.descEn,
                    info.descCs,
                    info.keywords
                ].join(' ');
                return normalizeStr(searchHaystack).includes(normQuery);
            });

            const totalResults = matchedPerformers.length + (cleanQuery ? matchedTimetable.length : 0) + matchedInfo.length;
            if (countSpan) {
                countSpan.textContent = totalResults;
            }

            // Render Performers
            if (performersContainer && secPerformers) {
                if (matchedPerformers.length > 0) {
                    secPerformers.classList.remove('is-hidden');
                    performersContainer.innerHTML = matchedPerformers.map(p => {
                        const bio = isCs ? p.bioCs : p.bioEn;
                        const viewProfileText = isCs ? '[ Zobrazit profil &rarr; ]' : '[ View Profile &rarr; ]';
                        return `
                            <article class="search-result-item" data-keywords="${p.id} ${p.name.toLowerCase()} ${p.genre.toLowerCase()} ${p.stage.toLowerCase()}">
                                <div class="search-result-row">
                                    <div class="search-result-content">
                                        <h3 class="search-result-title"><strong>${p.name}</strong> <span class="search-result-meta">[ ${p.genre} (${p.origin}) ]</span></h3>
                                        <p class="search-result-desc">${bio}</p>
                                    </div>
                                    <div class="search-result-action">
                                        <a href="artist-detail.html?id=${p.id}&from=search#${p.id}" class="btn-box">${viewProfileText}</a>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('');
                } else {
                    secPerformers.classList.add('is-hidden');
                    performersContainer.innerHTML = '';
                }
            }

            // Render Timetable
            if (timetableContainer && secTimetable) {
                // To keep the view focused, show timetable slots when query is specific or contains time/stage keywords
                const showTimetable = cleanQuery !== '' && matchedTimetable.length > 0;
                if (showTimetable) {
                    secTimetable.classList.remove('is-hidden');
                    const timetableToShow = matchedTimetable.slice(0, 10); // Limit to top 10 relevant timetable slots
                    timetableContainer.innerHTML = timetableToShow.map(p => {
                        const viewGridText = isCs ? '[ Zobrazit v harmonogramu &rarr; ]' : '[ View in Timetable Grid &rarr; ]';
                        const stageIcon = p.stage.includes('Solar') ? '☀️' : '🌙';
                        const dayNum = p.day === 'Friday' ? '1' : (p.day === 'Saturday' ? '2' : '3');
                        return `
                            <div class="search-result-item" data-keywords="${p.name.toLowerCase()} ${p.stage.toLowerCase()} ${p.time}">
                                <div class="search-result-row">
                                    <div class="search-result-content">
                                        <h3 class="search-result-title"><strong>${stageIcon} ${p.stage} &mdash; ${p.day}, ${p.time}</strong></h3>
                                        <p class="search-result-desc"><strong>${p.name}</strong> &mdash; ${p.genre} (${p.origin})</p>
                                    </div>
                                    <div class="search-result-action">
                                        <a href="program.html?day=${dayNum}&highlight=${p.id}#${p.id}" class="btn-box">${viewGridText}</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    secTimetable.classList.add('is-hidden');
                    timetableContainer.innerHTML = '';
                }
            }

            // Render Practical Info
            if (infoContainer && secInfo) {
                if (matchedInfo.length > 0) {
                    secInfo.classList.remove('is-hidden');
                    infoContainer.innerHTML = matchedInfo.map(info => {
                        const title = isCs ? info.titleCs : info.titleEn;
                        const desc = isCs ? info.descCs : info.descEn;
                        const linkText = isCs ? info.linkTextCs : info.linkTextEn;
                        return `
                            <div class="search-result-item" data-keywords="${info.keywords}">
                                <div class="search-result-row">
                                    <div class="search-result-content">
                                        <h3 class="search-result-title"><strong>${title}</strong></h3>
                                        <p class="search-result-desc">${desc}</p>
                                    </div>
                                    <div class="search-result-action">
                                        <a href="${info.link}" class="btn-box">${linkText}</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    secInfo.classList.add('is-hidden');
                    infoContainer.innerHTML = '';
                }
            }

            // Handle empty state
            if (emptyMsg) {
                if (totalResults === 0) {
                    emptyMsg.classList.remove('is-hidden');
                } else {
                    emptyMsg.classList.add('is-hidden');
                }
            }
        }

        // Attach listeners
        input.addEventListener('input', function(e) {
            executeSearch(e.target.value);
        });

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                executeSearch(input.value);
            });
        }

        pills.forEach(pill => {
            pill.addEventListener('click', function() {
                const q = pill.getAttribute('data-query') || '';
                input.value = q;
                executeSearch(q);
            });
        });

        window.addEventListener('languageChanged', function() {
            executeSearch(input.value);
        });

        // Run initial search
        executeSearch(input.value);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchEngine);
    } else {
        initSearchEngine();
    }
})();
