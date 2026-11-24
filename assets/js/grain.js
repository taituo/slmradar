// slmradar grain gradient — dependency-free WebGL.
// Every <canvas class="grain"> gets its own random, calm palette and shape.
// Click a canvas to reroll. Respects prefers-reduced-motion (renders one still frame).
(function () {
  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uSeed;
uniform vec3 uC0,uC1,uC2,uC3,uBack; uniform int uShape;
uniform float uSoft,uIntensity,uNoise,uScale;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vnoise(p);p=p*2.03+17.1;a*=.5;}return v;}

// Smooth 4-stop ramp; uSoft widens each blend.
vec3 ramp(float t){
  t=clamp(t,0.,.999)*3.;
  float i=floor(t);
  float s=mix(.18,.5,uSoft);
  float f=smoothstep(.5-s,.5+s,fract(t));
  vec3 a=i<1.?uC0:(i<2.?uC1:uC2);
  vec3 b=i<1.?uC1:(i<2.?uC2:uC3);
  return mix(a,b,f);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y)*uScale;
  float t=uTime*.03;
  vec2 w=vec2(fbm(p*.7+uSeed+t),fbm(p*.7-uSeed*.7-t))-.5;
  vec2 q=p+w*uIntensity*1.2;
  float v;
  if(uShape==0){ v=.5+.5*sin(q.y*2.2+q.x*.6+fbm(q*.8+t)*2.5+t*2.); }      // wave
  else if(uShape==1){ v=1.-length(q-vec2(sin(t*.7),cos(t*.5))*.35)*.75; } // blob
  else if(uShape==2){ v=.5+.5*sin(length(q*vec2(.6,1.))*2.6-t*3.+fbm(q)*2.5); }         // ripple
  else { v=smoothstep(.2,.8,fbm(q*.9+t)); }                                // mist
  vec3 col=ramp(v);
  col=mix(uBack,col,smoothstep(-.1,.45,v)*.8+.2);
  float g=hash(gl_FragCoord.xy+fract(uTime)*91.7)-.5;
  col+=g*uNoise*.16;
  col*=1.-.25*length(uv-.5);                                                 // soft vignette
  gl_FragColor=vec4(col,1.);
}`;

  const rnd = (a, b) => a + Math.random() * (b - a);
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    const f = n => { const k = (n + h * 12) % 12; const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); };
    return [f(0), f(8), f(4)];
  }
  // Calm palette: analogous hues, muted saturation, gentle lightness steps.
  function palette() {
    const h = rnd(0, 360), spread = rnd(25, 70), dir = Math.random() < .5 ? -1 : 1;
    const sat = rnd(25, 45);
    return {
      back: hsl(h + dir * spread * 1.5, sat * .6, rnd(8, 14)),
      c: [0, 1, 2, 3].map(i => hsl(h + dir * spread * (i / 3), sat + rnd(-6, 6), 26 + i * rnd(11, 15)))
    };
  }

  function mount(cv) {
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) { cv.style.background = 'linear-gradient(120deg,#2a3340,#4b5b63)'; return; }
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('grain shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function reroll() {
      const pal = palette();
      gl.uniform3fv(U('uBack'), pal.back);
      ['uC0', 'uC1', 'uC2', 'uC3'].forEach((n, i) => gl.uniform3fv(U(n), pal.c[i]));
      gl.uniform1i(U('uShape'), Math.floor(rnd(0, 4)));
      gl.uniform1f(U('uSeed'), rnd(0, 100));
      gl.uniform1f(U('uSoft'), rnd(.7, 1));
      gl.uniform1f(U('uIntensity'), rnd(.3, .65));
      gl.uniform1f(U('uNoise'), rnd(.35, .7));
      gl.uniform1f(U('uScale'), rnd(.8, 1.3));
    }
    reroll();
    const again = () => { reroll(); if (still) draw(0); };
    cv.addEventListener('click', again);
    document.addEventListener('slm-reroll', again);
    cv.title = 'Click for a new palette';

    const t0 = rnd(0, 1e5);
    let visible = true;
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(cv);

    function draw(now) {
      const dpr = cv.dataset.res ? parseFloat(cv.dataset.res) : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U('uRes'), w, h);
      gl.uniform1f(U('uTime'), (t0 + now) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (still) { draw(0); window.addEventListener('resize', () => draw(0)); return; }
    (function loop(now) { if (visible) draw(now); requestAnimationFrame(loop); })(0);
  }

  const init = () => document.querySelectorAll('canvas.grain').forEach(mount);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
