import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import Player from "../entities/Player";
import Slime from "../entities/Slime";

export default class ArenaLite extends Phaser.Scene {
  player!: Player;
  slimes: Slime[] = [];
  slimeGroup!: Phaser.GameObjects.Group;
  private arena = { x: 0, y: 0, w: 640, h: 400 };
  private walls: Phaser.GameObjects.Rectangle[] = [];

  preload(): void {
    this.load.image(Graphics.environment.name, Graphics.environment.file);
    this.load.image(Graphics.util.name, Graphics.util.file);
    this.load.spritesheet(Graphics.player.name, Graphics.player.file, {
      frameHeight: Graphics.player.height, frameWidth: Graphics.player.width
    });
    this.load.spritesheet(Graphics.slime.name, Graphics.slime.file, {
      frameHeight: Graphics.slime.height, frameWidth: Graphics.slime.width
    });
  }

  create(): void {
    this.add.text(10, 28, "ARENA LITE (sin tilemap)", { fontFamily:"monospace", fontSize:"14px", color:"#0f0" })
      .setDepth(9999).setScrollFactor(0);

    Object.values(Graphics.player.animations).forEach(a=>{
      if(!this.anims.get(a.key)) this.anims.create({ ...a, frames: this.anims.generateFrameNumbers(Graphics.player.name, a.frames) });
    });
    Object.values(Graphics.slime.animations).forEach(a=>{
      if(!this.anims.get(a.key)) this.anims.create({ ...a, frames: this.anims.generateFrameNumbers(Graphics.slime.name, a.frames) });
    });

    const margin = 40;
    this.arena.w = this.scale.width  - margin*2;
    this.arena.h = this.scale.height - margin*2;
    this.arena.x = (this.scale.width  - this.arena.w)/2;
    this.arena.y = (this.scale.height - this.arena.h)/2;

    this.add.rectangle(this.arena.x + this.arena.w/2, this.arena.y + this.arena.h/2, this.arena.w, this.arena.h, 0x2f3542).setDepth(-10);
    const t=24,c=0x57606f;
    const top    = this.add.rectangle(this.arena.x + this.arena.w/2, this.arena.y + t/2, this.arena.w, t, c);
    const bottom = this.add.rectangle(this.arena.x + this.arena.w/2, this.arena.y + this.arena.h - t/2, this.arena.w, t, c);
    const left   = this.add.rectangle(this.arena.x + t/2, this.arena.y + this.arena.h/2, t, this.arena.h, c);
    const right  = this.add.rectangle(this.arena.x + this.arena.w - t/2, this.arena.y + this.arena.h/2, t, this.arena.h, c);
    this.walls = [top,bottom,left,right]; this.walls.forEach(w=>this.physics.add.existing(w,true));

    this.player = new Player(this.arena.x + this.arena.w/2, this.arena.y + this.arena.h/2, this);
    this.slimeGroup = this.physics.add.group([]);

    this.walls.forEach(w=>{
      this.physics.add.collider(this.player.sprite, w as any);
      this.physics.add.collider(this.slimeGroup, w as any);
    });

    this.physics.add.collider(this.player.sprite, this.slimeGroup, undefined, (_p, go)=>{
      const s = this.slimes.find(x=>x.sprite===go); if(!s) return true;
      if(this.player.isAttacking()){ this.slimes=this.slimes.filter(x=>x!==s); s.kill(); return false; }
      else { this.player.stagger(); return true; }
    }, this);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setRoundPixels(true);
    this.time.delayedCall(400, ()=>this.spawnSlime());
  }

  update(time:number){ this.player.update(time); this.slimes.forEach(s=>s.update(time)); }

  private spawnSlime(){
    const m=48;
    const x=Phaser.Math.Between(this.arena.x+m, this.arena.x+this.arena.w-m);
    const y=Phaser.Math.Between(this.arena.y+m, this.arena.y+this.arena.h-m);
    const s=new Slime(x,y,this);
    this.physics.moveToObject(s.sprite, this.player.sprite, 60);
    this.slimes.push(s); this.slimeGroup.add(s.sprite);
  }
}
