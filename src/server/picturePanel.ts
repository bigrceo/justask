import { SITE_URL } from "@/lib/brand";
import { APP_CSS, MARK_SVG } from "./appShell";

/** MCP App shown inside the chat (Claude, and ChatGPT's MCP Apps support): pick a picture, upload, hand back an id. */
export function picturePanelHtml(site = SITE_URL) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${APP_CSS}
#drop{display:flex;align-items:center;gap:14px;border:1.5px dashed var(--line);border-radius:14px;padding:14px;cursor:pointer;transition:.2s}
#drop.over,#drop:hover{border-color:var(--ink);background:var(--soft)}
#thumb{width:56px;height:56px;border-radius:14px;background:var(--ink);color:var(--bg);display:grid;place-items:center;overflow:hidden;flex:none;font-size:24px}
#thumb img{width:100%;height:100%;object-fit:cover}
#what{display:flex;flex-direction:column;font-size:14px}#what b{color:var(--ink)}#what span{color:var(--mute);font-size:12px;margin-top:2px}
.status{font-size:12.5px;color:var(--mute);min-height:16px}.status.ok{color:var(--ok)}.status.bad{color:var(--bad)}
input{display:none}
</style></head><body>
<div class="card">
  <div class="head"><span class="brand">${MARK_SVG} Just Ask</span><span class="chip">Coin picture</span></div>
  <label id="drop" for="file">
    <div id="thumb">＋</div>
    <div id="what"><b>Choose a picture</b><span>PNG, JPEG, GIF or WebP · or drop it here</span></div>
  </label>
  <input id="file" type="file" accept="image/*">
  <div id="status" class="status">Nothing is launched from here.</div>
</div>
<script>
(function(){
  var SITE=${JSON.stringify(site)}, LIMIT=4000000, $=function(i){return document.getElementById(i)}, nextId=1, pending={};
  function rpc(m,p){var id=nextId++;parent.postMessage({jsonrpc:'2.0',id:id,method:m,params:p||{}},'*');return new Promise(function(res,rej){pending[id]={res:res,rej:rej};setTimeout(function(){if(pending[id]){delete pending[id];rej(new Error('no reply'))}},8000)})}
  function notify(m,p){parent.postMessage({jsonrpc:'2.0',method:m,params:p||{}},'*')}
  function size(){notify('ui/notifications/size-changed',{height:document.body.scrollHeight})}
  function theme(t){document.documentElement.classList.toggle('dark',t==='dark')}
  function status(t,c){var s=$('status');s.textContent=t;s.className='status'+(c?' '+c:'');size()}
  addEventListener('message',function(e){var m=e.data;if(!m||m.jsonrpc!=='2.0')return;
    if(m.id!=null&&pending[m.id]&&(('result' in m)||m.error)){var p=pending[m.id];delete pending[m.id];m.error?p.rej(new Error(m.error.message||'error')):p.res(m.result);return}
    if(m.method==='ui/notifications/host-context-changed'&&m.params)theme(m.params.theme)});
  theme(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  rpc('ui/initialize',{protocolVersion:'2026-01-26',appInfo:{name:'Just Ask picture',version:'1.0.0'},appCapabilities:{}})
    .then(function(r){notify('ui/notifications/initialized',{});if(r&&r.hostContext&&r.hostContext.theme)theme(r.hostContext.theme)}).catch(function(){});
  function prepare(f){
    if(f.size<=LIMIT&&/^image\\/(png|jpeg|gif|webp)$/.test(f.type))return Promise.resolve(f);
    return new Promise(function(res,rej){var img=new Image();img.onerror=function(){rej(new Error('format'))};
      img.onload=function(){var k=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
        c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
        (function next(q){if(q<0.5)return rej(new Error('size'));var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
          c.toBlob(function(b){b&&b.size<=LIMIT?res(b):next(q-0.15)},'image/jpeg',q)})(0.9)};
      img.src=URL.createObjectURL(f)})}
  function take(f){if(!f)return;
    if(!/^image\\//.test(f.type)){status("That file isn't a picture. Choose a PNG, JPEG, GIF or WebP.",'bad');return}
    $('thumb').innerHTML='<img alt="" src="'+URL.createObjectURL(f)+'">';
    $('what').innerHTML='<b>'+f.name.replace(/[<>&"]/g,'')+'</b><span>Choose a different picture</span>';
    status('Uploading…');
    prepare(f).then(function(b){return fetch(SITE+'/api/picture',{method:'POST',headers:{'content-type':b.type},body:b})})
      .then(function(r){return r.json()}).then(function(j){if(!j||!j.ok)throw new Error(j&&j.error||'upload');
        return rpc('ui/update-model-context',{content:[{type:'text',text:'The user picked the coin picture in the Just Ask panel. Use picture_id '+j.id+' for launch_coin.'}],structuredContent:{picture_id:j.id}})
          .catch(function(){}).then(function(){notify('ui/message',{role:'user',content:[{type:'text',text:'Picture uploaded (picture_id '+j.id+').'}]});status('Picture ready. Go back to the chat and confirm the launch.','ok')})})
      .catch(function(e){status(e.message==='format'?"This picture's format can't be read here. Try a PNG or JPEG.":e.message==='size'?'This picture is too big to upload. Try a smaller one.':"The upload didn't go through. Choose the picture again.",'bad')})}
  $('file').onchange=function(){take($('file').files[0]);$('file').value=''};
  var d=$('drop');d.ondragover=function(e){e.preventDefault();d.classList.add('over')};d.ondragleave=function(){d.classList.remove('over')};
  d.ondrop=function(e){e.preventDefault();d.classList.remove('over');take(e.dataTransfer.files[0])};
  size();
})();
</script></body></html>`;
}
