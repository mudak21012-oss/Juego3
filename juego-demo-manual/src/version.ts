// Sistema de versiones para rastrear actualizaciones
export const VERSION = {
  major: 2,
  minor: 5,
  patch: 0,
  
  // Generar string de versión completa
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  
  // Incrementar versión patch (para cambios pequeños)
  incrementPatch(): void {
    this.patch++;
    console.log(`[VERSION] Versión actualizada a: ${this.toString()}`);
  },
  
  // Incrementar versión minor (para nuevas características)
  incrementMinor(): void {
    this.minor++;
    this.patch = 0;
    console.log(`[VERSION] Versión actualizada a: ${this.toString()}`);
  },
  
  // Incrementar versión major (para cambios importantes)
  incrementMajor(): void {
    this.major++;
    this.minor = 0;
    this.patch = 0;
    console.log(`[VERSION] Versión actualizada a: ${this.toString()}`);
  }
};

// Log inicial
console.log(`[VERSION] Sistema de versiones inicializado: ${VERSION.toString()}`);

// CHANGELOG:
// export default "2.3.1"; - Debug exhaustivo del sistema de timers
//   - Logs detallados de setupEnemySpawning paso a paso
//   - Verificación de creación y estado del timer principal
//   - Test directo SIN timer para verificar creación de slimes
//   - Identificar si el problema está en timers o en creación
//
// v2.2.1 - Debug del problema de spawn
//   - Test simple a los 0.5 segundos para verificar función
//   - Logs detallados del proceso completo de spawn
//   - Verificación paso a paso de condiciones y creación
//   - Identificar por qué el sistema dejó de funcionar
//
// v2.2.0 - Sistema de enemigos optimizado y funcional
//   - 8 enemigos spawneando a 1 por segundo durante los primeros 10 segundos
//   - 1 enemigo inicial + 8 adicionales = 9 total máximo
//   - Tamaño normal de slimes (sin escala de debug)
//   - Eliminado rectángulo rojo de prueba
//   - Logs limpios y optimizados
//   - Sistema completamente funcional y balanceado
//
// v2.1.4 - Test de visibilidad extremo
//   - Slime de prueba justo al lado del jugador (imposible no verlo)
//   - Forzar visibilidad: depth=50, alpha=1, escala=2x
//   - Rectángulo rojo de referencia para verificar renderizado
//   - Logs exhaustivos de propiedades del sprite
//   - Si aún no se ve, el problema está en el sistema de renderizado
//
// v2.1.3 - Debug completo del sistema de enemigos
//   - Logs detallados del slime inicial en Map.ts
//   - Verificación del slimeGroup y sus elementos
//   - Spawn inmediato de prueba a los 0.1 segundos
//   - Verificación de visibilidad y posicionamiento de sprites
//   - Debug exhaustivo para identificar el problema
//
// v2.1.2 - Debug intensivo del sistema de spawn
//   - Spawn cada 1 segundo (muy frecuente para debug)
//   - 9 spawns máximo cerca del jugador
//   - Logs detallados de creación de Slime y posicionamiento
//   - Spawning relativo al jugador para asegurar visibilidad
//   - Verificación de estado del slimeGroup
//
// v2.1.1 - Sistema de spawn mejorado para pruebas
//   - Spawn cada 1.5 segundos fijo (más frecuente y predecible)
//   - 7 spawns máximo en lugar de 4 (más enemigos para probar)
//   - Logs detallados de debugging para identificar problemas
//   - Verificaciones de estado paso a paso en spawnEnemy()
//
// v2.1.0 - Sistema de spawn de enemigos temporizado
//   - Enemigos spawean cada 2-4 segundos durante los primeros 10 segundos
//   - Máximo 4 spawns adicionales al enemigo inicial (total ~5 enemigos)
//   - Sistema se detiene automáticamente después de 10 segundos
//   - Solo 1 enemigo inicial en lugar de 3
//   - Logs detallados del sistema de spawning
//   - Los enemigos eliminados se remueven correctamente del grupo
//
// v2.0.1 - Sistema de recuperación - puertas funcionales sin partículas
//   - Timer de 10 segundos implementado y funcional
//   - Puertas realmente bloquean físicamente el paso
//   - Partículas temporalmente desactivadas para estabilidad
//   - Sistema de apertura completa de puertas funciona correctamente
//
// v2.0.0 - Sistema de puertas renovado (con errores corregidos)
//   - Timer extendido a 10 segundos para mayor desafío
//   - Puertas ahora REALMENTE bloquean el paso físicamente
//   - Removido callback que permitía pasar antes del timer
//   - Sistema de partículas doradas en puertas bloqueadas
//   - Partículas se detienen automáticamente al desbloquear
//   - Puertas se REMUEVEN completamente al desbloquear (no solo colisión)
//   - FOV se recalcula automáticamente al abrir puertas
//
// v1.9.2 - HUD mejorado según especificaciones
//   - Marcador de puntos igual al FPS: Arial 16px con transparencia 0.8
//   - Barra de vida más grande: 200x20 con bordes redondeados (radio 3px)
//   - Fondo negro con transparencia para la barra de vida
//   - Texto de vida más grande para nueva barra
//
// v1.9.1 - Fix de tipografía con fallback
//   - Agregado fallback monospace para fuentes del HUD
//   - Mejorada compatibilidad de carga de fuentes
//   - Debug logs para verificar carga de elementos HUD
//
// v1.9.0 - HUD actualizado con marcador de puntos
//   - Eliminados cuadrados de armadura y arma del HUD
//   - Agregado marcador de puntos en esquina superior izquierda
//   - Tipografía unificada con CasualEncounter en todo el HUD
//   - Controles de prueba actualizados (3=+Puntos, 4=Reset Puntos)
//   - HUD más compacto y centrado en lo esencial
//
// v1.8.1 - HUD compacto reposicionado
//   - HUD movido a la parte inferior centrada
//   - Reducido tamaño de elementos del HUD
//   - Mejorada legibilidad de textos
//
// v1.8.0 - Sistema HUD con barra de vida y equipment slots
//   - Implementado HUDScene independiente
//   - Barra de vida con colores dinámicos
//   - Slots de armadura y arma
//   - Controles de prueba del HUD
//
// v1.7.0 - Puertas personalizadas con sprites específicos
//   - Puertas norte/sur usan sprite 0x81 (horizontales)
//   - Puertas este/oeste usan sprite 0x90 (verticales con rotación 180°)
//   - Sistema de orientación corregido
//   - Mejorada apariencia visual de las puertas
//
// v2.5.0 - UI/UX y Game Over mejorado
//   - Barra de vida se oculta automáticamente al llegar a 0 (evita conflictos con Game Over)
//   - Contador de enemigos corregido: muestra "X de Y" eliminados por el jugador
//   - Game Over compacto y nítido con mejor legibilidad
//   - Textos con mayor contraste y bordes para mejor definición
//   - Animaciones más rápidas y dinámicas
//   - Sistema de reset mejorado con inicialización forzada del HUD
//   - Overlay menos dominante para mejor experiencia visual
//
// v1.6.0 - Herramienta selector de sprites
//   - SpritePickerScene completo con navegación
//   - Mostrar índices y nombres de sprites
//   - Navegación con teclado y mouse
//   - Información detallada de cada sprite
//
// v1.5.0 - Sistema de timer en salas estilo Isaac
//   - Timer de 5 segundos para abrir puertas
//   - InfoScene separada para mostrar información
//   - Integración entre DungeonScene e InfoScene
//   - Puertas se abren automáticamente tras el timer
//
// v1.4.0 - Salas estilo Isaac implementadas
//   - Sala central de 15x15 con puertas en los 4 lados
//   - Sistema de puertas con sprites de madera
//   - Integración con sistema de mapas existente
//   - Base para futuro sistema de habitaciones múltiples