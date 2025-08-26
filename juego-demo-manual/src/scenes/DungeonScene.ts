import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import FOVLayer from "../entities/FOVLayer";
import Player from "../entities/Player";
import Slime from "../entities/Slime";
import Map from "../entities/Map";

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
  doorParticles?: Phaser.GameObjects.Particles.ParticleEmitterManager;
  doorEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  // Sistema de spawn de enemigos
  enemySpawnTimer: Phaser.Time.TimerEvent | null = null;
  canSpawnEnemies: boolean = true;
  
  // Contador de enemigos eliminados por el jugador
  enemiesKilledByPlayer: number = 0;
  totalEnemiesSpawned: number = 0;
  
  // DEBUG: Texto para mostrar info de slimes en pantalla
  slimeDebugText?: Phaser.GameObjects.Text;

  preload(): void {
    this.load.spritesheet(Graphics.environment.name, Graphics.environment.file, {
      frameWidth: Graphics.environment.width,
      frameHeight: Graphics.environment.height,
      margin: Graphics.environment.margin,
      spacing: Graphics.environment.spacing
    });
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
    console.log('[DungeonScene] 🚀 Constructor ejecutado');
    this.lastX = -1;
    this.lastY = -1;
    this.player = null;
    this.fov = null;
    this.tilemap = null;
    this.map = null;
    this.slimes = [];
    this.slimeGroup = null;
    this.enemySpawnTimer = null;
    this.canSpawnEnemies = true;
    this.enemiesKilledByPlayer = 0;
    this.totalEnemiesSpawned = 0;
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
      // El jugador mata al slime - GANAR 100 puntos
      this.slimes = this.slimes.filter(s => s != slime);
      this.slimeGroup!.remove(slime.sprite); // Remover del grupo también
      slime.kill();
      
      // Contar enemigo eliminado por el jugador
      this.enemiesKilledByPlayer++;
      
      // Agregar 100 puntos por matar slime
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.addScore) {
        hudScene.addScore(100);
        console.log(`[DungeonScene] 💀 Enemigo eliminado por jugador - +100 puntos! Eliminados: ${this.enemiesKilledByPlayer}/${this.totalEnemiesSpawned}, Restantes: ${this.slimes.length}`);
      }
      
      return false;
    } else {
      // El slime golpea al jugador - PERDER 20 puntos Y VIDA
      this.player!.stagger();
      
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene) {
        // Quitar 20 puntos por recibir daño
        if (hudScene.addScore) {
          hudScene.addScore(-20);
        }
        
        // Quitar 20 puntos de vida por recibir daño
        if (hudScene.damagePlayer) {
          hudScene.damagePlayer(20);
          console.log(`[DungeonScene] 💥 Jugador golpeado por slime - ¡20 puntos de vida y score perdidos!`);
          
          // Verificar si el jugador murió
          if (hudScene.currentHealth <= 0) {
            console.log(`[DungeonScene] 💀 ¡GAME OVER! El jugador ha muerto`);
            this.handleGameOver();
          }
        }
      }
      
      return true;
    }
  }

  create(): void {
    console.log('[DungeonScene] 🎮 Create() iniciado');
    
    // RESET: Asegurar que todas las variables estén en estado inicial
    this.canSpawnEnemies = true;
    this.enemySpawnTimer = null;
    this.slimes = [];
    this.slimeGroup = null;
    this.enemiesKilledByPlayer = 0;
    this.totalEnemiesSpawned = 0;
    console.log('[DungeonScene] 🔄 Variables de estado reseteadas');
    
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

    // TODO: Crear sistema de partículas para las puertas (temporalmente desactivado)
    // this.createDoorParticles();

    this.player = new Player(
      this.tilemap.tileToWorldX(map.startingX),
      this.tilemap.tileToWorldY(map.startingY),
      this
    );
    console.log(`[DungeonScene] 👤 Jugador creado en: (${this.player.sprite.x}, ${this.player.sprite.y})`);

    this.slimes = map.slimes;
    this.slimeGroup = this.physics.add.group(this.slimes.map(s => s.sprite));
    this.totalEnemiesSpawned = this.slimes.length; // Contar el enemigo inicial
    console.log(`[DungeonScene] ✅ ${this.slimes.length} enemigo inicial + SlimeGroup configurado, Total spawned: ${this.totalEnemiesSpawned}`);
    
    // DEBUG: Verificar posiciones de slimes iniciales
    this.slimes.forEach((slime, index) => {
      console.log(`[DungeonScene] 🐛 Slime ${index}: posición (${slime.sprite.x}, ${slime.sprite.y}), visible: ${slime.sprite.visible}, active: ${slime.sprite.active}`);
    });

    // DEBUG TEMPORAL: Crear texto en pantalla para mostrar info de slimes
    this.slimeDebugText = this.add.text(10, 100, '', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000'
    }).setScrollFactor(0).setDepth(1000);

    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(
      0,
      0,
      map.width * Graphics.environment.width,
      map.height * Graphics.environment.height
    );
    this.cameras.main.startFollow(this.player.sprite);

    // Inicializar el HUD
    this.scene.launch("HUDScene");
    
    // ASEGURAR que el HUD inicie con valores correctos
    this.time.delayedCall(100, () => {
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene) {
        console.log('[DungeonScene] 🔧 Inicializando HUD con valores por defecto');
        hudScene.setHealth(100, 100);
        hudScene.setScore(0);
      }
    });

    // Configurar sistema de spawn de enemigos
    console.log('[DungeonScene] 🚀 Iniciando configuración del sistema de spawn...');
    this.setupEnemySpawning();

    // TEST: Verificar que el timer funciona
    this.time.delayedCall(2000, () => {
      console.log('[DungeonScene] ⏰ Timer de prueba ejecutado a los 2 segundos');
    });

    this.physics.add.collider(this.player.sprite, map.wallLayer);
    this.physics.add.collider(this.slimeGroup, map.wallLayer);

    this.physics.add.collider(this.player.sprite, map.doorLayer);
    this.physics.add.collider(this.slimeGroup, map.doorLayer);

    this.physics.add.collider(
      this.player.sprite,
      this.slimeGroup,
      undefined,
      this.slimePlayerCollide,
      this
    );

    // Nota: La tecla R ahora se usa solo para reiniciar en Game Over
    // El sprite picker se puede acceder con la tecla U

    this.input.keyboard.on("keydown_U", () => {
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

    this.input.keyboard.on("keydown_U", () => {
      this.scene.pause();
      this.scene.run("SpritePickerScene");
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
    
    // Agregar controles para probar el HUD
    this.setupHUDControls();
    
    console.log('[DungeonScene] ========== ESCENA CONFIGURADA ==========');
    console.log('[DungeonScene] Timer ahora se muestra en InfoScene');
    console.log('[DungeonScene] Controles HUD: 1=Daño, 2=Curar, 3=+Puntos, 4=Reset Puntos');
  }

  setupHUDControls(): void {
    // Tecla 1: Daño
    this.input.keyboard.on("keydown_ONE", () => {
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.damagePlayer) {
        hudScene.damagePlayer(10);
        console.log("[HUD] Jugador recibió 10 de daño");
      }
    });

    // Tecla 2: Curación
    this.input.keyboard.on("keydown_TWO", () => {
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.healPlayer) {
        hudScene.healPlayer(15);
        console.log("[HUD] Jugador curado 15 puntos");
      }
    });

    // Tecla 3: Agregar puntos
    this.input.keyboard.on("keydown_THREE", () => {
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.addScore) {
        hudScene.addScore(100);
        console.log("[HUD] +100 puntos agregados");
      }
    });

    // Tecla 4: Reset puntos
    this.input.keyboard.on("keydown_FOUR", () => {
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.setScore) {
        hudScene.setScore(0);
        console.log("[HUD] Puntos reiniciados");
      }
    });
  }

  update(time: number, delta: number) {
    this.player!.update(time);

    // Solo actualizar el sistema de puertas - el timer se muestra en InfoScene
    if (this.map) {
      this.map.updateTimedDoors();
    }

    const camera = this.cameras.main;

    for (let slime of this.slimes) {
      slime.update(time, this.player || undefined);
    }

    // DEBUG: Actualizar texto de debug
    if (this.slimeDebugText) {
      let debugInfo = `Slimes totales: ${this.slimes.length}\n`;
      debugInfo += `Spawn activo: ${this.canSpawnEnemies}\n`;
      this.slimes.forEach((slime, index) => {
        const distance = this.player ? Phaser.Math.Distance.Between(
          this.player.sprite.x, this.player.sprite.y,
          slime.sprite.x, slime.sprite.y
        ) : 0;
        debugInfo += `S${index}: (${Math.floor(slime.sprite.x)},${Math.floor(slime.sprite.y)}) v:${slime.sprite.visible} d:${Math.floor(distance)}\n`;
      });
      this.slimeDebugText.setText(debugInfo);
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

  createDoorParticles(): void {
    if (!this.map) return;
    
    // Crear manager de partículas usando la textura del entorno
    this.doorParticles = this.add.particles(Graphics.environment.name);
    
    // Crear emisores de partículas para cada puerta
    for (let door of this.map.timedDoors) {
      const worldX = this.tilemap!.tileToWorldX(door.x) + Graphics.environment.width / 2;
      const worldY = this.tilemap!.tileToWorldY(door.y) + Graphics.environment.height / 2;
      
      const emitter = this.doorParticles.createEmitter({
        frame: 0, // Frame básico que siempre existe
        x: worldX,
        y: worldY,
        speed: { min: 10, max: 30 },
        scale: { start: 0.2, end: 0.1 },
        blendMode: 'ADD',
        lifespan: 800,
        frequency: 300,
        alpha: { start: 0.6, end: 0.1 },
        tint: 0xffaa00, // Color dorado/naranja para puertas bloqueadas
        quantity: 1
      });
      
      this.doorEmitters.push(emitter);
      console.log(`[DungeonScene] Partículas creadas para puerta en (${door.x}, ${door.y})`);
    }
    
    console.log(`[DungeonScene] Sistema de partículas creado para ${this.doorEmitters.length} puertas`);
  }

  stopDoorParticles(): void {
    // Detener todas las partículas de las puertas cuando se desbloqueen
    for (let emitter of this.doorEmitters) {
      emitter.stop();
    }
    console.log('[DungeonScene] Partículas de puertas detenidas - puertas desbloqueadas');
  }

  setupEnemySpawning(): void {
    console.log('[DungeonScene] 🎯 setupEnemySpawning() INICIADO');
    
    if (!this.map) {
      console.log('[DungeonScene] ❌ setupEnemySpawning: map es null!');
      return;
    }

    console.log(`[DungeonScene] 🐛 Sistema de spawn iniciado - 8 enemigos cada 1 segundo durante 8 segundos`);
    console.log(`[DungeonScene] 📊 Estado inicial: canSpawnEnemies=${this.canSpawnEnemies}, slimes.length=${this.slimes.length}`);
    
    // Usar un approach más simple: crear spawns individuales
    for (let i = 1; i <= 8; i++) {
      console.log(`[DungeonScene] ⏱️ Programando spawn ${i}/8 para el segundo ${i}`);
      this.time.delayedCall(i * 1000, () => { // Cada 1 segundo exacto
        if (this.canSpawnEnemies) {
          console.log(`[DungeonScene] ⏰ Spawn ${i}/8 ejecutándose... Total slimes antes: ${this.slimes.length}`);
          this.spawnEnemy();
          console.log(`[DungeonScene] ⏰ Spawn ${i}/8 completado. Total slimes después: ${this.slimes.length}`);
        } else {
          console.log(`[DungeonScene] ⏰ Spawn ${i}/8 cancelado - spawning detenido`);
        }
      });
    }

    console.log('[DungeonScene] ✅ 8 spawns programados cada 1s');

    // Timer para detener el spawning después de 8 segundos
    this.time.delayedCall(8000, () => {
      console.log('[DungeonScene] ⏰ Timer de stop ejecutado');
      this.stopEnemySpawning();
    });
    
    console.log('[DungeonScene] 🎯 setupEnemySpawning() COMPLETADO');
  }

  spawnEnemy(): void {
    console.log(`[DungeonScene] 🔄 spawnEnemy() llamado - canSpawn=${this.canSpawnEnemies}, map=${!!this.map}, slimeGroup=${!!this.slimeGroup}`);
    
    if (!this.canSpawnEnemies || !this.map || !this.slimeGroup) {
      console.log('[DungeonScene] ❌ No se puede spawnear enemigo - condiciones no cumplidas');
      return;
    }

    // Obtener las dimensiones de la sala central
    const room = this.map.rooms[0];
    if (!room) {
      console.log('[DungeonScene] ❌ No se encontró la sala central');
      return;
    }

    console.log(`[DungeonScene] 📐 Sala encontrada: x=${room.x}, y=${room.y}, w=${room.width}, h=${room.height}`);

    // En lugar de usar tiles, usar coordenadas del mundo directamente
    // Obtener el centro visible de la cámara
    const centerWorldX = this.cameras.main.worldView.centerX;
    const centerWorldY = this.cameras.main.worldView.centerY;
    
    console.log(`[DungeonScene] 🎯 Centro del mundo visible: (${centerWorldX}, ${centerWorldY})`);
    
    // Generar posición aleatoria cerca del centro visible
    const offsetX = Phaser.Math.Between(-80, 80); // Rango en píxeles
    const offsetY = Phaser.Math.Between(-80, 80);
    
    const worldX = centerWorldX + offsetX;
    const worldY = centerWorldY + offsetY;

    console.log(`[DungeonScene] 📍 Spawn en mundo (${worldX}, ${worldY})`);

    // Crear nuevo slime
    console.log('[DungeonScene] 🔨 Creando Slime...');
    const newSlime = new Slime(worldX, worldY, this);
    
    console.log(`[DungeonScene] 🔨 Slime creado: ${!!newSlime.sprite}, visible: ${newSlime.sprite.visible}`);
    
    this.slimes.push(newSlime);
    this.slimeGroup!.add(newSlime.sprite);
    this.totalEnemiesSpawned++; // Contar nuevo enemigo spawneado

    console.log(`[DungeonScene] ✅ Enemigo ${this.slimes.length} spawneado exitosamente. Total spawned: ${this.totalEnemiesSpawned}`);
  }

  stopEnemySpawning(): void {
    this.canSpawnEnemies = false;
    
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
      this.enemySpawnTimer = null;
    }

    console.log('[DungeonScene] 🛑 Sistema de spawn de enemigos DETENIDO - no aparecerán más enemigos');
    console.log(`[DungeonScene] 📊 Total de enemigos en pantalla: ${this.slimes.length}`);
  }

  clearAllEnemies(): void {
    if (this.slimes.length === 0) {
      console.log('[DungeonScene] ✅ No hay enemigos que limpiar - todos ya fueron eliminados');
      return;
    }
    
    console.log(`[DungeonScene] 🧹 Limpiando enemigos restantes... Total a eliminar: ${this.slimes.length}`);
    
    // Eliminar todos los slimes con animación
    this.slimes.forEach((slime, index) => {
      // Animación de desaparición
      slime.sprite.setTint(0xffffff);
      this.tweens.add({
        targets: slime.sprite,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          slime.sprite.destroy();
        }
      });
      console.log(`[DungeonScene] 💨 Enemigo restante ${index + 1} eliminándose...`);
    });

    // Limpiar arrays y grupos
    this.slimes = [];
    this.slimeGroup!.clear();
    
    console.log('[DungeonScene] ✅ Todos los enemigos restantes han sido eliminados');
  }

  // Función para manejar Game Over con menú atractivo
  handleGameOver(): void {
    console.log('[DungeonScene] 💀 GAME OVER - El jugador ha muerto');
    
    // Detener todos los sistemas de enemigos
    this.stopEnemySpawning();
    this.clearAllEnemies();
    
    // Pausar el juego
    this.physics.pause();
    
    // Crear overlay negro semi-transparente (menos dominante)
    const overlay = this.add.rectangle(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.6 // Reducido de 0.8 para ser menos dominante
    ).setDepth(1900);

    // Título principal GAME OVER (más nítido)
    const title = this.add.text(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY - 40,
      'GAME OVER',
      {
        fontFamily: "CasualEncounter, monospace",
        fontSize: "36px", // Aumentado de 32px para mejor legibilidad
        color: "#ff0000",
        stroke: "#ffffff",
        strokeThickness: 2 // Aumentado a 2 para más nitidez
      }
    ).setOrigin(0.5).setDepth(2000);

    // Obtener estadísticas finales
    const hudScene = this.scene.get("HUDScene") as any;
    const finalScore = hudScene ? hudScene.score : 0;
    
    // Estadísticas del juego (texto más nítido y legible)
    const statsText = this.add.text(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY + 5,
      `Puntuación Final: ${finalScore}\nEnemigos Eliminados: ${this.enemiesKilledByPlayer} de ${this.totalEnemiesSpawned}`,
      {
        fontFamily: "CasualEncounter, monospace",
        fontSize: "16px", // Aumentado de 12px para mejor legibilidad
        color: "#ffffff",
        align: "center",
        stroke: "#000000", // Añadir borde negro para más nitidez
        strokeThickness: 1
      }
    ).setOrigin(0.5).setDepth(2000);

    // Botón de reinicio (más nítido)
    const restartButton = this.add.text(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY + 50,
      '[ R para Reiniciar ]',
      {
        fontFamily: "CasualEncounter, monospace",
        fontSize: "16px", // Aumentado de 14px
        color: "#00ff00",
        backgroundColor: "#003300",
        padding: { x: 12, y: 6 }, // Aumentado un poco
        stroke: "#ffffff", // Borde blanco para más nitidez
        strokeThickness: 1
      }
    ).setOrigin(0.5).setDepth(2000);

    // Animación de parpadeo para el botón (más rápida)
    this.tweens.add({
      targets: restartButton,
      alpha: 0.5,
      duration: 600, // Reducido de 800
      yoyo: true,
      repeat: -1
    });

    // Efectos de entrada (más rápidos)
    title.setScale(0);
    this.tweens.add({
      targets: title,
      scaleX: 1,
      scaleY: 1,
      duration: 300, // Reducido de 500
      ease: 'Back.out'
    });

    statsText.setAlpha(0);
    this.tweens.add({
      targets: statsText,
      alpha: 1,
      duration: 400, // Reducido de 800
      delay: 150 // Reducido de 300
    });

    restartButton.setAlpha(0);
    this.tweens.add({
      targets: restartButton,
      alpha: 1,
      duration: 400, // Reducido de 800
      delay: 250 // Reducido de 600
    });
    
    // Agregar listener para reiniciar
    this.input.keyboard.once("keydown-R", () => {
      console.log('[DungeonScene] 🔄 Reiniciando juego...');
      
      // IMPORTANTE: Reiniciar el HUD ANTES de reiniciar la escena
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.resetGame) {
        console.log('[DungeonScene] 🔄 Llamando a HUD.resetGame()');
        hudScene.resetGame();
      } else {
        console.error('[DungeonScene] ❌ No se pudo acceder al HUD para resetear!');
      }
      
      // Pequeño delay antes de reiniciar para asegurar que el HUD se resetee
      this.time.delayedCall(100, () => {
        console.log('[DungeonScene] 🔄 Reiniciando escena...');
        this.scene.restart();
      });
    });
  }

  // Función que se llama cuando se completa una sala (puertas abiertas)
  onRoomCompleted(): void {
    console.log('[DungeonScene] 🎉 ¡SALA COMPLETADA! Las puertas se han abierto');
    
    // Detener spawning de enemigos
    this.stopEnemySpawning();
    
    // Verificar si el jugador mató a TODOS los enemigos
    const allEnemiesKilledByPlayer = this.enemiesKilledByPlayer === this.totalEnemiesSpawned;
    
    if (allEnemiesKilledByPlayer) {
      console.log('[DungeonScene] 🏆 ¡PERFECTO! Todos los enemigos fueron eliminados por el jugador');
      
      // Bonus de puntos solo si mató a todos los enemigos
      const hudScene = this.scene.get("HUDScene") as any;
      if (hudScene && hudScene.addScore) {
        hudScene.addScore(500);
        console.log(`[DungeonScene] 🏆 ¡Bonus de 500 puntos por eliminar TODOS los enemigos! (${this.enemiesKilledByPlayer}/${this.totalEnemiesSpawned})`);
      }
    } else {
      console.log(`[DungeonScene] 😔 Solo eliminaste ${this.enemiesKilledByPlayer}/${this.totalEnemiesSpawned} enemigos - Sin bonus`);
      
      // Limpiar enemigos restantes después de un breve delay (sin bonus)
      this.time.delayedCall(1000, () => {
        this.clearAllEnemies();
      });
    }
  }
}
