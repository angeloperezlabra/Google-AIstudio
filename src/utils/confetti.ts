import confetti from 'canvas-confetti';

export function fireStickerConfetti() {
  confetti({
    particleCount: 35,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    disableForReducedMotion: true,
  });
}

export function fireAchievementConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ffd700', '#ff6b6b', '#48dbfb', '#1dd1a1'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ffd700', '#ff6b6b', '#48dbfb', '#1dd1a1'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function fireWinConfetti() {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ffd700', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
  });
}
