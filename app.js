// ---- apply config ----
document.documentElement.classList.add("js");
document.querySelectorAll("[data-name]").forEach(el=>el.textContent=SITE_CONFIG.name);
document.querySelectorAll("[data-shortname]").forEach(el=>el.textContent=SITE_CONFIG.shortName||SITE_CONFIG.name);
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
// title is set in the <title> tag for SEO, do not override

const waURL = "https://wa.me/" + SITE_CONFIG.whatsapp + "?text=" + encodeURIComponent(SITE_CONFIG.whatsappMessage);
document.querySelectorAll("[data-wa]").forEach(a=>a.href=waURL);
document.querySelectorAll("[data-li]").forEach(a=>a.href=SITE_CONFIG.linkedin);
document.querySelectorAll("[data-teams]").forEach(a=>a.href=SITE_CONFIG.teams);
const em=document.querySelector("[data-email]");
if(em && SITE_CONFIG.email){
  em.href="mailto:"+SITE_CONFIG.email;
  em.style.display="inline-flex";
  em.addEventListener("click",()=>{
    // also copy the address, so the click always gives feedback
    const show=()=>{ 
      let t=document.getElementById("toast");
      if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);}
      t.textContent="📋 " + SITE_CONFIG.email + " copied!";
      t.classList.add("show");
      setTimeout(()=>t.classList.remove("show"),2600);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(SITE_CONFIG.email).then(show).catch(show);
    } else { show(); }
  });
}

// ---- animated counters (fire when visible) ----
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const runCount = el=>{
  const target=+el.dataset.count;
  const pre=el.dataset.prefix||"", suf=el.dataset.suffix||"";
  const write=v=>{el.textContent=pre+v+suf;};
  if(reduce){write(target);return;}
  const t0=performance.now(),dur=1400;
  const tick=t=>{
    const p=Math.min((t-t0)/dur,1), eased=1-Math.pow(1-p,3);
    write(Math.round(target*eased));
    if(p<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);}
}),{threshold:.4});
document.querySelectorAll("[data-count]").forEach(el=>cio.observe(el));




// ---- video fallback: if any project demo mp4 is missing, swap in its poster ----
document.querySelectorAll(".proj video").forEach(v=>{
  const src=v.querySelector("source");
  if(!src) return;
  src.addEventListener("error",()=>{
    const img=document.createElement("img");
    img.src=v.poster;
    img.alt=v.getAttribute("aria-label")||"Project preview";
    img.loading="lazy";
    img.style.cssText="display:block;width:100%";
    const shot=v.closest(".shot");
    v.replaceWith(img);
    const lbl=shot && shot.querySelector(".tb small");
    if(lbl) lbl.textContent=lbl.textContent.replace(" · video"," · live");
  });
});

// ---- theme toggle ----
const tt=document.getElementById("themeToggle"), tcMeta=document.getElementById("themeColor");
function applyTheme(t){
  document.documentElement.setAttribute("data-theme",t);
  if(tt) tt.setAttribute("aria-label", t==="dark" ? "Switch to light theme" : "Switch to dark theme");
  if(tcMeta) tcMeta.setAttribute("content", t==="dark" ? "#051f20" : "#f4f7f5");
  try{ localStorage.setItem("theme",t); }catch(e){}
}
if(tt){
  tt.addEventListener("click",()=>{
    applyTheme(document.documentElement.getAttribute("data-theme")==="dark" ? "light" : "dark");
  });
  // reflect the already-applied theme in the button label + meta
  applyTheme(document.documentElement.getAttribute("data-theme")||"dark");
}

// ---- cursor-lit card edges ----
if(!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches){
  const litCards=document.querySelectorAll(".lit");
  let lraf=null,lq=[];
  litCards.forEach(card=>{
    card.addEventListener("pointermove",e=>{
      lq=[card,e.clientX,e.clientY];
      if(lraf) return;
      lraf=requestAnimationFrame(()=>{
        const [c,x,y]=lq, r=c.getBoundingClientRect();
        c.style.setProperty("--cx",((x-r.left)/r.width*100)+"%");
        c.style.setProperty("--cy",((y-r.top)/r.height*100)+"%");
        lraf=null;
      });
    },{passive:true});
  });
}

