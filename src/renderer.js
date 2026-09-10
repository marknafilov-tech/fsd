import {mat4Multiply,mat4TRS} from './math.js';

const VS=`#version 300 es
in vec3 aPos; in vec3 aNormal;
uniform mat4 uMVP; uniform mat4 uModel; out vec3 vN; out vec3 vW;
void main(){vec4 w=uModel*vec4(aPos,1.0);vW=w.xyz;vN=mat3(uModel)*aNormal;gl_Position=uMVP*vec4(aPos,1.0);}`;
const FS=`#version 300 es
precision highp float; in vec3 vN; in vec3 vW;
uniform vec4 uColor; uniform vec3 uSun; uniform vec3 uCam; uniform float uFogNear; uniform float uFogFar;
out vec4 outColor;
void main(){vec3 n=normalize(vN);float d=max(dot(n,normalize(uSun)),0.0);float light=.34+d*.66;vec3 c=uColor.rgb*light;float dist=distance(vW,uCam);float fog=clamp((dist-uFogNear)/(uFogFar-uFogNear),0.0,1.0);c=mix(c,vec3(.50,.68,.82),fog);outColor=vec4(c,uColor.a);}`;

function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
function makeProgram(gl){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
function cubeData(){
  const p=[],n=[]; const faces=[[[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]];
  for(const [nn,a,b,c,d] of faces){for(const q of [a,b,c,a,c,d]){p.push(q[0],q[1],q[2]);n.push(...nn)}} return {p:new Float32Array(p),n:new Float32Array(n)};
}
function sphereData(rings=12,segs=20){const p=[],n=[];for(let y=0;y<rings;y++){const v0=y/rings,v1=(y+1)/rings,th0=v0*Math.PI,th1=v1*Math.PI;for(let x=0;x<segs;x++){const u0=x/segs,u1=(x+1)/segs;const pts=[[u0,th0],[u1,th0],[u1,th1],[u0,th1]];for(const uv of [[pts[0],pts[1],pts[2]],[pts[0],pts[2],pts[3]]])for(const [u,t] of uv){const q=[Math.cos(u*2*Math.PI)*Math.sin(t),Math.cos(t),Math.sin(u*2*Math.PI)*Math.sin(t)];p.push(q[0],q[1],q[2]);n.push(...q)}}}return {p:new Float32Array(p),n:new Float32Array(n)};}
function cylinderData(segments=20){const p=[],n=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;const vs=[[Math.cos(a),-1,Math.sin(a)],[Math.cos(b),-1,Math.sin(b)],[Math.cos(b),1,Math.sin(b)],[Math.cos(a),1,Math.sin(a)]];for(const tri of [[vs[0],vs[1],vs[2]],[vs[0],vs[2],vs[3]]])for(const q of tri){p.push(...q);n.push(q[0],0,q[2])}}return {p:new Float32Array(p),n:new Float32Array(n)};}

export class Renderer{
  constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!this.gl)throw new Error('WebGL2 is not available');this.program=makeProgram(this.gl);this.aPos=this.gl.getAttribLocation(this.program,'aPos');this.aNormal=this.gl.getAttribLocation(this.program,'aNormal');for(const u of ['uMVP','uModel','uColor','uSun','uCam','uFogNear','uFogFar'])this[u]=this.gl.getUniformLocation(this.program,u);this.meshes={cube:this.makeMesh(cubeData()),sphere:this.makeMesh(sphereData()),cylinder:this.makeMesh(cylinderData())};this.resize();this.gl.enable(this.gl.DEPTH_TEST);this.gl.enable(this.gl.CULL_FACE);}
  makeMesh(data){const gl=this.gl;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const bp=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bp);gl.bufferData(gl.ARRAY_BUFFER,data.p,gl.STATIC_DRAW);gl.enableVertexAttribArray(this.aPos);gl.vertexAttribPointer(this.aPos,3,gl.FLOAT,false,0,0);const bn=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bn);gl.bufferData(gl.ARRAY_BUFFER,data.n,gl.STATIC_DRAW);gl.enableVertexAttribArray(this.aNormal);gl.vertexAttribPointer(this.aNormal,3,gl.FLOAT,false,0,0);gl.bindVertexArray(null);return {vao,count:data.p.length/3};}
  resize(){const d=devicePixelRatio||1;this.canvas.width=Math.max(1,Math.floor(innerWidth*d));this.canvas.height=Math.max(1,Math.floor(innerHeight*d));this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.onResize?.();}
  drawObject(obj, camera, highlight=false){const gl=this.gl,mesh=this.meshes[obj.shape||'cube'];gl.useProgram(this.program);const pv=mat4Multiply(camera.proj,camera.view),model=mat4TRS(obj.position,obj.rotation,obj.scale);gl.uniformMatrix4fv(this.uMVP,false,new Float32Array(mat4Multiply(pv,model)));gl.uniformMatrix4fv(this.uModel,false,new Float32Array(model));const c=hex(obj.color||'#ffffff');if(highlight)gl.uniform4f(this.uColor,c[0]*1.2,c[1]*1.2,c[2]*1.2,1);else gl.uniform4f(this.uColor,c[0],c[1],c[2],1);gl.uniform3f(this.uSun,-.45,.9,.35);gl.uniform3f(this.uCam,...camera.pos);gl.uniform1f(this.uFogNear,55);gl.uniform1f(this.uFogFar,150);gl.bindVertexArray(mesh.vao);gl.drawArrays(gl.TRIANGLES,0,mesh.count);gl.bindVertexArray(null);}
  begin(sky=[.48,.67,.82,1]){const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(...sky);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}
}
function hex(h){const x=parseInt(h.replace('#',''),16);return [((x>>16)&255)/255,((x>>8)&255)/255,(x&255)/255]}
