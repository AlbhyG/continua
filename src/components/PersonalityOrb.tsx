'use client'

import { useEffect, useRef } from 'react'

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_intensities[12];
uniform float u_seed;

// 3D simplex noise for smooth, non-repeating patterns
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - 0.5;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec4 j = p - 49.0 * floor(p * (1.0/49.0));
  vec4 x_ = floor(j * (1.0/7.0));
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * (2.0/7.0) + 0.5/7.0 - 1.0;
  vec4 y = y_ * (2.0/7.0) + 0.5/7.0 - 1.0;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Seeded 2D noise via 3D simplex — very smooth
float sn(vec2 p) {
  return snoise(vec3(p, u_seed * 0.7));
}

// Low-frequency fbm — only 2 octaves for big smooth shapes
float fbm(vec2 p) {
  return 0.65 * sn(p) + 0.35 * sn(p * 1.8 + 4.3);
}

// Deep domain warp: 3 passes for smooth, large-scale flowing distortion
vec2 warp(vec2 p) {
  vec2 s = vec2(u_seed * 5.7, u_seed * 2.3);
  vec2 q = vec2(fbm(p + s), fbm(p + s + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 2.5 * q + s + vec2(1.7, 9.2)),
                fbm(p + 2.5 * q + s + vec2(8.3, 2.8)));
  vec2 t = vec2(fbm(p + 2.5 * r + s + vec2(13.1, 4.7)),
                fbm(p + 2.5 * r + s + vec2(7.9, 15.3)));
  return p + 2.0 * t;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float dist = length(uv);

  if (dist > 0.49) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // Pole angles
  float poleAngles[12];
  poleAngles[0]  = 0.5236;  poleAngles[1]  = 3.6652;
  poleAngles[2]  = 1.0472;  poleAngles[3]  = 4.1888;
  poleAngles[4]  = 1.5708;  poleAngles[5]  = 4.7124;
  poleAngles[6]  = 2.0944;  poleAngles[7]  = 5.2360;
  poleAngles[8]  = 2.6180;  poleAngles[9]  = 5.7596;
  poleAngles[10] = 3.1416;  poleAngles[11] = 0.0;

  // Vivid pole colors — matched to diagram positions
  vec3 poleColors[12];
  poleColors[0]  = vec3(0.13, 0.55, 0.13);  // Dark Green (Hyper-Socially Attuned)
  poleColors[1]  = vec3(0.6, 0.05, 1.0);    // Violet (Hypo-Socially Attuned)
  poleColors[2]  = vec3(0.5, 1.0, 0.05);    // Chartreuse (Altruistic)
  poleColors[3]  = vec3(0.22, 0.0, 0.65);   // Indigo (Narcissistic)
  poleColors[4]  = vec3(1.0, 0.92, 0.15);   // Yellow (High Empathy)
  poleColors[5]  = vec3(0.1, 0.1, 0.45);    // Navy (Low Empathy)
  poleColors[6]  = vec3(1.0, 0.5, 0.0);     // Orange (Low Reactivity)
  poleColors[7]  = vec3(0.15, 0.35, 1.0);   // Blue (High Reactivity)
  poleColors[8]  = vec3(1.0, 0.12, 0.12);   // Red (Submissive)
  poleColors[9]  = vec3(0.0, 0.78, 0.78);   // Teal (Dominant)
  poleColors[10] = vec3(0.7, 0.06, 0.3);    // Dark Crimson (Impulsive)
  poleColors[11] = vec3(0.0, 0.55, 0.3);    // Dark Emerald (Conscientious)

  // Off-center core
  vec2 corePos = vec2(0.0);
  float totalI = 0.0;
  for (int i = 0; i < 12; i++) {
    float inten = u_intensities[i] / 10.0;
    corePos += vec2(cos(poleAngles[i]), sin(poleAngles[i])) * inten * inten;
    totalI += inten;
  }
  if (totalI > 0.0) corePos /= totalI;
  corePos *= 0.1;
  float coreDist = length(uv - corePos);

  // === Warp the position for swirly color boundaries ===
  // Very low input frequency = very big swirls
  vec2 wp = warp(uv * 0.35);

  // Blend real position with warped position
  // This makes the color regions swirl instead of sitting in angular wedges
  vec2 blendPos = mix(uv, wp * 0.2, 0.5);
  float blendLen = length(blendPos);
  vec2 blendDir = (blendLen > 0.001) ? blendPos / blendLen : vec2(1.0, 0.0);

  // === Color field via dot product (no atan, no seam) ===
  vec3 color = vec3(0.0);
  float totalW = 0.0;

  for (int i = 0; i < 12; i++) {
    float intensity = u_intensities[i] / 10.0;
    if (intensity < 0.05) continue;

    vec2 poleDir = vec2(cos(poleAngles[i]), sin(poleAngles[i]));

    // Angular proximity via dot product
    float cosAng = dot(blendDir, poleDir);
    float angProx = cosAng * 0.5 + 0.5; // 0..1

    float spread = 0.12 + intensity * 0.38;
    float angW = smoothstep(0.5 - spread, 0.5 + spread, angProx);

    // Strong poles reach across the whole orb
    float reach = 0.15 + intensity * 0.45;
    float radW = smoothstep(reach + 0.2, 0.0, dist * (1.0 - intensity * 0.5));

    float w = angW * radW * intensity * intensity;
    color += poleColors[i] * w;
    totalW += w;
  }

  if (totalW > 0.0) color /= totalW;

  // Boost saturation
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(lum), color, 1.7);
  color = max(color, 0.0);

  // === Soft luminous glow variation (big smooth shapes) ===
  float glow = fbm(wp * 0.3) * 0.5 + 0.5;
  glow = smoothstep(0.3, 0.7, glow);
  color += color * glow * 0.35;

  // === White-hot core ===
  float coreGlow = exp(-coreDist * coreDist * 22.0);
  float coreShape = fbm(warp(uv * 0.4 + vec2(u_seed * 3.0))) * 0.5 + 0.5;
  coreGlow *= (0.5 + coreShape * 0.6);
  color = mix(color, vec3(1.0), coreGlow * 0.8);

  // Broader warm inner glow
  float innerGlow = exp(-coreDist * coreDist * 6.0);
  color = mix(color, color + 0.25, innerGlow * 0.4);

  // === Soft flowing bright streams ===
  // Very low frequency warped gaussian bands
  for (int j = 0; j < 3; j++) {
    float offset = float(j) * 13.0;
    vec2 streamWarp = warp(uv * (0.2 + float(j) * 0.06) + vec2(offset));
    float stream = fbm(streamWarp * 0.5);
    stream = exp(-stream * stream * 5.0);  // soft gaussian band
    float fade = exp(-coreDist * coreDist * 4.0) * 0.5 + 0.15;
    color += color * stream * fade * 0.3;
    color += stream * fade * 0.06;
  }

  // Tone map
  color = 1.0 - exp(-color * 1.5);

  // Sphere shading
  float sphere = 1.0 - dist * 0.9;
  color *= pow(max(sphere, 0.0), 0.22);

  // Soft specular
  float spec = pow(max(dot(normalize(uv), normalize(vec2(-0.2, 0.3))), 0.0), 16.0);
  color += spec * 0.1;

  // Smooth edge
  float edgeAlpha = smoothstep(0.49, 0.43, dist);

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, edgeAlpha);
}
`

export interface OrbData {
  lime: number
  violet: number
  chartreuse: number
  indigo: number
  yellow: number
  navy: number
  orange: number
  blue: number
  red: number
  teal: number
  magenta: number
  emerald: number
}

interface PersonalityOrbProps {
  data: OrbData
  size?: number
  className?: string
}

export default function PersonalityOrb({ data, size = 400, className = '' }: PersonalityOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
    if (!gl) return

    function compileShader(gl: WebGLRenderingContext, source: string, type: number) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER)
    const fs = compileShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height)

    const intensities = [
      data.lime, data.violet, data.chartreuse, data.indigo,
      data.yellow, data.navy, data.orange, data.blue,
      data.red, data.teal, data.magenta, data.emerald,
    ]
    for (let i = 0; i < 12; i++) {
      gl.uniform1f(gl.getUniformLocation(program, `u_intensities[${i}]`), intensities[i])
    }

    const seed = intensities.reduce((acc, v, i) => acc + v * (i + 1) * 0.37, 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_seed'), seed)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [data, size])

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
