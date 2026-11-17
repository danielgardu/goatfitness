// Equipment-aware choreography for the movements called out in the visual review.
const TAU=Math.PI*2;
const P=(x,y,z=0)=>[x,y,z];
const add=(p,x,y,z=0)=>[p[0]+x,p[1]+y,p[2]+z];
const mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
const ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
function key(u,stops){
  for(let i=1;i<stops.length;i++)if(u<=stops[i][0]){
    const [a,av]=stops[i-1],[b,bv]=stops[i];return av+(bv-av)*ease((u-a)/(b-a));
  }
  return stops.at(-1)[1];
}
const target=(u,stops)=>[0,1,2].map(i=>key(u,stops.map(([t,p])=>[t,p[i]])));
function torso(p,hip,lean=0){
  p.H=hip;p.S=add(hip,Math.sin(lean)*.86,Math.cos(lean)*.86);
  p.N=add(p.S,Math.sin(lean)*.36,Math.cos(lean)*.36);
}
function bench(p){
  p.H=P(.4,.97);p.S=P(-.46,.97);p.N=P(-.82,.97);
  p.LF=P(.93,.1,-.32);p.RF=P(.93,.1,.32);
  p.angles.legPoleL=[1,.15,-.3];p.angles.legPoleR=[1,.15,.3];
}
export function stairPosition(phase){return [.55-1.4*phase,.93-.76*phase];}

