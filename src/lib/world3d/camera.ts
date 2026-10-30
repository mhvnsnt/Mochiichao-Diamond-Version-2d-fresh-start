/**
 * Field camera for the 3D world presentation — a port of the held
 * HGSS field-camera behaviour (pokeheartgold include/camera.h +
 * src/camera.c, FieldCamera_Create): a perspective camera defined by
 * a look-at target, a distance, and an angle (pitch/yaw), following
 * the player over a grid world. HGSS field values: angled top-down,
 * pitch steep enough that rooflines and the ground grid both read,
 * distance framing roughly a screen of tiles around the player.
 *
 * World units: 1 tile = 16 units (the Diamond land grid). +x east,
 * +y up, +z south (toward the viewer's bottom edge), matching the
 * held land models' own axes, so map tile (tx, ty) maps to world
 * ((tx - mapW/2 + 0.5) * 16, 0, (ty - mapH/2 + 0.5) * 16).
 */

export const TILE_UNITS = 16;

export function tileToWorldX(tx: number, mapW: number): number {
  return (tx - mapW / 2 + 0.5) * TILE_UNITS;
}

export function tileToWorldZ(ty: number, mapH: number): number {
  return (ty - mapH / 2 + 0.5) * TILE_UNITS;
}

export interface FieldCamera {
  /** World position the camera looks at (the player's feet). */
  target: { x: number; y: number; z: number };
  /** Camera distance from the target, in world units. */
  distance: number;
  /** Downward pitch in degrees (90 = straight down, 0 = horizon). */
  pitchDeg: number;
  /** Vertical field of view in degrees. */
  fovDeg: number;
}

/** The standing HGSS-style field framing: pitch 52 degrees, a
 *  distance that frames the player's surroundings at game scale
 *  (tuned on the lane's real-scene captures: at 330 the whole
 *  36-tile chunk read as a map overview; ~195 reads as the field
 *  view, actors at the same screen size as the 2D presentation). */
export function hgssFieldCamera(target: { x: number; y: number; z: number }): FieldCamera {
  return { target, distance: 195, pitchDeg: 52, fovDeg: 42 };
}

export function cameraPosition(cam: FieldCamera): { x: number; y: number; z: number } {
  const pitch = (cam.pitchDeg * Math.PI) / 180;
  return {
    x: cam.target.x,
    y: cam.target.y + Math.sin(pitch) * cam.distance,
    z: cam.target.z - Math.cos(pitch) * cam.distance,
  };
}

/** Column-major 4x4 helpers (WebGL uniform layout). */
export type Mat4 = Float32Array;

export function mat4Perspective(fovDeg: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

export function mat4LookAt(eye: { x: number; y: number; z: number },
                           target: { x: number; y: number; z: number }): Mat4 {
  const up = { x: 0, y: 1, z: 0 };
  let zx = eye.x - target.x, zy = eye.y - target.y, zz = eye.z - target.z;
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl; zy /= zl; zz /= zl;
  let xx = up.y * zz - up.z * zy, xy = up.z * zx - up.x * zz, xz = up.x * zy - up.y * zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl; xy /= xl; xz /= xl;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  const out = new Float32Array(16);
  out[0] = xx; out[1] = yx; out[2] = zx;
  out[4] = xy; out[5] = yy; out[6] = zy;
  out[8] = xz; out[9] = yz; out[10] = zz;
  out[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
  out[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
  out[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
  out[15] = 1;
  return out;
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1]
        + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

/** Compose translate * rotY * scale (the only model transform the
 *  field placements need). */
export function mat4Compose(px: number, py: number, pz: number,
                            rotYDeg: number, scale: number): Mat4 {
  const th = (rotYDeg * Math.PI) / 180;
  const c = Math.cos(th), s = Math.sin(th);
  const out = new Float32Array(16);
  out[0] = c * scale; out[2] = -s * scale;
  out[5] = scale;
  out[8] = s * scale; out[10] = c * scale;
  out[12] = px; out[13] = py; out[14] = pz;
  out[15] = 1;
  return out;
}

export function mat4Identity(): Mat4 {
  const out = new Float32Array(16);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}
