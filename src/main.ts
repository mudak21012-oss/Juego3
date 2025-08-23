const __canary = document.getElementById('canary') || document.createElement('div');
if (!__canary.id) {
  __canary.id = 'canary';
  __canary.textContent = 'ENTRY OK — ARENA';
  document.body.appendChild(__canary);
}
console.log('[CANARY] main.ts cargado', new Date().toISOString());

import Phaser from 'phaser';
import ArenaLite from './scenes/ArenaLite';

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#000',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 600 },
  physics: { default: 'arcade', arcade: { debug: false } },
  render: { pixelArt: true, antialias: false, roundPixels: true },
  scene: [ArenaLite],
} as Phaser.Types.Core.GameConfig);
