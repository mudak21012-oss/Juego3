import Phaser from "phaser";
import { VERSION } from '../version';

export class HUDScene extends Phaser.Scene {
  private fpsText: Phaser.GameObjects.DynamicBitmapText;
  private timerText: Phaser.GameObjects.DynamicBitmapText;
  private versionText: Phaser.GameObjects.DynamicBitmapText;
  private scoreText: Phaser.GameObjects.DynamicBitmapText;

  // Sistema de corazones con Graphics
  private hearts: Phaser.GameObjects.Graphics[] = [];
  private heartsContainer: Phaser.GameObjects.Container;
  private maxHearts: number = 5;
  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private score: number = 0;

  constructor() {
    super({ key: "HUDScene" });
  }

  create(): void {
    console.log("[HUD] 🔧 Iniciando HUD...");
    
    // Crear todos los elementos del HUD
    this.createLabels();
    this.createScoreDisplay();
    this.createHeartSystem();
    
    console.log("[HUD] ✅ HUD completamente creado");
  }

  createHeartSystem(): void {
    console.log("[HUD] 🫀 Creando sistema de corazones con graphics...");
    
    // Limpiar corazones existentes
    if (this.hearts) {
      this.hearts.forEach(heart => {
        if (heart && heart.destroy) {
          heart.destroy();
        }
      });
    }
    
    // Posición al lado derecho del Score
    const scoreWidth = 120;
    const startX = 25 + scoreWidth + 20;
    const y = 65;
    const heartSpacing = 30;
    
    // Crear contenedor para los corazones
    if (this.heartsContainer) {
      this.heartsContainer.destroy();
    }
    this.heartsContainer = this.add.container(0, 0);
    this.heartsContainer.setScrollFactor(0);
    this.heartsContainer.setDepth(50);
    
    // Crear los 5 corazones usando graphics
    this.hearts = [];
    for (let i = 0; i < this.maxHearts; i++) {
      const heartGraphic = this.createHeartGraphic(startX + i * heartSpacing, y, 'full');
      this.hearts.push(heartGraphic);
      console.log(`[HUD] ✅ Corazón ${i} creado en posición (${startX + i * heartSpacing}, ${y})`);
    }
    
    console.log(`[HUD] 🎯 ${this.hearts.length} corazones gráficos creados, inicializando...`);
    this.updateHearts();
    console.log("[HUD] ✅ Sistema de corazones gráficos creado al lado derecho del Score");
  }

  createHeartGraphic(x: number, y: number, type: 'full' | 'half' | 'empty'): Phaser.GameObjects.Graphics {
    const heart = this.add.graphics();
    heart.setScrollFactor(0);
    heart.setDepth(50);
    
    // Función personalizada para cambiar el tipo de corazón
    (heart as any).setHeartType = (newType: 'full' | 'half' | 'empty') => {
      heart.clear();
      this.drawHeart(heart, x, y, newType);
    };
    
    // Función de compatibilidad con setFrame
    (heart as any).setFrame = (frame: number) => {
      if (frame === 0) (heart as any).setHeartType('full');
      else if (frame === 1) (heart as any).setHeartType('half');
      else (heart as any).setHeartType('empty');
    };
    
    // Dibujar el corazón inicial
    this.drawHeart(heart, x, y, type);
    
    return heart;
  }

