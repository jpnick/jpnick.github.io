/* UI: แถบความคืบหน้า แอคคอร์เดียน แท็บ เอฟเฟกต์ และกราฟการค้า */
(function(){

  var prog=document.getElementById('progress');
  window.addEventListener('scroll',function(){var h=document.documentElement;prog.style.width=(h.scrollTop)/(h.scrollHeight-h.clientHeight)*100+'%'});

  document.querySelectorAll('.acc-head').forEach(function(b){
    b.addEventListener('click',function(){b.closest('.acc').classList.toggle('open')});
  });

  // Tabs: enable JS mode only after successful wiring, so content is never lost if JS fails
  var tabs=document.getElementById('tabs');
  var panes=document.querySelectorAll('.tabpane');
  if(tabs && panes.length){
    document.body.classList.add('js-tabs');
    tabs.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      tabs.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on');
      panes.forEach(function(p){p.classList.remove('on')});
      var target=document.getElementById(b.getAttribute('data-t'));
      if(target){target.classList.add('on');}
      else{document.body.classList.remove('js-tabs');} // fallback: show everything
    });
  }

  function runCount(el){
    if(el.dataset.done)return; el.dataset.done=1;
    var to=parseFloat(el.getAttribute('data-to'));
    var dec=el.getAttribute('data-dec')?parseInt(el.getAttribute('data-dec')):0;
    var start=null;
    function step(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/1100,1);
      var v=to*(0.15+0.85*p*(2-p));
      el.textContent=dec?v.toFixed(dec):Math.round(v).toLocaleString();
      if(p<1)requestAnimationFrame(step);
      else el.textContent=dec?to.toFixed(dec):Math.round(to).toLocaleString();
    }
    requestAnimationFrame(step);
  }

  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          e.target.querySelectorAll('.count').forEach(runCount);
          io.unobserve(e.target);
        }
      });
    },{threshold:0,rootMargin:'0px 0px -60px 0px'});
    reveals.forEach(function(el){io.observe(el)});
  }else{
    reveals.forEach(function(el){el.classList.add('in')});
  }
  document.querySelectorAll('.hero .count').forEach(runCount);


  /* ===== SECTION 4 CHART ===== */
  (function(){
    var svg=document.getElementById('chart'); if(!svg) return;
    var tip=document.getElementById('ctip');
    var NS='http://www.w3.org/2000/svg';
    var years=[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
    var cn=[385,372,385,428,456,507,683,767,757,861,1036];
    var th=[375,383,418,447,461,487,618,568,505,479,497];
    var C_CN='#2f5d3a', C_TH='#d2702c';
    var W=860,H=400,mL=58,mR=18,mT=18,mB=54;
    var pw=W-mL-mR, ph=H-mT-mB;
    var mode='bar', show={cn:true,th:true};
    function L(t,e){return (window.__LANG==='en')?e:t;}

    function maxY(){
      var v=[0];
      if(mode==='gap'){ for(var i=0;i<years.length;i++) v.push(Math.abs(th[i]-cn[i])); }
      else { if(show.cn) v=v.concat(cn); if(show.th) v=v.concat(th); }
      var m=Math.max.apply(null,v); if(m<=0) m=100;
      m=m*1.08;
      var mag=Math.pow(10,Math.floor(Math.log(m)/Math.LN10));
      var nice=[1,1.2,1.5,2,2.5,3,4,5,6,8,10],r=m/mag;
      for(var k=0;k<nice.length;k++){ if(r<=nice[k]){ r=nice[k]; break; } }
      return r*mag;
    }
    function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function X(i){return mL+pw*(i+0.5)/years.length;}
    function Y(v,mx){var lo=(mode==='gap')?-mx:0;return mT+ph-((v-lo)/(mx-lo))*ph;}

    function draw(){
      while(svg.firstChild) svg.removeChild(svg.firstChild);
      var mx=maxY(), ticks=(mode==='gap')?6:5, i, g;

      var lo=(mode==='gap')?-mx:0;
      for(i=0;i<=ticks;i++){
        var val=lo+(mx-lo)*i/ticks, y=Y(val,mx);
        svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:y,y2:y,stroke:'#e2ddd2','stroke-width':1,'stroke-dasharray':i?'3 5':'0'}));
        var t=el('text',{x:mL-10,y:y+4,'text-anchor':'end','font-size':12,fill:'#8a8375','font-family':'Kanit,sans-serif'});
        var rv=Math.round(val);
        t.textContent=(rv<0?'\u2212':'')+Math.abs(rv); svg.appendChild(t);
      }
      var ax=el('text',{x:mL-10,y:mT-4,'text-anchor':'end','font-size':11,fill:'#b0a897','font-family':'Kanit,sans-serif'});
      ax.textContent=L('亿美元','100M USD'); svg.appendChild(ax);

      for(i=0;i<years.length;i++){
        var tx=el('text',{x:X(i),y:H-mB+22,'text-anchor':'middle','font-size':12,fill:'#6a6256','font-family':'Kanit,sans-serif'});
        tx.textContent=years[i]; svg.appendChild(tx);
      }

      var band=pw/years.length;
      if(mode==='bar'){
        var n=(show.cn?1:0)+(show.th?1:0), bw=Math.min(20,(band*0.62)/(n||1));
        for(i=0;i<years.length;i++){
          var off=0, cx=X(i), start=cx-(bw*n+(n>1?4:0))/2;
          if(show.cn){ bar(start+off,cn[i],mx,bw,C_CN,i); off+=bw+(n>1?4:0); }
          if(show.th){ bar(start+off,th[i],mx,bw,C_TH,i); }
        }
      } else if(mode==='line'){
        if(show.cn) series(cn,mx,C_CN);
        if(show.th) series(th,mx,C_TH);
      } else {
        var zeroY=Y(0,mx);
        svg.appendChild(el('line',{x1:mL,x2:W-mR,y1:zeroY,y2:zeroY,stroke:'#9a9382','stroke-width':1.5}));
        for(i=0;i<years.length;i++){
          var d=th[i]-cn[i], bw2=Math.min(30,band*0.5);
          var vy=Y(d,mx), neg=d<0;
          var by=Math.min(vy,zeroY), hh=Math.abs(vy-zeroY);
          var r=el('rect',{x:X(i)-bw2/2,y:zeroY,width:bw2,height:0,rx:5,
            fill:neg?'#c0413b':'#2f5d3a',opacity:.9});
          svg.appendChild(r);
          (function(rr,yy,hgt,dl){requestAnimationFrame(function(){
            rr.setAttribute('style','transition:y .7s cubic-bezier(.2,.8,.2,1) '+dl+'s,height .7s cubic-bezier(.2,.8,.2,1) '+dl+'s');
            rr.setAttribute('y',yy); rr.setAttribute('height',Math.max(hgt,1));
          });})(r,by,hh,i*0.035);
          var ly=neg?(vy+15):(vy-8);
          var lb=el('text',{x:X(i),y:ly,'text-anchor':'middle','font-size':11.5,
            fill:neg?'#a8231f':'#2f5d3a','font-weight':600,'font-family':'Kanit,sans-serif'});
          lb.textContent=(d>0?'+':d<0?'\u2212':'')+Math.abs(d); svg.appendChild(lb);
        }
      }

      for(i=0;i<years.length;i++){
        var hit=el('rect',{x:mL+band*i,y:mT,width:band,height:ph,fill:'transparent','data-i':i,style:'cursor:crosshair'});
        hit.addEventListener('mouseenter',onHover); hit.addEventListener('mousemove',onHover);
        hit.addEventListener('mouseleave',hide);
        hit.addEventListener('touchstart',function(ev){onHover(ev);},{passive:true});
        svg.appendChild(hit);
      }
    }

    function bar(x,v,mx,bw,col,i){
      var hh=(v/mx)*ph;
      var r=el('rect',{x:x,y:mT+ph,width:bw,height:0,rx:4,fill:col,opacity:.92});
      svg.appendChild(r);
      requestAnimationFrame(function(){
        r.setAttribute('style','transition:y .7s cubic-bezier(.2,.8,.2,1) '+(i*0.035)+'s,height .7s cubic-bezier(.2,.8,.2,1) '+(i*0.035)+'s');
        r.setAttribute('y',mT+ph-hh); r.setAttribute('height',Math.max(hh,1));
      });
    }
    function series(arr,mx,col){
      var d='',i;
      for(i=0;i<arr.length;i++){ d+=(i?' L':'M')+X(i)+' '+Y(arr[i],mx); }
      var area=d+' L'+X(arr.length-1)+' '+(mT+ph)+' L'+X(0)+' '+(mT+ph)+' Z';
      svg.appendChild(el('path',{d:area,fill:col,opacity:.10}));
      var p=el('path',{d:d,fill:'none',stroke:col,'stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'});
      svg.appendChild(p);
      try{ var L=p.getTotalLength();
        p.setAttribute('stroke-dasharray',L); p.setAttribute('stroke-dashoffset',L);
        requestAnimationFrame(function(){ p.setAttribute('style','transition:stroke-dashoffset 1.1s ease'); p.setAttribute('stroke-dashoffset',0); });
      }catch(e){}
      for(i=0;i<arr.length;i++){
        svg.appendChild(el('circle',{cx:X(i),cy:Y(arr[i],mx),r:4,fill:'#fff',stroke:col,'stroke-width':2.5}));
      }
    }

    function onHover(ev){
      var i=+ (ev.target.getAttribute('data-i'));
      if(isNaN(i)) return;
      var d=th[i]-cn[i];
      var html='<span class="ty">'+L('ปี ','Year ')+years[i]+'</span>';
      html+='<div class="tr"><span><i style="background:'+C_CN+'"></i>'+L('ไทยนำเข้าจากจีน','Imports from China')+'</span><b>'+cn[i].toLocaleString()+'</b></div>';
      html+='<div class="tr"><span><i style="background:'+C_TH+'"></i>'+L('ไทยส่งออกไปจีน','Exports to China')+'</span><b>'+th[i].toLocaleString()+'</b></div>';
      html+='<div class="tg">'+(d<0?L('ไทยขาดดุล \u2212','Deficit \u2212'):L('ไทยเกินดุล +','Surplus +'))+Math.abs(d).toLocaleString()+' (亿美元)</div>';
      tip.innerHTML=html; tip.hidden=false;
      var rect=svg.getBoundingClientRect(), scale=rect.width/W;
      tip.style.left=(X(i)*scale)+'px';
      tip.style.top=(mT*scale+10)+'px';
    }
    function hide(){ tip.hidden=true; }

    document.getElementById('cmodes').addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      this.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on'); mode=b.getAttribute('data-m'); hide(); draw();
    });
    document.getElementById('clegend').addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      var k=b.getAttribute('data-s');
      if(show[k] && !(show.cn&&show.th)) return;
      show[k]=!show[k]; b.classList.toggle('on',show[k]); hide(); draw();
    });

    var last=cn.length-1, gap=th[last]-cn[last];
    document.getElementById('csA').textContent=cn[last].toLocaleString();
    document.getElementById('csB').textContent=th[last].toLocaleString();
    document.getElementById('csC').textContent=(gap<0?'\u2212':'+')+Math.abs(gap).toLocaleString();
    document.getElementById('csD').textContent='+'+Math.round((cn[last]/cn[0]-1)*100)+'%';

    window.__redrawChart=function(){ hide(); draw(); };
    var started=false;
    function boot(){ if(started) return; started=true; draw(); }
    if('IntersectionObserver' in window){
      var o=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){boot();o.disconnect();}})},{threshold:.12});
      o.observe(svg);
    } else boot();
    setTimeout(boot,1200);
    var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){hide();},120)});
  })();

  // safety: never leave content invisible
  window.addEventListener('load',function(){
    setTimeout(function(){
      document.querySelectorAll('.reveal:not(.in)').forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.top<window.innerHeight*1.5){el.classList.add('in');el.querySelectorAll('.count').forEach(runCount);}
      });
    },500);
  });

})();
