export class Controls{
  constructor(canvas){this.canvas=canvas;this.keys=new Set();this.mouse={dx:0,dy:0,wheel:0,buttons:new Set()};this.locked=false;
    addEventListener('keydown',e=>{this.keys.add(e.code); if(['Space','Tab'].includes(e.code))e.preventDefault()});
    addEventListener('keyup',e=>this.keys.delete(e.code));
    canvas.addEventListener('mousedown',e=>{this.mouse.buttons.add(e.button);if(e.button===0 && document.pointerLockElement!==canvas){} });
    addEventListener('mouseup',e=>this.mouse.buttons.delete(e.button));
    addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas || this.mouse.buttons.has(2)){this.mouse.dx+=e.movementX;this.mouse.dy+=e.movementY}});
    canvas.addEventListener('wheel',e=>{this.mouse.wheel+=Math.sign(e.deltaY);e.preventDefault()},{passive:false});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
  }
  down(c){return this.keys.has(c)}
  consume(){const m={...this.mouse,buttons:new Set(this.mouse.buttons)};this.mouse.dx=this.mouse.dy=this.mouse.wheel=0;return m}
}
