import {Renderer} from './renderer.js';
import {Controls} from './controls.js';
import {Camera} from './camera.js';
import {World} from './world.js';
import {Physics} from './physics.js';
import {Player} from './player.js';
import {Editor} from './editor.js';
import {SaveSystem,downloadJSON} from './saveSystem.js';
import {UI} from './ui.js';
import {Inventory} from './inventory.js';
import {updateNPCs} from './npc.js';
import {createObject} from './blocks.js';

class App {
  constructor(){
    this.canvas=document.getElementById('game');
    this.renderer=new Renderer(this.canvas);
    this.controls=new Controls(this.canvas);
    this.camera=new Camera(this.canvas);
    this.world=new World();
    this.physics=new Physics(this.world);
    this.player=new Player();
    this.editor=new Editor(this.world,this.camera,this.controls);
    this.saves=new SaveSystem();
    this.inventory=new Inventory();
    this.ui=new UI(document.getElementById('ui'),this);
    this.last=performance.now();
    this.fps=60;
    this.mode='studio';
    this.gridVisible=true;
    this.initCamera();
    this.bind();
    this.loop=this.loop.bind(this);
    requestAnimationFrame(this.loop);
    this.toast('World ready · choose a tool and click the 3D viewport');
  }

  initCamera(){
    this.camera.mode='editor';
    this.camera.pos=[22,18,28];
    this.camera.yaw=Math.atan2(-22, -28);
    this.camera.pitch=-0.48;
    this.camera.distance=32;
    this.camera.target=[0,0,0];
    this.camera.resize();
  }