// ---- mobile menu ----
const burger=document.getElementById("navBurger"), mmenu=document.getElementById("mobileMenu");
if(burger && mmenu){
  const setOpen=open=>{
    burger.setAttribute("aria-expanded",String(open));
    burger.setAttribute("aria-label",open?"Close menu":"Open menu");
    mmenu.classList.toggle("open",open);
    mmenu.hidden=!open;
  };
  setOpen(false);
  burger.addEventListener("click",()=>setOpen(burger.getAttribute("aria-expanded")!=="true"));
  mmenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") setOpen(false); });
  // close if resized up to desktop
  matchMedia("(min-width: 761px)").addEventListener("change",e=>{ if(e.matches) setOpen(false); });
}

// ---- keep all project demo videos silent ----
document.querySelectorAll(".proj video").forEach(v=>{
  v.muted=true; v.defaultMuted=true; v.volume=0;
  v.removeAttribute("controlsList");
  v.setAttribute("controlsList","nodownload noremoteplayback");
  // if the browser or a user gesture unmutes it, mute it straight back
  v.addEventListener("volumechange",()=>{
    if(!v.muted || v.volume>0){ v.muted=true; v.volume=0; }
  });
  v.addEventListener("play",()=>{ v.muted=true; v.volume=0; });
});

// ---- scroll reveal (+ triggers bar fills via .in-view) ----
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("in","in-view");io.unobserve(e.target);}
}),{threshold:.01,rootMargin:"0px 0px 18% 0px"});
if(reduce || !("IntersectionObserver" in window)){
  document.querySelectorAll(".reveal").forEach(el=>el.classList.add("in","in-view"));
}else{
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
}

// ---- hero cursor spotlight (fine pointers only) ----
const heroEl=document.querySelector(".hero");
if(heroEl && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches){
  let sraf=null,sev=null;
  heroEl.addEventListener("pointermove",e=>{
    sev=e;
    if(sraf) return;
    sraf=requestAnimationFrame(()=>{
      const r=heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--mx",(sev.clientX-r.left)+"px");
      heroEl.style.setProperty("--my",(sev.clientY-r.top)+"px");
      sraf=null;
    });
  },{passive:true});
}

// ---- nav shrink on scroll ----
const hdr=document.querySelector("header");
const bttBtn=document.getElementById("backToTop");
const sdBtn=document.getElementById("scrollDown");
if(hdr || bttBtn || sdBtn){
  let nticking=false;
  const onScroll=()=>{
    if(nticking) return;
    nticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      if(hdr) hdr.classList.toggle("shrunk", y > 90);
      if(bttBtn) bttBtn.classList.toggle("show", y > 560);
      if(sdBtn){
        const nearBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 80;
        sdBtn.classList.toggle("hide", nearBottom);
      }
      nticking=false;
    });
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll,{passive:true});
  onScroll();
}
if(bttBtn){
  bttBtn.addEventListener("click",()=>{
    window.scrollTo({top:0, behavior: reduce ? "auto" : "smooth"});
  });
}
if(sdBtn){
  sdBtn.addEventListener("click",()=>{
    const sections=[...document.querySelectorAll("section[id], footer")];
    const y=window.scrollY + 2;
    const next=sections.find(s=>s.getBoundingClientRect().top + window.scrollY > y + 40);
    const target = next ? next.getBoundingClientRect().top + window.scrollY - 70 : document.documentElement.scrollHeight;
    window.scrollTo({top:target, behavior: reduce ? "auto" : "smooth"});
  });
}

