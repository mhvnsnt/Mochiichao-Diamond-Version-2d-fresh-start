/**
 * WebGL2 renderer for the 3D world presentation.
 *
 * Why raw WebGL2 and not a 3D library: the shipped stack is
 * React + Vite + PixiJS (WebGL) — no 3D engine is in the bundle,
 * and this lane adds no dependency. The held models arrive as
 * converted JSON (tools/nsbmd_convert.py), textures as PNGs, so
 * the renderer only needs: textured triangle draws with the DS
 * texture wrap/flip rules, a perspective field camera, and
 * yaw-billboarded 2D actor sprites standing in the ground plane —
 * the HGSS recipe (3D model world, 2D sprite actors, grid
 * movement). It draws into its own canvas layered exactly where
 * the Pixi canvas sits; the game logic never reads from it.
 *
 * Shading is deliberately flat: vertex-less, texture-only, no
 * lighting pass — the held textures carry their authored shading,
 * and the switcher's protected axes (colour/lighting/quality)
 * stay untouched. Shadows are render-time only: a soft blob quad
 * under each actor (never baked into art).
 */
import type { World3DArea, World3DPlacement } from './areaData';
import {
  cameraPosition, mat4Compose, mat4LookAt, mat4Multiply, mat4Perspective,
  type FieldCamera, type Mat4,
} from './camera';

export interface ModelMaterialJson {
  name: string;
  texName: string;
  repeatS: number; flipS: number; repeatT: number; flipT: number;
}

export interface ModelJson {
  name: string;
  materials: ModelMaterialJson[];
  shapes: { verts: number[]; matIndex: number; triCount: number }[];
}

interface GpuShape {
  vbo: WebGLBuffer;
  count: number;
  tex: WebGLTexture | null;
  texW: number;
  texH: number;
  mat: ModelMaterialJson;
  water: boolean;
}

interface GpuModel {
  shapes: GpuShape[];
  matrix: Mat4;
}

export interface ActorSprite {
  /** Loaded sheet/frame image; null draws a flat colour quad. */
  img: HTMLImageElement | null;
  /** Pixel crop inside img (sheet cell); null = whole image. */
  crop: { x: number; y: number; w: number; h: number } | null;
  feet: { x: number; y: number; z: number };
  /** World-unit size of the billboard. */
  w: number;
  h: number;
  flipX: boolean;
  /** Fallback / tint colour when img is null. */
  color?: string;
}

