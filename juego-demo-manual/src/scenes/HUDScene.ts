import Phaser from "phaser";

export default class HUDScene extends Phaser.Scene {
  healthBar?: Phaser.GameObjects.Graphics;
  healthBarBg?: Phaser.GameObjects.Graphics;
  healthText?: Phaser.GameObjects.Text;
  scoreText?: Phaser.GameObjects.Text;
  
  // Estado del jugador
  maxHealth: number = 100;
  currentHealth: number = 100;
  score: number = 0;

  constructor() {
    super({ key: "HUDScene" });
  }

  create(): void {
    // El HUD se mantiene fijo en pantalla por defecto
    this.createHealthBar();
    this.createScoreDisplay();
  }

  createHealthBar(): void {
    const screenWidth = this.cameras.main.width;
    const x = screenWidth / 2 - 100; // Más ancha
    const y = this.cameras.main.height - 70; // Más alta
    const width = 200; // Más ancha
    const height = 20; // Más alta

    // Solo crear la barra de vida, sin fondo separado
    this.healthBar = this.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(50); // Depth MUY bajo para que esté debajo del Game Over
    this.updateHealthBar();

    // Texto de vida (más grande para la nueva barra)
    this.healthText = this.add.text(x + width / 2, y + height / 2, `${this.currentHealth}/${this.maxHealth}`, {
      fontFamily: "CasualEncounter, monospace",
      fontSize: "10px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 1
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(50); // Depth MUY bajo para el texto también
  }

  createScoreDisplay(): void {
    // Marcador de puntos igual al FPS - misma tipografía, tamaño y transparencia
    this.scoreText = this.add.text(20, 50, `PUNTOS: ${this.score}`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      color: "#ffffff",
      alpha: 0.8
    }).setScrollFactor(0).setDepth(50); // Depth muy bajo
    
    console.log("[HUD] Score display creado igual al FPS");
  }

  createLabels(): void {
    // HUD compacto sin títulos grandes
    // Las etiquetas están en cada elemento individual
  }

  updateHealthBar(): void {
    if (!this.healthBar) return;

    this.healthBar.clear();
    
    const screenWidth = this.cameras.main.width;
    const x = screenWidth / 2 - 100; // Más ancha
    const y = this.cameras.main.height - 70; // Más alta
    const width = 200; // Más ancha
    const height = 20; // Más alta
    const cornerRadius = 3; // Bordes poco redondeados
    
    // Calcular el ancho de la barra basado en la vida actual
    const healthPercentage = this.currentHealth / this.maxHealth;
    const healthWidth = width * healthPercentage;
    
    // Color de la barra basado en el porcentaje de vida
    let healthColor = 0x00ff00; // Verde
    if (healthPercentage < 0.5) {
      healthColor = 0xffff00; // Amarillo
    }
    if (healthPercentage < 0.25) {
      healthColor = 0xff0000; // Rojo
    }
    
    // Fondo de la barra (negro con bordes redondeados)
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRoundedRect(x - 2, y - 2, width + 4, height + 4, cornerRadius + 1);
    
    // Barra de vida (con bordes redondeados)
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRoundedRect(x, y, healthWidth, height, cornerRadius);
    
    // Actualizar texto
    if (this.healthText) {
      this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
      this.healthText.setPosition(x + width / 2, y + height / 2);
    }
  }

  // Métodos públicos para actualizar el HUD
  setHealth(current: number, max?: number): void {
    this.currentHealth = Math.max(0, current);
    if (max !== undefined) {
      this.maxHealth = max;
    }
    this.updateHealthBar();
    
    // Si la vida llega a 0, ocultar la barra de vida para evitar conflictos con Game Over
    if (this.currentHealth <= 0) {
      this.hideHealthBar();
    }
  }
  
  hideHealthBar(): void {
    if (this.healthBar) {
      this.healthBar.setVisible(false);
    }
    if (this.healthText) {
      this.healthText.setVisible(false);
    }
    console.log('[HUDScene] 👻 Barra de vida ocultada (vida = 0)');
  }
  
  showHealthBar(): void {
    if (this.healthBar) {
      this.healthBar.setVisible(true);
    }
    if (this.healthText) {
      this.healthText.setVisible(true);
    }
    console.log('[HUDScene] ❤️ Barra de vida mostrada');
  }

  damagePlayer(damage: number): void {
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
      this.scoreText.setText(`PUNTOS: ${this.score}`);
    }
  }

  // Método para reiniciar completamente el HUD
  resetGame(): void {
    console.log('[HUDScene] 🔄 Reiniciando HUD - Restaurando vida y puntos');
    this.maxHealth = 100;
    this.currentHealth = 100;
    this.score = 0;
    this.updateHealthBar();
    this.updateScoreDisplay();
    this.showHealthBar(); // Asegurar que la barra de vida sea visible al reiniciar
  }
}
