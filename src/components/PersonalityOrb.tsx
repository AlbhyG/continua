'use client'

import { useEffect, useRef } from 'react'

// Color pairs arranged clockwise from 1:00 position
// Each axis: [positive color, negative color, angle in radians]
const AXES = [
  { pos: [1.0, 1.0, 0.0], neg: [0.2, 0.4, 1.0], angle: Math.PI / 6 },         // Yellow ↔ Blue
  { pos: [0.6, 0.9, 0.0], neg: [0.3, 0.0, 0.8], angle: (2 * Math.PI) / 6 },    // Chartreuse ↔ Indigo
  { pos: [0.3, 0.9, 0.0], neg: [0.6, 0.0, 0.9], angle: (3 * Math.PI) / 6 },    // Lime ↔ Violet
  { pos: [0.0, 0.7, 0.3], neg: [0.9, 0.0, 0.5], angle: (4 * Math.PI) / 6 },    // Emerald ↔ Magenta
  { pos: [0.0, 0.7, 0.7], neg: [0.9, 0.1, 0.1], angle: (5 * Math.PI) / 6 },    // Teal ↔ Red
  { pos: [0.0, 0.8, 0.9], neg: [1.0, 0.5, 0.0], angle: Math.PI },              // Aqua ↔ Orange
]

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_intensities[12]; // 6 axes × 2 poles

// Simplex-style noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian motion
float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= 2.02;
  f += 0.2500 * snoise(p); p *= 2.03;
  f += 0.1250 * snoise(p); p *= 2.01;
  f += 0.0625 * snoise(p);
  return f / 0.9375;
}

