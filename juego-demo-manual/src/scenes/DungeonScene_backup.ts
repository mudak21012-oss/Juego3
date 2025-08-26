import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import FOVLayer from "../entities/FOVLayer";
import Player from "../entities/Player";
import Slime from "../entities/Slime";
import Map from "../entities/Map";
import { VERSION } from "../version";

const worldTileHeight = 81;
const worldTileWidth = 81;

export default class DungeonScene extends Phaser.Scene {
  lastX: number;
  lastY: number;
  player: Player | null;
  slimes: Slime[];
  slimeGroup: Phaser.GameObjects.Group | null;
  fov: FOVLayer | null;
  tilemap: Phaser.Tilemaps.Tilemap | null;
  map: Map | null;
  roomDebugGraphics?: Phaser.GameObjects.Graphics;

  preload(): void {
    this.load.image(Graphics.environment.name, Graphics.environment.file);
    this.load.image(Graphics.util.name, Graphics.util.file);
    this.load.spritesheet(Graphics.player.name, Graphics.player.file, {
      frameHeight: Graphics.player.height,
      frameWidth: Graphics.player.width
    });
    this.load.spritesheet(Graphics.slime.name, Graphics.slime.file, {
      frameHeight: Graphics.slime.height,
      frameWidth: Graphics.slime.width
    });
  }

  constructor() {
    super("DungeonScene");
    this.lastX = -1;
    this.lastY = -1;
    this.player = null;
    this.fov = null;
    this.tilemap = null;
    this.map = null;
    this.slimes = [];
    this.slimeGroup = null;
  }

  slimePlayerCollide(
    _: Phaser.GameObjects.GameObject,
    slimeSprite: Phaser.GameObjects.GameObject
  ) {
    const slime = this.slimes.find(s => s.sprite === slimeSprite);
    if (!slime) {
      console.log("Missing slime for sprite collision!");
      return;
    }

    if (this.player!.isAttacking()) {
      this.slimes = this.slimes.filter(s => s != slime);
      slime.kill();
      return false;
    } else {
      this.player!.stagger();
      return true;
    }
  }

  create(): void {
    this.events.on("wake", () => {
      this.scene.run("InfoScene");
    });

    Object.values(Graphics.player.animations).forEach(anim => {
      if (!this.anims.get(anim.key)) {
        this.anims.create({
          ...anim,
          frames: this.anims.generateFrameNumbers(
            Graphics.player.name,
            anim.frames
          )
        });
      }
    });

    // TODO
    Object.values(Graphics.slime.animations).forEach(anim => {
      if (!this.anims.get(anim.key)) {
        this.anims.create({
          ...anim,
          frames: this.anims.generateFrameNumbers(
            Graphics.slime.name,
            anim.frames
          )
        });
      }
    });

    const map = new Map(worldTileWidth, worldTileHeight, this);
    this.map = map; // Guardar referencia
    this.tilemap = map.tilemap;

    this.fov = new FOVLayer(map);

    this.player = new Player(
      this.tilemap.tileToWorldX(map.startingX),
      this.tilemap.tileToWorldY(map.startingY),
      this
    );

    this.slimes = map.slimes;
    this.slimeGroup = this.physics.add.group(this.slimes.map(s => s.sprite));

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(
      0,
      0,
      map.width * Graphics.environment.width,
      map.height * Graphics.environment.height
    );
    this.cameras.main.startFollow(this.player.sprite);

    this.physics.add.collider(this.player.sprite, map.wallLayer);
    this.physics.add.collider(this.slimeGroup, map.wallLayer);

    this.physics.add.collider(this.player.sprite, map.doorLayer);
    this.physics.add.collider(this.slimeGroup, map.doorLayer);

    // this.physics.add.overlap(
    //   this.player.sprite,
    //   this.slimeGroup,
    //   this.slimePlayerCollide,
    //   undefined,
    //   this
    // );
    this.physics.add.collider(
      this.player.sprite,
      this.slimeGroup,
      undefined,
      this.slimePlayerCollide,
      this
    );

    // for (let slime of this.slimes) {
    //   this.physics.add.collider(slime.sprite, map.wallLayer);
    // }

    this.input.keyboard.on("keydown_R", () => {
      this.scene.stop("InfoScene");
      this.scene.run("ReferenceScene");
      this.scene.sleep();
    });

    this.input.keyboard.on("keydown_Q", () => {
      this.physics.world.drawDebug = !this.physics.world.drawDebug;
      if (!this.physics.world.debugGraphic) {
        this.physics.world.createDebugGraphic();
      }
      this.physics.world.debugGraphic.clear();
      this.roomDebugGraphics!.setVisible(this.physics.world.drawDebug);
    });

    this.input.keyboard.on("keydown_F", () => {
      this.fov!.layer.setVisible(!this.fov!.layer.visible);
    });

    this.roomDebugGraphics = this.add.graphics({ x: 0, y: 0 });
    this.roomDebugGraphics.setVisible(false);
    this.roomDebugGraphics.lineStyle(2, 0xff5500, 0.5);
    for (let room of map.rooms) {
      this.roomDebugGraphics.strokeRect(
        this.tilemap!.tileToWorldX(room.x),
        this.tilemap!.tileToWorldY(room.y),
        this.tilemap!.tileToWorldX(room.width),
        this.tilemap!.tileToWorldY(room.height)
      );
    }

    this.scene.run("InfoScene");
  }
    
