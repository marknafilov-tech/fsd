export class Physics{
  constructor(world){this.world=world}
  groundHeightAt(x,z,ignoreId=null){let h=0;for(const o of this.world.objects){if(o.id===ignoreId)continue;const sx=o.scale[0]*.5,sz=o.scale[2]*.5;if(x>=o.position[0]-sx&&x<=o.position[0]+sx&&z>=o.position[2]-sz&&z<=o.position[2]+sz){const top=o.position[1]+o.scale[1]*.5;h=Math.max(h,top)}}return h}
  movePlayer(player,dt){player.velocity[1]+= -24*dt;const next=[player.position[0]+player.velocity[0]*dt,player.position[1]+player.velocity[1]*dt,player.position[2]+player.velocity[2]*dt];const ground=this.groundHeightAt(next[0],next[2],null)+player.height*.5;if(next[1]<ground){next[1]=ground;player.velocity[1]=0;player.grounded=true}else player.grounded=false; player.position=next; if(player.position[1]<-40){player.position=[0,4,6];player.velocity=[0,0,0]}}
}
