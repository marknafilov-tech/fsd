export const PALETTE={
 cube:{label:'Cube',shape:'cube',scale:[1,1,1],color:'#4d8dff',material:'plastic'},
 platform:{label:'Platform',shape:'cube',scale:[4,.35,4],color:'#7acb52',material:'grass'},
 sphere:{label:'Sphere',shape:'sphere',scale:[1.2,1.2,1.2],color:'#ffcf44',material:'plastic'},
 cylinder:{label:'Cylinder',shape:'cylinder',scale:[1,1.5,1],color:'#b98558',material:'wood'},
 tree:{label:'Tree',shape:'cylinder',scale:[.55,2.5,.55],color:'#8d5b36',material:'wood',extra:'tree'},
 house:{label:'House',shape:'cube',scale:[3,2.2,3],color:'#f2d7a1',material:'stone',extra:'house'},
 stair:{label:'Stairs',shape:'cube',scale:[2,1,4],color:'#aab2bf',material:'stone',extra:'stairs'},
 coin:{label:'Coin',shape:'cylinder',scale:[.4,.12,.4],color:'#ffd83d',material:'metal',extra:'coin'},
 npc:{label:'NPC',shape:'cube',scale:[.8,1.6,.6],color:'#e78ab4',material:'plastic',extra:'npc'},
 spawn:{label:'Spawn',shape:'cube',scale:[1.2,.15,1.2],color:'#44e0a8',material:'plastic',extra:'spawn'}
};
export function createObject(type,pos=[0,0,0]){const p=PALETTE[type]||PALETTE.cube;return {id:crypto.randomUUID(),name:p.label,type,shape:p.shape,position:[...pos],rotation:[0,0,0],scale:[...p.scale],color:p.color,material:p.material,extra:p.extra||null,props:{}}}
export function starterGround(){return createObject('platform',[0,-.5,0])}
