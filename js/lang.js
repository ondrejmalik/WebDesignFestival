// js/lang.js - Language switcher and bilingual separation engine (EN / CS)
// Pure client-side solution supporting local server and direct file:/// launch.

(function() {
    'use strict';

    const LANG_STORAGE_KEY = 'festival_language';

    // Shared Czech morphological pluralization helper
    window.formatCzPlural = function(count, one, few, many) {
        if (count === 1) return `${count} ${one}`;
        if (count >= 2 && count <= 4) return `${count} ${few}`;
        return `${count} ${many}`;
    };

    // 60 Canonical Czech performer biographies (paired with canonical English bios)
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

    // Dictionary of translations for all shared UI elements
    const I18N = {
        en: {
            // Navigation
            nav_brand: "[ Festival of Darkness 2 ]",
            nav_home: "[ Home ]",
            nav_program: "[ Program ]",
            nav_artists: "[ Artists ]",
            nav_stages: "[ Stages ]",
            nav_practical: "[ Practical Info ]",
            nav_myschedule: "[ My Schedule ]",
            lang_label: "Language",
            lang_switch_title: "Switch language to Czech",
            lang_flag: "img/1f1ec-1f1e7.svg",
            theme_dark_label: "Dark",
            theme_light_label: "Light",
            theme_to_dark_title: "Switch to Dark Mode",
            theme_to_light_title: "Switch to Light Mode",
            dock_artists: "Artists",
            dock_stages: "Stages",
            dock_home: "HOME",
            dock_timetable: "Timetable",
            dock_myplan: "My Plan",
            nav_menu_btn: "[ ☰ Menu ]",
            nav_drawer_title: "[ Festival Menu ]",
            nav_drawer_close: "[ ✕ Close ]",
            footer_copy: "[ © 2026 Festival of Darkness 2 ]",

            // Mission Control Telemetry & Weather Alert (Homepage)
            mc_telemetry_label: "[ Live Ground Telemetry ]",
            mc_clock_prefix: "LOCAL TIME:",
            mc_radar_label: "RADAR:",
            mc_radar_text: "RAIN CLOUDS APPROACHING",
            mc_solar_status: "SOLAR STAGE: OPEN",
            mc_lunar_status: "LUNAR DOME: 100% DRY / COVERED",
            mc_rain_alert_title: "[ 🚨 WEATHER ALERT: RAIN PREDICTED ]",
            mc_rain_alert_desc: "Move under cover! The indoor geodesic dome is fully operational with non-stop live audio-visual programming.",
            mc_rain_alert_btn: "[ Move to Covered Tent (Lunar Forest Dome) → ]",
            mc_control_title: "[ Operational Status & Stage Telemetry ]",
            mc_tile_stage1_label: "[ STAGE 01 TELEMETRY ]",
            mc_tile_stage1_name: "Solar Horizon Stage",
            mc_tile_stage1_sub: "Open-Air Natural Amphitheater • 4,500 Capacity",
            mc_tile_stage1_btn: "[ Open Solar Timetable → ]",
            mc_tile_stage2_label: "[ STAGE 02 TELEMETRY • SHELTER ]",
            mc_tile_stage2_name: "🌙 Lunar Forest Dome",
            mc_tile_stage2_sub: "Geodesic All-Weather Dome • 1,800 Capacity • Covered",
            mc_tile_stage2_btn: "[ Open Covered Dome Timetable → ]",
            mc_tile_itinerary_label: "[ ITINERARY STATUS ]",
            mc_tile_itinerary_unit: "Saved Shows",
            mc_tile_itinerary_sub: "",
            mc_tile_itinerary_btn: "[ Open Planner → ]",

            // General & Shared
            stage_solar_name: "Solar Horizon Stage",
            stage_lunar_name: "Lunar Forest Dome",
            day_1: "Friday, July 10, 2026 (Day 1)",
            day_2: "Saturday, July 11, 2026 (Day 2)",
            day_3: "Sunday, July 12, 2026 (Day 3)",

            // index.html
            index_title: "Festival of Darkness 2 | Home",
            index_hero_title: "[ FESTIVAL OF DARKNESS 2 ]",
            index_hero_meta: "[ July 10 – July 12, 2026 | Kutna Hora, Czech Republic ]",
            index_hero_desc1: "[ Three-day festival of electronic, alternative, and audiovisual music in Kutna Hora. ]",
            index_hero_desc2: "[ Main genres: Post-Rock, Ambient, Indie Pop/Rock, Techno, and Experimental Electronics. ]",
            index_sections_title: "[ Main Website Sections ]",
            index_card_prog_title: "[ 📅 Program ]",
            index_card_prog_desc: "[ Full timetable across all 3 days and 2 stages with band details. ]",
            index_card_prog_btn: "[ Open Program → ]",
            index_card_art_title: "[ 🎤 Artists ]",
            index_card_art_desc: "[ Catalog of 60 artists from across Europe, genres, biographies, and profiles. ]",
            index_card_art_btn: "[ View Artists → ]",
            index_card_stg_title: "[ ⛺ Stages ]",
            index_card_stg_desc: "[ Outdoor amphitheater Solar Horizon Stage and covered Lunar Forest Dome. ]",
            index_card_stg_btn: "[ Explore Stages → ]",
            index_card_info_title: "[ 🚆 Practical Info & Transit ]",
            index_card_info_desc: "[ Route from the train station, free shuttle bus, walking map, camping, and FAQ. ]",
            index_card_info_btn: "[ 🚆 Transit from Station → ]",
            index_card_sch_title: "[ ★ My Schedule ]",
            index_card_sch_desc: "[ Your personal festival timetable across all 3 days. ]",
            index_card_sch_btn: "[ ★ Open My Schedule → ]",
            index_params_title: "[ Key Parameters of the 2026 Edition ]",
            index_params_item1: "[ • <strong>3 festival days:</strong> Friday July 10, Saturday July 11, Sunday July 12, 2026 ]",
            index_params_item2: "[ • <strong>2 distinct stages:</strong> Solar Horizon Stage & Lunar Forest Dome ]",
            index_params_item3: "[ • <strong>60 live performances</strong> and accompanying audiovisual shows ]",
            index_params_item4: "[ • <strong>Location:</strong> Festival Grounds, Kutna Hora, Czech Republic ]",
            telemetry_radar: "RAIN CLOUDS APPROACHING",
            telemetry_solar: "OPEN",
            telemetry_lunar: "100% DRY / COVERED",
            rain_alert_title: "[ 🚨 WEATHER ALERT: RAIN PREDICTED ]",
            rain_alert_desc: "Move under cover! The indoor geodesic dome is fully operational with non-stop live audio-visual programming.",
            rain_alert_btn: "[ Move to Covered Tent (Lunar Forest Dome) → ]",

            // stages.html
            stages_title: "Festival of Darkness 2 | Stages",
            stages_head: "[ Festival Stages & Locations ]",
            stages_intro: "[ The Kutna Hora festival grounds feature 2 main musical stages offering completely distinct sensory atmospheres. ]",
            stages_solar_title: "[ ☀️ Solar Horizon Stage ]",
            stages_solar_sketch: "",
            stages_solar_type: "<strong>Stage Type:</strong> Natural open-air amphitheater",
            stages_solar_cap: "<strong>Capacity:</strong> 4,500 visitors",
            stages_solar_focus: "<strong>Focus:</strong> Afternoon and evening live band performances (Post-Rock, Indie Rock, live audiovisual sets).",
            stages_solar_btn: "[ ☀️ View Solar Horizon Stage Schedule → ]",
            stages_lunar_title: "[ 🌙 Lunar Forest Dome (Covered Dome) ]",
            stages_lunar_sketch: "",
            stages_lunar_type: "<strong>Stage Type:</strong> Large-capacity covered dome with complete all-weather rain shelter",
            stages_lunar_cap: "<strong>Capacity:</strong> 1,800 visitors",
            stages_lunar_focus: "<strong>Focus:</strong> Late-night club sets, dark techno, modular ambient, experimental electronics, and 360° projections.",
            stages_lunar_shelter: "<em>Ideal refuge when it rains – music runs continuously under a solid covered roof!</em>",
            stages_lunar_btn: "[ 🌙 View Lunar Forest Dome Schedule → ]",
            stages_map_title: "[ Festival Grounds Map & Visitor Orientation ]",
            stages_map_desc: "[ Entrance A (Main Gate) • Solar Horizon Stage • Lunar Forest Dome (Covered) • Camping Ground • Cashless Zone • Shuttle Bus Stop ]",
            stages_map_btn: "[ 🚆 Transit Guide: How to get from the train station to the venue → ]",

            // program.html
            program_title: "Festival of Darkness 2 | Program",
            program_head: "[ Festival Timetable & Schedule ]",
            program_meta: "[ 3 festival days: July 10–12, 2026 | 2 stages: Solar Horizon Stage & Lunar Forest Dome | 60 performances ]",
            program_note: "",
            program_rain_title: "[ 🌧️ Quick Shelter Access: ]",
            program_rain_desc: "Raining at the festival? Check the timetable in covered Lunar Forest Dome in 1 click:",
            program_rain_btn: "[ 🌙 Show Covered Stage (Lunar Forest Dome) → ]",
            program_fav_count_label: "Saved in My Schedule:",
            program_showing_label: "shows",
            program_go_schedule: "[ View in My Schedule → ]",
            program_clear_fav: "[ Clear ★ ]",
            program_filter_title: "[ Timetable Filters ]",
            program_filter_day: "[ Day: ]",
            program_day_all: "[ All Days (Jul 10–12) ]",
            program_day1: "[ Friday, Jul 10 – Today (Day 1) ]",
            program_day2: "[ Saturday, Jul 11 (Day 2) ]",
            program_day3: "[ Sunday, Jul 12 (Day 3) ]",
            program_fav_only: "[ ★ Bookmarked Only ]",
            program_filter_stage: "[ Stage: ]",
            program_stage_all: "[ All Stages ]",
            program_stage_solar: "[ ☀️ Solar Horizon Stage (Open-air) ]",
            program_stage_lunar: "[ 🌙 Lunar Forest Dome (Covered Dome) ]",
            program_filter_genre: "[ Genre: ]",
            program_genre_all: "[ All Genres ]",
            program_day1_title: "[ Friday, July 10, 2026 – Day 1 ]",
            program_day2_title: "[ Saturday, July 11, 2026 – Day 2 ]",
            program_day3_title: "[ Sunday, July 12, 2026 – Day 3 ]",
            program_col_slot: "Time Slot",
            program_col_solar: "☀️ Solar Horizon Stage (Open-air Amphitheater)",
            program_col_lunar: "🌙 Lunar Forest Dome (Covered Dome – Rain Shelter)",
            empty_doors: "[ Doors Open & Grounds Preparation ]",
            empty_dome_open: "[ Dome Open & Sound Check ]",
            empty_stage_change: "[ Stage Changeover & Sound Setup ]",
            empty_intermission: "[ Changeover & Ambient Intermission ]",
            empty_curfew: "[ Solar Stage Closed (Curfew) ]",
            empty_pause: "[ Changeover & Ambient Pause ]",
            btn_add_to_schedule: "[ + Add to My Schedule ]",
            btn_in_schedule: "[ ★ In My Schedule ]",
            btn_band_details: "[ ℹ️ Band Details ]",
            btn_hide_details: "[ ✖ Hide Details ]",
            btn_artist_profile: "[ Artist Profile → ]",
            confirm_clear_all: "Are you sure you want to remove all saved performances?",
            program_legend_title: "",
            program_legend_card: "",
            program_legend_card_desc: "",
            program_legend_fav: "",
            program_legend_fav_desc: "",
            program_legend_empty: "",
            program_legend_empty_desc: "",
            artists_catalog_title: "[ All 60 Festival Performers ]",

            // artists.html
            artists_title: "Festival of Darkness 2 | Artists",
            artists_head: "[ Festival Lineup: Complete Catalog of 60 Performers ]",
            artists_meta: "[ 60 Musical Acts | 3 Days (July 10–12, 2026) | 2 Stages (Solar Horizon & Lunar Forest Dome) ]",
            artists_note: "",
            artists_fav_label: "Saved in My Schedule:",
            artists_showing_label: "Showing",
            artists_of_label: "of 60 performers",
            artists_go_schedule: "[ View in My Schedule → ]",
            artists_go_timetable: "[ View Timetable Grid → ]",
            artists_filter_title: "[ Filter & Search Performers ]",
            artists_day_label: "[ Day: ]",
            artists_day_all: "[ All Days (60) ]",
            artists_day_fri: "[ Friday, Jul 10 (20) ]",
            artists_day_sat: "[ Saturday, Jul 11 (20) ]",
            artists_day_sun: "[ Sunday, Jul 12 (20) ]",
            artists_fav_only: "[ ★ Bookmarked Only ]",
            artists_genre_label: "[ Genre: ]",
            artists_genre_all: "[ All Genres ]",
            artists_search_label: "[ Search: ]",
            artists_search_placeholder: "Search by artist name or genre (e.g. Echoes, Techno)...",
            artists_clear_search: "[ Clear Search ]",
            artists_detail_empty: "",
            artists_detail_close: "[ × Close Profile ]",
            artists_detail_photo: "[ Artist Press Kit Photo:",
            artists_detail_audio: "[ Audio Preview: ♫ Bandcamp & Spotify ]",
            artists_detail_bio_head: "[ Artist Biography & Profile ]",
            artists_detail_sched: "Scheduled Performance:",
            artists_detail_stage: "Stage:",
            artists_detail_add: "☆ Add to My Schedule",
            artists_detail_remove: "★ Remove from My Schedule",
            artists_card_detail: "[ View Detail → ]",
            artists_card_bookmark: "☆ Bookmark",
            artists_card_bookmarked: "★ Bookmarked",

            // practical-info.html
            practical_title: "Festival of Darkness 2 | Practical Info & Transit",
            practical_head: "[ Practical Information for Visitors ]",
            practical_date: "[ Festival of Darkness 2 | July 10–12, 2026 | Kutna Hora ]",
            practical_intro: "[ Complete guide to transit from the train station to the venue, shuttle bus timetables, marked walking route on the map, camping, and cashless services. ]",
            practical_quick_nav: "[ 📍 Quick Section Navigation: ]",
            practical_nav_transit: "[ 🚆 Transit: Station to Venue ↓ ]",
            practical_nav_shuttle: "[ 🚌 Festival Shuttle Bus Timetable ]",
            practical_nav_walk: "[ 🚶 Marked Walking Route & Map ]",
            practical_nav_camp: "[ ⛺ Camping Ground & Lodging ]",
            practical_nav_cashless: "[ 💳 Cashless & Venue Services ]",
            practical_nav_faq: "[ ❓ Frequently Asked Questions (FAQ) ]",

            // my-schedule.html
            schedule_title: "Festival of Darkness 2 | My Schedule",
            schedule_head: "[ ★ My Personal Schedule ]",
            schedule_intro: "[ Your bookmarked performances across all 3 festival days. ]",
            schedule_warning_note: "",
            schedule_add_more: "<strong>[ + Add more shows in \"Program\" → ]</strong>",
            schedule_clear_all: "[ Clear Entire Plan ]",
            schedule_share: "[ Share My Plan ]",
            schedule_export: "[ Export to Calendar (.ics) ]",
            schedule_empty_title: "[ You currently have no performances saved in your personal schedule ]",
            schedule_empty_desc: "You have not added any performances to your schedule yet. You can add them in the Program section.",
            schedule_empty_btn: "[ Go to \"Program\" Section → ]",
            schedule_conflict_banner_title: "⚠️ Schedule Conflict Alert: Found",
            schedule_conflict_banner_suffix: "overlapping shows!",
            schedule_conflict_banner_desc: "You have overlapping performances scheduled at the same time on the <strong>Solar Horizon Stage</strong> and in the <strong>Lunar Forest Dome</strong>.",
            schedule_clean_banner: "[ ✓ Your schedule has no conflicts! All selected performances follow each other seamlessly. ]",
            schedule_conflict_badge: "[ ⚠️ TIME CONFLICT ]",
            schedule_clean_badge: "[ ✓ No time conflict ]",
            schedule_overlaps_with: "Overlaps with:",
            schedule_remove_btn: "[ 🗑️ Remove from schedule ]",
            schedule_resolve_btn: "[ 🗑️ Remove performance ]",
            schedule_no_shows_day: "[ You currently have no performances saved for this day. ]",
            schedule_pick_shows_btn: "[ Pick shows in Program → ]",
            schedule_fri_head: "[ Your Timetable: Friday, July 10, 2026 ]",
            schedule_sat_head: "[ Your Timetable: Saturday, July 11, 2026 ]",
            schedule_sun_head: "[ Your Timetable: Sunday, July 12, 2026 ]",
            schedule_sat_empty: "[ You currently have no performances saved for Saturday. ]",
            schedule_sun_empty: "[ You currently have no performances saved for Sunday. ]",
            schedule_status_clean: "[ Status: ✓ No time conflict ]",
            schedule_stage_label: "Stage:",
            schedule_remove_btn_text: "[ Remove ]",

            // artist-detail.html & stages tabs
            stages_tab_solar: "[ ☀️ Solar Horizon Stage ]",
            stages_tab_lunar: "[ 🌙 Lunar Forest Dome ]",
            detail_title: "Festival of Darkness 2 | Artist Detail",
            detail_head: "[ Artist Profile & Performance Details ]",
            detail_back_to_program: "[ ← Back to Program ]",
            detail_back_to_artists: "[ ← Back to Artists ]",
            detail_back_to_myschedule: "[ ← Back to My Schedule ]",
            detail_view_timetable: "[ 📅 View in Timetable → ]",
            detail_view_stage: "[ ⛺ Stage Details → ]",
            detail_view_schedule: "[ ★ View in My Schedule → ]",
            detail_audio_preview: "[ Audio Sample Preview ]",
            detail_play: "[ ▶ Play ]",
            detail_pause: "[ ❚❚ Pause ]",
            detail_btn_text: "[ ℹ️ Detail → ]",
            schedule_artist_detail_btn: "[ ℹ️ Artist Detail → ]",
            skip_to_content: "Skip to main content",
            nav_search: "🔍 [ Search ]",
            sch_caption_day1: "Festival timetable for Friday, July 10, 2026",
            sch_caption_day2: "Festival timetable for Saturday, July 11, 2026",
            sch_caption_day3: "Festival timetable for Sunday, July 12, 2026",
            search_title: "[ Festival Search & Lineup Explorer ]",
            search_placeholder: "Search performers, stages, times, genres, info...",
            search_btn: "[ Search ]",
            search_results_for: "Search Results for:",
            search_performers: "Matching Performers",
            search_timetable: "Matching Timetable Slots",
            search_info: "Stages & Practical Information",
            search_empty: "No results found matching your query.",
            search_quick_pill_all: "[ Show All ]"
        },
        cs: {
            // Navigation
            nav_brand: "[ Festival of Darkness 2 ]",
            nav_home: "[ Úvod ]",
            nav_program: "[ Program ]",
            nav_artists: "[ Účinkující ]",
            nav_stages: "[ Scény ]",
            nav_practical: "[ Praktické info ]",
            nav_myschedule: "[ Můj program ]",
            lang_label: "Jazyk",
            lang_switch_title: "Přepnout do angličtiny",
            lang_flag: "img/1f1e8-1f1ff.svg",
            theme_dark_label: "Tmavý",
            theme_light_label: "Světlý",
            theme_to_dark_title: "Přepnout na tmavý režim",
            theme_to_light_title: "Přepnout na světlý režim",
            dock_artists: "Účinkující",
            dock_stages: "Scény",
            dock_home: "ÚVOD",
            dock_timetable: "Program",
            dock_myplan: "Můj plán",
            nav_menu_btn: "[ ☰ Menu ]",
            nav_drawer_title: "[ Menu festivalu ]",
            nav_drawer_close: "[ ✕ Zavřít ]",
            footer_copy: "[ © 2026 Festival of Darkness 2 ]",

            // Mission Control Telemetry & Weather Alert (Homepage)
            mc_telemetry_label: "[ Živá pozemní telemetrie ]",
            mc_clock_prefix: "MÍSTNÍ ČAS:",
            mc_radar_label: "RADAR:",
            mc_radar_text: "DEŠŤOVÉ MRAKY SE BLÍŽÍ",
            mc_solar_status: "SOLAR SCÉNA: OTEVŘENA",
            mc_lunar_status: "LUNAR KUPOLA: 100% KRYTÁ / SUCHÁ",
            mc_rain_alert_title: "[ 🚨 VÝSTRAHA POČASÍ: OČEKÁVÁ SE DÉŠŤ ]",
            mc_rain_alert_desc: "Přesuňte se pod střechu! Vnitřní geodetická kupole běží naplno s nepřetržitým audiovizuálním programem.",
            mc_rain_alert_btn: "[ Přesunout se do krytého stanu (Lunar Forest Dome) → ]",
            mc_control_title: "[ Provozní stav & telemetrie scén ]",
            mc_tile_stage1_label: "[ TELEMETRIE SCÉNY 01 ]",
            mc_tile_stage1_name: "Solar Horizon Stage",
            mc_tile_stage1_sub: "Přírodní otevřený amfiteátr • Kapacita 4 500",
            mc_tile_stage1_btn: "[ Otevřít program Solar → ]",
            mc_tile_stage2_label: "[ TELEMETRIE SCÉNY 02 • KRYTÝ PROSTOR ]",
            mc_tile_stage2_name: "🌙 Lunar Forest Dome",
            mc_tile_stage2_sub: "Geodetická kupole za každého počasí • Kapacita 1 800 • Zastřešeno",
            mc_tile_stage2_btn: "[ Otevřít program kryté scény → ]",
            mc_tile_itinerary_label: "[ STAV PLÁNOVAČE ]",
            mc_tile_itinerary_unit: "Uložených vystoupení",
            mc_tile_itinerary_sub: "",
            mc_tile_itinerary_btn: "[ Otevřít plánovač → ]",

            // General & Shared
            stage_solar_name: "Solar Horizon Stage",
            stage_lunar_name: "Lunar Forest Dome",
            day_1: "Pátek 10. 7. 2026 – 1. den",
            day_2: "Sobota 11. 7. 2026 – 2. den",
            day_3: "Neděle 12. 7. 2026 – 3. den",

            // index.html
            index_title: "Festival of Darkness 2 | Úvod",
            index_hero_title: "[ FESTIVAL OF DARKNESS 2 ]",
            index_hero_meta: "[ 10.–12. července 2026 | Kutná Hora, Česká republika ]",
            index_hero_desc1: "[ Třídenní festival elektronické, alternativní a audiovizuální hudby v Kutné Hoře. ]",
            index_hero_desc2: "[ Hlavní žánry: Post-Rock, Ambient, Indie Pop/Rock, Techno a experimentální elektronika. ]",
            index_sections_title: "[ Hlavní sekce webu ]",
            index_card_prog_title: "[ 📅 Program ]",
            index_card_prog_desc: "[ Kompletní harmonogram pro všechny 3 dny a 2 scény s detaily kapel. ]",
            index_card_prog_btn: "[ Otevřít Program → ]",
            index_card_art_title: "[ 🎤 Účinkující ]",
            index_card_art_desc: "[ Katalog 60 interpretů z celé Evropy, žánry, biografie a profily. ]",
            index_card_art_btn: "[ Zobrazit účinkující → ]",
            index_card_stg_title: "[ ⛺ Scény ]",
            index_card_stg_desc: "[ Venkovní amfiteátr Solar Horizon Stage a krytý Lunar Forest Dome. ]",
            index_card_stg_btn: "[ Prozkoumat scény → ]",
            index_card_info_title: "[ 🚆 Praktické info & Doprava ]",
            index_card_info_desc: "[ Trasa z vlakového nádraží, shuttle bus zdarma, pěší mapa, kemp a FAQ. ]",
            index_card_info_btn: "[ 🚆 Doprava z nádraží → ]",
            index_card_sch_title: "[ ★ Můj program ]",
            index_card_sch_desc: "[ Váš osobní festivalový harmonogram pro všechny 3 dny. ]",
            index_card_sch_btn: "[ ★ Otevřít Můj program → ]",
            index_params_title: "[ Klíčové parametry ročníku 2026 ]",
            index_params_item1: "[ • <strong>3 festivalové dny:</strong> Pátek 10. července, Sobota 11. července, Neděle 12. července 2026 ]",
            index_params_item2: "[ • <strong>2 unikátní scény:</strong> Solar Horizon Stage & Lunar Forest Dome ]",
            index_params_item3: "[ • <strong>60 živých vystoupení</strong> a doprovodných audiovizuálních show ]",
            index_params_item4: "[ • <strong>Lokalita:</strong> Festivalový areál, Kutná Hora, Česká republika ]",
            telemetry_radar: "BLÍŽÍ SE DEŠŤOVÉ MRAKY",
            telemetry_solar: "OTEVŘENO",
            telemetry_lunar: "100% SUCHÁ / KRYTÁ",
            rain_alert_title: "[ 🚨 METEOROLOGICKÉ VAROVÁNÍ: PŘEDPOVĚĎ DEŠTĚ ]",
            rain_alert_desc: "Přesuňte se pod střechu! Geodetická krytá kupole funguje nepřetržitě s živou hudbou a audiovizuální show.",
            rain_alert_btn: "[ Přesunout se pod střechu (Lunar Forest Dome) → ]",

            // stages.html
            stages_title: "Festival of Darkness 2 | Scény",
            stages_head: "[ Festivalové scény & lokace ]",
            stages_intro: "[ Areál festivalu v Kutné Hoře zahrnuje 2 hlavní hudební scény nabízející zcela odlišnou smyslovou atmosféru. ]",
            stages_solar_title: "[ ☀️ Solar Horizon Stage ]",
            stages_solar_sketch: "",
            stages_solar_type: "<strong>Typ scény:</strong> Přírodní otevřený amfiteátr (Open-air)",
            stages_solar_cap: "<strong>Kapacita:</strong> 4 500 návštěvníků",
            stages_solar_focus: "<strong>Zaměření:</strong> Odpolední a večerní vystoupení kapel (Post-Rock, Indie Rock, živé audiovizuální sety).",
            stages_solar_btn: "[ ☀️ Zobrazit program Solar Horizon Stage → ]",
            stages_lunar_title: "[ 🌙 Lunar Forest Dome (Krytá scéna) ]",
            stages_lunar_sketch: "",
            stages_lunar_type: "<strong>Typ scény:</strong> Velkokapacitní zastřešená kopule s plnou ochranou proti dešti",
            stages_lunar_cap: "<strong>Kapacita:</strong> 1 800 návštěvníků",
            stages_lunar_focus: "<strong>Zaměření:</strong> Noční klubové sety, dark techno, modulární ambient, experimentální elektronika a 360° projekce.",
            stages_lunar_shelter: "<em>Ideální útočiště při dešti – hudební produkce probíhá nepřetržitě pod pevnou střechou!</em>",
            stages_lunar_btn: "[ 🌙 Zobrazit program Lunar Forest Dome → ]",
            stages_map_title: "[ Mapa areálu & Orientace pro návštěvníky ]",
            stages_map_desc: "[ Vstup A (Hlavní brána) • Solar Horizon Stage • Lunar Forest Dome (Krytá scéna) • Stanové městečko • Cashless zóna • Zastávka shuttle busu ]",
            stages_map_btn: "[ 🚆 Průvodce dopravou: Jak se dostat z vlakového nádraží do areálu → ]",

            // program.html
            program_title: "Festival of Darkness 2 | Program",
            program_head: "[ Program & harmonogram vystoupení ]",
            program_meta: "[ 3 festivalové dny: 10.–12. 7. 2026 | 2 scény: Solar Horizon Stage & Lunar Forest Dome | 60 vystoupení ]",
            program_note: "",
            program_rain_title: "[ 🌧️ Rychlý přesun pod střechu: ]",
            program_rain_desc: "Začíná pršet v areálu? Zjistěte program v krytém Lunar Forest Dome na 1 kliknutí:",
            program_rain_btn: "[ 🌙 Zobrazit krytou scénu (Lunar Forest Dome) → ]",
            program_fav_count_label: "Uloženo v mém programu:",
            program_showing_label: "vystoupení",
            program_go_schedule: "[ Přejít do záložky „Můj program“ → ]",
            program_clear_fav: "[ Vymazat ★ ]",
            program_filter_title: "[ Filtry harmonogramu ]",
            program_filter_day: "[ Den: ]",
            program_day_all: "[ Všechny dny (10.–12. 7.) ]",
            program_day1: "[ Pátek 10. 7. – Dnes (1. den) ]",
            program_day2: "[ Sobota 11. 7. (2. den) ]",
            program_day3: "[ Neděle 12. 7. (3. den) ]",
            program_fav_only: "[ ★ Jen v mém programu ]",
            program_filter_stage: "[ Scéna: ]",
            program_stage_all: "[ Všechny scény ]",
            program_stage_solar: "[ ☀️ Solar Horizon Stage (Venkovní) ]",
            program_stage_lunar: "[ 🌙 Lunar Forest Dome (Krytá scéna) ]",
            program_filter_genre: "[ Žánr: ]",
            program_genre_all: "[ Všechny žánry ]",
            program_day1_title: "[ Den 1: Pátek 10. července 2026 ]",
            program_day2_title: "[ Den 2: Sobota 11. července 2026 ]",
            program_day3_title: "[ Den 3: Neděle 12. července 2026 ]",
            program_col_slot: "Časový slot",
            program_col_solar: "☀️ Solar Horizon Stage (Venkovní amfiteátr)",
            program_col_lunar: "🌙 Lunar Forest Dome (Krytá kupole – Ochrana před deštěm)",
            empty_doors: "[ Otevření areálu & Příprava ]",
            empty_dome_open: "[ Otevření kupole & Zvuková zkouška ]",
            empty_stage_change: "[ Přestavba scény & Zvuková zkouška ]",
            empty_intermission: "[ Přestavba & Ambientní pauza ]",
            empty_curfew: "[ Konec programu na Solar Stage (Noční klid) ]",
            empty_pause: "[ Přestavba & Ambientní pauza ]",
            btn_add_to_schedule: "[ + Přidat do mého programu ]",
            btn_in_schedule: "[ ★ V mém programu ]",
            btn_band_details: "[ ℹ️ Detaily kapely ]",
            btn_hide_details: "[ ✖ Skrýt detaily ]",
            btn_artist_profile: "[ Profil kapely → ]",
            confirm_clear_all: "Opravdu si přejete odebrat všechna uložená vystoupení?",
            program_legend_title: "",
            program_legend_card: "",
            program_legend_card_desc: "",
            program_legend_fav: "",
            program_legend_fav_desc: "",
            program_legend_empty: "",
            program_legend_empty_desc: "",
            artists_catalog_title: "[ Všech 60 festivalových vystupujících ]",

            // artists.html
            artists_title: "Festival of Darkness 2 | Účinkující",
            artists_head: "[ Katalog vystupujících: Všech 60 interpretů ]",
            artists_meta: "[ 60 hudebních formací | 3 dny (10.–12. 7. 2026) | 2 scény (Solar Horizon & Lunar Forest Dome) ]",
            artists_note: "",
            artists_fav_label: "Uloženo v mém programu:",
            artists_showing_label: "Zobrazeno",
            artists_of_label: "z 60 interpretů",
            artists_go_schedule: "[ Zobrazit v Mém programu → ]",
            artists_go_timetable: "[ Zobrazit harmonogram → ]",
            artists_filter_title: "[ Filtrovat & hledat vystupující ]",
            artists_day_label: "[ Den: ]",
            artists_day_all: "[ Všechny dny (60) ]",
            artists_day_fri: "[ Pátek 10. 7. (20) ]",
            artists_day_sat: "[ Sobota 11. 7. (20) ]",
            artists_day_sun: "[ Neděle 12. 7. (20) ]",
            artists_fav_only: "[ ★ Jen v mém programu ]",
            artists_genre_label: "[ Žánr: ]",
            artists_genre_all: "[ Všechny žánry ]",
            artists_search_label: "[ Hledat: ]",
            artists_search_placeholder: "Hledat podle jména nebo žánru (např. Echoes, Techno)...",
            artists_clear_search: "[ Vymazat hledání ]",
            artists_detail_empty: "",
            artists_detail_close: "[ × Zavřít profil ]",
            artists_detail_photo: "[ Fotografie a promo materiál:",
            artists_detail_audio: "[ Hudební ukázka: ♫ Bandcamp & Spotify ]",
            artists_detail_bio_head: "[ Biografie a profil interpreta ]",
            artists_detail_sched: "Plánované vystoupení:",
            artists_detail_stage: "Scéna:",
            artists_detail_add: "☆ Přidat do mého programu",
            artists_detail_remove: "★ Odebrat z mého programu",
            artists_card_detail: "[ Zobrazit detail → ]",
            artists_card_bookmark: "☆ Uložit",
            artists_card_bookmarked: "★ Uloženo",

            // practical-info.html
            practical_title: "Festival of Darkness 2 | Praktické info a Doprava",
            practical_head: "[ Praktické informace pro návštěvníky ]",
            practical_date: "[ Festival of Darkness 2 | 10.–12. července 2026 | Kutná Hora ]",
            practical_intro: "[ Kompletní průvodce dopravou z vlakového nádraží do areálu, jízdním řádem festivalového shuttle busu, vyznačenou pěší trasou na mapě, stanovým městečkem a bezhotovostním placením. ]",
            practical_quick_nav: "[ 📍 Rychlá navigace v sekci: ]",
            practical_nav_transit: "[ 🚆 Doprava z nádraží do areálu ↓ ]",
            practical_nav_shuttle: "[ 🚌 Jízdní řád festivalového Shuttle Busu ]",
            practical_nav_walk: "[ 🚶 Vyznačená pěší trasa & Mapa ]",
            practical_nav_camp: "[ ⛺ Stanové městečko & Ubytování ]",
            practical_nav_cashless: "[ 💳 Cashless & Služby v areálu ]",
            practical_nav_faq: "[ ❓ Často kladené otázky (FAQ) ]",

            // my-schedule.html
            schedule_title: "Festival of Darkness 2 | Můj program",
            schedule_head: "[ ★ Můj osobní program ]",
            schedule_intro: "[ Přehled vašich uložených vystoupení pro všechny 3 festivalové dny. ]",
            schedule_warning_note: "",
            schedule_add_more: "<strong>[ + Přidat další koncerty v sekci „Program“ → ]</strong>",
            schedule_clear_all: "[ Vymazat celý plán ]",
            schedule_share: "[ Sdílet můj plán ]",
            schedule_export: "[ Export do kalendáře (.ics) ]",
            schedule_empty_title: "[ Zatím nemáte v osobním plánu žádná uložená vystoupení ]",
            schedule_empty_desc: "Zatím nemáte v osobním programu uložena žádná vystoupení. Můžete si je přidat v sekci Program.",
            schedule_empty_btn: "[ Přejít do sekce „Program“ → ]",
            schedule_conflict_banner_title: "⚠️ Upozornění na časové kolize: Nalezeno",
            schedule_conflict_banner_suffix: "překrývajících se vystoupení!",
            schedule_conflict_banner_desc: "V některých časech máte naplánována překrývající se vystoupení na scéně <strong>Solar Horizon Stage</strong> a v <strong>Lunar Forest Dome</strong>.",
            schedule_clean_banner: "[ ✓ Váš harmonogram je bez časových kolizí! Všechna vybraná vystoupení na sebe navazují a stíháte je v plné délce. ]",
            schedule_conflict_badge: "[ ⚠️ ČASOVÁ KOLIZE ]",
            schedule_clean_badge: "[ ✓ Bez časové kolize ]",
            schedule_overlaps_with: "Překrývá se s:",
            schedule_remove_btn: "[ 🗑️ Odebrat z programu ]",
            schedule_resolve_btn: "[ 🗑️ Odebrat vystoupení ]",
            schedule_no_shows_day: "[ Pro tento den zatím nemáte uložená žádná vystoupení. ]",
            schedule_pick_shows_btn: "[ Vybrat vystoupení v Programu → ]",
            schedule_fri_head: "[ Váš harmonogram: Pátek 10. července 2026 ]",
            schedule_sat_head: "[ Váš harmonogram: Sobota 11. července 2026 ]",
            schedule_sun_head: "[ Váš harmonogram: Neděle 12. července 2026 ]",
            schedule_sat_empty: "[ Pro sobotu zatím nemáte uložená žádná vystoupení. ]",
            schedule_sun_empty: "[ Pro neděli zatím nemáte uložená žádná vystoupení. ]",
            schedule_status_clean: "[ Stav: ✓ Bez časové kolize ]",
            schedule_stage_label: "Scéna:",
            schedule_remove_btn_text: "[ Odebrat ]",

            // artist-detail.html & stages tabs
            stages_tab_solar: "[ ☀️ Scéna Solar Horizon ]",
            stages_tab_lunar: "[ 🌙 Kupola Lunar Forest ]",
            detail_title: "Festival of Darkness 2 | Detail interpreta",
            detail_head: "[ Profil interpreta & detaily vystoupení ]",
            detail_back_to_program: "[ ← Zpět do Programu ]",
            detail_back_to_artists: "[ ← Zpět k Účinkujícím ]",
            detail_back_to_myschedule: "[ ← Zpět do Mého plánu ]",
            detail_view_timetable: "[ 📅 Zobrazit v harmonogramu → ]",
            detail_view_stage: "[ ⛺ Detaily scény → ]",
            detail_view_schedule: "[ ★ Přejít do Mého plánu → ]",
            detail_audio_preview: "[ Zvuková ukázka ]",
            detail_play: "[ ▶ Přehrát ]",
            detail_pause: "[ ❚❚ Pozastavit ]",
            detail_btn_text: "[ ℹ️ Detail → ]",
            schedule_artist_detail_btn: "[ ℹ️ Detail interpreta → ]",
            skip_to_content: "Přejít k hlavnímu obsahu",
            nav_search: "🔍 [ Vyhledávání ]",
            sch_caption_day1: "Harmonogram festivalu na pátek 10. července 2026",
            sch_caption_day2: "Harmonogram festivalu na sobotu 11. července 2026",
            sch_caption_day3: "Harmonogram festivalu na neděli 12. července 2026",
            search_title: "[ Vyhledávání festivalu & Lineupu ]",
            search_placeholder: "Hledat interprety, scény, časy, žánry, informace...",
            search_btn: "[ Hledat ]",
            search_results_for: "Výsledky vyhledávání pro:",
            search_performers: "Odpovídající interpreti",
            search_timetable: "Odpovídající časové sloty",
            search_info: "Scény a praktické informace",
            search_empty: "Pro váš dotaz nebyly nalezeny žádné výsledky.",
            search_quick_pill_all: "[ Zobrazit vše ]"
        }
    };

    // Helper: Determine currently active language
    function getFestivalLang() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            if (urlLang === 'en' || urlLang === 'cs') {
                return urlLang;
            }
        } catch (e) {}

        try {
            const stored = localStorage.getItem(LANG_STORAGE_KEY);
            if (stored === 'en' || stored === 'cs') {
                return stored;
            }
        } catch (e) {}

        return 'en';
    }

    // Set and persist language
    function setFestivalLang(lang) {
        if (lang !== 'en' && lang !== 'cs') {
            lang = 'en';
        }

        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch (e) {}

        document.documentElement.lang = lang;
        applyTranslations(lang);

        // Notify all scripts (schedule.js, artists.js, nav.js, etc.)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
    }

    // Toggle between en and cs
    function toggleFestivalLang() {
        const current = getFestivalLang();
        const next = current === 'cs' ? 'en' : 'cs';
        setFestivalLang(next);
        return next;
    }

    // Apply translations across DOM elements
    function applyTranslations(lang) {
        const dict = I18N[lang] || I18N.en;

        // 1. Update text nodes with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                el.textContent = dict[key];
            }
        });

        // 2. Update HTML nodes with data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });

        // 3. Update input placeholders with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) {
                el.setAttribute('placeholder', dict[key]);
            }
        });

        // 4. Update title/aria attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key] !== undefined) {
                el.setAttribute('title', dict[key]);
            }
        });

        // 5. Update Language Switch Button (Flag + Language or Jazyk text next to it)
        const langBtns = document.querySelectorAll('.lang-switch-btn, #lang-switch-btn');
        langBtns.forEach(btn => {
            const flagEl = btn.querySelector('.flag-icon, [id^="lang-flag"]');
            const labelEl = btn.querySelector('.lang-label, [id^="lang-label"]');
            if (flagEl) {
                const isCs = (lang === 'cs');
                const flagSrc = dict.lang_flag || (isCs ? 'img/1f1e8-1f1ff.svg' : 'img/1f1ec-1f1e7.svg');
                const flagAlt = isCs ? 'CZ' : 'GB';
                flagEl.innerHTML = `<img src="${flagSrc}" alt="${flagAlt}" class="flag-img" width="20" height="20">`;
            }
            if (labelEl) {
                labelEl.textContent = dict.lang_label;
            }
            btn.setAttribute('title', dict.lang_switch_title);
            btn.setAttribute('aria-label', dict.lang_label);
            btn.onclick = toggleFestivalLang;
        });

        // 5b. Update Theme Switch Buttons
        if (typeof window.updateThemeButtons === 'function') {
            window.updateThemeButtons();
        }

        // 6. Update Page Title if mapped
        const path = window.location.pathname.toLowerCase();
        if (path.includes('index.html') || path.endsWith('/') || path === '') {
            document.title = dict.index_title || document.title;
        } else if (path.includes('program.html')) {
            document.title = dict.program_title || document.title;
        } else if (path.includes('artists.html')) {
            document.title = dict.artists_title || document.title;
        } else if (path.includes('stages.html')) {
            document.title = dict.stages_title || document.title;
        } else if (path.includes('practical-info.html')) {
            document.title = dict.practical_title || document.title;
        } else if (path.includes('my-schedule.html')) {
            document.title = dict.schedule_title || document.title;
        }

        // 7. Update elements with lang-conditional visibility (.lang-en vs .lang-cs)
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });
        document.querySelectorAll('.lang-cs').forEach(el => {
            el.style.display = lang === 'cs' ? '' : 'none';
        });
    }

    // Czech grammatical declension / pluralization helper
    function czechPlural(count, form1, form2to4, form5plus) {
        const abs = Math.abs(count);
        if (abs === 1) return form1;
        if (abs >= 2 && abs <= 4) return form2to4;
        return form5plus;
    }

    function formatCzechCount(count, form1, form2to4, form5plus) {
        return `${count} ${czechPlural(count, form1, form2to4, form5plus)}`;
    }

    // Expose helpers globally
    window.getFestivalLang = getFestivalLang;
    window.setFestivalLang = setFestivalLang;
    window.toggleFestivalLang = toggleFestivalLang;
    window.czechPlural = czechPlural;
    window.formatCzechCount = formatCzechCount;
    window.FESTIVAL_I18N = I18N;
    window.ARTIST_BIOS_CS = ARTIST_BIOS_CS;

    // Self-initialize on DOM ready
    function init() {
        const lang = getFestivalLang();
        document.documentElement.lang = lang;
        applyTranslations(lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
