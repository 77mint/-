(function(){
var TB=document.querySelector('.tab-bar');
const $=id=>document.getElementById(id);
const In=n=>n?n.slice(0,2).toUpperCase():'??';
const Nm=()=>{const d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')};
const Uid=()=>'_'+Math.random().toString(36).slice(2,9);
const LS={get:k=>JSON.parse(localStorage.getItem('md_'+k)||'null'),set:(k,v)=>localStorage.setItem('md_'+k,JSON.stringify(v))};

let U=LS.get('user');
let S=LS.get('servers')||[];
let saved=LS.get('saved')||[];
let aS=null,aCh=null,vP=null,cT='home',npI=[],rTo=null,wR=LS.get('wornRoles')||{};
function saveAll(){LS.set('servers',S);LS.set('saved',saved);LS.set('wornRoles',wR)}

// AUTH
let isLogin=false;
function showAuth(){$('authPage').classList.remove('hidden');$('app').classList.remove('show');TB.style.display='none'}
function showApp(){$('authPage').classList.add('hidden');$('app').classList.add('show');TB.style.display='flex'}
function showErr(msg){$('authErr').textContent=msg;$('authErr').style.display='block'}
function hideErr(){$('authErr').style.display='none'}
if(U){showApp()}else{showAuth()}

$('authSwitch').addEventListener('click',()=>{
  isLogin=!isLogin;hideErr();
  if(isLogin){$('authSub').textContent='欢迎回来';$('authBtn').textContent='登录';$('authSwitch').innerHTML='没有账号？<b>创建</b>';$('authAvatar').style.display='none'}
  else{$('authSub').textContent='创建你的账号';$('authBtn').textContent='创建账号';$('authSwitch').innerHTML='已有账号？<b>登录</b>';$('authAvatar').style.display='flex'}
});

let authAv=null;
$('authAvatar').addEventListener('click',()=>$('authAvatarFile').click());
$('authAvatarFile').addEventListener('change',function(){
  if(this.files[0]){const r=new FileReader();r.onload=e=>{authAv=e.target.result;$('authAvatarImg').src=authAv;$('authAvatarImg').style.display='block';$('authAvatar').querySelector('svg').style.display='none'};r.readAsDataURL(this.files[0])}
});

$('authBtn').addEventListener('click',()=>{
  const name=$('authName').value.trim();
  const pwd=$('authPwd').value;
  hideErr();
  if(!name||name.length<2)return showErr('用户名至少2个字');
  if(!pwd||pwd.length<4)return showErr('密码至少4位');
  const users=LS.get('allUsers')||[];
  if(isLogin){
    const u=users.find(x=>x.name===name&&x.pwd===pwd);
    if(!u)return showErr('用户名或密码错误');
    U=u;LS.set('user',U);showApp();initApp();
  }else{
    if(users.find(x=>x.name===name))return showErr('用户名已被使用');
    const id=String(100000+Math.floor(Math.random()*900000));
    U={name,avatar:authAv,id,pwd};
    users.push(U);LS.set('allUsers',users);LS.set('user',U);
    showApp();initApp();
  }
});

$('btnLogout').addEventListener('click',()=>{LS.set('user',null);U=null;location.reload()});

// HELPERS
function rF(f,cb){const r=new FileReader();r.onload=e=>cb(e.target.result);r.readAsDataURL(f)}
function gWR(){let o=[];S.forEach(s=>{if(!s.roles)return;(wR[s.id]||[]).forEach(rid=>{const r=s.roles.find(x=>x.id===rid);if(r)o.push(r)})});return o}
function RB(rd){if(!rd||!rd.length)return '';return rd.map(r=>'<span class="role-badge" style="background:'+r.color+'20;color:'+r.color+'">'+r.name+'</span>').join('')}
function SP(t){return t.replace(/\|\|(.+?)\|\|/g,'<span class="spoiler">$1</span>')}
document.addEventListener('click',e=>{if(e.target.classList.contains('spoiler')){e.target.classList.toggle('revealed');e.stopPropagation()}});
function isSv(s,p){return saved.some(x=>x.s===s&&x.p===p)}
function tgSv(s,p,t){if(isSv(s,p))saved=saved.filter(x=>!(x.s===s&&x.p===p));else saved.push({s,p,type:t});saveAll()}
function gS(){return S.find(x=>x.id===aS)}
function gC(){const s=gS();return s?s.channels.find(c=>c.id===aCh):null}

function initApp(){
if(!U)return;

// Chat dots -> edit profile
let pmO=false;
function cPM(){pmO=false;$('profileMenu').classList.remove('show');$('pmOverlay').classList.remove('show')}
$('chatDots').addEventListener('click',()=>{pmO=!pmO;$('profileMenu').classList.toggle('show',pmO);$('pmOverlay').classList.toggle('show',pmO)});
$('pmOverlay').addEventListener('click',cPM);
$('pmEditProfile').addEventListener('click',()=>{cPM();oPM()});

// Profile edit
let pAv=null,tW={};
function oPM(){$('modalProfile').classList.add('show');$('psNameInput').value=U.name;pAv=null;if(U.avatar){$('psAvatarImg').src=U.avatar;$('psAvatarImg').style.display='block';$('psPlaceholder').style.display='none'}else{$('psAvatarImg').style.display='none';$('psPlaceholder').style.display='flex'}tW=JSON.parse(JSON.stringify(wR));rpR()}
function rpR(){const l=$('psRoleList');l.innerHTML='';let h=false;S.forEach(s=>{if(!s.roles||!s.roles.length)return;h=true;const w=tW[s.id]||[];const lb=document.createElement('div');lb.style.cssText='width:100%;font-size:10px;color:#aaa;margin-top:'+(l.children.length?'6px':'0');lb.textContent=s.name;l.appendChild(lb);s.roles.forEach(r=>{const c=document.createElement('div');c.className='ps-role-chip '+(w.includes(r.id)?'on':'off');c.style.color=r.color;c.style.background=r.color+'15';c.innerHTML=r.name+(w.includes(r.id)?' <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>':'');c.addEventListener('click',()=>{if(!tW[s.id])tW[s.id]=[];if(tW[s.id].includes(r.id))tW[s.id]=tW[s.id].filter(x=>x!==r.id);else tW[s.id].push(r.id);rpR()});l.appendChild(c)})});$('psRolesSection').style.display=h?'block':'none'}
$('psAvatar').addEventListener('click',()=>$('psFileInput').click());
$('psFileInput').addEventListener('change',function(){if(this.files[0])rF(this.files[0],u=>{pAv=u;$('psAvatarImg').src=u;$('psAvatarImg').style.display='block';$('psPlaceholder').style.display='none'})});
$('btnCancelProfile').addEventListener('click',()=>$('modalProfile').classList.remove('show'));
$('modalProfile').addEventListener('click',e=>{if(e.target===$('modalProfile'))$('modalProfile').classList.remove('show')});
$('btnSaveProfile').addEventListener('click',()=>{const n=$('psNameInput').value.trim();if(!n)return;U.name=n;if(pAv)U.avatar=pAv;wR=JSON.parse(JSON.stringify(tW));LS.set('user',U);const users=LS.get('allUsers')||[];const idx=users.findIndex(x=>x.id===U.id);if(idx>=0){users[idx]=U;LS.set('allUsers',users)}saveAll();$('modalProfile').classList.remove('show')});

// Sidebar
function rSb(){const sb=$('sidebar');sb.querySelectorAll('.server-icon:not(.add)').forEach(e=>e.remove());const dv=sb.querySelector('.server-divider');S.forEach(s=>{const el=document.createElement('div');el.className='server-icon'+(s.id===aS?' active':'');el.title=s.name;if(s.avatar)el.innerHTML='<img src="'+s.avatar+'">';else el.innerHTML='<span class="si-text">'+In(s.name)+'</span>';el.addEventListener('click',()=>selS(s.id));dv.after(el)})}

$('sidebarSearch').addEventListener('click',()=>{$('searchOverlay').classList.add('show');$('searchServerInput').value='';$('searchResults').innerHTML='';$('ssHint').style.display='block'});
$('searchOverlay').addEventListener('click',e=>{if(e.target===$('searchOverlay'))$('searchOverlay').classList.remove('show')});
$('searchServerInput').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();const r=$('searchResults');r.innerHTML='';if(!q){$('ssHint').style.display='block';return}$('ssHint').style.display='none';S.filter(s=>s.sid.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)).forEach(s=>{const d=document.createElement('div');d.className='ss-result';d.innerHTML=s.name+'<span>#'+s.sid+'</span>';d.addEventListener('click',()=>{$('searchOverlay').classList.remove('show');selS(s.id)});r.appendChild(d)})});

function selS(id){aS=id;aCh=null;vP=null;rSb();hA();$('channelPage').classList.add('show');const s=gS();$('cpName').textContent=s.name;$('cpId').textContent='#'+s.sid;rCL();sT('home')}

function rCL(){const s=gS();if(!s)return;const l=$('cpList');l.innerHTML='';$('cpEmpty').style.display=s.channels.length?'none':'block';const ic={announce:'<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',forum:'<svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',persona:'<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'};s.channels.forEach(ch=>{const el=document.createElement('div');el.className='ch-item';el.innerHTML='<div class="chi-icon">'+ic[ch.type]+'</div><div class="chi-name">'+ch.name+'</div>';el.addEventListener('click',()=>oCh(ch.id));l.appendChild(el)})}

function oCh(id){aCh=id;vP=null;rTo=null;const ch=gC();if(!ch)return;$('channelPage').classList.remove('show');$('channelView').classList.add('show');$('cvTitle').textContent='# '+ch.name;$('cvSubtitle').textContent={announce:'通告',forum:'论坛',persona:'角色'}[ch.type];$('forumArea').style.display='none';$('personaArea').style.display='none';$('announceArea').style.display='none';$('announceInput').style.display='none';$('postDetail').classList.remove('show');$('fabGroup').style.display='none';$('replyQuote').classList.remove('show');if(ch.type==='announce'){$('announceArea').style.display='flex';if(gS().owner==='me')$('announceInput').style.display='flex';rAn()}else if(ch.type==='persona'){$('personaArea').style.display='flex';$('fabGroup').style.display='flex';rPe()}else{$('forumArea').style.display='flex';$('fabGroup').style.display='flex';rPo()}}

$('btnBackToChannels').addEventListener('click',()=>{$('channelView').classList.remove('show');$('channelPage').classList.add('show')});

// Announce
function rAn(){const ch=gC(),a=$('announceArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint">暂无通告</div>';return}[...ch.posts].reverse().forEach(p=>{const d=document.createElement('div');d.className='ann-item';d.innerHTML='<div class="ann-time">'+p.time+'</div><div class="ann-title">'+p.title+'</div>'+(p.content?'<div class="ann-content">'+p.content+'</div>':'');a.appendChild(d)})}
$('btnAnnPost').addEventListener('click',()=>{const v=$('annInput').value.trim();if(!v)return;const ch=gC();if(!ch.posts)ch.posts=[];ch.posts.push({id:Uid(),title:v,content:'',time:Nm()});$('annInput').value='';rAn();saveAll()});

// Forum posts
function rPo(){const ch=gC(),a=$('forumArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint">还没有帖子</div>';return}[...ch.posts].reverse().forEach(p=>{const c=document.createElement('div');c.className='post-card';const av=p.avatar?'<img src="'+p.avatar+'">':In(p.user);const rh=RB(p.roles);let ih='';if(p.images&&p.images.length)ih='<div class="pc-images">'+p.images.slice(0,2).map(i=>'<img src="'+i+'">').join('')+'</div>';const sv=isSv(aS,p.id);c.innerHTML='<div class="pc-bookmark '+(sv?'saved':'')+'" data-pid="'+p.id+'"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div><div class="pc-head"><div class="pc-avatar">'+av+'</div><div class="pc-meta"><div class="pc-user">'+p.user+'</div>'+(rh?'<div class="pc-roles">'+rh+'</div>':'')+'</div><span class="pc-time">'+p.time+'</span></div><div class="pc-title">'+SP(p.title)+'</div><div class="pc-preview">'+SP(p.content)+'</div>'+ih+'<div class="pc-footer"><span><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+(p.replies?p.replies.length:0)+'</span></div>';c.querySelector('.pc-bookmark').addEventListener('click',e=>{e.stopPropagation();tgSv(aS,p.id,'post');rPo()});c.addEventListener('click',e=>{if(e.target.closest('.pc-bookmark')||e.target.classList.contains('spoiler'))return;oP(p.id)});a.appendChild(c)})}

// Persona
function rPe(){const ch=gC(),a=$('personaArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint" style="width:100%">还没有角色</div>';return}ch.posts.forEach(p=>{const c=document.createElement('div');c.className='persona-card';const hi=p.images&&p.images.length;const sv=isSv(aS,p.id);c.innerHTML='<div class="psc-img">'+(hi?'<img src="'+p.images[0]+'">':'<div style="display:flex;align-items:center;justify-content:center;height:100%"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>')+'<div class="psc-author">@'+p.user+'</div><div class="psc-bookmark '+(sv?'saved':'')+'"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div></div><div class="psc-body"><div class="psc-name">'+p.title+'</div><div class="psc-desc">'+p.content+'</div><div class="psc-stats"><span><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>0</span><span><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+(p.replies?p.replies.length:0)+'</span></div></div>';c.querySelector('.psc-bookmark').addEventListener('click',e=>{e.stopPropagation();tgSv(aS,p.id,'persona');rPe()});c.addEventListener('click',e=>{if(e.target.closest('.psc-bookmark'))return;oP(p.id)});a.appendChild(c)})}

// Post detail
function oP(pid){const ch=gC(),p=ch.posts.find(x=>x.id===pid);if(!p)return;vP=pid;rTo=null;$('replyQuote').classList.remove('show');$('forumArea').style.display='none';$('personaArea').style.display='none';$('announceArea').style.display='none';$('fabGroup').style.display='none';$('postDetail').classList.add('show');const av=p.avatar?'<img src="'+p.avatar+'">':In(p.user);const rh=RB(p.roles);let ih='';if(p.images&&p.images.length)ih='<div class="op-imgs">'+p.images.map(i=>'<img src="'+i+'" style="max-height:200px">').join('')+'</div>';let h='<div class="pd-op"><div class="op-head"><div class="op-avatar">'+av+'</div><div class="op-info"><div class="op-name">'+p.user+' '+rh+'</div><div class="op-time">'+p.time+'</div></div></div><div class="op-title">'+SP(p.title)+'</div><div class="op-content">'+SP(p.content)+'</div>'+ih+'</div>';if(p.replies&&p.replies.length){h+='<div class="pd-replies-title">回复 ('+p.replies.length+')</div>';p.replies.forEach((r,i)=>{const ra=r.avatar?'<img src="'+r.avatar+'">':In(r.user);const il=i===p.replies.length-1;h+='<div class="reply-item" data-rid="'+r.id+'"><div class="ri-line"><div class="ri-avatar">'+ra+'</div>'+(!il?'<div class="ri-thread"></div>':'')+'</div><div class="ri-body"><div class="ri-name-row"><span class="ri-name">'+r.user+'</span>'+RB(r.roles)+'<span class="ri-time">'+r.time+'</span></div>'+(r.qn?'<div style="font-size:10px;color:#bbb;margin-bottom:2px;padding-left:8px;border-left:2px solid #eee">回复 <b>'+r.qn+'</b>: '+r.qt.slice(0,30)+'</div>':'')+'<div class="ri-text">'+SP(r.text)+'</div></div></div>'})}else h+='<div class="empty-hint" style="padding:16px 0">暂无回复</div>';$('pdBody').innerHTML=h;$('pdBody').scrollTop=0;$('pdBody').querySelectorAll('.reply-item').forEach(el=>{el.addEventListener('click',()=>{const rid=el.dataset.rid;const r=gC().posts.find(x=>x.id===vP).replies.find(x=>x.id===rid);if(!r)return;rTo={name:r.user,text:r.text};$('rqName').textContent=r.user;$('rqText').textContent=r.text.slice(0,40);$('replyQuote').classList.add('show');$('replyInput').focus()})})}

$('rqClose').addEventListener('click',()=>{rTo=null;$('replyQuote').classList.remove('show')});
$('btnBackToList').addEventListener('click',()=>{vP=null;$('postDetail').classList.remove('show');const ch=gC();$('fabGroup').style.display='flex';if(ch.type==='persona'){$('personaArea').style.display='flex';rPe()}else if(ch.type==='forum'){$('forumArea').style.display='flex';rPo()}else{$('announceArea').style.display='flex';rAn()}});

function sRp(){const t=$('replyInput').value.trim();if(!t||!vP)return;const p=gC().posts.find(x=>x.id===vP);if(!p.replies)p.replies=[];const r={id:Uid(),user:U.name,avatar:U.avatar,text:t,time:Nm(),roles:gWR().map(r=>({name:r.name,color:r.color}))};if(rTo){r.qn=rTo.name;r.qt=rTo.text}p.replies.push(r);$('replyInput').value='';rTo=null;$('replyQuote').classList.remove('show');oP(vP);$('pdBody').scrollTop=$('pdBody').scrollHeight;saveAll()}
$('btnReply').addEventListener('click',sRp);$('replyInput').addEventListener('keydown',e=>{if(e.key==='Enter')sRp()});

$('fabTop').addEventListener('click',()=>{const ch=gC();if(ch.type==='persona')$('personaArea').scrollTo({top:0,behavior:'smooth'});else $('forumArea').scrollTo({top:0,behavior:'smooth'})});

// New post
$('fabPost').addEventListener('click',()=>{npI=[];rnI();$('npTitleInput').value='';$('npContentInput').value='';$('emojiPicker').classList.remove('show');const av=U.avatar?'<img src="'+U.avatar+'">':In(U.name);const ch=gC();const isP=ch&&ch.type==='persona';$('npTitleInput').placeholder=isP?'角色名':'标题';$('npContentInput').placeholder=isP?'角色简介 / 标签...':'输入消息......';$('npAuthor').innerHTML='<div class="npa-avatar">'+av+'</div><div class="npa-info"><div class="npa-name">'+U.name+'</div><div class="npa-hint">发布至 # '+(ch?ch.name:'')+'</div></div>';$('newPostPage').classList.add('show')});
$('btnCloseNewPost').addEventListener('click',()=>$('newPostPage').classList.remove('show'));
$('btnNpImage').addEventListener('click',()=>$('npImageFile').click());
$('npImageFile').addEventListener('change',function(){[...this.files].forEach(f=>{if(npI.length<4)rF(f,u=>{npI.push(u);rnI()})});this.value=''});
function rnI(){const c=$('npImagesPreview');c.innerHTML='';npI.forEach((img,i)=>{const w=document.createElement('div');w.className='np-img-wrap';w.innerHTML='<img src="'+img+'"><div class="np-img-del"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>';w.querySelector('.np-img-del').addEventListener('click',()=>{npI.splice(i,1);rnI()});c.appendChild(w)})}
$('btnNpFile').addEventListener('click',()=>$('npFileFile').click());
$('npFileFile').addEventListener('change',function(){if(this.files[0])$('npContentInput').value+=($('npContentInput').value?'\n':'')+'[附件: '+this.files[0].name+']';this.value=''});
const emos=['😀','😂','🥰','😎','🤔','👍','❤️','🔥','✨','🎉','😭','🥺','💀','👀','🙏','💕','😊','🤣','😍','🥳'];
const ep=$('emojiPicker');emos.forEach(e=>{const s=document.createElement('span');s.textContent=e;s.addEventListener('click',()=>{$('npContentInput').value+=e;$('npContentInput').focus()});ep.appendChild(s)});
$('btnNpEmoji').addEventListener('click',()=>ep.classList.toggle('show'));
$('btnNpSpoiler').addEventListener('click',()=>{const ta=$('npContentInput'),s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;if(s!==e){ta.value=v.slice(0,s)+'||'+v.slice(s,e)+'||'+v.slice(e)}else{ta.value=v.slice(0,s)+'||||'+v.slice(s);ta.selectionStart=ta.selectionEnd=s+2}ta.focus()});
$('btnSubmitPost').addEventListener('click',()=>{const t=$('npTitleInput').value.trim(),c=$('npContentInput').value.trim();if(!t||!c)return;const ch=gC();if(!ch.posts)ch.posts=[];ch.posts.push({id:Uid(),user:U.name,avatar:U.avatar,title:t,content:c,time:Nm(),replies:[],roles:gWR().map(r=>({name:r.name,color:r.color})),images:[...npI]});$('newPostPage').classList.remove('show');if(ch.type==='persona')rPe();else rPo();saveAll()});

// Create server
let sAv=null;
$('btnAddServer').addEventListener('click',()=>{$('modalCreate').classList.add('show');$('inputServerName').value='';$('inputServerId').value='';sAv=null;$('serverAvatarPreview').style.display='none';$('serverAvatarPicker').querySelector('svg').style.display='';$('idHint').style.display='none'});
$('serverAvatarPicker').addEventListener('click',()=>$('serverAvatarFile').click());
$('serverAvatarFile').addEventListener('change',function(){if(this.files[0])rF(this.files[0],u=>{sAv=u;$('serverAvatarPreview').src=u;$('serverAvatarPreview').style.display='block';$('serverAvatarPicker').querySelector('svg').style.display='none'})});
$('btnCancelCreate').addEventListener('click',()=>$('modalCreate').classList.remove('show'));
$('modalCreate').addEventListener('click',e=>{if(e.target===$('modalCreate'))$('modalCreate').classList.remove('show')});
$('btnConfirmCreate').addEventListener('click',()=>{const n=$('inputServerName').value.trim();const sid=$('inputServerId').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');if(!n||!sid)return;if(S.some(s=>s.sid===sid)){$('idHint').style.display='block';return}S.push({id:Uid(),sid,name:n,avatar:sAv,channels:[],roles:[],owner:'me'});$('modalCreate').classList.remove('show');rSb();selS(S[S.length-1].id);saveAll()});

// Create channel
$('btnAddChannel').addEventListener('click',()=>{$('modalChannel').classList.add('show');$('inputChName').value='';$('inputChType').value='forum'});
$('btnCancelCh').addEventListener('click',()=>$('modalChannel').classList.remove('show'));
$('modalChannel').addEventListener('click',e=>{if(e.target===$('modalChannel'))$('modalChannel').classList.remove('show')});
$('btnConfirmCh').addEventListener('click',()=>{const n=$('inputChName').value.trim();if(!n)return;gS().channels.push({id:Uid(),name:n,type:$('inputChType').value,posts:[]});$('modalChannel').classList.remove('show');rCL();saveAll()});
$('btnInvite').addEventListener('click',()=>{const s=gS();const txt=s.name+' #'+s.sid;navigator.clipboard&&navigator.clipboard.writeText(txt).then(()=>alert('已复制: '+txt))});

// Vault
let vf='all';document.querySelectorAll('.vault-tabs .vt').forEach(t=>{t.addEventListener('click',()=>{vf=t.dataset.vt;document.querySelectorAll('.vault-tabs .vt').forEach(x=>x.classList.toggle('active',x===t));rV()})});
function rV(){const l=$('vaultList');l.innerHTML='';const items=saved.filter(x=>vf==='all'||x.type===vf);$('vaultEmpty').style.display=items.length?'none':'block';items.forEach(item=>{const s=S.find(x=>x.id===item.s);if(!s)return;let p=null;s.channels.forEach(ch=>{if(!p&&ch.posts)ch.posts.forEach(pp=>{if(pp.id===item.p)p=pp})});if(!p)return;const el=document.createElement('div');el.className='vault-item';el.innerHTML='<div class="vi-img">'+(p.images&&p.images.length?'<img src="'+p.images[0]+'">':'<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>')+'</div><div class="vi-info"><div class="vi-title">'+p.title+'</div><div class="vi-sub">'+s.name+' · '+(item.type==='persona'?'角色':'帖子')+'</div></div><div class="vi-unsave"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>';el.querySelector('.vi-unsave').addEventListener('click',e=>{e.stopPropagation();tgSv(item.s,item.p,item.type);rV()});l.appendChild(el)})}

// Roles
function rRo(){const g=$('roleSettingsGroup'),b=$('roleSettingsBody');const ow=S.filter(s=>s.owner==='me');if(!ow.length){g.style.display='none';return}g.style.display='block';b.innerHTML='';ow.forEach(s=>{const w=document.createElement('div');w.style.marginBottom='16px';w.innerHTML='<div style="font-size:12px;font-weight:600;margin-bottom:6px">'+s.name+'</div>';const l=document.createElement('div');l.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px';if(!s.roles)s.roles=[];if(!s.roles.length)l.innerHTML='<span style="font-size:11px;color:#ccc">暂无</span>';else s.roles.forEach(r=>{const t=document.createElement('div');t.className='role-tag';t.style.background=r.color+'20';t.style.color=r.color;t.innerHTML=r.name+' <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';t.addEventListener('click',()=>{s.roles=s.roles.filter(x=>x.id!==r.id);rRo();saveAll()});l.appendChild(t)});w.appendChild(l);const row=document.createElement('div');row.className='add-role-row';const ni=document.createElement('input');ni.type='text';ni.placeholder='名称';ni.maxLength=12;const ci=document.createElement('input');ci.type='color';ci.value=['#ff6b6b','#845ef7','#22b8cf','#ff922b','#51cf66'][s.roles.length%5];const bt=document.createElement('button');bt.textContent='添加';bt.addEventListener('click',()=>{const n=ni.value.trim();if(!n)return;s.roles.push({id:Uid(),name:n,color:ci.value});ni.value='';rRo();saveAll()});row.appendChild(ni);row.appendChild(ci);row.appendChild(bt);w.appendChild(row);b.appendChild(w)})}

// Tab navigation
function hA(){$('welcomeView').style.display='none';$('channelPage').classList.remove('show');$('channelView').classList.remove('show');$('pageChat').classList.remove('show');$('dmView').classList.remove('show');$('userProfile').classList.remove('show');$('chatListView').style.display='flex';$('pageVault').classList.remove('show');$('pageSettings').classList.remove('show');cPM();TB.style.display='flex'}

function sT(tab){cT=tab;document.querySelectorAll('.tab-bar .tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));hA();if(tab==='home'){$('sidebar').classList.remove('hidden');if(aS){if(aCh)$('channelView').classList.add('show');else $('channelPage').classList.add('show')}else $('welcomeView').style.display='flex'}else{$('sidebar').classList.add('hidden');if(tab==='chat')$('pageChat').classList.add('show');else if(tab==='vault'){$('pageVault').classList.add('show');rV()}else{$('pageSettings').classList.add('show');rRo()}}}

document.querySelectorAll('.tab-bar .tab').forEach(t=>{t.addEventListener('click',()=>sT(t.dataset.tab))});
document.querySelectorAll('.toggle').forEach(t=>{t.addEventListener('click',()=>t.classList.toggle('on'))});
rSb();
}
if(U)initApp();
})();
