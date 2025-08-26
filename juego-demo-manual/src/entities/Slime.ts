import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import Player from "./Player";

const speed = 30;
const detectionRange = 120; // Rango en el que el slime detecta al jugador

export default class Slime {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly body: Phaser.Physics.Arcade.Body;
  private nextAction: number;

  constructor(x: number, y: number, scene: Phaser.Scene) {
    console.log(`[Slime] 🔨 Creando en (${x}, ${y})`);
    this.sprite = scene.physics.add.sprite(x, y, Graphics.slime.name, 0);
    this.sprite.setSize(12, 10);
    this.sprite.setOffset(10, 14);
    this.sprite.anims.play(Graphics.slime.animations.idle.key);
    this.sprite.setDepth(10);

    this.body = <Phaser.Physics.Arcade.Body>this.sprite.body;
    this.nextAction = 0;
    this.body.bounce.set(0, 0);
    this.body.setImmovable(false); // Cambiar a false para que pueda ser empujado
    console.log(`[Slime] ✅ Slime creado exitosamente`);
  }

  update(time: number, player?: Player) {
    if (time < this.nextAction) {
      return;
    }

    // Si hay un jugador y está en rango, perseguirlo
    if (player && this.isPlayerInRange(player)) {
      this.chasePlayer(player);
      this.nextAction = time + 100; // Actualizar más frecuentemente cuando persigue
    } else {
      // Comportamiento aleatorio cuando no hay jugador cerca
      this.randomMovement();
      this.nextAction = time + Phaser.Math.Between(1000, 3000);
    }
  }

  private isPlayerInRange(player: Player): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    return distance <= detectionRange;
  }

  private chasePlayer(player: Player) {
    console.log(`[Slime] 🎯 Persiguiendo al jugador`);
    
    // Calcular dirección hacia el jugador
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );

    // Convertir ángulo a velocidad
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.body.setVelocity(velocityX, velocityY);
    this.sprite.anims.play(Graphics.slime.animations.move.key, true);
  }

  private randomMovement() {
    if (Phaser.Math.Between(0, 1) === 0) {
      this.body.setVelocity(0);
      this.sprite.anims.play(Graphics.slime.animations.idle.key, true);
    } else {
      this.sprite.anims.play(Graphics.slime.animations.move.key, true);
      const direction = Phaser.Math.Between(0, 3);
      this.body.setVelocity(0);

      if (!this.body.blocked.left && direction === 0) {
        this.body.setVelocityX(-speed);
      } else if (!this.body.blocked.right && direction <= 1) {
        this.body.setVelocityX(speed);
      } else if (!this.body.blocked.up && direction <= 2) {
        this.body.setVelocityY(-speed);
      } else if (!this.body.blocked.down && direction <= 3) {
        this.body.setVelocityY(speed);
      } else {
        console.log(`Couldn't find direction for slime: ${direction}`);
      }
    }
  }

  kill() {
    this.sprite.anims.play(Graphics.slime.animations.death.key, false);
    this.sprite.disableBody();
  }
}
