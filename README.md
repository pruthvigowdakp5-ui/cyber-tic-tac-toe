# ⚡ Tic Tac Toe // Cyber Neon Arena

A futuristic, highly responsive **Tic-Tac-Toe Web App** built with modern HTML5, CSS3, and Vanilla JavaScript. Features neon aesthetics, dynamic SVG strike animations, Web Audio sound effects, confetti celebrations, and an unbeatable Minimax AI engine.

![Game Preview](https://img.shields.io/badge/Status-Complete-00f2fe?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript-f72585?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-ffd166?style=for-the-badge)

---

## 🚀 Features

- 🤖 **Single Player vs AI**:
  - **Easy**: Casual, playful AI moves.
  - **Medium**: Tactical AI that blocks your wins and takes winning moves.
  - **Master**: Mathematically unbeatable **Minimax algorithm** with alpha-beta pruning.
- 👥 **2-Player Pass & Play**: Challenge friends on the same device.
- 🔊 **Built-in Web Audio FX**: Synthesized sound effects for moves, wins, ties, and button clicks (no external audio files needed; includes a mute toggle).
- ⚡ **Dynamic Neon Strike Line**: An animated SVG beam slashes across the winning line in real time.
- 🎊 **Confetti Celebration**: Full-screen canvas particle explosion upon victory.
- 💾 **Score & Streak Tracker**: Tracks Player 1 wins, Player 2 / AI wins, draws, and current win streaks using `localStorage`.
- ↩️ **Undo Move**: Made a mistake? Step backward anytime.
- 📱 **Mobile & Desktop Responsive**: Glassmorphic frosted cards, ambient animated light orbs, and tactile touch interactions.

---

## 🎮 How to Play Locally Before Pushing to Git

You do not need to install complex tools to test and play this game! Choose either method below:

### Method 1: Instant Direct Launch (Easiest)
1. Open this folder in your File Explorer: `f:\New folder`
2. Double-click **`index.html`** (or right-click and choose **Open with Google Chrome / Microsoft Edge / Brave**).
3. The game will instantly open and you can start playing!

### Method 2: Run via Local Web Server
If you have Node.js or Python installed, you can also run a quick local server:

**Using Node.js:**
```bash
npx serve .
```
Then visit `http://localhost:3000` in your browser.

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 📦 How to Push this Project to GitHub (Step-by-Step)

Follow these exact steps to push your game to GitHub and publish it online for free:

### Step 1: Initialize Git in your folder (already done for you or run below)
Open a terminal in this folder and run:
```bash
git init
git add .
git commit -m "Initial commit: Cyber Neon Tic Tac Toe web app"
```

### Step 2: Create a New Repository on GitHub
1. Go to [github.com](https://github.com) and log in.
2. Click the **`+`** icon in the top-right corner and select **New repository**.
3. Name your repository (for example: `tic-tac-toe-neon`).
4. Keep it **Public** (so you can use GitHub Pages for free).
5. **Do NOT** check "Add a README file" or ".gitignore" (we already have those).
6. Click **Create repository**.

### Step 3: Link & Push to GitHub
GitHub will show you commands. Copy and run the following in your terminal (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your own):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 🌐 Publish Online for Free with GitHub Pages

Once pushed to GitHub, you can turn this into a live link anyone can play on their phone or computer:

1. In your GitHub repository, click **Settings** (tab at the top).
2. On the left sidebar, click **Pages**.
3. Under **Branch**, select `main` and keep `/ (root)`.
4. Click **Save**.
5. Wait ~60 seconds, and GitHub will provide you a live URL like:  
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 📁 File Structure

```text
├── index.html       # Clean semantic layout, controls, grid, & modal
├── style.css        # Futuristic neon design system, animations & glassmorphism
├── script.js        # Minimax AI, Web Audio API, Confetti & game engine
├── .gitignore       # Git ignore rules for clean repository
└── README.md        # Documentation and Git guide
```

---

## 🛠️ Customization Tips

- **Change Player Colors**: Modify `--neon-cyan` and `--neon-pink` in `style.css`.
- **Change Default Difficulty**: In `script.js`, change `this.aiDifficulty = 'medium';` to `'hard'`.
- **Add Your Name**: Edit `#name-x` in `index.html`.
