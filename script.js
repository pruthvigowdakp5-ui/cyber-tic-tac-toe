/**
 * Tic Tac Toe // Cyber Neon Arena
 * Complete game logic with Minimax AI, Web Audio FX, Strike Line, and Confetti.
 */

(() => {
  'use strict';

  // --- Sound Effects System (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('ttt_sound') !== 'false';
    }

    initCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('ttt_sound', this.enabled);
      return this.enabled;
    }

    playMove(isX = true) {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isX ? 'triangle' : 'sine';
      const freq = isX ? 540 : 420;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playWin() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const startTime = this.ctx.currentTime + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    }

    playTie() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    }

    playClick() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }
  }

  // --- Confetti Particle System ---
  class ConfettiSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animId = null;

      if (this.canvas) {
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire() {
      if (!this.canvas || !this.ctx) return;
      this.particles = [];
      const colors = ['#00f2fe', '#f72585', '#ffd166', '#ffffff', '#4facfe'];
      const count = 90;

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() - 0.5) * 120,
          y: this.canvas.height / 2 + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 14,
          vy: Math.random() * -12 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          decay: Math.random() * 0.012 + 0.008
        });
      }

      if (this.animId) cancelAnimationFrame(this.animId);
      this.loop();
    }

    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // --- Winning Combinations & Strike Coordinates (0-300 scale) ---
  const WIN_PATTERNS = [
    // Rows
    { combo: [0, 1, 2], coords: { x1: 20, y1: 50, x2: 280, y2: 50 } },
    { combo: [3, 4, 5], coords: { x1: 20, y1: 150, x2: 280, y2: 150 } },
    { combo: [6, 7, 8], coords: { x1: 20, y1: 250, x2: 280, y2: 250 } },
    // Columns
    { combo: [0, 3, 6], coords: { x1: 50, y1: 20, x2: 50, y2: 280 } },
    { combo: [1, 4, 7], coords: { x1: 150, y1: 20, x2: 150, y2: 280 } },
    { combo: [2, 5, 8], coords: { x1: 250, y1: 20, x2: 250, y2: 280 } },
    // Diagonals
    { combo: [0, 4, 8], coords: { x1: 25, y1: 25, x2: 275, y2: 275 } },
    { combo: [2, 4, 6], coords: { x1: 275, y1: 25, x2: 25, y2: 275 } }
  ];

  // --- SVG Mark Templates ---
  const SVG_MARK_X = `
    <svg viewBox="0 0 50 50">
      <line x1="12" y1="12" x2="38" y2="38" stroke="currentColor" stroke-width="7" stroke-linecap="round"></line>
      <line x1="38" y1="12" x2="12" y2="38" stroke="currentColor" stroke-width="7" stroke-linecap="round"></line>
    </svg>`;

  const SVG_MARK_O = `
    <svg viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="16" stroke="currentColor" stroke-width="7" fill="none"></circle>
    </svg>`;

  // --- Game App Controller ---
  class TicTacToeGame {
    constructor() {
      // DOM Elements
      this.cells = Array.from(document.querySelectorAll('.cell'));
      this.strikeLine = document.getElementById('strike-line');
      this.statusText = document.getElementById('status-text');
      this.statusBar = document.getElementById('status-bar');

      this.playerXCard = document.getElementById('player-x-card');
      this.playerOCard = document.getElementById('player-o-card');
      this.nameX = document.getElementById('name-x');
      this.nameO = document.getElementById('name-o');

      this.scoreXEl = document.getElementById('score-x');
      this.scoreOEl = document.getElementById('score-o');
      this.scoreTiesEl = document.getElementById('score-ties');
      this.scoreStreakEl = document.getElementById('score-streak');

      this.btnUndo = document.getElementById('btn-undo');
      this.btnRestart = document.getElementById('btn-restart');
      this.btnResetScores = document.getElementById('btn-reset-scores');
      this.btnSound = document.getElementById('btn-sound');
      this.soundIconOn = document.getElementById('sound-icon-on');
      this.soundIconOff = document.getElementById('sound-icon-off');

      this.modePvE = document.getElementById('mode-pve');
      this.modePvP = document.getElementById('mode-pvp');
      this.aiDiffWrapper = document.getElementById('ai-difficulty-wrapper');
      this.diffButtons = Array.from(document.querySelectorAll('.diff-btn'));

      // Modal
      this.modal = document.getElementById('result-modal');
      this.modalBadge = document.getElementById('modal-badge');
      this.modalWinnerAvatar = document.getElementById('modal-winner-avatar');
      this.modalTitle = document.getElementById('modal-title');
      this.modalDesc = document.getElementById('modal-desc');
      this.modalPlayAgain = document.getElementById('modal-play-again');

      // Audio & Confetti
      this.sound = new SoundFX();
      this.confetti = new ConfettiSystem('confetti-canvas');

      // State
      this.board = Array(9).fill('');
      this.currentPlayer = 'X';
      this.gameActive = true;
      this.gameMode = 'pve'; // 'pve' or 'pvp'
      this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
      this.history = []; // stack of board snapshots
      this.scores = this.loadScores();

      this.init();
    }

    loadScores() {
      const stored = localStorage.getItem('ttt_scores_v2');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
      return { x: 0, o: 0, ties: 0, streak: 0 };
    }

    saveScores() {
      localStorage.setItem('ttt_scores_v2', JSON.stringify(this.scores));
      this.updateScoreboard();
    }

    init() {
      this.bindEvents();
      this.updateSoundButtonUI();
      this.updateScoreboard();
      this.resetRound();
    }

    bindEvents() {
      // Cell clicks
      this.cells.forEach(cell => {
        cell.addEventListener('click', (e) => this.handleCellClick(e));
      });

      // Actions
      this.btnRestart.addEventListener('click', () => {
        this.sound.playClick();
        this.resetRound();
      });

      this.btnResetScores.addEventListener('click', () => {
        this.sound.playClick();
        if (confirm('Are you sure you want to reset all scores and streaks?')) {
          this.scores = { x: 0, o: 0, ties: 0, streak: 0 };
          this.saveScores();
        }
      });

      this.btnUndo.addEventListener('click', () => {
        this.handleUndo();
      });

      this.btnSound.addEventListener('click', () => {
        const enabled = this.sound.toggle();
        this.updateSoundButtonUI();
        if (enabled) this.sound.playClick();
      });

      // Mode toggles
      this.modePvE.addEventListener('click', () => this.switchMode('pve'));
      this.modePvP.addEventListener('click', () => this.switchMode('pvp'));

      // AI Difficulty
      this.diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.sound.playClick();
          this.diffButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.aiDifficulty = btn.getAttribute('data-diff');
          this.resetRound();
        });
      });

      // Modal
      this.modalPlayAgain.addEventListener('click', () => {
        this.sound.playClick();
        this.hideModal();
        this.resetRound();
      });

      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hideModal();
        }
      });
    }

    switchMode(mode) {
      if (this.gameMode === mode) return;
      this.sound.playClick();
      this.gameMode = mode;

      if (mode === 'pve') {
        this.modePvE.classList.add('active');
        this.modePvP.classList.remove('active');
        this.modePvE.setAttribute('aria-selected', 'true');
        this.modePvP.setAttribute('aria-selected', 'false');
        this.aiDiffWrapper.classList.remove('hidden');
        this.nameO.textContent = 'AI Bot';
      } else {
        this.modePvP.classList.add('active');
        this.modePvE.classList.remove('active');
        this.modePvP.setAttribute('aria-selected', 'true');
        this.modePvE.setAttribute('aria-selected', 'false');
        this.aiDiffWrapper.classList.add('hidden');
        this.nameO.textContent = 'Player 2';
      }

      this.resetRound();
    }

    updateSoundButtonUI() {
      if (this.sound.enabled) {
        this.soundIconOn.classList.remove('hidden');
        this.soundIconOff.classList.add('hidden');
        this.btnSound.title = 'Sound FX: On (Click to Mute)';
      } else {
        this.soundIconOn.classList.add('hidden');
        this.soundIconOff.classList.remove('hidden');
        this.btnSound.title = 'Sound FX: Off (Click to Enable)';
      }
    }

    updateScoreboard() {
      this.scoreXEl.textContent = this.scores.x;
      this.scoreOEl.textContent = this.scores.o;
      this.scoreTiesEl.textContent = this.scores.ties;
      this.scoreStreakEl.textContent = this.scores.streak;
    }

    resetRound() {
      this.board = Array(9).fill('');
      this.currentPlayer = 'X';
      this.gameActive = true;
      this.history = [];
      this.btnUndo.disabled = true;

      // Clear Cells UI
      this.cells.forEach((cell, idx) => {
        cell.innerHTML = '';
        cell.className = 'cell';
        cell.setAttribute('aria-label', `Cell ${idx + 1}, empty`);
      });

      // Clear Strike line
      this.clearStrikeLine();

      // UI state
      this.updateTurnCards();
      const firstPlayerName = this.currentPlayer === 'X' ? 'Player 1 (X)' : (this.gameMode === 'pve' ? 'AI Bot (O)' : 'Player 2 (O)');
      this.statusText.textContent = `${firstPlayerName}'s turn to start!`;
      this.statusBar.classList.remove('highlight');
    }

    updateTurnCards() {
      if (this.currentPlayer === 'X') {
        this.playerXCard.classList.add('active-turn');
        this.playerOCard.classList.remove('active-turn');
        this.playerXCard.querySelector('.turn-indicator').textContent = 'Your Turn';
        this.playerOCard.querySelector('.turn-indicator').textContent = 'Waiting';
      } else {
        this.playerOCard.classList.add('active-turn');
        this.playerXCard.classList.remove('active-turn');
        this.playerOCard.querySelector('.turn-indicator').textContent = this.gameMode === 'pve' ? 'Computing...' : 'Your Turn';
        this.playerXCard.querySelector('.turn-indicator').textContent = 'Waiting';
      }
    }

    handleCellClick(e) {
      if (!this.gameActive) return;

      const cell = e.currentTarget;
      const index = parseInt(cell.getAttribute('data-index'), 10);

      // Prevent clicking taken cells
      if (this.board[index] !== '') return;

      // In PvE, prevent clicking during AI's turn
      if (this.gameMode === 'pve' && this.currentPlayer === 'O') return;

      // Save state for undo
      this.history.push({
        board: [...this.board],
        player: this.currentPlayer
      });
      this.btnUndo.disabled = false;

      this.makeMove(index, this.currentPlayer);

      // If game still active and vs AI, trigger AI move
      if (this.gameActive && this.gameMode === 'pve' && this.currentPlayer === 'O') {
        this.statusText.textContent = 'AI is calculating move...';
        setTimeout(() => {
          if (!this.gameActive) return;
          const aiMove = this.getBestMove();
          if (aiMove !== -1) {
            this.makeMove(aiMove, 'O');
          }
        }, 450);
      }
    }

    makeMove(index, player) {
      this.board[index] = player;
      const cell = this.cells[index];

      cell.innerHTML = player === 'X' ? SVG_MARK_X : SVG_MARK_O;
      cell.classList.add('taken', player === 'X' ? 'x-cell' : 'o-cell');
      cell.setAttribute('aria-label', `Cell ${index + 1}, ${player}`);

      this.sound.playMove(player === 'X');

      // Check win or draw
      const winData = this.checkWin(this.board);

      if (winData) {
        this.handleWin(winData);
        return;
      }

      if (this.checkDraw(this.board)) {
        this.handleDraw();
        return;
      }

      // Switch turn
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.updateTurnCards();

      const name = this.currentPlayer === 'X' ? 'Player 1 (X)' : (this.gameMode === 'pve' ? 'AI Bot' : 'Player 2 (O)');
      this.statusText.textContent = `${name}'s turn`;
    }

    handleUndo() {
      if (this.history.length === 0 || !this.gameActive) return;

      this.sound.playClick();

      let targetState;
      if (this.gameMode === 'pve') {
        // In AI mode, undo 2 moves (both AI and human) if it was human turn, or 1 if during AI
        if (this.history.length >= 2) {
          this.history.pop(); // Remove AI move
          targetState = this.history.pop(); // Remove player move, restore prior
        } else {
          targetState = this.history.pop();
        }
      } else {
        targetState = this.history.pop();
      }

      const restoredBoard = targetState ? targetState.board : Array(9).fill('');
      const restoredPlayer = targetState ? targetState.player : 'X';

      this.board = [...restoredBoard];
      this.currentPlayer = restoredPlayer;

      // Re-render cells
      this.cells.forEach((cell, idx) => {
        const val = this.board[idx];
        cell.className = 'cell';
        if (val === 'X') {
          cell.innerHTML = SVG_MARK_X;
          cell.classList.add('taken', 'x-cell');
          cell.setAttribute('aria-label', `Cell ${idx + 1}, X`);
        } else if (val === 'O') {
          cell.innerHTML = SVG_MARK_O;
          cell.classList.add('taken', 'o-cell');
          cell.setAttribute('aria-label', `Cell ${idx + 1}, O`);
        } else {
          cell.innerHTML = '';
          cell.setAttribute('aria-label', `Cell ${idx + 1}, empty`);
        }
      });

      this.clearStrikeLine();
      this.updateTurnCards();
      this.statusText.textContent = `Move undone. ${this.currentPlayer}'s turn`;

      if (this.history.length === 0) {
        this.btnUndo.disabled = true;
      }
    }

    checkWin(board) {
      for (const pattern of WIN_PATTERNS) {
        const [a, b, c] = pattern.combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return {
            winner: board[a],
            combo: pattern.combo,
            coords: pattern.coords
          };
        }
      }
      return null;
    }

    checkDraw(board) {
      return board.every(cell => cell !== '') && !this.checkWin(board);
    }

    handleWin(winData) {
      this.gameActive = false;
      this.btnUndo.disabled = true;

      const winner = winData.winner;
      const isX = winner === 'X';

      // Highlight winning cells
      winData.combo.forEach(idx => {
        this.cells[idx].classList.add('win-cell');
      });

      // Draw dynamic strike line
      this.drawStrikeLine(winData.coords, isX);

      // Update Scores & Streaks
      if (isX) {
        this.scores.x++;
        this.scores.streak++;
      } else {
        this.scores.o++;
        this.scores.streak = 0;
      }
      this.saveScores();

      // Audio & Confetti
      this.sound.playWin();
      if (isX || this.gameMode === 'pvp') {
        this.confetti.fire();
      }

      // Status text
      const winnerName = isX ? 'Player 1 (X)' : (this.gameMode === 'pve' ? 'AI Bot (O)' : 'Player 2 (O)');
      this.statusText.textContent = `🎉 ${winnerName} Wins!`;
      this.statusBar.classList.add('highlight');

      // Show Modal after brief delay
      setTimeout(() => {
        this.showVictoryModal(winner);
      }, 700);
    }

    handleDraw() {
      this.gameActive = false;
      this.btnUndo.disabled = true;

      this.scores.ties++;
      this.scores.streak = 0;
      this.saveScores();

      this.sound.playTie();
      this.statusText.textContent = "It's a Stalemate Draw!";
      this.statusBar.classList.add('highlight');

      setTimeout(() => {
        this.showTieModal();
      }, 600);
    }

    drawStrikeLine(coords, isX) {
      const line = this.strikeLine;
      line.setAttribute('x1', coords.x1);
      line.setAttribute('y1', coords.y1);
      line.setAttribute('x2', coords.x2);
      line.setAttribute('y2', coords.y2);

      line.className = isX ? 'x-win' : 'o-win';

      const length = Math.hypot(coords.x2 - coords.x1, coords.y2 - coords.y1);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;

      // Force reflow
      line.getBoundingClientRect();
      line.style.strokeDashoffset = '0';
    }

    clearStrikeLine() {
      const line = this.strikeLine;
      line.removeAttribute('class');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', '0');
      line.setAttribute('y2', '0');
      line.style.strokeDasharray = 'none';
      line.style.strokeDashoffset = 'none';
    }

    showVictoryModal(winner) {
      const isX = winner === 'X';
      const winnerName = isX ? 'PLAYER 1' : (this.gameMode === 'pve' ? 'AI BOT' : 'PLAYER 2');

      this.modalBadge.textContent = 'VICTORY REACHED';
      this.modalWinnerAvatar.className = `modal-winner-avatar ${isX ? 'winner-x' : 'winner-o'}`;
      this.modalWinnerAvatar.innerHTML = isX ? SVG_MARK_X : SVG_MARK_O;
      this.modalTitle.textContent = `${winnerName} TAKES THE MATCH!`;
      this.modalDesc.textContent = isX
        ? 'Supreme grid mastery. Continue your tactical win streak!'
        : (this.gameMode === 'pve' ? 'The neural machine prevailed this time. Ready for revenge?' : 'Outstanding match! Ready for the next round?');

      this.modal.classList.remove('hidden');
    }

    showTieModal() {
      this.modalBadge.textContent = 'GAME OVER';
      this.modalWinnerAvatar.className = 'modal-winner-avatar winner-tie';
      this.modalWinnerAvatar.innerHTML = '⚖️';
      this.modalTitle.textContent = 'HONORABLE DRAW!';
      this.modalDesc.textContent = 'Equally matched defenses. Neither grid surrendered.';

      this.modal.classList.remove('hidden');
    }

    hideModal() {
      this.modal.classList.add('hidden');
    }

    // --- AI Engine (Easy, Medium, Minimax Master) ---
    getBestMove() {
      const emptyIndices = this.board
        .map((val, idx) => (val === '' ? idx : null))
        .filter(val => val !== null);

      if (emptyIndices.length === 0) return -1;

      // 1. Easy Mode: 80% random, 20% tactical
      if (this.aiDifficulty === 'easy') {
        if (Math.random() > 0.25) {
          return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      }

      // 2. Medium Mode: Check if AI can win, or block human win, else pick center or random
      if (this.aiDifficulty === 'medium') {
        // Can AI win in 1 move?
        for (const idx of emptyIndices) {
          const tempBoard = [...this.board];
          tempBoard[idx] = 'O';
          if (this.checkWin(tempBoard)) return idx;
        }

        // Can human win in 1 move? Block it!
        for (const idx of emptyIndices) {
          const tempBoard = [...this.board];
          tempBoard[idx] = 'X';
          if (this.checkWin(tempBoard)) return idx;
        }

        // Take center if available
        if (this.board[4] === '') return 4;

        // Otherwise random
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }

      // 3. Hard Mode: Unbeatable Minimax
      return this.minimaxBestMove();
    }

    minimaxBestMove() {
      let bestScore = -Infinity;
      let move = -1;

      // If center is available as first AI move, take center immediately (optimization)
      if (this.board[4] === '' && Math.random() < 0.8) {
        return 4;
      }

      for (let i = 0; i < 9; i++) {
        if (this.board[i] === '') {
          this.board[i] = 'O';
          const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
          this.board[i] = '';

          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }

      return move !== -1 ? move : this.board.indexOf('');
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
      const winData = this.checkWin(board);
      if (winData) {
        return winData.winner === 'O' ? (10 - depth) : (depth - 10);
      }
      if (this.checkDraw(board)) {
        return 0;
      }

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'O';
            const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
            board[i] = '';
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
          }
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'X';
            const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
            board[i] = '';
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
          }
        }
        return minEval;
      }
    }
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
  });
})();
