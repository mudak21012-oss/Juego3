import Phaser from "phaser";
import Graphics from "../assets/Graphics";

export default class SpritePickerScene extends Phaser.Scene {
  selectedIndex: number = 0;
  previewSprite?: Phaser.GameObjects.Image;
  previewCode?: Phaser.GameObjects.Text;
  menuItems: Phaser.GameObjects.Text[] = [];
  scrollOffset: number = 0;
  maxVisibleItems: number = 20;

  constructor() {
    super({ key: "SpritePickerScene" });
  }

  preload(): void {
    this.load.spritesheet(Graphics.environment.name, Graphics.environment.file, {
      frameWidth: Graphics.environment.width,
      frameHeight: Graphics.environment.height,
      margin: Graphics.environment.margin,
      spacing: Graphics.environment.spacing
    });
  }

  create(): void {
    // Verificar que la textura se haya cargado correctamente
    if (!this.textures.exists(Graphics.environment.name)) {
      console.error("[SPRITE PICKER] Textura environment no encontrada");
      return;
    }

    // Fondo negro
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setScrollFactor(0);
    
    // Título
    this.add.text(400, 30, "SPRITE DATABASE - Flechas: Navegar | ENTER: Seleccionar | U: Cerrar", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // === ÁREA DE VISTA PREVIA (IZQUIERDA) ===
    // Fondo del área de vista previa
    this.add.rectangle(150, 300, 200, 400, 0x222222, 1).setScrollFactor(0);
    this.add.text(150, 120, "VISTA PREVIA", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Cuadrado de vista previa 32x32
    const previewFrame = this.add.rectangle(150, 200, 36, 36, 0x444444, 1);
    previewFrame.setStrokeStyle(2, 0x666666).setScrollFactor(0);
    
    // Sprite de vista previa (inicializado correctamente)
    try {
      this.previewSprite = this.add.image(150, 200, Graphics.environment.name, this.selectedIndex);
      this.previewSprite.setScale(2).setScrollFactor(0);
      console.log("[SPRITE PICKER] Preview sprite creado correctamente");
    } catch (error) {
      console.error("[SPRITE PICKER] Error creando preview sprite:", error);
      // Crear un rectángulo como fallback
      this.add.rectangle(150, 200, 16, 16, 0xff0000, 1).setScrollFactor(0);
    }

    // Código del sprite
    this.previewCode = this.add.text(150, 250, "0x00 (0)", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Información adicional
    this.add.text(150, 350, "Sprite seleccionado:", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#aaaaaa"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // === ÁREA DE MENÚ (DERECHA) ===
    // Fondo del área de menú
    this.add.rectangle(500, 300, 300, 400, 0x111111, 1).setScrollFactor(0);
    this.add.text(500, 120, "LISTA DE SPRITES", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.createMenu();
    this.updatePreview();
    this.setupControls();
  }

  createMenu(): void {
    // Limpiar menú existente
    this.menuItems.forEach(item => item.destroy());
    this.menuItems = [];

    const startY = 150;
    const itemHeight = 20;

    // Mostrar solo los items visibles (scroll)
    for (let i = 0; i < this.maxVisibleItems; i++) {
      const spriteIndex = this.scrollOffset + i;
      if (spriteIndex >= 256) break;

      const y = startY + i * itemHeight;
      const hexCode = spriteIndex.toString(16).toUpperCase().padStart(2, '0');
      
      const menuItem = this.add.text(380, y, `0x${hexCode} (${spriteIndex})`, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: spriteIndex === this.selectedIndex ? "#00ff00" : "#ffffff",
        backgroundColor: spriteIndex === this.selectedIndex ? "#003300" : "#transparent"
      }).setScrollFactor(0);

      this.menuItems.push(menuItem);
    }

    // Indicador de scroll
    if (this.scrollOffset > 0 || this.scrollOffset + this.maxVisibleItems < 256) {
      this.add.text(500, startY + this.maxVisibleItems * itemHeight + 10, 
        `${this.scrollOffset + 1}-${Math.min(this.scrollOffset + this.maxVisibleItems, 256)} de 256`, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#aaaaaa"
      }).setOrigin(0.5, 0).setScrollFactor(0);
    }
  }

  setupControls(): void {
    this.input.keyboard.on("keydown_UP", () => {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.updateScroll();
        this.updatePreview();
        this.scene.restart();
      }
    });

    this.input.keyboard.on("keydown_DOWN", () => {
      if (this.selectedIndex < 255) {
        this.selectedIndex++;
        this.updateScroll();
        this.updatePreview();
        this.scene.restart();
      }
    });

    this.input.keyboard.on("keydown_ENTER", () => {
      const hexCode = this.selectedIndex.toString(16).toUpperCase().padStart(2, '0');
      console.log(`[SPRITE DATABASE] SELECCIONADO: 0x${hexCode} (decimal: ${this.selectedIndex})`);
      
      // Mostrar mensaje de confirmación
      this.add.text(400, 550, `✓ SPRITE SELECCIONADO: 0x${hexCode}`, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 2
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);
    });

    this.input.keyboard.on("keydown_U", () => {
      this.scene.stop();
      this.scene.resume("DungeonScene");
    });
  }

  updateScroll(): void {
    // Ajustar scroll para mantener el item seleccionado visible
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.maxVisibleItems) {
      this.scrollOffset = this.selectedIndex - this.maxVisibleItems + 1;
    }
  }

  updatePreview(): void {
    if (this.previewSprite && this.previewCode) {
      try {
        // Verificar que el frame existe
        const texture = this.textures.get(Graphics.environment.name);
        const frameExists = texture && texture.has(this.selectedIndex.toString());
        
        if (frameExists) {
          // Actualizar sprite de vista previa
          this.previewSprite.setFrame(this.selectedIndex);
          this.previewSprite.setVisible(true);
        } else {
          console.warn(`[SPRITE PICKER] Frame ${this.selectedIndex} no existe`);
          this.previewSprite.setVisible(false);
        }
        
        // Actualizar código
        const hexCode = this.selectedIndex.toString(16).toUpperCase().padStart(2, '0');
        this.previewCode.setText(`0x${hexCode} (${this.selectedIndex})`);
        
        // Debug: Confirmar que el frame se está actualizando
        console.log(`[SPRITE PICKER] Mostrando sprite: 0x${hexCode} (frame: ${this.selectedIndex}), existe: ${frameExists}`);
      } catch (error) {
        console.error("[SPRITE PICKER] Error actualizando preview:", error);
      }
    }
  }
}