// ---- testimonials: static list + Supabase (approved only) ----
const tSec=document.getElementById("reviews"), tGrid=document.getElementById("tGrid");
const SB = SUPABASE_URL && SUPABASE_KEY;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function tCard(t){
  const n=Math.max(1,Math.min(5,+t.stars||5));
  return `<div class="t-card reveal in">
    <div class="t-stars">${"★".repeat(n)}${"☆".repeat(5-n)}</div>
    <div class="t-text">${esc(t.text)}</div>
    <div class="t-who"><b>${esc(t.name)}</b><small>${esc(t.role||"")}${t.role&&t.business?" · ":""}${esc(t.business||"")}</small></div>
  </div>`;
}
function renderReviews(list){
  if(!list.length) return;
  tGrid.innerHTML = list.map(tCard).join("");
  tSec.style.display="";
  tSec.querySelectorAll(".reveal:not(.in)").forEach(el=>{
    if(reduce || !("IntersectionObserver" in window)){ el.classList.add("in","in-view"); }
    else { io.observe(el); }
  });
}
if(tSec){
  let all=[...TESTIMONIALS];
  renderReviews(all);
  if(SB){
    tSec.style.display="";  // form should be reachable even before first review
    fetch(SUPABASE_URL+"/rest/v1/reviews?approved=eq.true&select=name,business,stars,text&order=created_at.desc",
      {headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY}})
      .then(r=>r.ok?r.json():[])
      .then(rows=>{ if(rows.length){ all=[...rows,...TESTIMONIALS]; renderReviews(all); } })
      .catch(()=>{});
  }
}
// review form
const rvT=document.getElementById("rvToggle"), rvF=document.getElementById("rvForm"), rvMsg=document.getElementById("rvMsg");
if(rvT){
  rvT.addEventListener("click",()=>{
    if(!SB){ rvMsg.textContent=""; rvF.style.display = rvF.style.display==="none"?"":"none";
      if(rvF.style.display!=="none"){rvMsg.style.color="var(--amber)";rvMsg.textContent="Review submissions are being set up. Please send your review on WhatsApp for now.";}
      return;
    }
    rvF.style.display = rvF.style.display==="none"?"":"none";
  });
  document.getElementById("rvSubmit").addEventListener("click",async()=>{
    const name=document.getElementById("rvName").value.trim();
    const biz=document.getElementById("rvBiz").value.trim();
    const stars=+document.getElementById("rvStars").value;
    const text=document.getElementById("rvText").value.trim();
    if(document.getElementById("rvHp").value) return;             // spam honeypot
    rvMsg.style.color="var(--muted)";
    if(!name||!text){ rvMsg.style.color="#e07a5f"; rvMsg.textContent="Please fill in your name and review."; return; }
    if(!SB){ rvMsg.style.color="#e07a5f"; rvMsg.textContent="Submissions aren't live yet. Please use WhatsApp."; return; }
    rvMsg.textContent="Sending…";
    try{
      const res=await fetch(SUPABASE_URL+"/rest/v1/reviews",{
        method:"POST",
        headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},
        body:JSON.stringify({name,business:biz||null,stars,text})
      });
      if(!res.ok) throw new Error(res.status);
      rvMsg.style.color="var(--jade)";
      rvMsg.textContent="✅ Thank you! Your review was sent and will appear once approved.";
      ["rvName","rvBiz","rvText"].forEach(id=>document.getElementById(id).value="");
    }catch(e){
      rvMsg.style.color="#e07a5f";
      rvMsg.textContent="Something went wrong. Please try again or send it on WhatsApp.";
    }
  });
}

