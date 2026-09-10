const toolGroups={
  select:[['select','Select','↖']],
  part:[['cube','Block','■'],['platform','Platform','▬'],['sphere','Sphere','●'],['cylinder','Cylinder','◉'],['stair','Stairs','▤']],
  decor:[['tree','Tree','♣'],['house','House','⌂'],['coin','Coin','●'],['npc','NPC','☺'],['spawn','Spawn','✦']]
};

export class UI {
  constructor(root,app){this.root=root;this.app=app;this.render();this.refresh();}

  render(){
    this.root.innerHTML=`
      <header class="studio-bar">
        <div class="brand-area">
          <div class="brand-mark">B</div><div class="brand-copy"><strong>BlockWorld</strong><span>Studio</span></div>
          <div class="menu-tabs"><button class="top-tab active">HOME</button><button class="top-tab">MODEL</button><button class="top-tab">TEST</button><button class="top-tab">VIEW</button></div>
        </div>
        <div class="play-cluster"><button class="primary-play" data-act="play"><span>▶</span> Play</button><button class="mini-btn" data-act="new">＋</button><button class="mini-btn" data-act="save">▣</button></div>
        <div class="bar-right"><span id="modeBadge">STUDIO</span><button class="mini-btn" data-act="places">☰</button></div>
      </header>

      <div class="ribbon">
        <div class="ribbon-section"><div class="ribbon-title">EDIT</div><div class="ribbon-buttons"><button data-action="undo"><span>↶</span><small>Undo</small></button><button data-action="redo"><span>↷</span><small>Redo</small></button></div></div>
        <div class="ribbon-sep"></div>
        <div class="ribbon-section"><div class="ribbon-title">BUILD</div><div class="ribbon-buttons"><button data-tool="select"><span>↖</span><small>Select</small></button><button data-tool="cube"><span>■</span><small>Part</small></button><button data-tool="platform"><span>▬</span><small>Platform</small></button><button data-act="templates"><span>✦</span><small>Templates</small></button></div></div>
        <div class="ribbon-sep"></div>
        <div class="ribbon-section"><div class="ribbon-title">WORLD</div><div class="ribbon-buttons"><button data-action="grid"><span>▦</span><small>Grid</small></button><button data-act="export"><span>⇩</span><small>Export</small></button><button data-act="import"><span>⇧</span><small>Import</small></button></div></div>
      </div>

      <aside class="toolbox panel-surface">
        <div class="panel-head"><div><b>Toolbox</b><span>Build your place</span></div><button class="ghost-btn">•••</button></div>
        <div class="search"><span>⌕</span><input id="toolSearch" placeholder="Search tools and parts"></div>
        <div class="tool-scroll">
          <div class="group-title">TOOLS</div><div id="tools-select" class="tool-grid"></div>
          <div class="group-title">PARTS</div><div id="tools-part" class="tool-grid"></div>
          <div class="group-title">DECOR</div><div id="tools-decor" class="tool-grid"></div>
        </div>
      </aside>

      <aside class="explorer panel-surface">
        <div class="panel-head"><div><b>Explorer</b><span>Workspace</span></div><button class="ghost-btn">＋</button></div>
        <div class="explorer-root"><span>▾</span><b>Workspace</b><span class="count" id="objectCount">0</span></div>
        <div id="objectList" class="object-list"></div>
      </aside>

      <aside class="properties panel-surface">
        <div class="panel-head"><div><b>Properties</b><span>Selected object</span></div><button class="ghost-btn">•••</button></div>
        <div id="props" class="props-body"></div>
      </aside>

      <div class="viewport-hud">
        <div class="scene-chip"><span class="live-dot"></span><span id="sceneName">My Place</span></div>
        <div class="view-tools"><button title="Focus selected" data-action="focus">F</button><button title="Grid" data-action="grid">▦</button></div>
      </div>
      <div class="crosshair"><span></span></div>

      <footer class="status-bar"><div><span id="toolStatus">Select tool</span><span class="status-sep">|</span><span id="statusText">Ready</span></div><div><span id="modeText">Studio</span><span class="status-sep">|</span><span id="fpsText">60 FPS</span><span class="status-sep">|</span><span id="objectText">0 objects</span></div></footer>
      <div id="modal" class="modal hidden"></div>
      <div id="toast" class="toast"></div>`;
    this.paintTools();this.bind();
  }

  paintTools(){
    for(const group of ['select','part','decor']){
      const el=this.root.querySelector('#tools-'+group);
      el.innerHTML=toolGroups[group].map(([id,name,icon])=>`<button class="tool-card ${id==='select'?'selected':''}" data-tool="${id}"><span class="tool-icon">${icon}</span><span>${name}</span></button>`).join('');
    }
  }

