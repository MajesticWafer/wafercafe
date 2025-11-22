export const particles = [];

export function createParticles(x,y,count=10){
  for(let i=0;i<count;i++){
    particles.push({
      x,y,
      vx:(Math.random()-0.5)*2,
      vy:(Math.random()-0.5)*2,
      life:Math.random()*30+20,
      alpha:1,
      size:Math.random()*2+1
    });
  }
}

export function updateParticles(timeScale = 1){
  particles.forEach((p,i)=>{
    p.x += p.vx * timeScale;
    p.y += p.vy * timeScale;
    p.life -= timeScale;
    p.alpha = Math.max(0, p.life/30);

    // Wraparound
    if(p.x > 800) p.x = 0;
    if(p.x < 0) p.x = 800;
    if(p.y > 600) p.y = 0;
    if(p.y < 0) p.y = 600;

    if(p.life <= 0) particles.splice(i,1);
  });
}

export function drawParticles(ctx){
  particles.forEach(p=>{
    ctx.fillStyle=`rgba(255,255,255,${p.alpha})`;
    ctx.fillRect(p.x,p.y,p.size,p.size);

    // ghost copies
    const offsets = [-800,0,800];
    offsets.forEach(ox=>{
      offsets.forEach(oy=>{
        if(ox!==0 || oy!==0){
          ctx.fillRect(p.x+ox,p.y+oy,p.size,p.size);
        }
      });
    });
  });
}
