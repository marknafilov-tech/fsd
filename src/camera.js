import {V3,mat4Perspective,mat4LookAt} from './math.js';

export class Camera {
  constructor(canvas){
    this.canvas=canvas;
    this.mode='editor';
    this.pos=[22,18,28];
    this.target=[0,0,0];
    this.yaw=0.72;
    this.pitch=-0.5;
    this.distance=32;
    this.fov=65*Math.PI/180;
    this.near=0.05;
    this.far=300;
    this.aspect=1;
  }

  resize(){
    this.aspect=Math.max(1e-6,this.canvas.width/Math.max(1,this.canvas.height));
  }

  editorFree(dt,controls,mouse){
    // RMB controls orbit; WASD/EQ always move in the current camera basis.
    if(mouse.buttons.has(2)){
      this.yaw-=mouse.dx*0.0025;
      this.pitch=Math.max(-1.45,Math.min(1.45,this.pitch-mouse.dy*0.002));
    }

    const forward=[Math.sin(this.yaw),0,Math.cos(this.yaw)];
    const right=[Math.cos(this.yaw),0,-Math.sin(this.yaw)];
    let d=[0,0,0];
    if(controls.down('KeyW')) d=V3.add(d,forward);
    if(controls.down('KeyS')) d=V3.sub(d,forward);
    if(controls.down('KeyD')) d=V3.add(d,right);
    if(controls.down('KeyA')) d=V3.sub(d,right);
    if(controls.down('KeyE')) d[1]+=1;
    if(controls.down('KeyQ')) d[1]-=1;
    if(V3.len(d)>0) d=V3.norm(d);
    const speed=(controls.down('ShiftLeft')||controls.down('ShiftRight'))?24:12;
    this.pos=V3.add(this.pos,V3.mul(d,speed*dt));

    const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
    const look=[Math.sin(this.yaw)*cp,sp,Math.cos(this.yaw)*cp];
    this.target=V3.add(this.pos,look);
    if(mouse.wheel) this.distance=Math.max(4,Math.min(140,this.distance+mouse.wheel*1.5));
  }

  playFollow(player,dt,mouse){
    this.yaw-=mouse.dx*0.0025;
    this.pitch=Math.max(-1.15,Math.min(0.5,this.pitch-mouse.dy*0.002));
    if(mouse.wheel) this.distance=Math.max(4,Math.min(18,this.distance+mouse.wheel*0.7));

    const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
    // dir points from the player toward the camera; camera looks along -dir.
    const dir=[Math.sin(this.yaw)*cp,sp,Math.cos(this.yaw)*cp];
    const desired=V3.add(player.position,V3.mul(dir,this.distance));
    desired[1]+=2.5;
    this.pos=this.pos.map((v,i)=>v+(desired[i]-v)*Math.min(1,dt*10));
    this.target=[player.position[0],player.position[1]+1.6,player.position[2]];
  }

  matrices(){
    return {
      view:mat4LookAt(this.pos,this.target),
      proj:mat4Perspective(this.fov,this.aspect||1,this.near,this.far),
      pos:[...this.pos]
    };
  }
}