const VERT_SRC = `
attribute vec3 aPos;
attribute vec2 aUv;
uniform mat4 uMvp;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const FRAG_SRC = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform vec2 uRepeat;   // 1 = wrap-repeat this axis
uniform vec2 uFlip;     // 1 = mirrored repeat this axis
uniform vec2 uUvOffset; // texel units (water animation)
uniform float uAlphaTest; // >0: discard below this alpha
uniform float uOpacity;
uniform vec4 uSolid;    // used when uUseSolid > 0.5
uniform float uUseSolid;
varying vec2 vUv;
float wrapAxis(float t, float rep, float flip) {
  if (rep < 0.5) return clamp(t, 0.0, 1.0);
  if (flip > 0.5) {
    float m = mod(t, 2.0);
    return m < 1.0 ? m : 2.0 - m;
  }
  return fract(t);
}
void main() {
  if (uUseSolid > 0.5) {
    gl_FragColor = uSolid;
    return;
  }
  vec2 uv = (vUv + uUvOffset) / uTexSize;
  uv.x = wrapAxis(uv.x, uRepeat.x, uFlip.x);
  uv.y = wrapAxis(uv.y, uRepeat.y, uFlip.y);
  vec4 c = texture2D(uTex, uv);
  if (uAlphaTest > 0.0 && c.a < uAlphaTest) discard;
  gl_FragColor = vec4(c.rgb, c.a * uOpacity);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error('shader: ' + gl.getShaderInfoLog(sh));
  }
  return sh;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export class World3DRenderer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private aPos: number;
  private aUv: number;
  private models: GpuModel[] = [];
  private actorTex = new Map<HTMLImageElement, WebGLTexture>();
  private dynVbo: WebGLBuffer;
  private shadowTex: WebGLTexture;
  ready = false;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    this.prog = prog;
    for (const name of ['uMvp', 'uTex', 'uTexSize', 'uRepeat', 'uFlip', 'uUvOffset', 'uAlphaTest', 'uOpacity', 'uSolid', 'uUseSolid']) {
      this.loc[name] = gl.getUniformLocation(prog, name);
    }
    this.aPos = gl.getAttribLocation(prog, 'aPos');
    this.aUv = gl.getAttribLocation(prog, 'aUv');
    this.dynVbo = gl.createBuffer()!;
    // Soft radial blob texture for render-time contact shadows.
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.42)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    this.shadowTex = this.makeTexture(c);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
  }

  private makeTexture(src: TexImageSource): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return tex;
  }

  private textureForImage(img: HTMLImageElement): WebGLTexture {
    let tex = this.actorTex.get(img);
    if (!tex) {
      tex = this.makeTexture(img);
      this.actorTex.set(img, tex);
    }
    return tex;
  }

  async loadPlacement(baseUrl: string, texDir: string, modelFile: string,
                      texFiles: Record<string, string>,
                      matrix: Mat4, waterTextures: string[]): Promise<void> {
    const gl = this.gl;
    const res = await fetch(`${baseUrl}/${modelFile}`);
    const model = (await res.json()) as ModelJson;
    const texByName = new Map<string, { tex: WebGLTexture; w: number; h: number }>();
    await Promise.all(model.materials.map(async (mat) => {
      const file = texFiles[mat.texName];
      if (!file || texByName.has(mat.texName)) return;
      try {
        const img = await loadImage(`${baseUrl}/${texDir}/${file}`);
        texByName.set(mat.texName, { tex: this.makeTexture(img), w: img.width, h: img.height });
      } catch {
        texByName.set(mat.texName, { tex: null as unknown as WebGLTexture, w: 1, h: 1 });
      }
    }));
    const shapes: GpuShape[] = model.shapes.map((shape) => {
      const mat = model.materials[shape.matIndex] ?? model.materials[0];
      const entry = texByName.get(mat.texName);
      const vbo = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.verts), gl.STATIC_DRAW);
      return {
        vbo,
        count: shape.verts.length / 5,
        tex: entry && entry.tex ? entry.tex : null,
        texW: entry ? entry.w : 1,
        texH: entry ? entry.h : 1,
        mat,
        water: waterTextures.includes(mat.texName),
      };
    });
    this.models.push({ shapes, matrix });
  }

  async loadArea(area: World3DArea, mapW: number, mapH: number): Promise<void> {
    const land = area.land;
    await this.loadPlacement(
      area.baseUrl, land.texDir, land.model, land.texFiles,
      mat4Compose(land.offset.x, land.offset.y, land.offset.z, 0, 1),
      area.waterTextures,
    );
    for (const b of area.buildings as World3DPlacement[]) {
      const wx = (b.tileX - mapW / 2) * 16;
      const wz = (b.tileY - mapH / 2) * 16;
      await this.loadPlacement(
        area.baseUrl, b.texDir, b.model, b.texFiles,
        mat4Compose(wx, 0, wz, b.rotYDeg ?? 0, b.scale),
        [],
      );
    }
    this.ready = true;
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(2, Math.round(width * dpr));
    this.canvas.height = Math.max(2, Math.round(height * dpr));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private bindShapeUniforms(vp: Mat4, model: Mat4): void {
    const gl = this.gl;
    gl.uniformMatrix4fv(this.loc.uMvp, false, mat4Multiply(vp, model));
  }

  render(cam: FieldCamera, actors: ActorSprite[], timeMs: number): void {
    const gl = this.gl;
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    const proj = mat4Perspective(cam.fovDeg, aspect, 4, 2400);
    const eye = cameraPosition(cam);
    const view = mat4LookAt(eye, cam.target);
    const vp = mat4Multiply(proj, view);
    gl.clearColor(0.039, 0.102, 0.039, 1); // #0a1a0a, the 2D canvas clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.loc.uTex, 0);
    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aUv);

    const drawShapes = (wantWater: boolean) => {
      for (const model of this.models) {
        for (const shape of model.shapes) {
          if (shape.water !== wantWater) continue;
          this.bindShapeUniforms(vp, model.matrix);
          gl.bindBuffer(gl.ARRAY_BUFFER, shape.vbo);
          gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 20, 0);
          gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 20, 12);
          if (shape.tex) {
            gl.uniform1f(this.loc.uUseSolid, 0);
            gl.bindTexture(gl.TEXTURE_2D, shape.tex);
            gl.uniform2f(this.loc.uTexSize, shape.texW, shape.texH);
            gl.uniform2f(this.loc.uRepeat, shape.mat.repeatS || shape.mat.flipS ? 1 : 0,
              shape.mat.repeatT || shape.mat.flipT ? 1 : 0);
            gl.uniform2f(this.loc.uFlip, shape.mat.flipS ? 1 : 0, shape.mat.flipT ? 1 : 0);
            const scroll = shape.water ? (timeMs / 1000) * 6 : 0; // texels/sec
            gl.uniform2f(this.loc.uUvOffset, 0, scroll % shape.texH);
            gl.uniform1f(this.loc.uAlphaTest, shape.water ? 0 : 0.35);
            gl.uniform1f(this.loc.uOpacity, shape.water ? 0.92 : 1);
          } else {
            // Held texture missing from the bound set: flat mid-grey,
            // never a wrong texture. (Named cases are mapped in the
            // area data; this is only a safety net.)
            gl.uniform1f(this.loc.uUseSolid, 1);
            gl.uniform4f(this.loc.uSolid, 0.45, 0.45, 0.45, 1);
            gl.uniform1f(this.loc.uAlphaTest, 0);
            gl.uniform1f(this.loc.uOpacity, 1);
            gl.uniform2f(this.loc.uUvOffset, 0, 0);
          }
          gl.drawArrays(gl.TRIANGLES, 0, shape.count);
        }
      }
    };

    gl.depthMask(true);
    gl.disable(gl.BLEND);
    drawShapes(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    drawShapes(true);

    // Actor contact shadows (render-time, never baked): flat
    // ground-plane quads under each actor's feet.
    const right = { x: view[0], y: view[4], z: view[8] }; // camera right, world space (view row 0)
    this.bindShapeUniforms(vp, mat4Compose(0, 0, 0, 0, 1));
    gl.uniform1f(this.loc.uUseSolid, 0);
    gl.uniform1f(this.loc.uAlphaTest, 0);
    gl.uniform1f(this.loc.uOpacity, 1);
    gl.uniform2f(this.loc.uUvOffset, 0, 0);
    gl.uniform2f(this.loc.uRepeat, 0, 0);
    gl.uniform2f(this.loc.uFlip, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.uniform2f(this.loc.uTexSize, 1, 1);
    for (const a of actors) {
      const hw = a.w * 0.55;
      const y = a.feet.y + 0.12;
      const data = new Float32Array([
        a.feet.x - hw, y, a.feet.z - hw, 0, 0,
        a.feet.x + hw, y, a.feet.z - hw, 1, 0,
        a.feet.x + hw, y, a.feet.z + hw, 1, 1,
        a.feet.x - hw, y, a.feet.z - hw, 0, 0,
        a.feet.x + hw, y, a.feet.z + hw, 1, 1,
        a.feet.x - hw, y, a.feet.z + hw, 0, 1,
      ]);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynVbo);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 20, 0);
      gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 20, 12);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Actors, far to near (billboard quads standing on the ground).
    const sorted = [...actors].sort((p, q) => {
      const dp = (p.feet.x - eye.x) ** 2 + (p.feet.z - eye.z) ** 2;
      const dq = (q.feet.x - eye.x) ** 2 + (q.feet.z - eye.z) ** 2;
      return dq - dp;
    });
    gl.uniform1f(this.loc.uAlphaTest, 0.35);
    for (const a of sorted) {
      if (a.img) {
        gl.uniform1f(this.loc.uUseSolid, 0);
        gl.uniform1f(this.loc.uOpacity, 1);
        gl.bindTexture(gl.TEXTURE_2D, this.textureForImage(a.img));
        gl.uniform2f(this.loc.uTexSize, a.img.width, a.img.height);
        const c = a.crop ?? { x: 0, y: 0, w: a.img.width, h: a.img.height };
        // Billboard quad: vertical, bottom edge at the feet. The
        // shadow pass above drew its own ground quad per actor via
        // the same buffer; here the upright sprite.
        const hw = a.w / 2;
        const x0 = a.feet.x - right.x * hw, z0 = a.feet.z - right.z * hw;
        const x1 = a.feet.x + right.x * hw, z1 = a.feet.z + right.z * hw;
        const [u0, u1] = a.flipX ? [c.x + c.w, c.x] : [c.x, c.x + c.w];
        const data = new Float32Array([
          x0, a.feet.y, z0, u0, c.y + c.h, x1, a.feet.y, z1, u1, c.y + c.h,
          x1, a.feet.y + a.h, z1, u1, c.y,
          x0, a.feet.y, z0, u0, c.y + c.h, x1, a.feet.y + a.h, z1, u1, c.y,
          x0, a.feet.y + a.h, z0, u0, c.y,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dynVbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 20, 12);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        gl.uniform1f(this.loc.uUseSolid, 1);
        const col = a.color ?? '#888888';
        const r = parseInt(col.slice(1, 3), 16) / 255;
        const g = parseInt(col.slice(3, 5), 16) / 255;
        const b = parseInt(col.slice(5, 7), 16) / 255;
        gl.uniform4f(this.loc.uSolid, r, g, b, 1);
        const hw = a.w / 2;
        const x0 = a.feet.x - right.x * hw, z0 = a.feet.z - right.z * hw;
        const x1 = a.feet.x + right.x * hw, z1 = a.feet.z + right.z * hw;
        const data = new Float32Array([
          x0, a.feet.y, z0, 0, 0, x1, a.feet.y, z1, 0, 0, x1, a.feet.y + a.h, z1, 0, 0,
          x0, a.feet.y, z0, 0, 0, x1, a.feet.y + a.h, z1, 0, 0, x0, a.feet.y + a.h, z0, 0, 0,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dynVbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 20, 12);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }
    gl.depthMask(true);
  }
}
