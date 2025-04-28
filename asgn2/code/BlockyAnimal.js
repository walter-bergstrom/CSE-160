// BlockyAnimal.js  (same geometry - now with mouse rotation)

/* ========== GLSL ========== */
const VSHADER_SRC = `
attribute vec4 a_Position;
uniform   mat4 u_ModelMatrix;
uniform   mat4 u_GlobalMatrix;
void main(){
  gl_Position = u_GlobalMatrix * u_ModelMatrix * a_Position;
}`;
const FSHADER_SRC = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){ gl_FragColor = u_FragColor; }`;

/* ========== globals ========== */
let canvas, gl, a_Position, u_ModelMatrix, u_GlobalMatrix, u_FragColor;

let g_angleX = -25, g_angleY = 15;           // scene rotation
let g_shoulder = 0;                          // front-right leg
let g_tailManual = 0, g_animOn = false;

let g_time = 0, g_last = performance.now(), g_tailAuto = 0;
let fpsAvg = 0;

/* palette */
const FUR=[0.8,0.6,0.4,1], DARK=[0.55,0.4,0.2,1],
      SNOUT=[0.9,0.7,0.5,1], NOSE=[0.05,0.05,0.05,1];

/* ========== WebGL init ========== */
function setupWebGL(){
  canvas=document.getElementById('webgl');
  gl=canvas.getContext('webgl',{preserveDrawingBuffer:true});
  if(!gl){ alert('WebGL unavailable'); return; }
  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0,0,canvas.width,canvas.height);
}
function connectGL(){
  if(!initShaders(gl,VSHADER_SRC,FSHADER_SRC)){ alert('shader init failed'); return; }
  a_Position   = gl.getAttribLocation(gl.program,'a_Position');
  u_ModelMatrix= gl.getUniformLocation(gl.program,'u_ModelMatrix');
  u_GlobalMatrix=gl.getUniformLocation(gl.program,'u_GlobalMatrix');
  u_FragColor  = gl.getUniformLocation(gl.program,'u_FragColor');
}
function setColor(c){ gl.uniform4f(u_FragColor,...c); }

/* ========== Cube VBO (unchanged) ========== */
let cubeBuf=null;
function bindCube(){
  if(!cubeBuf){
    cubeBuf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,cubeBuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
      0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0,
      0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0,
      0,0,0, 1,0,0, 1,0,1,  0,0,0, 1,0,1, 0,0,1,
      0,0,0, 0,1,0, 0,1,1,  0,0,0, 0,1,1, 0,0,1,
      1,0,0, 1,1,0, 1,1,1,  1,0,0, 1,1,1, 1,0,1,
      0,0,1, 1,0,1, 1,1,1,  0,0,1, 1,1,1, 0,1,1
    ]),gl.STATIC_DRAW);
  }else gl.bindBuffer(gl.ARRAY_BUFFER,cubeBuf);
  gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_Position);
}
function drawCube(M,col){
  bindCube(); gl.uniformMatrix4fv(u_ModelMatrix,false,M.elements);
  const shade=[1,0.9,0.75,0.9,0.6,0.45];
  for(let f=0;f<6;f++){
    setColor([col[0]*shade[f], col[1]*shade[f], col[2]*shade[f],1]);
    gl.drawArrays(gl.TRIANGLES,f*6,6);
  }
}

/* ========== cone helper (unchanged) ========== */
function tri(v){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_Position); gl.drawArrays(gl.TRIANGLES,0,3);}
function drawCone(M,col,seg=16){
  gl.uniformMatrix4fv(u_ModelMatrix,false,M.elements);
  const step=2*Math.PI/seg;
  for(let a=0;a<2*Math.PI;a+=step){
    const p1=[Math.cos(a),Math.sin(a),0], p2=[Math.cos(a+step),Math.sin(a+step),0];
    setColor(col.map((c,i)=>i<3?c*0.7:c)); tri([0,0,0,...p1,...p2]);
    setColor(col); tri([0,0,1,...p1,...p2]);
  }
}

/* ========== renderScene ========== */
function renderScene(){
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const global=new Matrix4().rotate(g_angleX,0,1,0).rotate(g_angleY,1,0,0);
  gl.uniformMatrix4fv(u_GlobalMatrix,false,global.elements);

  const body=new Matrix4().translate(0,-0.2,0);
  drawCube(new Matrix4(body).scale(0.8,0.4,0.5),FUR);

  const head=new Matrix4(body).translate(0.7,0.35,0.1).scale(0.35,0.35,0.35);
  drawCube(head,FUR);
  drawCube(new Matrix4(head).translate(0.8,0.2,0.3).scale(0.5,0.3,0.4),SNOUT);
  drawCube(new Matrix4(head).translate(1,0.3,0.4).scale(0.08,0.08,0.08),NOSE);
  [[0,1,0.8],[0,1,0.1]].forEach(p=> drawCone(new Matrix4(head).translate(...p).rotate(-90,1,0,0).scale(0.1,0.1,0.25),DARK,18));

  drawCone(new Matrix4(body).translate(0,0.2,0.2).rotate(g_tailManual+g_tailAuto,0,0,1).rotate(-90,0,1,0).scale(0.1,0.1,0.5),DARK,18);

  [[0.6,-0.1],[0.01,-0.1],[0.6,0.4],[0.01,0.4]].forEach(([dx,dz],i)=>{
    const leg=new Matrix4(body).translate(dx,-0.35,dz);
    if(i===0) leg.rotate(g_shoulder,1,0,0);
    drawCube(new Matrix4(leg).scale(0.18,0.5,0.18),DARK);
  });
}

/* ========== UI & mouse rotation + shift-click tail ========== */
function $(id){return document.getElementById(id);}
function initUI(){
  $('angleX').oninput = e=> g_angleX      = +e.target.value;
  $('angleY').oninput = e=> g_angleY      = +e.target.value;
  $('shoulder').oninput = e=> g_shoulder  = +e.target.value;
  $('tail').oninput     = e=> g_tailManual= +e.target.value;
  $('animOn').onclick   = ()=> g_animOn = true;
  $('animOff').onclick  = ()=> g_animOn = false;

  /* --- mouse drag rotation --- */
  let dragging=false, lastX=0, lastY=0, SENS=0.3;
  canvas.onmousedown = e=>{
    if(e.shiftKey){         // shift-click: random tail angle
      const angle = (Math.random()*120)-60;   // -60…+60
      g_tailManual = angle;
      $('tail').value = angle.toFixed(0);     // sync slider
      return;                                 // don’t start drag
    }
    dragging=true; lastX=e.clientX; lastY=e.clientY;
  };
  canvas.onmousemove = e=>{
    if(!dragging) return;
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    g_angleX += dx*SENS; g_angleY += dy*SENS;
    lastX=e.clientX; lastY=e.clientY;
  };
  window.onmouseup = ()=> dragging=false;
}

/* ========== loop ========== */
function tick(){
  const now=performance.now(), dt=(now-g_last)/1000; g_last=now;
  if(g_animOn) g_tailAuto=60*Math.sin((g_time+=dt)*2*Math.PI);
  renderScene();
  fpsAvg=fpsAvg?fpsAvg*0.9+0.1*(1/dt):1/dt;
  $('perf').textContent='fps '+fpsAvg.toFixed(1);
  requestAnimationFrame(tick);
}

/* ========== main ========== */
function main(){
  setupWebGL(); connectGL(); initUI(); bindCube();
  renderScene(); requestAnimationFrame(tick);
}
