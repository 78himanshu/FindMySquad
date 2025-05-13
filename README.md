# FindMySquad 🏆

**FindMySquad** is a dynamic social sports and fitness platform that helps users find and join local games, connect with gym buddies, rate teammates, and coordinate through in-app messaging.

## 🔥 Key Features

### User Profiles & Preferences
- Users create detailed profiles with skill levels, sports interests, and city preferences.
- Profiles influence matchmaking and game recommendations.

### 🎮 Host Games
- Logged-in users can create a game session by specifying sport, location, date, time, and player limits.
- Hosts can edit or delete their sessions anytime before the start.

### 👥 Join Games
- Users can browse and join nearby upcoming games.
- Duplicate joins and time-clashing sessions are prevented.
- A real-time calendar view is available to see your joined sessions.

### 🚫 Smart Restrictions
- Sessions automatically hide/join buttons once the start time passes.
- "Session is Full" is displayed if the player limit is reached.
- Hosts cannot leave their own games.

### 💬 In-App Chat (Real-Time)
- Players can chat inside each game session until it ends.
- Messages are persisted using MongoDB and expire automatically after the session ends.

### 📬 Email Reminders
- Users receive automated email reminders 1 hour before any joined game.
- Uses scheduled jobs and nodemailer integration.

### 🏋️‍♂️ GymBuddy Finder
- Users can host or join gym workout sessions that are similar to game sessions.
- Preferences are matched by city and skill level.

### ⭐ Ratings & Reviews
- After each game, users can rate teammates.
- Karma points and fairness are emphasized.

### 🏆 Leaderboard & Achievements
- Users gain or lose karma points for behavior like missing games.
- A public leaderboard shows the top players.

### 🌍 Map Integration
- Leaflet.js is used to display the game location on a map.
- Users can visually confirm where the session will take place.

### 🔍 Smart Matchmaking
- Users receive game recommendations based on location, sports interests, and skill level.

### 👫 Friend System
- Users can follow others to keep track of their activity; followers/following numbers are visible on profiles.

### 🕹️ Esports Tournaments
- ⁠*Create & Manage:* Hosts can spin up new tournaments (choose game, format, date/time, skill level, prize pool), then edit or delete them before they start.
-  ⁠*Team Registration:* Users can either create a new team or join an existing one—team‐size & slot counts are enforced, and overlaps (e.g. time conflicts) are blocked.
-⁠  ⁠*Leader Controls:* Tournament creators see a “Manage Teams” view; team leaders can add/remove members or disband their squads.
-⁠  ⁠*Live Status:* Once the tournament’s start time passes, a “Started” badge replaces all join/create buttons.
-  **⁠*Conflict Prevention* blocks overlapping tournament registrations for the same user.**

---

## 🚀 Technologies Used

**Frontend**
- HTML5, CSS3, JavaScript
- Handlebars (Express Templates)
- Leaflet.js for maps

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB & Mongoose ODM

**Libraries & APIs**
- Google Maps API (geolocation)
- Axios for API calls
- Nodemailer for emails
- Socket.IO for real-time chat
- bcrypt & express-session for auth
- dotenv, cookie-parser

---

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/78himanshu/FindMySquad.git
cd FindMySquad

# 2. Install dependencies
npm install

# 3. Start development server (optional live reload if configured)
npm start

# 4. Open your browser
http://localhost:8080
