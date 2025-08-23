export const WAVES_CFG = {
  totalSec: 300,          // 5 min global
  baseSpawnMs: 1200,      // rate_0
  decayPerMin: 0.85,      // rate_m = rate_0 * 0.85^m
  hpScalePerMin: 1.2,     // HP_m = ceil(HP0 * 1.2^m)
  speedBonusPerMin: 0.08, // v_m = v0 * (1 + 0.08*m)
  perRoomBase: 3          // enemigos base por tick
};