  bind(){
    this.root.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.act)this.app.action(b.dataset.act);
      if(b.dataset.tool)this.app.selectTool(b.dataset.tool);
      if(b.dataset.action==='undo'){this.app.world.undo();this.refresh();}
      if(b.dataset.action==='redo'){this.app.world.redo();this.refresh();}
      if(b.dataset.action==='grid')this.app.action('grid');
      if(b.dataset.action==='focus'){const o=this.app.editor.selected();if(o){this.app.camera.target=[...o.position];this.app.camera.pos=[o.position[0]+10,o.position[1]+7,o.position[2]+10];}}
      const sel=b.closest('.tool-card');if(sel){this.root.querySelectorAll('.tool-card').forEach(x=>x.classList.remove('selected'));sel.classList.add('selected');}
      if(b.dataset.select){this.app.world.selected=b.dataset.select;this.refresh();}
    });
    this.root.querySelector('#toolSearch').addEventListener('input',e=>{
      const q=e.target.value.trim().toLowerCase();this.root.querySelectorAll('.tool-card').forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?'':'none');
    });
  }

  setTool(type){
    this.root.querySelectorAll('.tool-card').forEach(b=>b.classList.toggle('selected',b.dataset.tool===type));
    this.root.querySelector('#toolStatus').textContent=type==='select'?'Select tool':'Place '+(toolGroups.part.concat(toolGroups.decor).find(x=>x[0]===type)?.[1]||type);
  }
  setMode(mode){this.root.querySelector('#modeBadge').textContent=mode.toUpperCase();this.root.querySelector('#modeText').textContent=mode==='studio'?'Studio':'Play';}
  setGrid(on){this.root.querySelector('[data-action="grid"]')?.classList.toggle('active',on);}
  setStatus(msg){
    const s=this.root.querySelector('#statusText');if(s)s.textContent=msg;
    const t=this.root.querySelector('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(this._toast);this._toast=setTimeout(()=>t.classList.remove('show'),1800);
  }
  tick(fps,mode,count){this.root.querySelector('#fpsText').textContent=Math.round(fps)+' FPS';this.root.querySelector('#objectText').textContent=count+' objects';this.root.querySelector('#objectCount').textContent=count;}

  refresh(){
    const objects=this.app.world.objects;
    this.root.querySelector('#sceneName').textContent=this.app.world.meta.name||'My Place';
    const list=this.root.querySelector('#objectList');
    list.innerHTML=objects.map(o=>`<button class="object-row ${o.id===this.app.world.selected?'selected':''}" data-select="${o.id}"><span class="object-icon ${o.type}">${iconFor(o.type)}</span><span class="object-name">${escapeHtml(o.name)}</span><span class="object-type">${o.type}</span></button>`).join('');
    const p=this.root.querySelector('#props');const o=this.app.editor.selected();
    if(!o){p.innerHTML='<div class="empty-props"><span class="empty-icon">◇</span><b>No selection</b><span>Choose an object in the viewport or Explorer.</span></div>';return;}
    p.innerHTML=`<div class="selection-title"><div class="selection-icon ${o.type}">${iconFor(o.type)}</div><div><b>${escapeHtml(o.name)}</b><span>${o.type}</span></div></div>
      <label>Name<input id="pn" value="${escapeHtml(o.name)}"></label>
      <label>Color<div class="color-row"><input id="pc" type="color" value="${o.color}"><span>${o.color}</span></div></label>
      <div class="prop-section">TRANSFORM</div>
      <div class="prop-grid"><label>X<input id="px" type="number" step=".1" value="${o.position[0]}"></label><label>Y<input id="py" type="number" step=".1" value="${o.position[1]}"></label><label>Z<input id="pz" type="number" step=".1" value="${o.position[2]}"></label></div>
      <div class="prop-section">SIZE</div><div class="prop-grid"><label>X<input id="sx" type="number" step=".1" value="${o.scale[0]}"></label><label>Y<input id="sy" type="number" step=".1" value="${o.scale[1]}"></label><label>Z<input id="sz" type="number" step=".1" value="${o.scale[2]}"></label></div>
      <div class="prop-actions"><button data-edit="rotate">↻ Rotate</button><button data-edit="delete" class="danger">Delete</button></div>`;
    ['pn','pc','px','py','pz','sx','sy','sz'].forEach(id=>p.querySelector('#'+id).addEventListener('change',()=>this.app.editProp(id,p.querySelector('#'+id).value)));
    p.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>this.app.editProp(b.dataset.edit));
  }
  modal(html){const m=this.root.querySelector('#modal');m.classList.remove('hidden');m.innerHTML=html;}
  closeModal(){this.root.querySelector('#modal').classList.add('hidden');}
}
function iconFor(t){return ({cube:'■',platform:'▬',sphere:'●',cylinder:'◉',stair:'▤',tree:'♣',house:'⌂',coin:'●',npc:'☺',spawn:'✦'})[t]||'◇';}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
