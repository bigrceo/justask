import { APP_CSS, BRIDGE_JS, FEATHER_SVG, MARK_SVG } from "./appShell";

const q = (s: string) => s.replace(/"/g, '\\"');

/**
 * The one Just Ask card, used by review_launch (preview + Launch button), launch_coin (live, with a launch
 * animation) and coin_status (live). It reads the tool's structuredContent and, once a coin exists, keeps its
 * numbers fresh from the public API.
 */
export function coinCardHtml(site: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${APP_CSS}
.top{display:flex;gap:14px;align-items:center}
.img{width:64px;height:64px;border-radius:16px;object-fit:cover;background:var(--soft);flex:none;border:1px solid var(--line)}
.pick{width:64px;height:64px;border-radius:16px;flex:none;border:1.5px dashed var(--line);display:grid;place-items:center;cursor:pointer;color:var(--mute);font-size:22px;background:var(--soft);overflow:hidden}
.pick:hover{border-color:var(--ink);color:var(--ink)}
.pick img{width:100%;height:100%;object-fit:cover}
.name{font-size:18px;font-weight:650;letter-spacing:-.01em}
.tick{font-size:13px;color:var(--mute);margin-top:2px;display:flex;align-items:center;gap:6px}
.chg{font-size:12px;font-weight:600;padding:1px 7px;border-radius:99px;background:color-mix(in srgb,var(--ok) 15%,transparent);color:var(--ok)}
.chg.neg{background:color-mix(in srgb,var(--bad) 15%,transparent);color:var(--bad)}
.desc{font-size:13px;color:var(--mute);line-height:1.45}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cell{background:var(--soft);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}
.k{font-size:11px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}
.v{font-size:15px;font-weight:600;margin-top:3px;font-variant-numeric:tabular-nums}
.spark{position:absolute;right:8px;bottom:8px;width:90px;height:30px;opacity:.9}
.ca{display:flex;align-items:center;gap:8px;background:var(--soft);border-radius:12px;padding:9px 12px;font-size:12.5px}
.ca span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ca button{border:0;background:none;color:var(--mute);cursor:pointer;font-size:12px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;display:flex}
.bar i{display:block;height:100%;background:var(--ink)}
.bar b{display:block;height:100%;background:var(--accent)}
.legend{display:flex;justify-content:space-between;font-size:12px;color:var(--mute);margin-top:6px}
.row{display:flex;gap:8px;flex-wrap:wrap}
.launch{width:100%;justify-content:center;padding:12px;font-size:15px;font-weight:600;border-radius:14px}
.launch[disabled]{opacity:.45;cursor:not-allowed}
.note{font-size:12px;color:var(--mute);text-align:center}
.err{font-size:12.5px;color:var(--bad);text-align:center}
.steps{display:flex;flex-direction:column;gap:8px;padding:6px 2px}
.step{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--mute);transition:color .3s}
.step.on{color:var(--ink)}
.step .s{width:18px;height:18px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center;font-size:11px;flex:none}
.step.on .s{border-color:var(--ink);border-top-color:transparent;animation:spin .8s linear infinite}
.step.done .s{border-color:var(--ok);background:var(--ok);color:#fff;animation:none}
@keyframes spin{to{transform:rotate(360deg)}}
.boom{position:fixed;inset:0;pointer-events:none;overflow:hidden}
.boom i{position:absolute;top:-10px;width:7px;height:11px;border-radius:2px;animation:fall 1.6s cubic-bezier(.2,.6,.4,1) forwards}
@keyframes fall{to{transform:translateY(520px) rotate(540deg);opacity:0}}
input{display:none}
</style></head><body>
<div class="card" id="root"><div class="head"><span class="brand">${MARK_SVG} Just Ask</span></div><div class="desc">Loading…</div></div>
<input id="file" type="file" accept="image/*">
<script>${BRIDGE_JS}
var SITE=${JSON.stringify(site)}, FEATHER="${q(FEATHER_SVG)}", MARK="${q(MARK_SVG)}", state=null, poll=null;
function money(n){n=Number(n||0);if(n>0&&n<0.01)return '<$0.01';return n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(1)+'K':'$'+n.toFixed(2)}
function short(a){return a?a.slice(0,6)+'…'+a.slice(-4):''}
function $(id){return document.getElementById(id)}
function head(chip){return '<div class="head"><span class="brand">'+MARK+' Just Ask</span>'+chip+'</div>'}
function liveChip(){return '<span class="chip"><span class="dot"></span>Live on '+FEATHER+' Robinhood Chain</span>'}
function split(c){var u=(c.userBps||0)/100,b=100-u;return '<div><div class="bar"><i style="width:'+u+'%"></i><b style="width:'+b+'%"></b></div><div class="legend"><span>'+(u?u+'% of fees → '+short(c.wallet):'No wallet given')+'</span><span>'+b+'% → $ASK burn</span></div></div>'}
function sparkSvg(p){if(!p||p.length<2)return '';var mn=Math.min.apply(0,p),mx=Math.max.apply(0,p),r=mx-mn||1,w=90,h=30;
  var d=p.map(function(v,i){return (i?'L':'M')+(i*w/(p.length-1)).toFixed(1)+' '+(h-2-(v-mn)/r*(h-4)).toFixed(1)}).join(' ');
  var up=p[p.length-1]>=p[0];return '<svg class="spark" viewBox="0 0 90 30"><path d="'+d+'" fill="none" stroke="'+(up?'var(--ok)':'var(--bad)')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}

/* ---------- review: preview + Launch ---------- */
function renderReview(c){
  state=c;
  var img=c.image?'<img src="'+esc(c.image)+'" alt="">':'＋';
  $('root').innerHTML=head('<span class="chip">Review launch</span>')+
   '<div class="top rise"><div class="pick" id="pick" title="Choose a picture">'+img+'</div><div><div class="name">'+esc(c.name)+'</div><div class="tick">$'+esc(c.ticker)+' · paired with NVDA</div></div></div>'+
   (c.description?'<div class="desc rise">'+esc(c.description)+'</div>':'')+
   '<div class="rise">'+split(c)+'</div>'+
   '<button class="btn primary launch rise" id="go">'+(c.image?'Launch $'+esc(c.ticker):'Add a picture to launch')+'</button>'+
   '<div class="note" id="note">Free to launch. You approve it here, nothing goes live before you tap.</div>';
  $('pick').onclick=function(){$('file').click()};
  $('go').disabled=!c.image;
  $('go').onclick=launch;
  size();
}
$('file').onchange=function(){var f=$('file').files[0];$('file').value='';if(!f)return;
  $('pick').innerHTML='<img src="'+URL.createObjectURL(f)+'" alt="">';$('note').textContent='Uploading the picture…';
  fetch(SITE+'/api/picture?review='+encodeURIComponent(state.reviewId||''),{method:'POST',headers:{'content-type':f.type},body:f}).then(function(r){return r.json()}).then(function(j){
    if(!j.ok)throw new Error(j.error||'upload');state.image=j.url;
    $('go').disabled=false;$('go').textContent='Launch $'+state.ticker;$('note').textContent='Picture ready.';
  }).catch(function(e){$('note').innerHTML='<span class="err">'+esc(e.message==='upload'?"The upload didn't go through. Try again.":e.message)+'</span>'})};

function callTool(name,args){
  if(window.openai&&window.openai.callTool)return window.openai.callTool(name,args);
  return rpc('tools/call',{name:name,arguments:args},120000);
}
function launch(){
  $('go').disabled=true;
  $('root').innerHTML=head('<span class="chip">Launching</span>')+
   '<div class="top"><img class="img" src="'+esc(state.image)+'" alt=""><div><div class="name">'+esc(state.name)+'</div><div class="tick">$'+esc(state.ticker)+'</div></div></div>'+
   '<div class="steps"><div class="step on" id="s1"><span class="s"></span>Creating the coin on Robinhood Chain</div><div class="step" id="s2"><span class="s"></span>Locking your fee split on chain</div><div class="step" id="s3"><span class="s"></span>Opening trading</div></div>';
  size();
  var t1=setTimeout(function(){$('s1').className='step done';$('s1').firstChild.textContent='✓';$('s2').className='step on'},2500);
  var t2=setTimeout(function(){$('s2').className='step done';$('s2').firstChild.textContent='✓';$('s3').className='step on'},5000);
  callTool('launch_coin',{review_id:state.reviewId}).then(function(r){
    clearTimeout(t1);clearTimeout(t2);
    var sc=r&&(r.structuredContent||(r.result&&r.result.structuredContent));
    if(!sc||!sc.token){var t=r&&r.content&&r.content[0]&&r.content[0].text;throw new Error(t||"The launch didn't go through.")}
    renderLive(sc,true);
    var said='The user tapped Launch on the Just Ask card: $'+sc.ticker+' is live on Robinhood Chain, CA '+sc.token+'. Do not launch it again.';
    rpc('ui/update-model-context',{content:[{type:'text',text:said}],structuredContent:{launched:sc.token}}).catch(function(){});
  }).catch(function(e){
    renderReview(state);
    var msg=e.message==='no reply'||/not (allowed|supported|found)|permission/i.test(e.message)
      ?"The chat app didn't let the card launch it. Just say <b>go</b> in the chat and it launches with this picture."
      :esc(e.message);
    $('note').innerHTML='<span class="err">'+msg+'</span>';
  });
}

/* ---------- live coin ---------- */
function renderLive(c,boom){
  state=c;
  var chg=Number(c.changePct||0),cls=chg<0?'chg neg':'chg';
  $('root').innerHTML=head(c.kind==='status'?'<span class="chip">Coin status</span>':liveChip())+
   '<div class="top rise"><img class="img" src="'+esc(c.image)+'" alt=""><div><div class="name">'+esc(c.name)+'</div><div class="tick">$'+esc(c.ticker)+' <span class="'+cls+'" id="chg">'+(chg>=0?'+':'')+chg.toFixed(1)+'%</span></div></div></div>'+
   '<div class="ca rise mono"><span>'+esc(c.token)+'</span><button id="cp">Copy CA</button></div>'+
   '<div class="grid rise"><div class="cell"><div class="k">Market cap</div><div class="v" id="mc">'+money(c.mcapUsd)+'</div><span id="sp">'+sparkSvg(c.spark)+'</span></div><div class="cell"><div class="k">Paid to creator</div><div class="v" id="pd">'+money(c.paidUsd)+'</div></div></div>'+
   '<div class="rise">'+split(c)+'</div>'+
   '<div class="row rise"><a class="btn primary" id="share">Share on X</a><a class="btn" id="page">Coin page ↗</a><a class="btn" id="scan">Blockscout ↗</a></div>';
  $('cp').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(c.token);this.textContent='Copied ✓'};
  $('share').onclick=function(){openLink('https://x.com/intent/tweet?text='+encodeURIComponent('I just launched $'+c.ticker+' on Robinhood Chain by asking my AI.\\n\\nOne sentence. No wallet, no code, free.')+'&url='+encodeURIComponent(SITE+'/c/'+c.token.slice(2,10).toLowerCase()))};
  $('page').onclick=function(){openLink(SITE+'/c/'+c.token)};
  $('scan').onclick=function(){openLink('https://robinhoodchain.blockscout.com/token/'+c.token)};
  if(boom)confetti();
  size();
  clearInterval(poll);poll=setInterval(refresh,15000);
}
function refresh(){fetch(SITE+'/api/coins/'+state.token).then(function(r){return r.json()}).then(function(j){var c=j.coin;if(!c)return;
  $('mc').textContent=money(c.mcapUsd);$('pd').textContent=money(c.paidUsd);$('sp').innerHTML=sparkSvg(c.spark);
  var chg=Number(c.changePct||0);$('chg').textContent=(chg>=0?'+':'')+chg.toFixed(1)+'%';$('chg').className=chg<0?'chg neg':'chg';}).catch(function(){})}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var b=document.createElement('div');b.className='boom';var cs=['#fff27a','#0b0b0c','#16a34a','#f4f4f5','#D97757'];
  for(var i=0;i<60;i++){var p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cs[i%cs.length];p.style.animationDelay=Math.random()*.4+'s';b.appendChild(p)}
  document.body.appendChild(b);setTimeout(function(){b.remove()},2200)}