  drawHeart(graphics: Phaser.GameObjects.Graphics, x: number, y: number, type: 'full' | 'half' | 'empty'): void {
    graphics.clear();
    
    // Colores según el tipo
    let fillColor: number;
    let strokeColor: number;
    let alpha: number;
    
    switch (type) {
      case 'full':
        fillColor = 0xff0040; // Rojo vibrante
        strokeColor = 0x990020; // Rojo oscuro
        alpha = 1.0;
        break;
      case 'half':
        fillColor = 0xff8040; // Naranja-rojo
        strokeColor = 0x994020; // Naranja oscuro
        alpha = 0.8;
        break;
      case 'empty':
        fillColor = 0x404040; // Gris
        strokeColor = 0x202020; // Gris oscuro
        alpha = 0.4;
        break;
    }
    
    // Configurar estilo
    graphics.fillStyle(fillColor, alpha);
    graphics.lineStyle(2, strokeColor, alpha);
    
    // Dibujar forma de corazón usando curvas
    const scale = 0.8;
    const heartSize = 12 * scale;
    
    graphics.beginPath();
    
    // Corazón pixel art simplificado
    // Parte superior izquierda
    graphics.moveTo(x - heartSize, y - heartSize/2);
    graphics.lineTo(x - heartSize/2, y - heartSize);
    graphics.lineTo(x, y - heartSize/2);
    
    // Parte superior derecha
    graphics.lineTo(x + heartSize/2, y - heartSize);
    graphics.lineTo(x + heartSize, y - heartSize/2);
    graphics.lineTo(x + heartSize/2, y);
    
    // Punta inferior
    graphics.lineTo(x, y + heartSize);
    graphics.lineTo(x - heartSize/2, y);
    graphics.lineTo(x - heartSize, y - heartSize/2);
    
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Si es medio corazón, dibujar línea divisoria
    if (type === 'half') {
      graphics.lineStyle(1, 0x000000, 0.6);
      graphics.beginPath();
      graphics.moveTo(x, y - heartSize);
      graphics.lineTo(x, y + heartSize);
      graphics.strokePath();
    }
  }

  updateHearts(): void {
    console.log(`[HUD] 💗 updateHearts() iniciado - Vida: ${this.currentHealth}`);
    alert(`🔍 UPDATE HEARTS - Vida: ${this.currentHealth}`);
    
    if (!this.hearts || !this.hearts.length) {
      console.warn("[HUD] ⚠️ No hay corazones para actualizar");
      alert("❌ NO HAY CORAZONES");
      return;
    }
    
    // Calcular cuántos corazones llenos, medios y vacíos mostrar
    const fullHearts = Math.floor(this.currentHealth / 20); // Cada corazón = 20 HP
    const hasHalfHeart = (this.currentHealth % 20) >= 10; // Medio corazón a los 10 HP
    
    console.log(`[HUD] 💗 Actualizando corazones: ${this.currentHealth} HP = ${fullHearts} llenos + ${hasHalfHeart ? 1 : 0} medio`);
    alert(`💗 ${fullHearts} llenos + ${hasHalfHeart ? 1 : 0} medio`);
    
    for (let i = 0; i < this.maxHearts; i++) {
      const heart = this.hearts[i];
      
      if (!heart) {
        console.error(`[HUD] ❌ Corazón ${i} es null/undefined`);
        alert(`❌ Corazón ${i} NULL`);
        continue;
      }
      
      try {
        // Detener cualquier tween previo para evitar conflictos
        this.tweens.killTweensOf(heart);
        
        if (i < fullHearts) {
          // Corazón lleno
          console.log(`[HUD] ❤️ Corazón ${i}: LLENO`);
          (heart as any).setFrame(0); // Frame 0 = lleno
          heart.setAlpha(1);
          heart.setVisible(true);
          alert(`❤️ Corazón ${i} = LLENO`);
          
        } else if (i === fullHearts && hasHalfHeart) {
          // Medio corazón
          console.log(`[HUD] 💔 Corazón ${i}: MEDIO`);
          (heart as any).setFrame(1); // Frame 1 = medio
          heart.setAlpha(1);
          heart.setVisible(true);
          alert(`💔 Corazón ${i} = MEDIO`);
          
        } else {
          // Corazón vacío
          console.log(`[HUD] 🖤 Corazón ${i}: VACÍO`);
          (heart as any).setFrame(2); // Frame 2 = vacío
          heart.setAlpha(0.4);
          heart.setVisible(true);
          alert(`🖤 Corazón ${i} = VACÍO`);
        }
      } catch (error) {
        console.error(`[HUD] ❌ Error actualizando corazón ${i}:`, error);
        alert(`❌ ERROR corazón ${i}: ${error.message}`);
      }
    }
    
    console.log(`[HUD] ✅ Actualización completada`);
    alert("✅ ACTUALIZACIÓN COMPLETA");
  }

