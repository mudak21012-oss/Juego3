import Phaser from "phaser";
import Fonts from "../assets/Fonts";

export default class HUDScene extends Phaser.Scene {
  healthBar?: Phaser.GameObjects.Graphics;
  healthBarBg?: Phaser.GameObjects.Graphics;
  healthText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.DynamicBitmapText;
  
  // Sistema de corazones con sprites
  hearts: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics)[] = [];
  heartsContainer?: Phaser.GameObjects.Container;
  
  // Estado del jugador
  maxHealth: number = 100;
  currentHealth: number = 100;
  score: number = 0;
  
  // Configuración de corazones
  maxHearts: number = 5; // 5 corazones = 100 HP (20 HP por corazón)
  heartSize: number = 28; // Un poco más pequeños
  halfHeartThreshold: number = 10; // Medio corazón a los 10 HP

  constructor() {
    super({ key: "HUDScene" });
  }

  preload(): void {
    this.load.bitmapFont("default", ...Fonts.default);
    
    // Cargar spritesheet estático (PNG) para estados fijos - con espacios encodificados
    this.load.spritesheet('heart-static', 'assets/hearts/Pixel%20Heart%20Sprite%20Sheet%2032x32.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Cargar GIF animado para la transición de daño
    this.load.image('heart-animation', 'assets/hearts/Pixel%20Heart%20Animation%2032x32.gif');
    
    console.log("[HUD] Cargando spritesheet original con URL encodificada...");
  }

  create(): void {
    // El HUD se mantiene fijo en pantalla por defecto
    this.createHeartAnimations();
    this.createHeartSystem();
    this.createScoreDisplay();
    
    console.log("[HUD] ✅ HUD Scene creado correctamente");
  }

  createHeartAnimations(): void {
    // Verificar que el spritesheet se cargó correctamente
    if (!this.textures.exists('heart-static')) {
      console.error("[HUD] ❌ Spritesheet 'heart-static' no se cargó correctamente");
      return;
    }
    
    // Solo crear animaciones estáticas del PNG
    // Frame 0: Corazón lleno
    this.anims.create({
      key: 'heart-full',
      frames: this.anims.generateFrameNumbers('heart-static', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    });

    // Frame 1: Medio corazón (estático)
    this.anims.create({
      key: 'heart-half',
      frames: this.anims.generateFrameNumbers('heart-static', { start: 1, end: 1 }),
      frameRate: 1,
      repeat: 0
    });

    // Frame 2: Corazón vacío
    this.anims.create({
      key: 'heart-empty',
      frames: this.anims.generateFrameNumbers('heart-static', { start: 2, end: 2 }),
      frameRate: 1,
      repeat: 0
    });

    console.log("[HUD] ✅ Animaciones estáticas creadas (PNG)");
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
    const scoreWidth = 120; // Espacio aproximado que ocupa "SCORE: 000"
    const startX = 25 + scoreWidth + 20; // Score x + ancho + margen
    const y = 65; // Misma altura que el Score
    const heartSpacing = 30; // Espacio compacto para corazones
    
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
    const scale = 0.8; // Tamaño del corazón
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

  createFallbackHeartSystem(): void {
    console.log("[HUD] 🔄 Creando sistema de corazones fallback con texto");
    // Sistema simple con texto como backup - al lado del Score
    const scoreWidth = 120;
    const startX = 25 + scoreWidth + 20;
    const y = 65;
    this.hearts = [];
    
    for (let i = 0; i < this.maxHearts; i++) {
      const heartText = this.add.text(startX + i * 25, y, '♥', {
        fontSize: '20px',
        color: '#ff0000'
      });
      heartText.setScrollFactor(0);
      heartText.setDepth(50);
      
      // Agregar propiedades para compatibilidad
      (heartText as any).setFrame = (frame: number) => {
        if (frame === 0) {
          heartText.setStyle({ color: '#ff0000' }); // Rojo = lleno
          heartText.setText('♥');
        } else if (frame === 1) {
          heartText.setStyle({ color: '#ff8800' }); // Naranja = medio
          heartText.setText('♡');
        } else {
          heartText.setStyle({ color: '#444444' }); // Gris = vacío
          heartText.setText('♡');
        }
      };
      
      this.hearts.push(heartText as any);
    }
    
    console.log("[HUD] ✅ Sistema fallback con texto creado - debería mostrar cambios visuales");
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
      
      // Validaciones robustas
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
        console.error('Detalles del corazón:', heart);
        alert(`❌ ERROR corazón ${i}: ${error.message}`);
      }
    }
    
    console.log(`[HUD] ✅ Actualización completada`);
    alert("✅ ACTUALIZACIÓN COMPLETA");
  }

  createScoreDisplay(): void {
    // Texto de puntuación con exactamente el mismo estilo que FPS, timer y version
    this.scoreText = this.add.dynamicBitmapText(25, 65, "default", `SCORE: ${this.score}`, 12);
    this.scoreText.setAlpha(0.7);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(50);
    
    console.log("[HUD] Score display creado con estilo idéntico a FPS/timer/version");
  }

  createLabels(): void {
    // HUD compacto sin títulos grandes
    // Las etiquetas están en cada elemento individual
  }

  // Métodos públicos para actualizar el HUD
  setHealth(current: number, max?: number): void {
    const previousHealth = this.currentHealth;
    this.currentHealth = Math.max(0, current);
    if (max !== undefined) {
      this.maxHealth = max;
    }
    
    console.log(`[HUD] 💗 SETHEALTH llamado: ${previousHealth} → ${current}`);
    console.log(`[HUD] 📊 Estado actual: vida=${this.currentHealth}, max=${this.maxHealth}`);
    
    // ALERT TEMPORAL PARA DEBUGGING
    if (current < previousHealth) {
      alert(`¡DAÑO DETECTADO! Vida: ${previousHealth} → ${current}`);
    }
    
    // Lógica simplificada para debug
    if (current < previousHealth) {
      console.log(`[HUD] 🩸 Perdiste vida, actualizando corazones...`);
      this.updateHearts(); // Simplificado para debug
    } else {
      console.log(`[HUD] 💚 Vida igual o mayor, actualizando corazones...`);
      this.updateHearts();
    }
    
    // Si la vida llega a 0, ocultar los corazones para evitar conflictos con Game Over
    if (this.currentHealth <= 0) {
      console.log(`[HUD] 💀 Vida en 0, ocultando corazones`);
      this.hideHearts();
    }
  }

  playHealthLossAnimation(previousHealth: number, newHealth: number): void {
    console.log(`[HUD] 🩸 Animación de pérdida de vida: ${previousHealth} → ${newHealth}`);
    
    // Para sistema gráfico, solo actualizar directamente
    this.updateHearts();
    
    // TODO: Implementar animación con tweens para graphics
    // const affectedHeartIndex = Math.floor(newHealth / 20);
    // if (this.hearts[affectedHeartIndex]) {
    //   this.tweens.add({
    //     targets: this.hearts[affectedHeartIndex],
    //     alpha: 0.3,
    //     scaleX: 1.2,
    //     scaleY: 1.2,
    //     duration: 200,
    //     yoyo: true,
    //     ease: 'Power2'
    //   });
    // }
  }
          this.tweens.add({
            targets: this.hearts[affectedHeartIndex],
            x: this.hearts[affectedHeartIndex].x + 3,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            onComplete: () => {
              // Después del temblor, actualizar normalmente
              this.updateHearts();
            }
          });
        } catch (error) {
          console.error("[HUD] ❌ Error en animación de pérdida:", error);
          this.updateHearts(); // Fallback
        }
      } else {
        console.warn(`[HUD] ⚠️ Corazón ${affectedHeartIndex} no válido para animación`);
        this.updateHearts(); // Fallback
      }
    } else {
      // Solo cambió de lleno a medio, actualizar normalmente
      this.updateHearts();
    }
  }
  
  hideHearts(): void {
    if (this.heartsContainer) {
      this.heartsContainer.setVisible(false);
      // Detener todas las animaciones de pulso
      this.hearts.forEach(heart => {
        this.tweens.killTweensOf(heart);
        heart.setScale(1); // Resetear escala
      });
    }
    console.log('[HUDScene] 👻 Corazones ocultados (vida = 0)');
  }
  
  showHearts(): void {
    if (this.heartsContainer) {
      this.heartsContainer.setVisible(true);
      this.updateHearts(); // Redibujar y reactivar animaciones
    }
    console.log('[HUDScene] ❤️ Corazones mostrados');
  }

  damagePlayer(damage: number): void {
    alert(`¡DAMAGEPLAYER LLAMADO! Daño: ${damage}, Vida actual: ${this.currentHealth}`);
    this.setHealth(this.currentHealth - damage);
  }

  healPlayer(healing: number): void {
    this.setHealth(Math.min(this.currentHealth + healing, this.maxHealth));
  }

  // Métodos para el sistema de puntos
  setScore(score: number): void {
    this.score = Math.max(0, score);
    this.updateScoreDisplay();
  }

  addScore(points: number): void {
    this.setScore(this.score + points);
  }

  updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.score}`);
    }
  }

    // Método para reiniciar completamente el HUD
  resetGame(): void {
    console.log('[HUDScene] 🔄 Reiniciando HUD - Restaurando vida y puntos');
    this.maxHealth = 100;
    this.currentHealth = 100;
    this.score = 0;
    this.updateHearts();
    this.updateScoreDisplay();
    
    // Mostrar corazones si estaban ocultos
    if (this.heartsContainer) {
      this.heartsContainer.setVisible(true);
    }
  }

  // Método de prueba para testear animaciones
  testHeartAnimations(): void {
    console.log('[HUD] 🧪 Probando animaciones de corazón...');
    
    if (!this.hearts.length) {
      console.log('[HUD] ❌ No hay corazones para probar');
      return;
    }

    // Probar cada animación en diferentes corazones
    if (this.hearts[0]) {
      console.log('[HUD] Probando heart-full en corazón 0');
      this.hearts[0].play('heart-full');
    }
    
    if (this.hearts[1]) {
      console.log('[HUD] Probando heart-half en corazón 1');
      this.hearts[1].play('heart-half');
    }
    
    if (this.hearts[2]) {
      console.log('[HUD] Probando heart-empty en corazón 2');
      this.hearts[2].play('heart-empty');
    }
    
    if (this.hearts[3] && this.anims.exists('heart-losing')) {
      console.log('[HUD] Probando heart-losing en corazón 3');
      this.hearts[3].play('heart-losing');
    }
  }
}