// ---- contact form (final CTA) ----
const cfT=document.getElementById("cfToggle"), cfF=document.getElementById("cfForm"), cfStatus=document.getElementById("cfStatus");
if(cfT && cfF){
  cfT.addEventListener("click",()=>{
    const open = cfF.style.display==="none" || !cfF.style.display;
    cfF.style.display = open ? "block" : "none";
    if(open) document.getElementById("cfName").focus();
  });
  cfF.addEventListener("submit", async(e)=>{
    e.preventDefault();
    const name=document.getElementById("cfName").value.trim();
    const biz=document.getElementById("cfBiz").value.trim();
    const contact=document.getElementById("cfContact").value.trim();
    const msg=document.getElementById("cfMsg").value.trim();
    if(document.getElementById("cfHp").value) return;              // spam honeypot
    cfStatus.style.color="var(--muted)";
    if(!name||!contact||!msg){ cfStatus.style.color="#e07a5f"; cfStatus.textContent="Please fill in all fields."; return; }
    const submitBtn=document.getElementById("cfSubmit");
    submitBtn.disabled=true;
    cfStatus.textContent="Sending…";
    let sent=false;
    if(SB){
      try{
        const res=await fetch(SUPABASE_URL+"/rest/v1/leads",{
          method:"POST",
          headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},
          body:JSON.stringify({name,business:biz,contact,message:msg,source:"website"})
        });
        if(res.ok) sent=true;
      }catch(e){ /* fall through to mailto */ }
    }
    if(sent){
      cfStatus.style.color="var(--jade)";
      cfStatus.textContent="✅ Thanks "+name.split(" ")[0]+"! I'll reply personally, usually same day.";
      ["cfName","cfBiz","cfContact","cfMsg"].forEach(id=>document.getElementById(id).value="");
    }else{
      const body="Name: "+name+(biz?"\nBusiness: "+biz:"")+"\nContact: "+contact+"\n\n"+msg;
      window.location.href="mailto:"+SITE_CONFIG.email+"?subject="+encodeURIComponent("New project inquiry from "+name)+"&body="+encodeURIComponent(body);
      cfStatus.style.color="var(--jade)";
      cfStatus.textContent="Opening your email app to send this, or message me on WhatsApp instead.";
    }
    submitBtn.disabled=false;
  });
}

