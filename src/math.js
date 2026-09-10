export const V3 = {
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  len:a=>Math.hypot(a[0],a[1],a[2]), norm:a=>{const l=Math.hypot(...a)||1; return [a[0]/l,a[1]/l,a[2]/l]},
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
};
export function mat4Identity(){return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]}
export function mat4Multiply(a,b){const o=new Array(16); for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3]; return o}
export function mat4Perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2), nf=1/(near-far); return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,(2*far*near)*nf,0]}
export function mat4LookAt(eye,target,up=[0,1,0]){const z=V3.norm(V3.sub(eye,target)), x=V3.norm(V3.cross(up,z)), y=V3.cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -V3.dot(x,eye),-V3.dot(y,eye),-V3.dot(z,eye),1]}
export function mat4TRS(p,r,s){const [sx,sy,sz]=s; const cx=Math.cos(r[0]),sxr=Math.sin(r[0]),cy=Math.cos(r[1]),syr=Math.sin(r[1]),cz=Math.cos(r[2]),szr=Math.sin(r[2]); const m00=cz*cy,m01=cz*syr*sxr-szr*cx,m02=cz*syr*cx+szr*sxr; const m10=szr*cy,m11=szr*syr*sxr+cz*cx,m12=szr*syr*cx-cz*sxr; const m20=-syr,m21=cy*sxr,m22=cy*cx; return [m00*sx,m10*sx,m20*sx,0,m01*sy,m11*sy,m21*sy,0,m02*sz,m12*sz,m22*sz,0,p[0],p[1],p[2],1]}
export function rayAABB(origin,dir,min,max){let tmin=-Infinity,tmax=Infinity; for(let i=0;i<3;i++){if(Math.abs(dir[i])<1e-8){if(origin[i]<min[i]||origin[i]>max[i]) return null;} else {let t1=(min[i]-origin[i])/dir[i],t2=(max[i]-origin[i])/dir[i]; if(t1>t2)[t1,t2]=[t2,t1]; tmin=Math.max(tmin,t1); tmax=Math.min(tmax,t2); if(tmin>tmax)return null;}} return tmax<0?null:Math.max(0,tmin)}