// Domain warping for organic swirls
vec2 warp(vec2 p) {
  float fx = fbm(p + vec2(1.7, 9.2));
  float fy = fbm(p + vec2(8.3, 2.8));
  return p + vec2(fx, fy) * 1.2;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  float dist = length(uv);

  // Discard outside circle
  if (dist > 0.48) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
    return;
  }

  // Warped coordinates for organic flow
  vec2 wp = warp(uv * 3.0);
  vec2 wp2 = warp(uv * 2.0 + vec2(5.0, 3.0));

  float angle = atan(uv.y, uv.x);

  // Axis angles and colors
  float axes[6];
  axes[0] = 0.5236;  // π/6 = 30°
  axes[1] = 1.0472;  // 2π/6 = 60°
  axes[2] = 1.5708;  // 3π/6 = 90°
  axes[3] = 2.0944;  // 4π/6 = 120°
  axes[4] = 2.6180;  // 5π/6 = 150°
  axes[5] = 3.1416;  // π = 180°

  // Positive pole colors
  vec3 posColors[6];
  posColors[0] = vec3(1.0, 1.0, 0.0);   // Yellow
  posColors[1] = vec3(0.6, 0.9, 0.0);   // Chartreuse
  posColors[2] = vec3(0.3, 0.9, 0.0);   // Lime
  posColors[3] = vec3(0.0, 0.75, 0.3);  // Emerald
  posColors[4] = vec3(0.0, 0.7, 0.7);   // Teal
  posColors[5] = vec3(0.0, 0.85, 0.95); // Aqua

  // Negative pole colors
  vec3 negColors[6];
  negColors[0] = vec3(0.15, 0.3, 1.0);  // Blue
  negColors[1] = vec3(0.3, 0.0, 0.7);   // Indigo
  negColors[2] = vec3(0.6, 0.0, 0.85);  // Violet
  negColors[3] = vec3(0.9, 0.0, 0.5);   // Magenta
  negColors[4] = vec3(0.95, 0.1, 0.1);  // Red
  negColors[5] = vec3(1.0, 0.5, 0.0);   // Orange

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;

  for (int i = 0; i < 6; i++) {
    float axAngle = axes[i];

    // Positive pole
    float posIntensity = max(u_intensities[i * 2], 0.0) / 10.0;
    float posAngleDiff = acos(clamp(cos(angle - axAngle), -1.0, 1.0));

    // Noise-based organic shape
    float posNoise = fbm(wp + vec2(cos(axAngle), sin(axAngle)) * 2.0) * 0.5 + 0.5;
    float posNoise2 = fbm(wp2 + vec2(cos(axAngle), sin(axAngle)) * 1.5) * 0.5 + 0.5;

    // Weight: angular proximity × intensity × noise × distance falloff
    float posSpread = 0.3 + posIntensity * 0.7; // how far the color spreads angularly
    float posAngularWeight = smoothstep(3.14159, 0.0, posAngleDiff / posSpread);

    // Strong intensities cross the center and reach far
    float posReach = 0.1 + posIntensity * 0.45;
    float posDistWeight = smoothstep(posReach + 0.2, 0.0, dist * (1.0 - posIntensity * 0.5));

    float posWeight = posAngularWeight * posDistWeight * posIntensity * (0.5 + posNoise * 0.8) * (0.7 + posNoise2 * 0.5);

    color += posColors[i] * posWeight;
    totalWeight += posWeight;

    // Negative pole (opposite side)
    float negIntensity = max(u_intensities[i * 2 + 1], 0.0) / 10.0;
    float negAngle = axAngle + 3.14159;
    float negAngleDiff = acos(clamp(cos(angle - negAngle), -1.0, 1.0));

    float negNoise = fbm(wp + vec2(cos(negAngle), sin(negAngle)) * 2.0) * 0.5 + 0.5;
    float negNoise2 = fbm(wp2 + vec2(cos(negAngle), sin(negAngle)) * 1.5) * 0.5 + 0.5;

    float negSpread = 0.3 + negIntensity * 0.7;
    float negAngularWeight = smoothstep(3.14159, 0.0, negAngleDiff / negSpread);
    float negReach = 0.1 + negIntensity * 0.45;
    float negDistWeight = smoothstep(negReach + 0.2, 0.0, dist * (1.0 - negIntensity * 0.5));

    float negWeight = negAngularWeight * negDistWeight * negIntensity * (0.5 + negNoise * 0.8) * (0.7 + negNoise2 * 0.5);

    color += negColors[i] * negWeight;
    totalWeight += negWeight;
  }

  if (totalWeight > 0.0) {
    color /= totalWeight;
  }

  // Add luminosity / glow
  float glow = fbm(wp * 1.5) * 0.3 + 0.7;
  color *= glow;

  // Brighten
  color = pow(color, vec3(0.75));

  // Add subtle bright tendrils
  float tendrils = fbm(warp(uv * 5.0)) * 0.5 + 0.5;
  color += tendrils * 0.12;

  // Sphere shading - subtle 3D effect
  float sphere = 1.0 - dist * 1.2;
  sphere = pow(max(sphere, 0.0), 0.4);
  color *= sphere;

  // Edge softness
  float edgeAlpha = smoothstep(0.48, 0.44, dist);

  // Slight specular highlight
  vec2 lightDir = vec2(-0.2, 0.3);
  float spec = max(dot(normalize(uv), lightDir), 0.0);
  spec = pow(spec, 8.0) * 0.15;
  color += spec;

  gl_FragColor = vec4(color, edgeAlpha);
}
`

export interface OrbData {
  yellow: number
  blue: number
  chartreuse: number
  indigo: number
  lime: number
  violet: number
  emerald: number
  magenta: number
  teal: number
  red: number
  aqua: number
  orange: number
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
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // Compile shaders
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

    // Full-screen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Set uniforms
    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(resLoc, canvas.width, canvas.height)

    // Map data to the 12 intensity uniform slots
    // Order: yellow, blue, chartreuse, indigo, lime, violet, emerald, magenta, teal, red, aqua, orange
    const intensities = [
      data.yellow, data.blue,
      data.chartreuse, data.indigo,
      data.lime, data.violet,
      data.emerald, data.magenta,
      data.teal, data.red,
      data.aqua, data.orange,
    ]

    for (let i = 0; i < 12; i++) {
      const loc = gl.getUniformLocation(program, `u_intensities[${i}]`)
      gl.uniform1f(loc, intensities[i])
    }

    // Render
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Cleanup
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