// ================= 3D layer (no dependencies, Canvas 2D projection) =================
(function(){
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const rgb = ()=> (getComputedStyle(document.documentElement).getPropertyValue("--glow")||"61,220,151").trim();

  // ---- 1. tilt cards ----
  if(FINE && !RM){
    document.querySelectorAll(".proj,.svc,.ind,.prob-chip").forEach(el=>{
      const big = el.classList.contains("proj") || el.classList.contains("svc");
      const max = big ? 5 : 9;
      const glare = document.createElement("span");
      glare.className="tilt-glare"; glare.setAttribute("aria-hidden","true");
      el.appendChild(glare);
      let raf=0, t=0;
      el.addEventListener("pointermove",e=>{
        const r=el.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          clearTimeout(t);
          el.style.transition="none";
          el.style.transitionDelay="0s";
          el.style.transform=`perspective(900px) rotateX(${(-py*max).toFixed(2)}deg) rotateY(${(px*max).toFixed(2)}deg) translateY(-4px)`;
          glare.style.opacity="1";
          glare.style.background=`radial-gradient(260px circle at ${(px+.5)*100}% ${(py+.5)*100}%, rgba(${rgb()},.16), transparent 60%)`;
        });
      });
      el.addEventListener("pointerleave",()=>{
        cancelAnimationFrame(raf);
        el.style.transition="transform .6s cubic-bezier(.22,1,.36,1)";
        el.style.transform="";
        glare.style.opacity="0";
        t=setTimeout(()=>{el.style.transition="";el.style.transitionDelay="";},650);
      });
    });
  }

  // ---- 2. hero dashboard depth ----
  const stage=document.querySelector(".hd-stage"), hero=document.getElementById("top");
  if(stage && hero && FINE && !RM){
    const D={ry:-9,rx:4,px:0,py:0}, T={...D}; let run=false;
    const tick=()=>{
      let moving=false;
      for(const k in D){ const d=T[k]-D[k]; if(Math.abs(d)>.01){D[k]+=d*.14;moving=true;} else D[k]=T[k]; }
      stage.style.setProperty("--hry",D.ry.toFixed(2)+"deg");
      stage.style.setProperty("--hrx",D.rx.toFixed(2)+"deg");
      stage.style.setProperty("--px",D.px.toFixed(3));
      stage.style.setProperty("--py",D.py.toFixed(3));
      if(moving) requestAnimationFrame(tick); else run=false;
    };
    const go=()=>{ if(!run){run=true;requestAnimationFrame(tick);} };
    hero.addEventListener("pointermove",e=>{
      const r=hero.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
      T.ry=-9+px*12; T.rx=4-py*10; T.px=px; T.py=py; go();
    },{passive:true});
    hero.addEventListener("pointerleave",()=>{T.ry=-9;T.rx=4;T.px=0;T.py=0;go();});
  }

  // ---- shared tiny 3D helpers ----
  function rot(p,rx,ry){
    let [x,y,z]=p;
    const cy=Math.cos(ry),sy=Math.sin(ry); [x,z]=[x*cy+z*sy,-x*sy+z*cy];
    const cx=Math.cos(rx),sx=Math.sin(rx); [y,z]=[y*cx-z*sx,y*sx+z*cx];
    return [x,y,z];
  }
  function setup(canvas){
    const dpr=1;
    const fit=()=>{const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);};
    fit(); addEventListener("resize",fit,{passive:true});
    return {ctx:canvas.getContext("2d"),dpr};
  }
  function runWhenVisible(canvas,draw){
    let vis=false,raf=0;
    let last=0;
    const loop=t=>{ raf=requestAnimationFrame(loop); if(!vis||document.hidden||t-last<32)return; last=t; draw(t); };
    new IntersectionObserver(es=>{vis=es[0].isIntersecting;},{rootMargin:"100px"}).observe(canvas);
    if(RM){draw(0);return;}
    raf=requestAnimationFrame(loop);
  }

  // ---- 3. hero node-network background ----
  const net=document.getElementById("fxNet");
  if(net && net.getContext){
    const {ctx,dpr}=setup(net);
    const N=innerWidth<760?22:44;
    const pts=Array.from({length:N},()=>[Math.random()*2-1,Math.random()*2-1,Math.random()*2-1]);
    let mx=0,my=0,tmx=0,tmy=0;
    if(FINE) hero.addEventListener("pointermove",e=>{const r=hero.getBoundingClientRect();tmx=(e.clientX-r.left)/r.width-.5;tmy=(e.clientY-r.top)/r.height-.5;});
    let col=rgb(),f=0;
    runWhenVisible(net,t=>{
      if(++f%90===0) col=rgb();
      const W=net.width,H=net.height; ctx.clearRect(0,0,W,H);
      mx+=(tmx-mx)*.04; my+=(tmy-my)*.04;
      const ry=t*0.00006+mx*.6, rx=my*.4;
      const sc=Math.min(W,H*1.6)*.55, F=2.6;
      const P=pts.map(p=>{const q=rot(p,rx,ry);const k=F/(F+q[2]);return {x:W/2+q[0]*sc*k*1.35,y:H/2+q[1]*sc*k*.8,z:q[2],k};});
      ctx.lineWidth=dpr;
      for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
        const dx=pts[i][0]-pts[j][0],dy=pts[i][1]-pts[j][1],dz=pts[i][2]-pts[j][2];
        const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d<.55){ctx.strokeStyle=`rgba(${col},${((1-d/.55)*.35*(P[i].k+P[j].k)/2).toFixed(3)})`;
          ctx.beginPath();ctx.moveTo(P[i].x,P[i].y);ctx.lineTo(P[j].x,P[j].y);ctx.stroke();}
      }
      for(const p of P){ctx.fillStyle=`rgba(${col},${(.25+.55*p.k/1.4).toFixed(2)})`;
        ctx.beginPath();ctx.arc(p.x,p.y,(1.2+1.6*p.k)*dpr,0,6.283);ctx.fill();}
    });
  }

  // ---- 4. interactive 3D object (drag to rotate) ----
  const obj=document.getElementById("fxObj");
  if(obj && obj.getContext){
    const {ctx,dpr}=setup(obj);
    const g=(1+Math.sqrt(5))/2;
    let V=[[-1,g,0],[1,g,0],[-1,-g,0],[1,-g,0],[0,-1,g],[0,1,g],[0,-1,-g],[0,1,-g],[g,0,-1],[g,0,1],[-g,0,-1],[-g,0,1]]
      .map(v=>{const l=Math.hypot(...v);return v.map(c=>c/l);});
    const E=[];
    for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){
      if(Math.hypot(V[i][0]-V[j][0],V[i][1]-V[j][1],V[i][2]-V[j][2])<1.1)E.push([i,j]);
    }
    let rx=.5,ry=0,vx=0,vy=0,drag=false,lx=0,ly=0,idle=0;
    obj.addEventListener("pointerdown",e=>{drag=true;lx=e.clientX;ly=e.clientY;obj.setPointerCapture(e.pointerId);});
    obj.addEventListener("pointermove",e=>{if(!drag)return;vy=(e.clientX-lx)*.012;vx=(e.clientY-ly)*.012;ry+=vy;rx+=vx;lx=e.clientX;ly=e.clientY;idle=0;});
    const up=()=>{drag=false;};
    obj.addEventListener("pointerup",up);obj.addEventListener("pointercancel",up);
    let col=rgb(),f=0;
    runWhenVisible(obj,t=>{
      if(++f%90===0) col=rgb();
      const W=obj.width,H=obj.height; ctx.clearRect(0,0,W,H);
      if(!drag){ vx*=.95;vy*=.95; rx+=vx; ry+=vy+(RM?0:.004); }
      const R=Math.min(W,H)*.27,F=3.4;
      const proj=(p,s=1)=>{const q=rot(p,rx,ry);const k=F/(F+q[2]);return {x:W/2+q[0]*R*s*k,y:H/2+q[1]*R*s*k,k,z:q[2]};};
      const A=V.map(v=>proj(v));
      ctx.lineWidth=1.2*dpr;
      for(const [i,j] of E){
        const a=A[i],b=A[j],al=.2+.45*((a.k+b.k)/2-.7);
        ctx.strokeStyle=`rgba(${col},${Math.max(.12,al).toFixed(2)})`;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      // inner counter-rotating core
      const B=V.map(v=>{const q=rot(v,-rx*1.3+t*.0004,-ry*1.3);const k=F/(F+q[2]);return {x:W/2+q[0]*R*.45*k,y:H/2+q[1]*R*.45*k};});
      ctx.strokeStyle=`rgba(${col},.35)`;
      for(const [i,j] of E){ctx.beginPath();ctx.moveTo(B[i].x,B[i].y);ctx.lineTo(B[j].x,B[j].y);ctx.stroke();}
      for(const a of A){ctx.fillStyle=`rgba(${col},${(.35+.5*(a.k-.7)).toFixed(2)})`;ctx.beginPath();ctx.arc(a.x,a.y,(2+2*a.k)*dpr,0,6.283);ctx.fill();}
      // four orbiting step nodes
      for(let n=0;n<4;n++){
        const ang=(RM?0:t*.0006)+n*Math.PI/2;
        const p=proj([Math.cos(ang)*1.55,Math.sin(ang)*.35,Math.sin(ang)*1.55],1);
        const r=(9+4*p.k)*dpr;
        ctx.fillStyle=`rgba(${col},.18)`;ctx.beginPath();ctx.arc(p.x,p.y,r*1.7,0,6.283);ctx.fill();
        ctx.fillStyle=`rgb(${col})`;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.283);ctx.fill();
        ctx.fillStyle="#04140d";ctx.font=`700 ${11*dpr}px Manrope,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(String(n+1),p.x,p.y+.5*dpr);
      }
    });
  }
})();
