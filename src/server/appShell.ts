import { SITE_URL } from "@/lib/brand";

/** Shared look + MCP Apps bridge (postMessage JSON-RPC) for the in-chat panels. */
export const MARK_SVG = `<svg viewBox="0 0 32 32" width="18" height="18"><rect width="32" height="32" rx="8" fill="currentColor"/><path d="M16 6c-5.8 0-10.4 4.1-10.4 9.2 0 2.7 1.3 5.2 3.5 6.9l-.9 3.7c-.2.6.5 1.1 1.1.7l3.8-2.4c.9.2 1.9.3 2.9.3 5.8 0 10.4-4.1 10.4-9.2S21.8 6 16 6z" fill="var(--bg)"/><path d="M16 10.2l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" fill="currentColor"/></svg>`;

export const FEATHER_SVG = `<svg viewBox="0 0 115.87 149.53" width="9" height="12" style="flex:none"><path fill="currentColor" d="m.86,149.53h3.3c.6,0,1.2-.3,1.4-.8C30.46,85.33,57.56,53.93,74.56,35.13c.7-.8.4-1.4-.6-1.4h-30.4c-1.1,0-2.03.44-2.8,1.4l-21.8,27c-3.2,4-4,7.7-4,13v27.6C7.86,122.63,3.36,136.13.06,148.33c-.2.78.1,1.2.8,1.2ZM110.56,4.03c-4.7-5-25.9-5.2-35.7-1.4-2.04.79-4,2.13-4.9,2.9-9,7.7-15,13.8-20.7,19.8-.7.7-.4,1.4.6,1.4h33.7c3.1,0,4.9,1.8,4.9,4.9v38c0,1,.8,1.3,1.4.4l20.3-26.5c3.3-4.3,4.3-5.6,5.2-11.6,1.2-8.8.5-22.3-4.8-27.9Zm-43.5,100.8l13.9-22.9c.3-.6.4-1.3.4-1.8v-38.2c0-1-.7-1.4-1.4-.6-20.9,23.3-37.2,47.8-52.3,77.3-.38.74.1,1.4,1,1.1l31.2-9.6c3.52-1.08,5.5-2.5,7.2-5.3Z"/></svg>`;

export const APP_CSS = `
:root{--ink:#0b0b0c;--mute:#6b6b70;--line:#e7e5df;--bg:#ffffff;--soft:#f6f5f1;--accent:#fff27a;--ok:#16a34a;--bad:#dc2626;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.dark{--ink:#f4f4f5;--mute:#a1a1aa;--line:#33322f;--bg:#1f1e1d;--soft:#2a2927;--accent:#fff27a}
html,body{margin:0;background:var(--bg);color:var(--ink)}
.card{border:1px solid var(--line);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:14px;overflow:hidden}
.head{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:var(--mute)}
.brand{display:flex;align-items:center;gap:8px;color:var(--ink);font-weight:600;font-size:13.5px}
.chip{border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:11.5px;color:var(--mute);display:inline-flex;align-items:center;gap:6px}
.dot{width:6px;height:6px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 25%,transparent)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
a{color:inherit}
.btn{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:8px 13px;font-size:13px;font-weight:500;text-decoration:none;cursor:pointer;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.btn.primary{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn:hover{opacity:.85}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.rise{animation:rise .45s cubic-bezier(.2,.7,.2,1) both}
`;

export const BRIDGE_JS = `
var nextId=1,pending={};
function rpc(m,p,ms){var id=nextId++;parent.postMessage({jsonrpc:'2.0',id:id,method:m,params:p||{}},'*');return new Promise(function(res,rej){pending[id]={res:res,rej:rej};setTimeout(function(){if(pending[id]){delete pending[id];rej(new Error('no reply'))}},ms||8000)})}
function notify(m,p){parent.postMessage({jsonrpc:'2.0',method:m,params:p||{}},'*')}
function size(){notify('ui/notifications/size-changed',{height:document.documentElement.scrollHeight})}
function theme(t){document.documentElement.classList.toggle('dark',t==='dark')}
var onResult=function(){};
addEventListener('message',function(e){var m=e.data;if(!m||m.jsonrpc!=='2.0')return;
  if(m.id!=null&&pending[m.id]&&(('result' in m)||m.error)){var p=pending[m.id];delete pending[m.id];m.error?p.rej(new Error(m.error.message||'error')):p.res(m.result);return}
  if(m.method==='ui/notifications/host-context-changed'&&m.params)theme(m.params.theme);
  if(m.method==='ui/notifications/tool-result'&&m.params)onResult(m.params.structuredContent||{});
});
theme(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
rpc('ui/initialize',{protocolVersion:'2026-01-26',appInfo:{name:'Just Ask',version:'1.0.0'},appCapabilities:{}})
  .then(function(r){notify('ui/notifications/initialized',{});if(r&&r.hostContext&&r.hostContext.theme)theme(r.hostContext.theme)}).catch(function(){});
// ChatGPT Apps SDK fallback
if(window.openai&&window.openai.toolOutput)setTimeout(function(){onResult(window.openai.toolOutput)},0);
addEventListener('openai:set_globals',function(){if(window.openai&&window.openai.toolOutput)onResult(window.openai.toolOutput)});
function openLink(u){if(window.openai&&window.openai.openExternal){window.openai.openExternal({href:u});return}rpc('ui/open-link',{url:u}).catch(function(){window.open(u,'_blank')})}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
`;

export const appCsp = { connectDomains: [SITE_URL], resourceDomains: [SITE_URL, "https:"] };
