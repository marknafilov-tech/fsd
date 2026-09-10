import {createObject,starterGround} from './blocks.js';
export class World{
  constructor(){this.meta={name:'My Place',author:'Player',created:new Date().toISOString(),world:{sky:'#7bb0d4',ambient:.8}};this.objects=[starterGround(),...this.createDecor('park')];this.selected=null;this.mode='studio';this.history=[];this.future=[];}
  snapshot(){return JSON.parse(JSON.stringify({meta:this.meta,objects:this.objects}))}
  commit(label='edit'){this.history.push(this.snapshot());if(this.history.length>60)this.history.shift();this.future=[]}
  add(obj){this.commit('add');this.objects.push(obj)}
  remove(id){const i=this.objects.findIndex(o=>o.id===id);if(i<0)return;this.commit('remove');this.objects.splice(i,1);if(this.selected===id)this.selected=null}
  get(id){return this.objects.find(o=>o.id===id)}
  undo(){if(!this.history.length)return;this.future.push(this.snapshot());const s=this.history.pop();this.meta=s.meta;this.objects=s.objects}
  redo(){if(!this.future.length)return;this.history.push(this.snapshot());const s=this.future.pop();this.meta=s.meta;this.objects=s.objects}
  createDecor(kind){const a=[]; if(kind==='park'){for(const [x,z] of [[-8,-6],[8,-5],[-6,8],[8,8]]){const o=createObject('tree',[x,2,z]);a.push(o)}for(let x=-15;x<=15;x+=5)for(let z=-15;z<=15;z+=5){if((x+z)%10===0)a.push(createObject('platform',[x,-.35,z]))}} return a}
  applyTemplate(t){this.history=[];this.future=[];const arr=[starterGround()]; if(t==='empty'){} if(t==='city'){for(let x=-12;x<=12;x+=6)for(let z=-12;z<=12;z+=6)arr.push(createObject('house',[x,2,z]));for(let i=-2;i<=2;i++)arr.push(createObject('platform',[0,-.35,i*6]));} if(t==='park'){arr.push(...this.createDecor('park'))} if(t==='obby'){for(let i=0;i<12;i++)arr.push(createObject('platform',[i*3, i%2?1.5:.2,0]));for(let i=0;i<4;i++)arr.push(createObject('cube',[6,i+1,5]));} if(t==='race'){for(let i=0;i<18;i++)arr.push(createObject('platform',[0,-.35,i*3]));for(let i=0;i<5;i++)arr.push(createObject('cube',[(i%2?3:-3),.7,8+i*8]));} if(t==='arena'){arr.push(createObject('platform',[0,-.3,0]));for(let a=0;a<4;a++){const q=a*Math.PI/2;arr.push(createObject('cube',[Math.cos(q)*12,2,Math.sin(q)*12]))}}this.objects=arr;this.selected=null}
  serialize(){return {version:2,meta:this.meta,objects:this.objects}}
  load(data){if(!data?.objects)return false;this.meta=data.meta||this.meta;this.objects=data.objects;this.selected=null;this.history=[];this.future=[];return true}
}