    // 1. Rectángulo del timer - esquina inferior izquierda
    const timerBackground = this.add.rectangle(150, 450, 280, 80, 0x000000, 0.8);
    timerBackground.setScrollFactor(0);
    timerBackground.setDepth(5000);
    timerBackground.setStrokeStyle(2, 0xffffff);
    console.log('[DungeonScene] � Fondo del timer creado en esquina inferior izquierda');
    
    // 2. Texto del timer
    this.timerText = this.add.text(90, 430, "TIMER: 5", {
      fontFamily: "Arial",
      fontSize: "24px", 
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2
    });
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(5001);
    this.timerText.setOrigin(0, 0);
    
    // 3. Texto de la versión
    const versionText = this.add.text(90, 455, `VERSION: ${VERSION.toString()}`, {
      fontFamily: "Arial",
      fontSize: "18px", 
      color: "#00ff00",
      stroke: "#000000",
      strokeThickness: 2
    });
    versionText.setScrollFactor(0);
    versionText.setDepth(5001);
    versionText.setOrigin(0, 0);
    
    console.log('[DungeonScene] 🔤 Timer y versión creados en esquina inferior izquierda');
    console.log('[DungeonScene] Timer visible:', this.timerText.visible);
    console.log('[DungeonScene] Versión visible:', versionText.visible);
    console.log('[DungeonScene] Versión actual:', VERSION.toString());
    
    // Forzar todo
    this.timerText.setText("TIMER: 5");
    this.timerText.setVisible(true);
    this.timerText.setAlpha(1);
    versionText.setVisible(true);
    versionText.setAlpha(1);
    this.timerText.setAlpha(1);
    
    console.log('[DungeonScene] ¡Timer ultra visible configurado!');
  }

  update(time: number, delta: number) {
    this.player!.update(time);

    // Solo actualizar el sistema de puertas - el timer se muestra en InfoScene
    if (this.map) {
      this.map.updateTimedDoors();
    }

    const camera = this.cameras.main;

    for (let slime of this.slimes) {
      slime.update(time);
    }

    const player = new Phaser.Math.Vector2({
      x: this.tilemap!.worldToTileX(this.player!.sprite.body.x),
      y: this.tilemap!.worldToTileY(this.player!.sprite.body.y)
    });

    const bounds = new Phaser.Geom.Rectangle(
      this.tilemap!.worldToTileX(camera.worldView.x) - 1,
      this.tilemap!.worldToTileY(camera.worldView.y) - 1,
      this.tilemap!.worldToTileX(camera.worldView.width) + 2,
      this.tilemap!.worldToTileX(camera.worldView.height) + 2
    );

    this.fov!.update(player, bounds, delta);
  }
}
