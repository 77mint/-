(function(){
const APP_VERSION='1.0.4';
const SB_ENV='mintds-d8gybgoqke953154b';
let tcb=null,db=null,auth=null;
async function doAnon(a){if(typeof a.signInAnonymously==='function')return a.signInAnonymously();if(typeof a.anonymousAuthProvider==='function')return a.anonymousAuthProvider().signIn();throw new Error('no-anon');}
const cloudInit=(async()=>{if(typeof cloudbase==='undefined')throw new Error('SDK未加载');tcb=cloudbase.init({env:SB_ENV});auth=tcb.auth({persistence:'local'});await doAnon(auth);db=tcb.database()})();
cloudInit.catch(e=>console.log('云连接失败',e&&e.message));
async function hashPwd(p){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')}
let sb=null;
var TB=document.querySelector('.tab-bar');
const $=id=>document.getElementById(id);
const In=n=>n?n.slice(0,2).toUpperCase():'??';
const Nm=()=>{const d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')};
const Uid=()=>'_'+Math.random().toString(36).slice(2,9);
const LS={get:k=>JSON.parse(localStorage.getItem('md_'+k)||'null'),set:(k,v)=>{try{localStorage.setItem('md_'+k,JSON.stringify(v))}catch(e){console.log('Storage full, clearing old data');try{localStorage.removeItem('md_servers');localStorage.setItem('md_'+k,JSON.stringify(v))}catch(e2){}}}};
let U=LS.get('user'),S=LS.get('servers')||[],saved=LS.get('saved')||[];
let aS=null,aCh=null,vP=null,cT='home',npI=[],rTo=null,chActIdx=null;
function saveAll(){LS.set('servers',S);LS.set('saved',saved)}
let darkMode=LS.get('darkMode')||false;
function applyDark(){document.body.classList.toggle('dark',darkMode)}
applyDark();
function chkDot(){const d=$('updateDot');if(d){const v=LS.get('appVersion');d.style.display=(!v||v!==APP_VERSION)?'inline-block':'none'}}

async function uploadImg(file){return null}
async function uploadFiles(files){return []}

let isLogin=false;
function showAuth(){$('authPage').classList.remove('hidden');$('app').classList.remove('show');TB.style.display='none'}
function showApp(){$('authPage').classList.add('hidden');$('app').classList.add('show');TB.style.display='flex'}
function showErr(m){$('authErr').textContent=m;$('authErr').style.display='block'}
function hideErr(){$('authErr').style.display='none'}
async function checkSession(){if(U){showApp();initApp()}else showAuth()}
checkSession();

$('authSwitch').addEventListener('click',()=>{isLogin=!isLogin;hideErr();if(isLogin){$('authSub').textContent='欢迎回来';$('authBtn').textContent='登录';$('authSwitch').innerHTML='没有账号？<b>创建</b>';$('authAvatar').style.display='none'}else{$('authSub').textContent='创建你的账号';$('authBtn').textContent='创建账号';$('authSwitch').innerHTML='已有账号？<b>登录</b>';$('authAvatar').style.display='flex'}});
let authAv=null;
$('authAvatar').addEventListener('click',()=>$('authAvatarFile').click());
$('authAvatarFile').addEventListener('change',function(){if(this.files[0]){const r=new FileReader();r.onload=e=>{authAv=e.target.result;$('authAvatarImg').src=authAv;$('authAvatarImg').style.display='block';$('authAvatar').querySelector('svg').style.display='none'};r.readAsDataURL(this.files[0])}});
$('authBtn').addEventListener('click',async()=>{
const name=$('authName').value.trim(),pwd=$('authPwd').value;hideErr();
if(!name||name.length<2)return showErr('用户名至少2个字');
if(!pwd||pwd.length<4)return showErr('密码至少4位');
const oldLabel=isLogin?'登录':'创建账号';$('authBtn').textContent='请稍候...';
try{await cloudInit}catch(e){$('authBtn').textContent=oldLabel;return showErr('连不上服务器('+(e&&e.message||'')+')，请重试')}
try{
const h=await hashPwd(pwd);
if(isLogin){
const r=await db.collection('users').where({name}).get();
if(!r.data||!r.data.length){$('authBtn').textContent=oldLabel;return showErr('用户名或密码错误')}
const u=r.data[0];
if(u.pwd!==h){$('authBtn').textContent=oldLabel;return showErr('用户名或密码错误')}
U={name:u.name,avatar:u.avatar||null,id:u._id,role:u.role||'user'};
}else{
const ex=await db.collection('users').where({name}).get();
if(ex.data&&ex.data.length){$('authBtn').textContent=oldLabel;return showErr('用户名已被使用')}
const first=await db.collection('users').limit(1).get();
const isSuper=!(first.data&&first.data.length);
const add=await db.collection('users').add({name,pwd:h,avatar:authAv||null,role:isSuper?'super':'user',createdAt:Date.now()});
U={name,avatar:authAv||null,id:add.id,role:isSuper?'super':'user'};
}
LS.set('user',U);LS.set('appVersion',APP_VERSION);showApp();initApp();
}catch(e){$('authBtn').textContent=oldLabel;showErr('出错了: '+(e&&e.message||e))}
});
$('btnLogout').addEventListener('click',async()=>{LS.set('user',null);location.reload()});

function rF(f,cb){const r=new FileReader();r.onload=e=>cb(e.target.result);r.readAsDataURL(f)}
function RB(rd){if(!rd||!rd.length)return '';return rd.map(r=>'<span class="role-badge" style="background:'+r.color+'20;color:'+r.color+'">'+r.name+'</span>').join('')}
function SP(t){return t.replace(/\|\|(.+?)\|\|/g,'<span class="spoiler">$1</span>')}
document.addEventListener('click',e=>{if(e.target.classList.contains('spoiler')){e.target.classList.toggle('revealed');e.stopPropagation()}});
function isSv(s,p){return saved.some(x=>x.s===s&&x.p===p)}
function tgSv(s,p,t){if(isSv(s,p))saved=saved.filter(x=>!(x.s===s&&x.p===p));else saved.push({s,p,type:t});saveAll()}
function gS(){return S.find(x=>x.id===aS)}
function gC(){const s=gS();return s?s.channels.find(c=>c.id===aCh):null}
function imgGrid(images,cls){if(!images||!images.length)return '';const cnt=Math.min(images.length,4);return '<div class="'+cls+' img-'+cnt+'">'+images.slice(0,4).map(i=>'<img src="'+i+'">').join('')+'</div>'}

function initApp(){
if(!U)return;
chkDot();
$('currentVer').textContent='当前版本 '+APP_VERSION;
$('btnCheckUpdate').addEventListener('click',()=>{const v=LS.get('appVersion');if(!v||v!==APP_VERSION){LS.set('appVersion',APP_VERSION);chkDot();alert('已更新到 '+APP_VERSION)}else alert('已是最新版本')});
document.querySelectorAll('.toggle').forEach((t,i)=>{if(i===0){if(darkMode)t.classList.add('on');t.addEventListener('click',()=>{darkMode=!darkMode;t.classList.toggle('on');LS.set('darkMode',darkMode);applyDark()})}else t.addEventListener('click',()=>t.classList.toggle('on'))});
const fsSizes=['fs-small','fs-normal','fs-large','fs-xlarge'],fsLabels=['小','标准','大','特大'];
let fsIdx=parseInt(localStorage.getItem('md_fontSize')||'1');
document.body.classList.add(fsSizes[fsIdx]);
$('fontSizeLabel').textContent=fsLabels[fsIdx];
$('btnFontSize').addEventListener('click',()=>{document.body.classList.remove(fsSizes[fsIdx]);fsIdx=(fsIdx+1)%4;document.body.classList.add(fsSizes[fsIdx]);localStorage.setItem('md_fontSize',String(fsIdx));$('fontSizeLabel').textContent=fsLabels[fsIdx]});

let pmO=false;
function cPM(){pmO=false;$('profileMenu').classList.remove('show');$('pmOverlay').classList.remove('show')}
$('chatDots').addEventListener('click',()=>{pmO=!pmO;$('profileMenu').classList.toggle('show',pmO);$('pmOverlay').classList.toggle('show',pmO)});
$('pmOverlay').addEventListener('click',cPM);
$('pmEditProfile').addEventListener('click',()=>{cPM();oPM()});
let pAv=null;
function oPM(){$('modalProfile').classList.add('show');$('psNameInput').value=U.name;pAv=null;if(U.avatar){$('psAvatarImg').src=U.avatar;$('psAvatarImg').style.display='block';$('psPlaceholder').style.display='none'}else{$('psAvatarImg').style.display='none';$('psPlaceholder').style.display='flex'}}
$('psAvatar').addEventListener('click',()=>$('psFileInput').click());
$('psFileInput').addEventListener('change',function(){if(this.files[0])rF(this.files[0],u=>{pAv=u;$('psAvatarImg').src=u;$('psAvatarImg').style.display='block';$('psPlaceholder').style.display='none'})});
$('btnCancelProfile').addEventListener('click',()=>$('modalProfile').classList.remove('show'));
$('modalProfile').addEventListener('click',e=>{if(e.target===$('modalProfile'))$('modalProfile').classList.remove('show')});
$('btnSaveProfile').addEventListener('click',async()=>{const n=$('psNameInput').value.trim();if(!n)return;U.name=n;if(pAv)U.avatar=pAv;LS.set('user',U);if(db&&U.id)try{await db.collection('users').doc(U.id).update({name:n,avatar:pAv||U.avatar})}catch(e){};saveAll();$('modalProfile').classList.remove('show')});

$('chActionCancel').addEventListener('click',()=>$('chActionOverlay').classList.remove('show'));
$('chActionOverlay').addEventListener('click',e=>{if(e.target===$('chActionOverlay'))$('chActionOverlay').classList.remove('show')});
$('chMoveUp').addEventListener('click',()=>{const s=gS();if(chActIdx>0){const t=s.channels[chActIdx];s.channels[chActIdx]=s.channels[chActIdx-1];s.channels[chActIdx-1]=t;saveAll();rCL()}$('chActionOverlay').classList.remove('show')});
$('chMoveDown').addEventListener('click',()=>{const s=gS();if(chActIdx<s.channels.length-1){const t=s.channels[chActIdx];s.channels[chActIdx]=s.channels[chActIdx+1];s.channels[chActIdx+1]=t;saveAll();rCL()}$('chActionOverlay').classList.remove('show')});
$('chDelete').addEventListener('click',()=>{const s=gS();if(confirm('确定删除「'+s.channels[chActIdx].name+'」？')){s.channels.splice(chActIdx,1);saveAll();rCL()}$('chActionOverlay').classList.remove('show')});

function rSb(){const sb2=$('sidebar');sb2.querySelectorAll('.server-icon:not(.add)').forEach(e=>e.remove());const dv=sb2.querySelector('.server-divider');S.forEach(s=>{const el=document.createElement('div');el.className='server-icon'+(s.id===aS?' active':'');el.title=s.name;if(s.avatar)el.innerHTML='<img src="'+s.avatar+'">';else el.innerHTML='<span class="si-text">'+In(s.name)+'</span>';el.addEventListener('click',()=>selS(s.id));dv.after(el)})}
$('sidebarSearch').addEventListener('click',()=>{$('searchOverlay').classList.add('show');$('searchServerInput').value='';$('searchResults').innerHTML='';$('ssHint').style.display='block'});
$('searchOverlay').addEventListener('click',e=>{if(e.target===$('searchOverlay'))$('searchOverlay').classList.remove('show')});
$('searchServerInput').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();const r=$('searchResults');r.innerHTML='';if(!q){$('ssHint').style.display='block';return}$('ssHint').style.display='none';S.filter(s=>s.sid.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)).forEach(s=>{const d=document.createElement('div');d.className='ss-result';d.innerHTML=s.name+'<span>#'+s.sid+'</span>';d.addEventListener('click',()=>{$('searchOverlay').classList.remove('show');selS(s.id)});r.appendChild(d)})});
function selS(id){aS=id;aCh=null;vP=null;rSb();hA();$('channelPage').classList.add('show');const s=gS();$('cpName').textContent=s.name;$('cpId').textContent='#'+s.sid;rCL();sT('home')}

$('btnServerSettings').addEventListener('click',()=>{const s=gS();if(!s||s.owner!=='me')return alert('只有创建者可以修改');const nn=prompt('修改社区名称',s.name);if(nn&&nn.trim()){s.name=nn.trim();$('cpName').textContent=s.name;rSb();saveAll()}});

function rCL(){const s=gS();if(!s)return;const l=$('cpList');l.innerHTML='';$('cpEmpty').style.display=s.channels.length?'none':'block';const ic={announce:'<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',forum:'<svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',persona:'<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'};
s.channels.forEach((ch,idx)=>{const el=document.createElement('div');el.className='ch-item';el.innerHTML='<div class="chi-icon">'+ic[ch.type]+'</div><div class="chi-name">'+ch.name+'</div>';el.addEventListener('click',()=>oCh(ch.id));let lpt=null;el.addEventListener('touchstart',()=>{lpt=setTimeout(()=>{chActIdx=idx;$('chActionTitle').textContent=ch.name;$('chActionOverlay').classList.add('show')},500)});el.addEventListener('touchend',()=>clearTimeout(lpt));el.addEventListener('touchmove',()=>clearTimeout(lpt));l.appendChild(el)})}

function oCh(id){aCh=id;vP=null;rTo=null;const ch=gC();if(!ch)return;$('channelPage').classList.remove('show');$('channelView').classList.add('show');$('cvTitle').textContent='# '+ch.name;$('cvSubtitle').textContent={announce:'通告',forum:'论坛',persona:'角色'}[ch.type];$('forumArea').style.display='none';$('personaArea').style.display='none';$('announceArea').style.display='none';$('announceInput').style.display='none';$('postDetail').classList.remove('show');$('fabGroup').style.display='none';$('replyQuote').classList.remove('show');if(ch.type==='announce'){$('announceArea').style.display='flex';if(gS().owner==='me')$('announceInput').style.display='flex';rAn()}else if(ch.type==='persona'){$('personaArea').style.display='flex';$('fabGroup').style.display='flex';rPe()}else{$('forumArea').style.display='flex';$('fabGroup').style.display='flex';rPo()}}
$('btnBackToChannels').addEventListener('click',()=>{$('channelView').classList.remove('show');$('channelPage').classList.add('show')});

function rAn(){const ch=gC(),a=$('announceArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint">暂无通告</div>';return}[...ch.posts].reverse().forEach(p=>{const d=document.createElement('div');d.className='ann-item';d.innerHTML='<div class="ann-time">'+p.time+'</div><div class="ann-title">'+p.title+'</div>'+(p.content?'<div class="ann-content">'+p.content+'</div>':'');a.appendChild(d)})}
$('btnAnnPost').addEventListener('click',()=>{const v=$('annInput').value.trim();if(!v)return;const ch=gC();if(!ch.posts)ch.posts=[];ch.posts.push({id:Uid(),title:v,content:'',time:Nm()});$('annInput').value='';rAn();saveAll()});

function rPo(){const ch=gC(),a=$('forumArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint">还没有帖子</div>';return}[...ch.posts].reverse().forEach(p=>{const c=document.createElement('div');c.className='post-card';const av=p.avatar?'<img src="'+p.avatar+'">':In(p.user);const ih=imgGrid(p.images,'pc-images');const sv=isSv(aS,p.id);c.innerHTML='<div class="pc-bookmark '+(sv?'saved':'')+'" data-pid="'+p.id+'"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div><div class="pc-head"><div class="pc-avatar">'+av+'</div><div class="pc-meta"><div class="pc-user">'+p.user+'</div></div><span class="pc-time">'+p.time+'</span></div><div class="pc-title">'+SP(p.title)+'</div><div class="pc-preview">'+SP(p.content)+'</div>'+ih+'<div class="pc-footer"><span><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+(p.replies?p.replies.length:0)+'</span></div>';c.querySelector('.pc-bookmark').addEventListener('click',e=>{e.stopPropagation();tgSv(aS,p.id,'post');rPo()});c.addEventListener('click',e=>{if(e.target.closest('.pc-bookmark')||e.target.classList.contains('spoiler'))return;oP(p.id)});a.appendChild(c)})}

function rPe(){const ch=gC(),a=$('personaArea');a.innerHTML='';if(!ch.posts||!ch.posts.length){a.innerHTML='<div class="empty-hint" style="width:100%">还没有角色</div>';return}ch.posts.forEach(p=>{const c=document.createElement('div');c.className='persona-card';const hi=p.images&&p.images.length;const sv=isSv(aS,p.id);c.innerHTML='<div class="psc-img">'+(hi?'<img src="'+p.images[0]+'">':'<div style="display:flex;align-items:center;justify-content:center;height:100%"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>')+'<div class="psc-author">@'+p.user+'</div><div class="psc-bookmark '+(sv?'saved':'')+'"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div></div><div class="psc-body"><div class="psc-name">'+p.title+'</div><div class="psc-desc">'+p.content+'</div><div class="psc-stats"><span><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>0</span><span><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+(p.replies?p.replies.length:0)+'</span></div></div>';c.querySelector('.psc-bookmark').addEventListener('click',e=>{e.stopPropagation();tgSv(aS,p.id,'persona');rPe()});c.addEventListener('click',e=>{if(e.target.closest('.psc-bookmark'))return;oP(p.id)});a.appendChild(c)})}

function oP(pid){const ch=gC(),p=ch.posts.find(x=>x.id===pid);if(!p)return;vP=pid;rTo=null;$('replyQuote').classList.remove('show');$('forumArea').style.display='none';$('personaArea').style.display='none';$('announceArea').style.display='none';$('fabGroup').style.display='none';$('postDetail').classList.add('show');const av=p.avatar?'<img src="'+p.avatar+'">':In(p.user);const ih=imgGrid(p.images,'op-imgs');let h='<div class="pd-op"><div class="op-head"><div class="op-avatar">'+av+'</div><div class="op-info"><div class="op-name">'+p.user+'</div><div class="op-time">'+p.time+'</div></div></div><div class="op-title">'+SP(p.title)+'</div><div class="op-content">'+SP(p.content)+'</div>'+ih+'</div>';if(p.replies&&p.replies.length){h+='<div class="pd-replies-title">回复 ('+p.replies.length+')</div>';p.replies.forEach((r,i)=>{const ra=r.avatar?'<img src="'+r.avatar+'">':In(r.user);const il=i===p.replies.length-1;h+='<div class="reply-item" data-rid="'+r.id+'"><div class="ri-line"><div class="ri-avatar">'+ra+'</div>'+(!il?'<div class="ri-thread"></div>':'')+'</div><div class="ri-body"><div class="ri-name-row"><span class="ri-name">'+r.user+'</span><span class="ri-time">'+r.time+'</span></div>'+(r.qn?'<div style="font-size:10px;color:#bbb;margin-bottom:2px;padding-left:8px;border-left:2px solid #eee">回复 <b>'+r.qn+'</b>: '+r.qt.slice(0,30)+'</div>':'')+'<div class="ri-text">'+SP(r.text)+'</div></div></div>'})}else h+='<div class="empty-hint" style="padding:16px 0">暂无回复</div>';$('pdBody').innerHTML=h;$('pdBody').scrollTop=0;$('pdBody').querySelectorAll('.reply-item').forEach(el=>{el.addEventListener('click',()=>{const rid=el.dataset.rid;const r=gC().posts.find(x=>x.id===vP).replies.find(x=>x.id===rid);if(!r)return;rTo={name:r.user,text:r.text};$('rqName').textContent=r.user;$('rqText').textContent=r.text.slice(0,40);$('replyQuote').classList.add('show');$('replyInput').focus()})})}
$('rqClose').addEventListener('click',()=>{rTo=null;$('replyQuote').classList.remove('show')});
$('btnBackToList').addEventListener('click',()=>{vP=null;$('postDetail').classList.remove('show');const ch=gC();$('fabGroup').style.display='flex';if(ch.type==='persona'){$('personaArea').style.display='flex';rPe()}else if(ch.type==='forum'){$('forumArea').style.display='flex';rPo()}else{$('announceArea').style.display='flex';rAn()}});
function sRp(){const t=$('replyInput').value.trim();if(!t||!vP)return;const p=gC().posts.find(x=>x.id===vP);if(!p.replies)p.replies=[];const r={id:Uid(),user:U.name,avatar:U.avatar,text:t,time:Nm(),roles:[]};if(rTo){r.qn=rTo.name;r.qt=rTo.text}p.replies.push(r);$('replyInput').value='';rTo=null;$('replyQuote').classList.remove('show');oP(vP);$('pdBody').scrollTop=$('pdBody').scrollHeight;saveAll()}
$('btnReply').addEventListener('click',sRp);$('replyInput').addEventListener('keydown',e=>{if(e.key==='Enter')sRp()});
$('fabTop').addEventListener('click',()=>{const ch=gC();if(ch.type==='persona')$('personaArea').scrollTo({top:0,behavior:'smooth'});else $('forumArea').scrollTo({top:0,behavior:'smooth'})});

let npFiles=[];
$('fabPost').addEventListener('click',()=>{npI=[];npFiles=[];rnI();$('npTitleInput').value='';$('npContentInput').value='';$('emojiPicker').classList.remove('show');const av=U.avatar?'<img src="'+U.avatar+'">':In(U.name);const ch=gC();const isP=ch&&ch.type==='persona';$('npTitleInput').placeholder=isP?'角色名':'标题';$('npContentInput').placeholder=isP?'角色简介 / 标签...':'输入消息......';$('npAuthor').innerHTML='<div class="npa-avatar">'+av+'</div><div class="npa-info"><div class="npa-name">'+U.name+'</div><div class="npa-hint">发布至 # '+(ch?ch.name:'')+'</div></div>';$('newPostPage').classList.add('show')});
$('btnCloseNewPost').addEventListener('click',()=>$('newPostPage').classList.remove('show'));
$('btnNpImage').addEventListener('click',()=>$('npImageFile').click());
$('npImageFile').addEventListener('change',function(){[...this.files].forEach(f=>{if(npFiles.length<4){npFiles.push(f);rF(f,u=>{npI.push(u);rnI()})}});this.value=''});
function rnI(){const c=$('npImagesPreview');c.innerHTML='';npI.forEach((img,i)=>{const w=document.createElement('div');w.className='np-img-wrap';w.innerHTML='<img src="'+img+'"><div class="np-img-del"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>';w.querySelector('.np-img-del').addEventListener('click',()=>{npI.splice(i,1);npFiles.splice(i,1);rnI()});c.appendChild(w)})}
$('btnNpFile').addEventListener('click',()=>$('npFileFile').click());
$('npFileFile').addEventListener('change',function(){if(this.files[0])$('npContentInput').value+=($('npContentInput').value?'\n':'')+'[附件: '+this.files[0].name+']';this.value=''});
const emos=['😀','😂','🥰','😎','🤔','👍','❤️','🔥','✨','🎉','😭','🥺','💀','👀','🙏','💕','😊','🤣','😍','🥳'];
const ep=$('emojiPicker');emos.forEach(e=>{const s=document.createElement('span');s.textContent=e;s.addEventListener('click',()=>{$('npContentInput').value+=e;$('npContentInput').focus()});ep.appendChild(s)});
$('btnNpEmoji').addEventListener('click',()=>ep.classList.toggle('show'));
$('btnNpSpoiler').addEventListener('click',()=>{const ta=$('npContentInput'),s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;if(s!==e)ta.value=v.slice(0,s)+'||'+v.slice(s,e)+'||'+v.slice(e);else{ta.value=v.slice(0,s)+'||||'+v.slice(s);ta.selectionStart=ta.selectionEnd=s+2}ta.focus()});
$('btnSubmitPost').addEventListener('click',async()=>{const t=$('npTitleInput').value.trim(),c=$('npContentInput').value.trim();if(!t||!c)return;let imgUrls=npI.slice();const ch=gC();if(!ch.posts)ch.posts=[];ch.posts.push({id:Uid(),user:U.name,avatar:U.avatar,title:t,content:c,time:Nm(),replies:[],roles:[],images:imgUrls});$('newPostPage').classList.remove('show');if(ch.type==='persona')rPe();else rPo();saveAll()});

let sAv=null;
$('btnAddServer').addEventListener('click',()=>{$('modalCreate').classList.add('show');$('inputServerName').value='';$('inputServerId').value='';sAv=null;$('serverAvatarPreview').style.display='none';$('serverAvatarPicker').querySelector('svg').style.display='';$('idHint').style.display='none'});
$('serverAvatarPicker').addEventListener('click',()=>$('serverAvatarFile').click());
$('serverAvatarFile').addEventListener('change',function(){if(this.files[0])rF(this.files[0],u=>{sAv=u;$('serverAvatarPreview').src=u;$('serverAvatarPreview').style.display='block';$('serverAvatarPicker').querySelector('svg').style.display='none'})});
$('btnCancelCreate').addEventListener('click',()=>$('modalCreate').classList.remove('show'));
$('modalCreate').addEventListener('click',e=>{if(e.target===$('modalCreate'))$('modalCreate').classList.remove('show')});
$('btnConfirmCreate').addEventListener('click',()=>{const n=$('inputServerName').value.trim(),sid=$('inputServerId').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');if(!n||!sid)return;if(S.some(s=>s.sid===sid)){$('idHint').style.display='block';return}S.push({id:Uid(),sid:sid,name:n,avatar:sAv,channels:[],roles:[],owner:'me'});$('modalCreate').classList.remove('show');rSb();selS(S[S.length-1].id);saveAll()});
$('btnAddChannel').addEventListener('click',()=>{$('modalChannel').classList.add('show');$('inputChName').value='';$('inputChType').value='forum'});
$('btnCancelCh').addEventListener('click',()=>$('modalChannel').classList.remove('show'));
$('modalChannel').addEventListener('click',e=>{if(e.target===$('modalChannel'))$('modalChannel').classList.remove('show')});
$('btnConfirmCh').addEventListener('click',()=>{const n=$('inputChName').value.trim();if(!n)return;gS().channels.push({id:Uid(),name:n,type:$('inputChType').value,posts:[]});$('modalChannel').classList.remove('show');rCL();saveAll()});
$('btnInvite').addEventListener('click',()=>{const s=gS();navigator.clipboard&&navigator.clipboard.writeText(s.name+' #'+s.sid).then(()=>alert('已复制'))});

let vf='all';
document.querySelectorAll('.vault-tabs .vt').forEach(t=>{t.addEventListener('click',()=>{vf=t.dataset.vt;document.querySelectorAll('.vault-tabs .vt').forEach(x=>x.classList.toggle('active',x===t));rV()})});
function rV(){const l=$('vaultList');l.innerHTML='';const items=saved.filter(x=>vf==='all'||x.type===vf);$('vaultEmpty').style.display=items.length?'none':'block';items.forEach(item=>{const s=S.find(x=>x.id===item.s);if(!s)return;let p=null;s.channels.forEach(ch=>{if(!p&&ch.posts)ch.posts.forEach(pp=>{if(pp.id===item.p)p=pp})});if(!p)return;const el=document.createElement('div');el.className='vault-item';el.innerHTML='<div class="vi-img">'+(p.images&&p.images.length?'<img src="'+p.images[0]+'">':'<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>')+'</div><div class="vi-info"><div class="vi-title">'+p.title+'</div><div class="vi-sub">'+s.name+' · '+(item.type==='persona'?'角色':'帖子')+'</div></div><div class="vi-unsave"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>';el.querySelector('.vi-unsave').addEventListener('click',e=>{e.stopPropagation();tgSv(item.s,item.p,item.type);rV()});l.appendChild(el)})}

function hA(){$('welcomeView').style.display='none';$('channelPage').classList.remove('show');$('channelView').classList.remove('show');$('pageChat').classList.remove('show');$('pageVault').classList.remove('show');$('pageSettings').classList.remove('show');$('chatListView').style.display='flex';cPM();TB.style.display='flex'}
function sT(tab){cT=tab;document.querySelectorAll('.tab-bar .tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));hA();if(tab==='home'){$('sidebar').classList.remove('hidden');if(aS){if(aCh)$('channelView').classList.add('show');else $('channelPage').classList.add('show')}else $('welcomeView').style.display='flex'}else{$('sidebar').classList.add('hidden');if(tab==='chat')$('pageChat').classList.add('show');else if(tab==='vault'){$('pageVault').classList.add('show');rV()}else $('pageSettings').classList.add('show')}}
document.querySelectorAll('.tab-bar .tab').forEach(t=>{t.addEventListener('click',()=>sT(t.dataset.tab))});
rSb();
}
})();
