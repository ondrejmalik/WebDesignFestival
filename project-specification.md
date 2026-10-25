# Festival Website Project Specification

## 1. Festival Identity

| Item | Specification |
|---|---|
| **Name** | Festival of Darkness 2 |
| **Edition** | 2026 |
| **Location** | Kutna Hora, Czech Republic |
| **Date Range** | July 10 – July 12, 2026 (3 days) |
| **Festival Character** | Three-day music festival of electronic, alternative, and audiovisual art across two distinct stages (open-air amphitheater and covered marquee dome). |
| **Main Genres / Themes** | Post-Rock, Ambient, Indie Pop/Rock, Techno, and Experimental Electronics. |

---

## 2. Website Purpose

**What the website serves for:**
Acts as the primary digital guide for the festival, presenting all 60 performers, the 3-day timetable, and organizational guidelines for the Kutna Hora venue.

**Primary website goals:**
- Provide a clear, intuitive schedule for both stages (Solar Horizon Stage and Lunar Forest Dome).
- Showcase performer profiles and music samples.
- Deliver essential practical information ensuring a seamless visitor experience.

**Key user actions:**
- Identifying performance time and stage for any selected artist.
- Saving selected performances into a personal schedule.
- Locating transit instructions, venue maps, and festival rules.

---

## 3. Target Groups

**1. Alternative and Electronic Music Fans (Ages 18–35)**
- **Needs:** Rapid access to the lineup, artist discovery, and personal itinerary planning.
- **Expectations:** Fast, mobile-responsive layout for effortless navigation directly under the stage.
- **Features needed:** Interactive schedule with filtering, ability to save favorite performers.

**2. General Visitors and Locals (Ages 20–50)**
- **Needs:** Finding how and when to reach the venue, checking the main open-air stage schedule.
- **Expectations:** Concise, factual, easily discoverable practical details.
- **Features needed:** "Practical Info" section, clear navigation bar, stage descriptions.

---

## 4. Information Architecture

**Sitemap / Website Structure:**
- `/` (`index.html`) – Homepage (Hero identity, highlights, section directory)
- `/program` (`program.html`) – Complete schedule
    - Day 1: Friday, July 10
    - Day 2: Saturday, July 11
    - Day 3: Sunday, July 12
- `/artists` (`artists.html`) – Catalog of 60 artists with search & detail view
- `/stages` (`stages.html`) – Presentation of 2 stages + venue map
- `/practical-info` (`practical-info.html`) – Transit to Kutna Hora, camping, cashless, FAQ
- `/my-schedule` (`my-schedule.html`) – Personal schedule / planner (LocalStorage)

**Main Navigation:**
[ Festival of Darkness 2 ] | [ Home ] | [ Program ] | [ Artists ] | [ Stages ] | [ Practical Info ] | [ My Schedule ]

**Entity Relationships:**
- Each **Performance** takes place at exactly one **Stage** (Solar Horizon or Lunar Forest).
- Each **Performance** is associated with exactly one **Performer**.
- A **Schedule Item** connects a specific time slot, Performer, and Stage.

**Purpose of Individual Sections:**
- **Homepage:** Eye-catcher, festival identity, key parameters, quick section routing.
- **Program:** Timeline filterable by 3 festival days, 2 stages, and genres.
- **Artists:** Performer catalog (name, genre, country of origin, detail modal/view).
- **Stages:** Stage venue profiles (capacity, indoor/outdoor type, atmosphere).
- **Practical Info:** Structured guidance on transport, accommodation, rules, and FAQ.
- **My Schedule (Interactive):** Custom itinerary where visitors save shows (persisted in browser LocalStorage with clash detection).

---

## 5. User Scenarios

**Scenario 1: Finding the Covered Stage Timetable**
- **User type:** Festival attendee at the venue.
- **Goal:** Check who is playing tonight at the indoor Lunar Forest Dome.
- **Context:** Rain begins to fall; attendee needs to move under a roof and checks the site on mobile.
- **Expected result:** User taps "Stages" or "Program" in the navigation, selects "Lunar Forest Dome", and instantly views the chronological timetable for the current day.

**Scenario 2: Creating a Personal Weekend Itinerary**
- **User type:** Fan preparing for the festival.
- **Goal:** Bookmark preferred concerts to avoid scheduling collisions between Solar and Lunar stages.
- **Context:** User is on a desktop computer reviewing the schedule before the festival.
- **Expected result:** User clicks "+ Add to My Schedule" on desired performances. In the "My Schedule" tab, they see a conflict-free chronological agenda for all 3 days.

**Scenario 3: Traveling to Kutna Hora**
- **User type:** Out-of-town visitor.
- **Goal:** Learn how to reach the festival venue from the train station.
- **Context:** Attendee arrives at Kutna Hora main railway station.
- **Expected result:** Opens "Practical Info" and finds festival shuttle bus departure frequency and walking directions to the festival grounds.

---

## 6. AI Usage Reflection

| Required Point of Reflection | Team Evaluation |
|---|---|
| **What AI was used for** | Structuring the Markdown specification, formatting user scenarios, and generating consistent entity relations directly aligned with the festival's XML dataset. |
| **How output was verified** | Verified consistency against `data.xml`: 3 days (July 10–12, 2026), 2 stages (Solar and Lunar), 60 performers, and compliance with course requirements. |
| **What was accepted** | Clean, minimalist architectural structure, clear user personas, and linking scenarios to actual database stages and performers. |
| **What was modified or rejected** | Removed unnecessary feature bloat (e.g. backend authentication, payment gateways) to keep the project strictly compliant with pure client-side constraints. |
| **Identified limits and errors** | AI initially tended to suggest complex server-side architectures; manual intervention was needed to restrict the design to clean client-side static web rules. |
