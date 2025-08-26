import Tile, { TileType } from "./Tile";
import Slime from "./Slime";
import Graphics from "../assets/Graphics";
import DungeonScene from "../scenes/DungeonScene";

export default class Map {
  public readonly tiles: Tile[][];
  public readonly width: number;
  public readonly height: number;
  public readonly tilemap: Phaser.Tilemaps.Tilemap;
  public readonly wallLayer: Phaser.Tilemaps.StaticTilemapLayer;
  public readonly doorLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  public readonly startingX: number;
  public readonly startingY: number;

  public readonly slimes: Slime[];
  public readonly rooms: { x: number; y: number; width: number; height: number }[];
  
  // Sistema de puertas temporizadas
  public readonly timedDoors: { x: number; y: number; unlocked: boolean }[] = [];
  public doorUnlockTime: number = 0;
  private scene: DungeonScene; // Referencia para controlar partículas
  private roomCompleted: boolean = false; // Nueva bandera para evitar múltiples completaciones

  constructor(width: number, height: number, scene: DungeonScene) {
    this.width = width;
    this.height = height;
    this.scene = scene; // Guardar referencia para partículas

    // Crear una sala central cuadrada (15x15) estilo Isaac
    this.rooms = []; // Crear manualmente
    
    // Sala central en el medio del mapa
    const centerX = Math.floor(width / 2) - 7; // Centro - mitad del tamaño de sala
    const centerY = Math.floor(height / 2) - 7;
    const roomSize = 15;
    
    // Agregar la sala al array de rooms
    this.rooms.push({ x: centerX, y: centerY, width: roomSize, height: roomSize });
    
    console.log(`[Map] Creando sala central Isaac en (${centerX}, ${centerY}) de tamaño ${roomSize}x${roomSize}`);

    // Inicializar todo como paredes
    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles.push([]);
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = new Tile(TileType.Wall, x, y, this);
      }
    }

    // Crear el interior de la sala (suelo)
    for (let y = centerY + 1; y < centerY + roomSize - 1; y++) {
      for (let x = centerX + 1; x < centerX + roomSize - 1; x++) {
        this.tiles[y][x] = new Tile(TileType.None, x, y, this);
      }
    }

    // Crear las 4 puertas en los bordes externos de la sala
    const doorPositions = [
      { x: centerX + Math.floor(roomSize / 2), y: centerY }, // Norte (en el borde)
      { x: centerX + roomSize - 1, y: centerY + Math.floor(roomSize / 2) }, // Este (en el borde)
      { x: centerX + Math.floor(roomSize / 2), y: centerY + roomSize - 1 }, // Sur (en el borde)
      { x: centerX, y: centerY + Math.floor(roomSize / 2) } // Oeste (en el borde)
    ];

    console.log('[Map] Creando puertas en posiciones:', doorPositions);
    
    for (let i = 0; i < doorPositions.length; i++) {
      const door = doorPositions[i];
      const doorTile = new Tile(TileType.Door, door.x, door.y, this);
      
      // Marcar la orientación de la puerta basándose en su posición
      // Norte (0) y Sur (2) usan horizontal (0x90), Este (1) y Oeste (3) usan vertical (0x81)
      doorTile.doorOrientation = (i === 0 || i === 2) ? 'horizontal' : 'vertical';
      
      this.tiles[door.y][door.x] = doorTile;
      console.log(`[Map] Puerta ${i + 1} (${doorTile.doorOrientation}) creada en (${door.x}, ${door.y})`);
    }

    // Crear pasillos que conectan las puertas con el interior de la sala
    // Pasillo Norte
    this.tiles[centerY + 1][centerX + Math.floor(roomSize / 2)] = new Tile(TileType.None, centerX + Math.floor(roomSize / 2), centerY + 1, this);
    // Pasillo Este
    this.tiles[centerY + Math.floor(roomSize / 2)][centerX + roomSize - 2] = new Tile(TileType.None, centerX + roomSize - 2, centerY + Math.floor(roomSize / 2), this);
    // Pasillo Sur
    this.tiles[centerY + roomSize - 2][centerX + Math.floor(roomSize / 2)] = new Tile(TileType.None, centerX + Math.floor(roomSize / 2), centerY + roomSize - 2, this);
    // Pasillo Oeste
    this.tiles[centerY + Math.floor(roomSize / 2)][centerX + 1] = new Tile(TileType.None, centerX + 1, centerY + Math.floor(roomSize / 2), this);

    // Punto inicial en el centro de la sala
    this.startingX = centerX + Math.floor(roomSize / 2);
    this.startingY = centerY + Math.floor(roomSize / 2);
    
    console.log(`[Map] Punto de inicio del jugador: (${this.startingX}, ${this.startingY})`);

    // Crear slimes iniciales en la sala (pocos, porque aparecerán más durante el timer)
    this.slimes = [];
    for (let i = 0; i < 1; i++) { // Solo 1 slime inicial
      const slimeX = centerX + 2 + Math.floor(Math.random() * (roomSize - 4));
      const slimeY = centerY + 2 + Math.floor(Math.random() * (roomSize - 4));
      const worldX = slimeX * 32 + 16;
      const worldY = slimeY * 32 + 16;
      
      const initialSlime = new Slime(worldX, worldY, scene);
      this.slimes.push(initialSlime);
    }
    console.log(`[Map] ${this.slimes.length} slime inicial creado. Más aparecerán durante el timer`);

    this.tilemap = scene.make.tilemap({
      tileWidth: Graphics.environment.width,
      tileHeight: Graphics.environment.height,
      width: width,
      height: height
    });

    const dungeonTiles = this.tilemap.addTilesetImage(
      Graphics.environment.name,
      Graphics.environment.name,
      Graphics.environment.width,
      Graphics.environment.height,
      Graphics.environment.margin,
      Graphics.environment.spacing
    );

    const groundLayer = this.tilemap
      .createBlankDynamicLayer("Ground", dungeonTiles, 0, 0)
      .randomize(
        0,
        0,
        this.width,
        this.height,
        Graphics.environment.indices.floor.outerCorridor
      );

    // Los slimes ya están creados en el constructor modificado arriba
    console.log(`[Map] Total de slimes creados: ${this.slimes.length}`);
    
    this.tilemap.convertLayerToStatic(groundLayer).setDepth(1);

    const wallLayer = this.tilemap.createBlankDynamicLayer(
      "Wall",
      dungeonTiles,
      0,
      0
    );

    this.doorLayer = this.tilemap.createBlankDynamicLayer(
      "Door",
      dungeonTiles,
      0,
      0
    );

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = this.tiles[y][x];
        if (tile.type === TileType.Wall) {
          wallLayer.putTileAt(tile.spriteIndex(), x, y);
        } else if (tile.type === TileType.Door) {
          const doorTile = this.doorLayer.putTileAt(tile.spriteIndex(), x, y);
          
          // Rotar las puertas de los costados (este/oeste) 180 grados para que el detalle esté arriba
          if (tile.doorOrientation === 'vertical') {
            doorTile.rotation = Math.PI; // 180 grados para puertas este/oeste (0x90)
            console.log(`[Map] Puerta costado (0x90) este/oeste en (${x}, ${y}) rotada 180° - detalle arriba`);
          } else {
            doorTile.rotation = 0; // Sin rotación para puertas norte/sur (0x81) - v1.7.1 restaurada
            console.log(`[Map] Puerta norte/sur (0x81) en (${x}, ${y}) sin rotación - v1.7.1`);
          }
        }
      }
    }
    wallLayer.setCollisionBetween(0, 0x7f);
    const collidableDoors = [
      Graphics.environment.indices.doors.horizontal,
      Graphics.environment.indices.doors.vertical
    ];
    
    // Configurar todas las puertas como sólidas inicialmente
    this.doorLayer.setCollision(collidableDoors);
    
    // Asegurar que todas las puertas tengan colisión física real
    this.doorLayer.forEachTile((tile) => {
      if (tile && collidableDoors.includes(tile.index)) {
        tile.setCollision(true, true, true, true); // Todas las direcciones bloqueadas
        console.log(`[Map] Puerta en (${tile.x}, ${tile.y}) configurada como SÓLIDA`);
      }
    });

    // REMOVER el callback que destruye las puertas al tocarlas - esto permitía pasar antes del timer
    // this.doorLayer.setTileIndexCallback(... ) - COMENTADO PARA BLOQUEO REAL
    
    this.doorLayer.setDepth(3);

    this.wallLayer = this.tilemap.convertLayerToStatic(wallLayer);
    this.wallLayer.setDepth(2);
    
    // Configurar sistema de puertas temporizadas (10 segundos)
    this.doorUnlockTime = Date.now() + 10000; // 10 segundos desde ahora
    
    // Configurar colisiones para las puertas (inicialmente bloqueadas)
    this.doorLayer.setCollisionByProperty({ collides: true });
    
    this.setupTimedDoors();
    console.log('[Map] Sistema de puertas temporizadas configurado. Desbloqueo en:', new Date(this.doorUnlockTime).toLocaleTimeString());
    console.log('[Map] Puertas inicialmente BLOQUEADAS con colisión - 10 segundos');
  }

  // Configurar puertas que se abren con tiempo
  private setupTimedDoors(): void {
    console.log('[Map] Configurando puertas temporizadas...');
    console.log('[Map] Dimensiones del mapa:', this.width, 'x', this.height);
    
    // Buscar todas las puertas en el mapa y marcarlas como temporizadas
    let doorsFound = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.type === TileType.Door) {
          this.timedDoors.push({ x, y, unlocked: false });
          doorsFound++;
          console.log(`[Map] Puerta temporizada encontrada en (${x}, ${y})`);
        }
      }
    }
    console.log(`[Map] Total de puertas encontradas: ${doorsFound}`);
    
    if (doorsFound === 0) {
      console.warn('[Map] ¡No se encontraron puertas! El sistema de temporizador no funcionará.');
    }
  }

  // Actualizar sistema de puertas (llamar desde DungeonScene.update)
  public updateTimedDoors(): void {
    const currentTime = Date.now();
    
    // Log cada pocos segundos para debug
    if (currentTime % 3000 < 16) {
      console.log(`[Map] Actualizando puertas. Tiempo actual: ${currentTime}, Desbloqueo en: ${this.doorUnlockTime}`);
      console.log(`[Map] Puertas totales: ${this.timedDoors.length}`);
    }
    
    if (currentTime >= this.doorUnlockTime) {
      // Desbloquear todas las puertas
      let doorsUnlocked = 0;
      for (let door of this.timedDoors) {
        if (!door.unlocked) {
          door.unlocked = true;
          // Remover completamente la puerta y abrir paso
          const tile = this.doorLayer.getTileAt(door.x, door.y);
          if (tile) {
            // Quitar el tile de la puerta completamente (abrir el paso)
            this.doorLayer.putTileAt(-1, door.x, door.y);
            // Marcar como suelo en el sistema interno
            this.tileAt(door.x, door.y)!.open();
            // Forzar recálculo de FOV
            this.scene.fov!.recalculate();
            doorsUnlocked++;
            console.log(`[Map] ✅ Puerta REMOVIDA y paso abierto en (${door.x}, ${door.y})`);
          } else {
            console.warn(`[Map] ❌ No se encontró tile de puerta en (${door.x}, ${door.y})`);
          }
        }
      }
      
      if (doorsUnlocked > 0) {
        console.log(`[Map] 🎉 TODAS LAS PUERTAS DESBLOQUEADAS! Total: ${doorsUnlocked}`);
        
        // Solo ejecutar una vez cuando se completa la sala
        if (!this.roomCompleted) {
          this.roomCompleted = true;
          console.log('[Map] 🏆 Sala completada por primera vez - ejecutando limpieza de enemigos');
          this.scene.onRoomCompleted();
        }
        
        // TODO: Detener partículas de las puertas (temporalmente desactivado)
        // if (this.scene.stopDoorParticles) {
        //   this.scene.stopDoorParticles();
        // }
      }
    }
  }

  // Obtener tiempo restante para desbloquear puertas
  public getTimeToUnlock(): number {
    return Math.max(0, this.doorUnlockTime - Date.now());
  }

  tileAt(x: number, y: number): Tile | null {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return null;
    }
    return this.tiles[y][x];
  }

  withinRoom(x: number, y: number): boolean {
    return (
      this.rooms.find(r => {
        const top = r.y;
        const left = r.x;
        const right = r.x + r.width;
        const bottom = r.y + r.height;
        return (
          y >= top - 1 && y <= bottom + 1 && x >= left - 1 && x <= right + 1
        );
      }) != undefined
    );
  }
}