onResult=function(c){if(!c)return;if(c.kind==='review')renderReview(c);else if(c.token)renderLive(c,c.kind==='launch')};
size();
</script></body></html>`;
}

/** List card for my_coins and top_coins. */
export function listCardHtml(site: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${APP_CSS}
.sum{display:flex;gap:8px}
.cell{flex:1;background:var(--soft);border-radius:12px;padding:10px 12px}
.k{font-size:11px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}
.v{font-size:16px;font-weight:650;margin-top:3px;font-variant-numeric:tabular-nums}
.list{display:flex;flex-direction:column}
.it{display:flex;align-items:center;gap:12px;padding:10px 4px;border-top:1px solid var(--line);cursor:pointer;border-radius:10px}
.it:first-child{border-top:0}
.it:hover{background:var(--soft)}
.n{width:18px;font-size:12px;color:var(--mute);text-align:right;flex:none}
.it img{width:40px;height:40px;border-radius:11px;object-fit:cover;background:var(--soft);flex:none}
.m{flex:1;min-width:0}.m b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.m span{font-size:12px;color:var(--mute)}
.r{text-align:right;font-variant-numeric:tabular-nums}.r b{display:block;font-size:14px}.r span{font-size:12px;font-weight:600}
.up{color:var(--ok)}.dn{color:var(--bad)}
.row{display:flex;gap:8px}
.empty{font-size:13.5px;color:var(--mute);padding:8px 0}
</style></head><body>
<div class="card" id="root"><div class="head"><span class="brand">${MARK_SVG} Just Ask</span></div><div class="empty">Loading…</div></div>
<script>${BRIDGE_JS}
var SITE=${JSON.stringify(site)}, MARK="${q(MARK_SVG)}";
function money(n){n=Number(n||0);if(n>0&&n<0.01)return '<$0.01';return n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(1)+'K':'$'+n.toFixed(2)}
onResult=function(d){if(!d||!d.coins)return;
  var total=d.coins.reduce(function(a,c){return a+Number(c.paidUsd||0)},0);
  var h='<div class="head"><span class="brand">'+MARK+' Just Ask</span><span class="chip">'+esc(d.title)+'</span></div>';
  if(d.kind==='mine')h+='<div class="sum rise"><div class="cell"><div class="k">Coins</div><div class="v">'+d.coins.length+'</div></div><div class="cell"><div class="k">Earned</div><div class="v">'+money(total)+'</div></div></div>';
  if(!d.coins.length)h+='<div class="empty">'+(d.kind==='mine'?'No coins launched from this wallet yet. Ask me to launch one.':'No coins yet. Be the first: ask me to launch one.')+'</div>';
  else h+='<div class="list rise">'+d.coins.map(function(c,i){var ch=Number(c.changePct||0);
    return '<div class="it" data-ca="'+esc(c.token)+'"><span class="n">'+(i+1)+'</span><img src="'+esc(c.image)+'" alt=""><div class="m"><b>'+esc(c.name)+'</b><span>$'+esc(c.ticker)+(d.kind==='mine'?' · earned '+money(c.paidUsd):'')+'</span></div><div class="r"><b>'+money(c.mcapUsd)+'</b><span class="'+(ch<0?'dn':'up')+'">'+(ch>=0?'+':'')+ch.toFixed(1)+'%</span></div></div>'}).join('')+'</div>';
  h+='<div class="row"><a class="btn" id="all">See all coins ↗</a></div>';
  document.getElementById('root').innerHTML=h;
  Array.prototype.forEach.call(document.querySelectorAll('.it'),function(el){el.onclick=function(){openLink(SITE+'/c/'+el.getAttribute('data-ca'))}});
  document.getElementById('all').onclick=function(){openLink(SITE+'/explore')};
  size();
};
size();
</script></body></html>`;
}
