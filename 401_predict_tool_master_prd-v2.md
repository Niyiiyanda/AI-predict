# 401 PREDICT TOOL — MASTER PRD (v2.0)
## Automated Football Forecasting & Predictive Analytics Engine (2026/27 European Season)

---

### 1. Executive Overview & System Objective
The **401 Predict Tool** is an automated mathematical modeling and forecasting application designed for Europe's top five domestic football leagues (Premier League, La Liga, Bundesliga, Serie A, and Ligue 1) for the active **2026/27 season**. The tool integrates live API data ingestion, 7-to-10 match rolling feature engineering ($V_1$ through $V_5$), an XGBoost/Machine Learning ensemble, Dixon-Coles bivariate Poisson distribution modeling, and Expected Value (+EV) bookmaker market analysis.

---

### 2. Temporal & System Integrity Specifications
- **Reference System Year:** Standardized to active **2026/27 European Football Season** using West Africa Time (WAT / `Africa/Lagos` UTC+1) system date.
- **Season Resolution:** August cutoff: `month >= 8 ? current_year : current_year - 1`. For October 2026, season resolves to `2026/2027`.
- **Zero Mock / Fallback Datasets:** Hardcoded fallback datasets, static fixtures, and placeholder teams are strictly prohibited. The live official REST API is the single source of truth.
- **Fail-Fast Engine Blocker:** Any failure to connect to official data endpoints or corrupted match integrity immediately triggers `ENGINE STATUS: BLOCKER`.

---

### 3. Data Routing & Ingestion Architecture

#### 3.1 Primary Data Routing
- **English Premier League:** Official Fantasy Premier League REST API:
  - Bootstrap & Teams Roster: `https://fantasy.premierleague.com/api/bootstrap-static/`
  - Match Fixtures & Events: `https://fantasy.premierleague.com/api/fixtures/`
- **European Leagues (La Liga, Bundesliga, Serie A, Ligue 1):** API-Football v3 REST API (`https://v3.football.api-sports.io/fixtures`).
- **Bookmaker Odds & +EV Analysis:** The Odds API (`https://api.the-odds-api.com/v4/sports/`).
- **Prohibited Provider:** Football-Data.org is 100% prohibited and purged.

#### 3.2 Two-Step Dynamic FPL Fetch Workflow
1. **Step 1 (Bootstrap Ingestion):** Execute a `GET` request to `https://fantasy.premierleague.com/api/bootstrap-static/`. Extract the `teams` array on every execution to dynamically construct a runtime dictionary mapping `team.id` $\to$ `team.name`.
2. **Step 2 (Fixtures Ingestion & ID Resolution):** Execute a `GET` request to `https://fantasy.premierleague.com/api/fixtures/`. Map `team_h` (Home) and `team_a` (Away) IDs dynamically against the dictionary built in Step 1.
3. **Execution Blocker:** If either API request fails or returns invalid payloads, the engine halts immediately and throws: `ENGINE STATUS: BLOCKER`.

#### 3.3 Division Roster Firewall (2026/27 Season)

##### Active 2026/27 Clubs:
Arsenal, Aston Villa, Bournemouth, Brentford, Brighton & Hove Albion, Chelsea, Coventry City, Crystal Palace, Everton, Fulham, Hull City, Ipswich Town, Leeds United, Liverpool, Manchester City, Manchester United, Newcastle United, Nottingham Forest, Sunderland, Tottenham Hotspur.

##### Prohibited Clubs:
Southampton, Burnley, Luton Town, Sheffield United, Leicester City, West Ham United, Wolverhampton Wanderers.

*Note:* In production code, all hardcoded team arrays are removed; the live API payload from `https://fantasy.premierleague.com/api/bootstrap-static/` serves as the single source of truth on every execution for dynamically fetching and verifying the 20 active division clubs. If any API call fails, the engine throws a fatal error: `ENGINE STATUS: BLOCKER`.

---

### 4. Mathematical Modeling & Feature Engineering ($V_1 - V_5$)

#### 4.1 Boundary Normalization Formulas (1.0 to 10.0 Standard Scale)
All 5 core variables are derived from 7-to-10 match rolling averages and bounded within $[1.0, 10.0]$:

1. **$V_1$ Defensive Solidity:**
   $$\text{Raw } V_1 = \text{xGA} + \text{Interceptions} + \text{Blocks}$$
   $$V_1 = \min\left(10.0, \max\left(1.0, \frac{\text{Raw } V_1}{100.0} \times 9.0 + 1.0\right)\right)$$

2. **$V_2$ Duel Success:**
   $$\text{Raw } V_2 = \left(\frac{\text{Total Duels Won}}{\text{Total Duels Contested}}\right) \times 100\%$$
   $$V_2 = \begin{cases} 5.5 & \text{if Total Duels Contested } < 20 \\ \min\left(10.0, \max\left(1.0, \frac{\text{Raw } V_2}{100.0} \times 9.0 + 1.0\right)\right) & \text{otherwise} \end{cases}$$

3. **$V_3$ Goalkeeper Performance:**
   $$V_3 = \min\left(10.0, \max\left(1.0, \left(\frac{\text{Save \%}}{100} \times 0.7 \times 9\right) + \left(\frac{\text{Keeper Rating}}{10} \times 0.3 \times 9\right) + 1.0\right)\right)$$

4. **$V_4$ Chance Creation:**
   $$\text{Raw } V_4 = \text{xA} + \text{xG Buildup} + \text{Progressive Passes}$$
   $$V_4 = \begin{cases} 1.0 & \text{if Total Shots } = 0 \\ \min\left(10.0, \max\left(1.0, \frac{\text{Raw } V_4}{100.0} \times 9.0 + 1.0\right)\right) & \text{otherwise} \end{cases}$$

5. **$V_5$ Shooting Quality:**
   $$\text{Raw } V_5 = \text{xGOT} - \text{npxG}$$
   $$V_5 = \min\left(10.0, \max\left(1.0, 5.5 + (\text{Raw } V_5 \times 3.0)\right)\right)$$

---

### 5. Prediction Output Architecture (Strict 4-Part Report)
1. **Header & Fixture Title:** 🏟️ MATCH PREDICTION: [HOME TEAM] vs [AWAY TEAM] (League, Gameweek, Season).
2. **Team Tactical Form & Variable Snapshot:** Display Dynamic DCN Form Score, Form Grade, and $V_1$ through $V_5$ Metrics.
3. **38 Market Outcome Probability Matrix:** Categorized into:
   - 🟢 Realistic Tier ($\ge 70\%$)
   - 🟡 Probable Tier ($55\% - 69\%$)
   - 🔴 Risky / Value Tier ($< 50\%$)
4. **Key Player Matchups & Prop Intelligence:** 3 tactical 1v1 clashes with positional advantage ratings and Anytime Goal, Assist, Shots on Target, and Card risks.
5. **AI Analyst Preview:** 3-part tactical breakdown (Form Foundations, Tactical Mismatches, Dual-Perspective Betting Strategy).