  bind(){
    addEventListener('resize',()=>{this.renderer.resize();this.camera.resize();});

    this.canvas.addEventListener('mousedown',e=>{
      if(this.mode==='studio'){
        if(e.button===0){
          const o=this.editor.click(e.clientX,e.clientY);
          if(o) this.ui.refresh();
        }else if(e.button===2){
          // RMB is deliberately delete-on-object, like a simple Studio build tool.
          const hit=this.editor.pick(e.clientX,e.clientY);
          if(hit){this.world.remove(hit.id);this.ui.refresh();}
        }
      } else if(this.mode==='play'){
        this.canvas.requestPointerLock?.();
      }
    });

    addEventListener('keydown',e=>{
      if(e.code==='Tab'){e.preventDefault();this.toggleMode();return;}
      if(e.code==='Escape'&&this.mode==='play'){document.exitPointerLock?.();return;}
      if(this.mode!=='studio') return;
      if((e.ctrlKey||e.metaKey)&&e.code==='KeyC'){e.preventDefault();this.editor.copy();this.ui.setStatus('Copied object');}
      if((e.ctrlKey||e.metaKey)&&e.code==='KeyV'){e.preventDefault();if(this.editor.paste())this.ui.refresh();}
      if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();this.world.undo();this.ui.refresh();}
      if((e.ctrlKey||e.metaKey)&&e.code==='KeyY'){e.preventDefault();this.world.redo();this.ui.refresh();}
      if(e.code==='Delete'){const o=this.editor.selected();if(o){this.world.remove(o.id);this.ui.refresh();}}
      if(e.code==='KeyR') this.editor.modify(o=>o.rotation[1]+=Math.PI/2);
      if(e.code==='KeyQ') this.editor.modify(o=>o.position[1]-=this.editor.grid);
      if(e.code==='KeyE') this.editor.modify(o=>o.position[1]+=this.editor.grid);
      if(e.code==='KeyF'){
        const o=this.editor.selected();
        if(o){this.camera.pos=[o.position[0]+10,o.position[1]+7,o.position[2]+10];this.camera.target=[...o.position];this.camera.pitch=-0.45;this.camera.yaw=Math.atan2(this.camera.target[0]-this.camera.pos[0],this.camera.target[2]-this.camera.pos[2]);}
      }
    });
  }

  toggleMode(force){
    this.mode=force||(this.mode==='studio'?'play':'studio');
    this.world.mode=this.mode;
    if(this.mode==='play'){
      this.player.position=[0,3.2,8];
      this.player.velocity=[0,0,0];
      this.camera.mode='play';
      this.camera.yaw=0;
      this.camera.pitch=-0.25;
      document.title='BlockWorld — Play';
      this.toast('PLAY · WASD move · Shift run · Space jump · Tab Studio');
    }else{
      document.exitPointerLock?.();
      this.initCamera();
      document.title='BlockWorld Studio';
      this.toast('STUDIO · build and edit your place');
    }
    this.ui.setMode(this.mode);
  }

  selectTool(type){
    this.editor.placement=type;
    this.ui.setTool(type);
    this.toast(type==='select'?'Select tool · click an object':'Place '+type+' · click the viewport');
  }

  placeType(type){
    this.selectTool(type);
  }

  action(action){
    switch(action){
      case 'play': this.toggleMode('play'); break;
      case 'save': this.save(); break;
      case 'export': downloadJSON(this.world); this.toast('JSON exported'); break;
      case 'import': document.getElementById('jsonImport').click(); break;
      case 'templates': this.templateModal(); break;
      case 'places': this.placesModal(); break;
      case 'new': this.world.applyTemplate('empty'); this.ui.refresh(); this.toast('New empty world'); break;
      case 'grid': this.gridVisible=!this.gridVisible; this.ui.setGrid(this.gridVisible); break;
    }
  }

  async save(){
    try{const r=await this.saves.save(this.world);this.toast(`Saved “${r.name}”`);}
    catch(e){this.toast('Save failed: '+e.message);}
  }

  async placesModal(){
    const rows=await this.saves.list();
    this.ui.modal(`<div class="modal-card wide"><div class="modal-head"><div><div class="eyebrow">MY PLACES</div><h2>Saved worlds</h2></div><button class="icon-btn" data-close>×</button></div>${rows.length?`<div class="place-list">${rows.map(r=>`<div class="place-row"><div><b>${escapeHtml(r.name||'Untitled')}</b><span>${new Date(r.updated||r.created).toLocaleString()}</span></div><div class="place-actions"><button data-load="${r.id}">Open</button><button data-delete-place="${r.id}" class="danger">Delete</button></div></div>`).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">▣</div><b>No saved worlds yet</b><span>Save this place and it will appear here.</span></div>`}<div class="modal-foot"><button data-close>Close</button></div></div>`);
    const m=document.getElementById('modal');
    m.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>this.ui.closeModal());
    m.querySelectorAll('[data-load]').forEach(b=>b.onclick=async()=>{const d=await this.saves.load(b.dataset.load);if(d){this.world.load(d);this.ui.refresh();this.ui.closeModal();this.toast('Place loaded');}});
    m.querySelectorAll('[data-delete-place]').forEach(b=>b.onclick=async()=>{await this.saves.remove(b.dataset.deletePlace);this.ui.closeModal();this.placesModal();});
  }

  templateModal(){
    this.ui.modal(`<div class="modal-card"><div class="modal-head"><div><div class="eyebrow">CREATE</div><h2>Choose a template</h2><span class="subtle">Starter scenes for your next place.</span></div><button class="icon-btn" data-close>×</button></div><div class="template-grid">${[
      ['empty','Empty','Blank canvas','◇'],['city','City','Houses and streets','⌂'],['park','Park','Trees and paths','♧'],['obby','Obby','Jumping course','◆'],['race','Race','Straight track','➜'],['arena','Arena','Open battle space','◎']
    ].map(([id,name,desc,icon])=>`<button class="template-card" data-template="${id}"><span class="template-icon">${icon}</span><b>${name}</b><span>${desc}</span></button>`).join('')}</div><div class="modal-foot"><button data-close>Cancel</button></div></div>`);
    const m=document.getElementById('modal');
    m.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>this.ui.closeModal());
    m.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{this.world.applyTemplate(b.dataset.template);this.ui.refresh();this.ui.closeModal();this.toast(`${b.textContent.trim().split('\n')[0]} template created`);});
  }

  editProp(id,val){
    const o=this.editor.selected(); if(!o)return;
    if(id==='delete'){this.world.remove(o.id);this.ui.refresh();return;}
    if(id==='rotate'){this.editor.modify(x=>x.rotation[1]+=Math.PI/2);this.ui.refresh();return;}
    this.world.commit('property');
    if(id==='pn')o.name=val;
    if(id==='pc')o.color=val;
    if(id==='px')o.position[0]=Number(val)||0;
    if(id==='py')o.position[1]=Number(val)||0;
    if(id==='pz')o.position[2]=Number(val)||0;
    if(id==='sx')o.scale[0]=Math.max(.05,Number(val)||.05);
    if(id==='sy')o.scale[1]=Math.max(.05,Number(val)||.05);
    if(id==='sz')o.scale[2]=Math.max(.05,Number(val)||.05);
    this.ui.refresh();
  }

  renderExtras(o,cam){
    if(o.extra==='tree'){
      this.renderer.drawObject({position:[o.position[0],o.position[1]+3,o.position[2]],rotation:[0,0,0],scale:[2.1,2.1,2.1],color:'#4fa451',shape:'sphere'},cam,false);
    }
    if(o.extra==='house'){
      this.renderer.drawObject({position:[o.position[0],o.position[1]+2.0,o.position[2]],rotation:[0,.78,0],scale:[3.4,1.4,3.4],color:'#b85d5d',shape:'cube'},cam,false);
    }
    if(o.extra==='stairs'){
      for(let i=0;i<5;i++) this.renderer.drawObject({position:[o.position[0],o.position[1]-o.scale[1]/2+i*.25,o.position[2]-1.5+i*.75],rotation:[0,0,0],scale:[2,.4,.9],color:o.color,shape:'cube'},cam,false);
    }
    if(o.extra==='coin'){
      this.renderer.drawObject({position:[o.position[0],o.position[1],o.position[2]],rotation:[Math.PI/2,performance.now()/700,0],scale:[.8,.2,.8],color:'#ffe64c',shape:'cylinder'},cam,false);
    }
  }

  renderGrid(cam){
    if(!this.gridVisible)return;
    for(let i=-25;i<=25;i++){
      const major=i%5===0;
      const c=major?'#a6bed2':'#7f96ab';
      this.renderer.drawObject({position:[i,-.02,0],rotation:[0,0,0],scale:[major?.025:.012,.012,50],color:c,shape:'cube'},cam,false);
      this.renderer.drawObject({position:[0,-.021,i],rotation:[0,0,0],scale:[50,.012,major?.025:.012],color:c,shape:'cube'},cam,false);
    }
  }

  loop(now){
    const dt=Math.min(.033,Math.max(.001,(now-this.last)/1000));
    this.last=now;
    this.fps=this.fps*.92+(1/dt)*.08;
    const mouse=this.controls.consume();
    updateNPCs(this.world,dt);
    if(this.mode==='studio') this.camera.editorFree(dt,this.controls,mouse);
    else {this.player.update(this.controls,this.camera,this.physics,dt);this.camera.playFollow(this.player,dt,mouse);}
    this.renderer.begin();
    const cam=this.camera.matrices();
    if(this.mode==='studio') this.renderGrid(cam);
    for(const o of this.world.objects){this.renderer.drawObject(o,cam,o.id===this.world.selected);this.renderExtras(o,cam);}
    if(this.mode==='play') for(const p of this.player.meshes()) this.renderer.drawObject(p,cam,false);
    this.ui.tick(this.fps,this.mode,this.world.objects.length);
    requestAnimationFrame(this.loop);
  }

  toast(msg){this.ui.setStatus(msg);}
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

const app=new App();
document.getElementById('jsonImport').addEventListener('change',async e=>{
  const f=e.target.files?.[0]; if(!f)return;
  try{const data=JSON.parse(await f.text());if(!app.world.load(data))throw new Error('Invalid place file');app.ui.refresh();app.toast('JSON imported');}
  catch(err){app.toast('Import failed: '+err.message);}
  e.target.value='';
});
window.blockWorld=app;
