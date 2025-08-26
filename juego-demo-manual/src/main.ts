import Phaser from "phaser";
import ReferenceScene from "./scenes/ReferenceScene";
import DungeonScene from "./scenes/DungeonScene";
import InfoScene from "./scenes/InfoScene";
import SpritePickerScene from "./scenes/SpritePickerScene";
import HUDScene from "./scenes/HUDScene";
import { VERSION } from "./version";
// import SceneWatcherPlugin from "phaser-plugin-scene-watcher";

console.log(`[GAME] 🚀 Dungeon Dash iniciando - Versión ${VERSION.toString()}`);

new Phaser.Game({
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  render: { pixelArt: true },
  physics: { default: "arcade", arcade: { debug: false, gravity: { y: 0 } } },
  scene: [DungeonScene, InfoScene, HUDScene, ReferenceScene, SpritePickerScene],
  scale: {
    mode: Phaser.Scale.RESIZE
  }
  // plugins: {
  //   global: [{ key: "SceneWatcher", plugin: SceneWatcherPlugin, start: true }]
  // }
});
