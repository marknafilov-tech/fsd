export class Player {
  constructor(){
    this.position=[0,3.2,8];
    this.velocity=[0,0,0];
    this.height=3.2;
    this.radius=.65;
    this.grounded=false;
    this.speed=6;
    this.run=10;
    this.yaw=0;
    this.lastMove=0;
  }

  update(controls,camera,physics,dt){
    // Camera sits behind the player. Therefore W follows the camera's horizontal view direction (-camera rear vector).
    const forward=[-Math.sin(camera.yaw),0,-Math.cos(camera.yaw)];
    const right=[Math.cos(camera.yaw),0,-Math.sin(camera.yaw)];
    let x=0,z=0;
    if(controls.down('KeyW')){x+=forward[0];z+=forward[2];}
    if(controls.down('KeyS')){x-=forward[0];z-=forward[2];}
    if(controls.down('KeyD')){x+=right[0];z+=right[2];}
    if(controls.down('KeyA')){x-=right[0];z-=right[2];}
    const len=Math.hypot(x,z);
    const running=controls.down('ShiftLeft')||controls.down('ShiftRight');
    const speed=running?this.run:this.speed;
    const accel=this.grounded?14:5;
    if(len>0){
      x/=len;z/=len;
      this.velocity[0]+=(x*speed-this.velocity[0])*Math.min(1,accel*dt);
      this.velocity[2]+=(z*speed-this.velocity[2])*Math.min(1,accel*dt);
      this.yaw=Math.atan2(-x,-z);
    }else{
      this.velocity[0]+=(0-this.velocity[0])*Math.min(1,8*dt);
      this.velocity[2]+=(0-this.velocity[2])*Math.min(1,8*dt);
    }
    if(controls.down('Space')&&this.grounded){this.velocity[1]=9;this.grounded=false;}
    physics.movePlayer(this,dt);
    this.lastMove=Math.min(1,Math.hypot(this.velocity[0],this.velocity[2])/this.run);
  }

  meshes(){
    const p=this.position;
    const t=performance.now()*0.012;
    const walk=Math.sin(t)*(this.lastMove>0.08?0.14:0);
    return [
      {id:'avatarBody',position:[p[0],p[1]+.55,p[2]],rotation:[0,this.yaw,0],scale:[1.2,1.7,.7],color:'#3b73e8',shape:'cube'},
      {id:'avatarHead',position:[p[0],p[1]+1.9,p[2]],rotation:[0,this.yaw,0],scale:[1.05,1.05,1.05],color:'#f2c29b',shape:'cube'},
      {id:'avatarArmL',position:[p[0]-.85,p[1]+.55+walk,p[2]],rotation:[walk*1.8,0,0],scale:[.42,1.5,.42],color:'#f2c29b',shape:'cube'},
      {id:'avatarArmR',position:[p[0]+.85,p[1]+.55-walk,p[2]],rotation:[-walk*1.8,0,0],scale:[.42,1.5,.42],color:'#f2c29b',shape:'cube'},
      {id:'avatarLegL',position:[p[0]-.38,p[1]-.75,p[2]],rotation:[-walk*1.5,this.yaw,0],scale:[.5,1.6,.5],color:'#20283b',shape:'cube'},
      {id:'avatarLegR',position:[p[0]+.38,p[1]-.75,p[2]],rotation:[walk*1.5,this.yaw,0],scale:[.5,1.6,.5],color:'#20283b',shape:'cube'}
    ];
  }
}
