"use client";
import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
uniform vec2 resolution;uniform float time;uniform float aspect;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
 const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
 vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
 vec2 i1=x0.x>x0.y?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
 i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
 vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
 vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
 m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
 vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);
}
void main(){vec2 uv=gl_FragCoord.xy/resolution;vec2 p=uv*vec2(aspect,1.);
 float t=time*.028;float n=snoise(p*1.3+vec2(t,-t*.6));
 float clouds=smoothstep(-.5,.85,snoise(p*1.8+vec2(n*.5,t*.5)));
 float vignette=1.-smoothstep(.25,1.,distance(uv,vec2(.66,.56)));
 vec3 base=vec3(.012,.023,.025);vec3 teal=vec3(.025,.14,.125);vec3 slate=vec3(.045,.075,.095);
 vec3 col=mix(base,mix(slate,teal,clouds),clouds*vignette*.7);
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
 gl_FragColor=vec4(col+grain*.008,1.);
}`;

/** Local Velaris-style simplex field. Static CSS fallback when WebGL is absent or motion is reduced. */
export default function Velaris() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const screenWidth = window.screen.width || window.innerWidth;
    const screenHeight = window.screen.height || window.innerHeight;
    const layer = el.parentElement;
    if (layer) {
      layer.style.width = `${screenWidth}px`;
      layer.style.height = `${screenHeight}px`;
    }
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const gl = el.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    // Allocate once. Resizing a WebGL drawing buffer clears it; CSS resizing must never do that.
    el.width = Math.min(1200, Math.max(480, Math.round(window.innerWidth)));
    el.height = 800;
    gl.viewport(0, 0, el.width, el.height);
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const res = gl.getUniformLocation(program, "resolution"),
      time = gl.getUniformLocation(program, "time"),
      aspect = gl.getUniformLocation(program, "aspect");
    let frame = 0,
      last = 0,
      visible = true,
      elapsed = 0;
    let aspectValue = 1;
    const paint = () => {
      gl.uniform2f(res, el.width, el.height);
      gl.uniform1f(time, elapsed);
      gl.uniform1f(aspect, aspectValue);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const resize = () => {
      aspectValue = screenWidth / Math.max(1, screenHeight);
      // Only update projection and redraw synchronously; keep the last gradient visible throughout.
      if (!motion.matches && visible && !document.hidden) paint();
    };
    const draw = (now: number) => {
      if (
        !motion.matches &&
        visible &&
        !document.hidden &&
        now - last >= 1000 / 24
      ) {
        elapsed += Math.min(now - last, 60) / 1000;
        last = now;
        paint();
      }
      frame = requestAnimationFrame(draw);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      if (!motion.matches) {
        paint();
        el.style.opacity = "1";
        last = performance.now();
        frame = requestAnimationFrame(draw);
      } else el.style.opacity = "0";
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    });
    intersection.observe(el);
    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frame);
      el.style.opacity = "0";
    };
    el.addEventListener("webglcontextlost", lost);
    motion.addEventListener("change", update);
    resize();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", update);
      el.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);
  return (
    <div className="home-ambient" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