  createScoreDisplay(): void {
    // Texto de puntuación con el mismo estilo que los otros elementos
    this.scoreText = this.add.dynamicBitmapText(25, 65, "default", `SCORE: ${this.score}`, 12);
    this.scoreText.setAlpha(0.7);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(50);
    
    console.log("[HUD] Score display creado");
  }

  createLabels(): void {
    // FPS Display
    this.fpsText = this.add.dynamicBitmapText(25, 25, "default", "FPS: 0", 12);
    this.fpsText.setAlpha(0.7);
    this.fpsText.setScrollFactor(0);
    this.fpsText.setDepth(50);

    // Timer Display  
    this.timerText = this.add.dynamicBitmapText(25, 45, "default", "TIEMPO: 00:00", 12);
    this.timerText.setAlpha(0.7);
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(50);

    // Version Display
    const versionString = `v${VERSION.major}.${VERSION.minor}.${VERSION.patch}`;
    this.versionText = this.add.dynamicBitmapText(725, 565, "default", versionString, 12);
    this.versionText.setAlpha(0.7);
    this.versionText.setScrollFactor(0);
    this.versionText.setDepth(50);
  }

  // Métodos públicos para actualizar el HUD
  setHealth(current: number, max?: number): void {
    const previousHealth = this.currentHealth;
    this.currentHealth = Math.max(0, current);
    if (max !== undefined) {
      this.maxHealth = max;
    }
    
    console.log(`[HUD] 💗 SETHEALTH llamado: ${previousHealth} → ${current}`);
    
    // ALERT TEMPORAL PARA DEBUGGING
    if (current < previousHealth) {
      alert(`¡DAÑO DETECTADO! Vida: ${previousHealth} → ${current}`);
    }
    
    // Actualizar corazones
    this.updateHearts();
    
    // Si la vida llega a 0, manejar Game Over
    if (this.currentHealth <= 0) {
      console.log(`[HUD] 💀 Vida en 0, activando Game Over`);
      this.scene.start('GameOverScene', { score: this.score });
    }
  }

  damagePlayer(damage: number): void {
    console.log(`[HUD] 🩸 damagePlayer() llamado con daño: ${damage}`);
    
    // ALERT TEMPORAL PARA DEBUGGING
    alert(`¡DAMAGEPLAYER LLAMADO! Daño: ${damage}, Vida actual: ${this.currentHealth}`);
    
    const previousHealth = this.currentHealth;
    this.setHealth(this.currentHealth - damage);
    
    console.log(`[HUD] 💗 Vida actualizada: ${previousHealth} → ${this.currentHealth}`);
  }

  update(): void {
    // Actualizar FPS
    const fps = Math.round(this.game.loop.actualFps);
    this.fpsText.setText(`FPS: ${fps}`);

    // Actualizar timer (ejemplo simple)
    const gameTime = this.time.now / 1000;
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
    this.timerText.setText(`TIEMPO: ${minutesStr}:${secondsStr}`);
  }

  // Métodos para manipular score
  addScore(points: number): void {
    this.score += points;
    const scoreStr = this.score < 100 ? (this.score < 10 ? '00' + this.score : '0' + this.score) : this.score.toString();
    this.scoreText.setText(`SCORE: ${scoreStr}`);
  }

  subtractScore(points: number): void {
    this.score = Math.max(0, this.score - points);
    const scoreStr = this.score < 100 ? (this.score < 10 ? '00' + this.score : '0' + this.score) : this.score.toString();
    this.scoreText.setText(`SCORE: ${scoreStr}`);
  }
}
