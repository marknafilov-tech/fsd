import {createObject} from './blocks.js';
export function createNPC(position,name='Guide'){const o=createObject('npc',position);o.name=name;o.props.dialog='Welcome to BlockWorld!';o.props.role='friend';return o}
export function updateNPCs(world,dt){for(const o of world.objects){if(o.type==='npc'){o.rotation[1]+=dt*.35}}}
