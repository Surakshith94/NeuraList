# 🧠 NeuraList: Context-Aware Productivity Engine

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

NeuraList is not just another to-do list. It is a full-stack, algorithm-driven productivity dashboard designed to optimize your workflow based on your current energy levels and mood. Built with the MERN stack, it features dynamic time-boxing, browser storage persistence, and real-time data visualization.

## ✨ Core Features

* **⚡ The "Energy Wave" Algorithm:** Instead of a static list, users select their current mood (Energized, Neutral, Burned Out). The algorithm automatically filters, chunks, and reorders tasks. "Burned Out" mode automatically shrinks high-priority tasks into manageable 25-minute sprints.
* **🔥 Consistency Heatmap:** A custom-built, GitHub-style 28-day SVG heatmap that tracks completed tasks and visually maps productivity streaks over time.
* **⏱️ Live Persistent Stopwatch:** An integrated, animated task timer. It utilizes `localStorage` to preserve exact second-counts even if the user accidentally refreshes or closes the browser tab.
* **🎧 Integrated Focus Audio:** Natively embedded Web Audio API player that allows users to toggle ambient Lofi focus music directly from the active task card without browser autoplay blocking.
* **🤏 Physics-Based Drag-and-Drop:** Built using `@dnd-kit`, allowing users to manually override the algorithm and reorder their dynamic queue with smooth, collision-based physics.
* **📊 Real-Time Project Allocation:** Automatically groups database tasks by project tags and calculates the exact time commitment required for the upcoming session.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling & Animations)
* Shadcn UI / Radix UI (Headless accessible modals)
* `@dnd-kit` (Drag and Drop engine)
* Axios (HTTP Client)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose (Schema validation & data modeling)
* CORS & dotenv (Security and environment management)

## 🚀 Local Setup & Installation

Follow these steps to run the application on your local machine.

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/neuralist.git](https://github.com/YOUR_USERNAME/neuralist.git)
cd neuralist
```
### 2. set up the backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory with the following content:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```
start the backend server:
```bash
npm start
```

### 3. set up the frontend
```bash
cd ../client
npm install
```

start the frontend development server:
```bash
npm run dev
```
The application should now be running at `http://localhost:5173` (or the port specified by Vite).

## 🧠 Engineering Highlights
**Overcoming Browser Memory Wipes:** Engineered a dual-state system syncing React useState with browser localStorage to ensure the live stopwatch, current session mood, and custom drag-and-drop array orders survive hard page refreshes.

**Data Archiving vs. Deletion:** Designed a non-destructive database schema. Instead of DELETE requests, completed tasks use PUT requests to update a status and completedAt timestamp, allowing the frontend to generate historical productivity heatmaps.


**desingend by Surakshith**
 

