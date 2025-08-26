# 🎮 Juego Demo v2.5.0

Un dungeon crawler estilo Isaac desarrollado con Phaser 3 y TypeScript para testing público.

## 🚀 [¡JUGAR AHORA!](https://mudak21012-oss.github.io/Juego-Demo/)

## 📋 Características del Juego

### 🏰 Sala Estilo Isaac
- Sala central de 15x15 con 4 puertas
- Timer de 10 segundos para abrir las puertas
- Diseño clásico de dungeon crawler

### 👾 Sistema de Enemigos
- **1 slime inicial** al comenzar
- **8 slimes adicionales** aparecen cada segundo
- **IA inteligente**: Los enemigos buscan al jugador
- **Total**: 9 enemigos máximo por partida

### ⚔️ Combate y Puntuación
- **+100 puntos** por enemigo eliminado
- **-20 puntos** por daño recibido
- **+500 BONUS** por eliminar todos los enemigos
- **Sistema de vida**: 100 HP con barra visual

### 💀 Game Over
- Estadísticas de la partida
- Contador de enemigos eliminados
- Reinicio rápido con **R**

##  Controles

- **WASD** o **Flechas**: Movimiento
- **Espacio**: Atacar
- **R**: Reiniciar (en Game Over)

## 🧪 Testing Público

**¡Este juego está en fase de testing!** 

**Por favor prueba y reporta:**
- ¿Los enemigos aparecen correctamente?
- ¿El sistema de puntuación funciona bien?
- ¿El Game Over se ve correctamente?
- ¿Algún bug o problema?

## 🛠️ Tecnología

Desarrollado con **Phaser 3** y **TypeScript**

---

**Version 2.5.0** - Lista para testing público

## Contributing

Get a local instance running with `npm i` and then `npm run start`.

Press `R` in game to see a tilesheet reference, press `R` again to return to the game. Press `Q` to show the debug layer.

Contributions must be valid typescript & formatted with prettier.js.

Otherwise, go nuts.

## TODO

 * use `PerformanceObserver` to get a more accurate FPS value

## Credits

* Uses [mrpas](https://www.npmjs.com/package/mrpas) to determine the field of view
* Uses [dungeoneer](https://www.npmjs.com/package/dungeoneer) to generate the dungeon
* `Rogue*.png` files are from the [Rogue Dungeon Tileset 16x16](https://fongoose.itch.io/rogue-dungeon-tileset-16x16) by [fongoose](https://twitter.com/fongoosemike)
* "CasualEncounter" font from Anna Anthropy's [World of Fonts](https://w.itch.io/world-of-fonts)
