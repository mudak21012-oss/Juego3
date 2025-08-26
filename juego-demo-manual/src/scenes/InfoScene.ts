import Phaser from "phaser";
import Fonts from "../assets/Fonts";
import { VERSION } from "../version";

export default class InfoScene extends Phaser.Scene {
  text?: Phaser.GameObjects.DynamicBitmapText;
  lastUpdate?: number;

  constructor() {
    super({ key: "InfoScene" });
  }

  preload(): void {
    this.load.bitmapFont("default", ...Fonts.default);
  }

  create(): void {
    this.text = this.add.dynamicBitmapText(25, 25, "default", "", 12);
    this.text.setAlpha(0.7);
    this.lastUpdate = 0;
  }

  update(time: number, _: number): void {
    if (time > this.lastUpdate! + 100) {
      // Obtener la escena del juego principal para acceder al timer
      const dungeonScene = this.scene.get("DungeonScene") as any;
      let timerText = "TIMER: --";
      
      if (dungeonScene && dungeonScene.map) {
        const timeLeft = dungeonScene.map.getTimeToUnlock();
        const seconds = Math.ceil(timeLeft / 1000);
        if (timeLeft > 0) {
          timerText = `TIMER: ${seconds}s`;
        } else {
          timerText = "PUERTAS ABIERTAS!";
        }
      }
      
      this.text!.setText([
        `FPS: ${Math.round(this.game.loop.actualFps)}    ${timerText}    VERSION: ${VERSION.toString()}`
      ]);
      this.lastUpdate = time;
    }
  }
}