export function reviewedActivity(p,id,t,phase,sampleRelease,api){
  const s=Math.sin(t),c=Math.cos(t);
  switch(id){
    case 'benchPress':case 'skullCrusher':{
      bench(p);
      const rep=key(phase,[[0,0],[.12,0],[.43,1],[.59,1],[.93,0],[1,0]]);
      for(const [i,side] of ['L','R'].entries()){
        const z=i?1:-1;
        if(id==='benchPress')p[side+'W']=P(-.46,1.18+.67*rep,z*.48);
        else{
          p[side+'E']=P(-.46,1.45,z*.19);
          const angle=-3.13+1.48*rep;
          p[side+'W']=add(p[side+'E'],Math.sin(angle)*.46,-Math.cos(angle)*.46);
        }
        p.angles['armPole'+side]=[0,0,z];
      }
      break;
    }
    case 'calisthenics':{
      const pull=ease((1-c)/2);
      // The chin passes in front of the bar; the bar never passes through the head.
      torso(p,P(-.4,1.64+.65*pull),-.025);
      p.LW=P(0,3.2,-.57);p.RW=P(0,3.2,.57);
      p.LF=add(p.H,-.28,-1.01,-.16);p.RF=add(p.H,-.28,-1.01,.16);
      p.angles.armPoleL=[-.1,0,-1];p.angles.armPoleR=[-.1,0,1];
      break;
    }
    case 'legTraining':{
      const squat=key(phase,[[0,0],[.1,0],[.46,1],[.56,1],[.88,0],[1,0]]);
      torso(p,P(-.3*squat,1.18-.52*squat),.04+.44*squat);
      p.LF=P(.1,.1,-.34);p.RF=P(.1,.1,.34);
      p.LW=add(p.S,.73,-.18,-.23);p.RW=add(p.S,.73,-.18,.23);
      p.angles.legPoleL=[1,0,-.2];p.angles.legPoleR=[1,0,.2];
      break;
    }
    case 'weightlifter':{
      const hip=key(phase,[[0,.66],[.14,.56],[.3,1.13],[.4,.95],[.53,1.16],[.66,1.16],[.78,.98],[.9,.66],[1,.66]]);
      const lean=key(phase,[[0,.4],[.14,.4],[.3,.04],[.4,.08],[.46,-.08],[.53,0],[.66,0],[.73,-.08],[.78,.1],[.9,.4],[1,.4]]);
      torso(p,P(0,hip),lean);p.LF=P(.06,.1,-.32);p.RF=P(.06,.1,.32);
      const y=key(phase,[[0,.7],[.14,.7],[.3,1.94],[.4,1.9],[.53,2.9],[.66,2.9],[.78,1.9],[.9,.7],[1,.7]]);
      const x=key(phase,[[0,.53],[.14,.53],[.3,.45],[.4,.5],[.46,.66],[.5,.55],[.53,.08],[.66,.08],[.7,.56],[.75,.66],[.78,.5],[.9,.53],[1,.53]]);
      p.LW=P(x,y,-.44);p.RW=P(x,y,.44);
      p.angles.armPoleL=[.2,-.4,-1];p.angles.armPoleR=[.2,-.4,1];
      break;
    }
    case 'elliptical':
      torso(p,P(0,1.33+.015*Math.cos(t*2)),.08);
      for(const [i,side] of ['L','R'].entries()){
        const q=t+i*Math.PI,z=i?.24:-.24;
        p[side+'F']=P(.42*Math.cos(q),.38-.12*Math.sin(q),z);
        p[side+'W']=P(.53-.19*Math.cos(q),1.9,z);
        p[side+'FootPitch']=.04*Math.cos(q);
      }
      break;
    case 'stairClimber':{
      torso(p,P(-.16,1.55+.014*Math.cos(t*2)),.12);
      for(const [i,side] of ['L','R'].entries()){
        const q=(phase+i*.5)%1,z=i?.23:-.23,stance=.58;
        let foot;
        if(q<stance){const [x,y]=stairPosition(q);foot=P(x,y+.1,z);}
        else{
          const u=(q-stance)/(1-stance),v=1-u,[x,y]=stairPosition(stance);
          foot=P(v**3*x+3*v*v*u*-.4+3*v*u*u*.82+u**3*.55,
            v**3*(y+.1)+3*v*v*u*1.3+3*v*u*u*1.3+u**3*1.03,z);
        }
        p[side+'F']=foot;p[side+'W']=P(.68,2.08,i?.47:-.47);
        p.angles['legPole'+side]=[1,0,i?.1:-.1];
      }
      p.props.stepPhase=phase;
      break;
    }
    case 'volleyball':{
      const dip=key(phase,[[0,0],[.12,0],[.32,1],[.49,0],[1,0]]);
      torso(p,P(0,1.13-.2*dip),.035);
      p.LF=P(.02,.1,-.31);p.RF=P(.02,.1,.31);
      const hand=target(phase,[[0,P(.4,-.32)],[.16,P(.4,-.32)],[.32,P(.34,.54)],
        [.43,P(.34,.73)],[.51,P(.35,.87)],[.7,P(.5,.15)],[.9,P(.4,-.32)],[1,P(.4,-.32)]]);
      p.LW=add(p.S,hand[0],hand[1],-.13);p.RW=add(p.S,hand[0],hand[1],.13);
      p.angles.armPoleL=[.2,-.3,-1];p.angles.armPoleR=[.2,-.3,1];
      if(sampleRelease)break;
      const contact=api.releasePosition(id,.43,[0,.23,-.13]);
      if(phase<=.43)p.props.ball=mix(add(contact,2.5,1,0),contact,ease(phase/.43));
      else{
        const u=(phase-.43)/.57;
        p.props.ball=mix(contact,P(3.7,1.3,0),u);p.props.ball[1]+=.9*Math.sin(Math.PI*u);
      }
      p.props.ballScale=ease(phase/.06)*(1-ease((phase-.93)/.07));
      break;
    }
    case 'baseball':{
      const power=key(phase,[[0,0],[.3,0],[.46,1],[.66,.8],[.92,0],[1,0]]);
      torso(p,P(.12*power,1.07),.07+.055*power);
      p.LF=P(.18+.18*power,.1,-.25);p.RF=P(-.3,.1,.25);
      p.angles.shoulderYaw=key(phase,[[0,.2],[.28,.62],[.46,-.55],[.67,-1.05],[.9,.2],[1,.2]]);
      p.angles.hipYaw=p.angles.shoulderYaw*.5;
      p.RW=target(phase,[[0,add(p.S,.05,.01,.43)],[.27,add(p.S,-.12,.06,.43)],
        [.46,add(p.S,.58,-.4,-.02)],[.67,add(p.S,.2,-.15,-.45)],
        [.83,add(p.S,.4,-.3,.15)],[.95,add(p.S,.05,.01,.43)],[1,add(p.S,.05,.01,.43)]]);
      const yaw=key(phase,[[0,-.4],[.28,-.65],[.43,.9],[.46,1.5],[.65,2.5],[.75,2.6],[.95,-.4],[1,-.4]]);
      const elevation=key(phase,[[0,1.15],[.28,1.15],[.43,.25],[.46,.05],[.65,.65],[.75,.8],[.95,1.15],[1,1.15]]);
      p.props.implementDirection=P(Math.cos(elevation)*Math.cos(yaw),Math.sin(elevation),-Math.cos(elevation)*Math.sin(yaw));
      p.LW=api.implementPoint(p,[0,.12,0]);
      p.angles.armPoleL=[.1,-1,-.4];p.angles.armPoleR=[.1,-1,.4];
      p.RFootPitch=.14*power;p.LFootYaw=-.18*power;
      if(!sampleRelease){
        api.strikeFlight(p,id,phase);
        if(phase>.46){const u=(phase-.46)/.54;p.props.ball[0]+=2.5*u;p.props.ball[1]+=.9*u;}
      }
      break;
    }
    case 'hockey':{
      const sweep=key(phase,[[0,0],[.14,0],[.31,-.75],[.5,1],[.67,.7],[.91,0],[1,0]]);
      torso(p,P(-.08+.04*sweep,.92, .045*sweep),.45);
      p.LF=P(.15,.18,-.35);p.RF=P(-.2,.18,.35);
      p.angles.shoulderYaw=-.25*sweep;p.angles.hipYaw=-.12*sweep;
      const angle=.12+.18*sweep;
      p.RW=P(.4+.23*sweep,.055+1.25*Math.cos(angle)-.22*Math.sin(angle),.2-.25*sweep);
      p.props.implementRotation=[0,0,angle];p.LW=api.implementPoint(p,[0,-.32,0]);
      p.angles.armPoleL=[.1,-1,-.4];p.angles.armPoleR=[.1,-1,.4];
      p.LFootYaw=-.12;p.RFootYaw=.12;
      if(!sampleRelease)api.strikeFlight(p,id,phase);
      break;
    }
    default:return false;
  }
  return true;
}
