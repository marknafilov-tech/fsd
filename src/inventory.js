export class Inventory{constructor(){this.items={coin:0,key:0,tool:1,weapon:1}} add(id,n=1){this.items[id]=(this.items[id]||0)+n} serialize(){return {...this.items}}}
