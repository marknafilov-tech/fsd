import {V3,rayAABB} from './math.js';
import {createObject} from './blocks.js';

export class Editor {
  constructor(world,camera,controls){
    this.world=world;
    this.camera=camera;
    this.controls=controls;
    this.placement='select';
    this.grid=1;
    this.clipboard=null;
  }

  rayFromScreen(x,y){
    const rect=this.camera.canvas.getBoundingClientRect();
    const nx=((x-rect.left)/Math.max(1,rect.width))*2-1;
    const ny=1-((y-rect.top)/Math.max(1,rect.height))*2;
    const cp=Math.cos(this.camera.pitch),sp=Math.sin(this.camera.pitch);
    const sy=Math.sin(this.camera.yaw),cy=Math.cos(this.camera.yaw);
    const f=V3.norm([sy*cp,sp,cy*cp]);
    const r=V3.norm([cy,0,-sy]);
    // Camera-up is right × forward, not forward × right.
    const u=V3.norm(V3.cross(r,f));
    const tan=Math.tan(this.camera.fov/2);
    const aspect=Math.max(.1,rect.width/Math.max(1,rect.height));
    return V3.norm(V3.add(f,V3.add(V3.mul(r,nx*tan*aspect),V3.mul(u,ny*tan))));
  }

  pick(x,y){
    const o=this.camera.pos;
    const d=this.rayFromScreen(x,y);
    let hit=null,best=Infinity;
    for(const obj of this.world.objects){
      if(obj.locked) continue;
      const half=obj.scale.map(v=>Math.abs(v)*.5+.06);
      const min=V3.sub(obj.position,half),max=V3.add(obj.position,half);
      const t=rayAABB(o,d,min,max);
      if(t!==null&&t<best){best=t;hit=obj;}
    }
    return hit;
  }

  groundPoint(x,y){
    const o=this.camera.pos,d=this.rayFromScreen(x,y);
    if(Math.abs(d[1])<1e-6) return null;
    const t=-o[1]/d[1];
    if(t<0) return null;
    const p=V3.add(o,V3.mul(d,t));
    return [Math.round(p[0]/this.grid)*this.grid,0,Math.round(p[2]/this.grid)*this.grid];
  }

  placeAtScreen(x,y,type=this.placement){
    const p=this.groundPoint(x,y);
    if(!p) return null;
    const probe=createObject(type,[p[0],0,p[2]]);
    probe.position[1]=Math.max(0,probe.scale[1]*0.5);
    this.world.add(probe);
    this.world.selected=probe.id;
    return probe;
  }

  click(x,y){
    const activeTool=this.placement;
    const hit=this.pick(x,y);
    if(hit && activeTool==='select'){
      this.world.selected=hit.id;
      return hit;
    }
    if(activeTool!=='select') return this.placeAtScreen(x,y,activeTool);
    if(hit){this.world.selected=hit.id;return hit;}
    this.world.selected=null;
    return null;
  }

  selected(){return this.world.selected?this.world.get(this.world.selected):null;}
  modify(fn){const o=this.selected();if(!o)return;this.world.commit('transform');fn(o);}
  copy(){const o=this.selected();if(!o)return null;this.clipboard=structuredClone(o);return this.clipboard;}
  paste(){
    if(!this.clipboard)return null;
    const c=structuredClone(this.clipboard);
    c.id=crypto.randomUUID();
    c.position[0]+=this.grid;
    c.position[2]+=this.grid;
    this.world.add(c);
    this.world.selected=c.id;
    return c;
  }
}
