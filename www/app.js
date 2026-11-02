const KEY='expenseTracker.v1';
const CATS={
 expense:[['طعام','🍔'],['مواصلات','🚗'],['سكن','🏠'],['فواتير','🧾'],['صحة','💊'],['تعليم','📚'],['ترفيه','🎮'],['تسوق','🛍️'],['ملابس','👕'],['اتصالات','📱'],['رياضة','🏋️'],['أخرى','📦']],
 income:[['راتب','💼'],['عمل حر','💻'],['استثمار','📈'],['هدية','🎁'],['أخرى','💰']]};
const ACCOUNTS=[['cash','نقدي','💵'],['bank','بنك','🏦'],['wallet','محفظة إلكترونية','📱']];
const COLORS=['#0B8A5F','#2E7CD6','#E8A13A','#E05252','#7C5CD6','#0FA3A3','#E56AA0','#5B8C2A','#D6782E','#4A6FA5','#8A6D3B','#666'];
const CUR={LYD:'د.ل.',EGP:'ج.م',USD:'$',EUR:'€',SAR:'ر.س'};
let state=load(), view=new Date(); view.setDate(1);
let fType='expense', fCat='طعام', editingId=null, typeFilter='all', catFilter='';
let acctFilter='';
function load(){let s={tx:[],budgets:{},currency:'LYD'};try{const p=JSON.parse(localStorage.getItem(KEY));if(p&&Array.isArray(p.tx))s=p}catch(e){}
 s.budgets=s.budgets||{}; s.catBudgets=s.catBudgets||{}; s.goals=s.goals||[]; s.dark=!!s.dark; s.theme=s.theme||''; s.font=s.font||''; s.wishes=s.wishes||[]; s.challenges=s.challenges||[]; s.work=s.work||{salary:0,dpm:22,hpd:8}; s.debts=s.debts||[]; s.lock=s.lock||{on:false,hash:'',salt:'',mins:5,bio:false}; s.autoBackup=s.autoBackup||{on:false,name:'',last:0}; s.round=s.round||{on:false,step:10,goalId:''}; s.sweeps=s.sweeps||[]; s.inst=s.inst||[]; s.netLog=s.netLog||[];
 s.tx.forEach(t=>{t.time=t.time||'';t.account=t.account||'cash';t.recurring=!!t.recurring;t.mood=t.mood||''}); return s}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
const $=id=>document.getElementById(id);
const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const fmt=n=>new Intl.NumberFormat('ar',{maximumFractionDigits:2}).format(Math.round(n*100)/100)+' '+(CUR[state.currency]||state.currency);
const sum=(arr,k)=>arr.filter(t=>t.type===k).reduce((s,t)=>s+t.amount,0);
const monthTx=(d=view)=>state.tx.filter(t=>t.date.startsWith(ym(d)));
const byDT=(a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||''))||b.id.localeCompare(a.id);
const catIcon=c=>{for(const k in CATS){const f=CATS[k].find(x=>x[0]===c);if(f)return f[1]}return'📦'};
const accOf=id=>ACCOUNTS.find(a=>a[0]===id)||ACCOUNTS[0];
const esc=s=>(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const todayStr=()=>new Date().toISOString().slice(0,10);
const nowTime=()=>new Date().toTimeString().slice(0,5);
function relDay(dateStr){const t=todayStr();const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
 if(dateStr===t)return'اليوم'; if(dateStr===y)return'أمس'; return new Date(dateStr+'T12:00').toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long'})}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function go(name){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));$('screen-'+name).classList.add('on');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));window.scrollTo({top:0});if(name==='lab')renderLab()}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

const THEMES=[

['m1','m','الذهبي الملكي','أسود وذهبي فاخر','#AE7E0A','#8A6408','#0B1120','#141E33','#1A2742','#2A3A5C','#EDF2FC','#97A7C6','#1D2B4D','#131F3A','#0B1120','#232F4D'],
['m2','m','الزمردي الليلي','أخضر عميق هادئ','#0FA37A','#0B8A5F','#0A1410','#122019','#182A20','#24402F','#E7F4EC','#8FAE9C','#0E3B2A','#0A2A1E','#06180F','#173528'],
['m3','m','الأزرق الفولاذي','رصين وواضح','#33608C','#274B6E','#EEF2F6','#FFFFFF','#F6F9FB','#D9E2EC','#16283C','#64788E','#3E6DA3','#33608C','#22405F','#E3EDF7'],
['m4','m','المحيطي','أزرق محيط منعش','#0E7C86','#0A5F68','#EBF6F7','#FFFFFF','#F4FAFA','#D5E8EA','#10333A','#5F7E84','#12A5B4','#0E7C86','#084C54','#E0F2F3'],
['m5','m','الصحراوي الرملي','دافئ وترابي','#9A6B2F','#7A5423','#F7F1E6','#FFFDF8','#FBF6EC','#E9DCC3','#33270F','#8A7A56','#C49A52','#9A6B2F','#6E4E20','#F3E8D2'],
['m6','m','الفحمي العصري','رمادي داكن أنيق','#7FA8C9','#5B87AC','#101114','#1A1B1F','#222329','#33343B','#F0F1F4','#9BA0AA','#26272E','#17181C','#0C0C0E','#26272E'],
['m7','m','الغابات','أخضر طبيعي','#2E7D32','#1F5C24','#EFF6EE','#FFFFFF','#F5FAF4','#DCE9DA','#17301A','#63755F','#43A047','#2E7D32','#1B4D1F','#E4F2E2'],
['m8','m','البنفسجي الليلي','غامض وعميق','#8B6FD8','#6D4FC2','#140F24','#1F1836','#271E47','#3A2E63','#EFEAFB','#A79BCB','#4A3590','#33235F','#1B1236','#2A2049'],
['m9','m','النحاسي البرونزي','دفء معدني','#B06A2C','#8C5220','#F8F1EA','#FFFFFF','#FBF5EE','#EBDCCB','#37220E','#8C7358','#CD8A44','#B06A2C','#7E4C1C','#F5E7D7'],
['m10','m','الزيتوني','هادئ وعملي','#6B7F2A','#52631E','#F2F4E8','#FFFFFF','#F8FAF0','#E0E4CB','#272E12','#767E5A','#8CA03C','#6B7F2A','#48561A','#EBEFDA'],

['f1','f','الوردي الناعم','أنوثة هادئة','#D14D8B','#AE3570','#FDF1F6','#FFFFFF','#FEF7FA','#F6D9E6','#3D1225','#9A6B82','#F083B4','#D14D8B','#A02A5E','#FCE4EF'],
['f2','f','اللافندر الحالم','بنفسجي فاتح رقيق','#8A6FD8','#6D4FC2','#F3F0FD','#FFFFFF','#F8F6FE','#E2DBF6','#2A1E4D','#8378AC','#B79CED','#8A6FD8','#5E3FB0','#ECE7FC'],
['f3','f','الخوخي الدافئ','مشرق ومبهج','#E07840','#C25E2A','#FDF3EC','#FFFFFF','#FEF8F3','#F6DFCE','#3D2110','#9A7B63','#F5A26B','#E07840','#B34E1E','#FCEBDD'],
['f4','f','النعناعي المنعش','نظيف ومنعش','#1FA98A','#157A64','#ECF8F3','#FFFFFF','#F4FBF7','#D3EEE1','#0F2F26','#5F8577','#3FC7A5','#1FA98A','#0F6B54','#DFF5EC'],
['f5','f','السماوي اللطيف','أزرق هادئ','#4A90D9','#3570AE','#EEF5FD','#FFFFFF','#F5F9FE','#D8E7F6','#16324D','#6B87A0','#7FB2EA','#4A90D9','#2A5A94','#E3EFFC'],
['f6','f','المرجاني','حيوي ودافئ','#EE6A5F','#D14A40','#FDF0EE','#FFFFFF','#FEF6F4','#F6DAD5','#3D1712','#9A7268','#F78D7D','#EE6A5F','#C23B32','#FCE7E2'],
['f7','f','الروز جولد','فخامة وردية','#C4744E','#A35736','#FAF1EC','#FFFFFF','#FCF6F1','#EFDBCF','#38200F','#96765E','#E0A184','#C4744E','#96502C','#F7E6DA'],
['f8','f','الأوركيد','بنفسجي وردي زاهي','#B04FD0','#8E35AC','#FAF0FD','#FFFFFF','#FCF6FE','#EFD6F6','#33133D','#8E6B9A','#CE7FEA','#B04FD0','#7E2599','#F6E2FC'],
['f9','f','البرقوقي الليلي','أنيق وغامض','#C77FB8','#A85A9C','#1D0F1E','#2C1830','#38203C','#4E2C52','#FAEDF8','#B08FA9','#5C2A63','#3F1D45','#240F28','#37203B'],
['f10','f','الساكورا','زهور الكرز اليابانية','#DE6FA3','#C24E85','#FDF3F7','#FFFFFF','#FEF8FA','#F6DEE8','#3A1626','#9C7387','#F2A7C6','#DE6FA3','#B83A76','#FBE7F0'],

['n1','n','منتصف الليل','أزرق ليلي عميق','#5B8DEF','#3A66C4','#070B16','#0E1626','#14203A','#22345C','#E8EEFC','#8CA0C8','#16294D','#0E1B36','#05080F','#16233F'],
['n2','n','العنبري الليلي','دفء ذهبي خافت','#E8A13A','#C77F1F','#171106','#241A0B','#2E210E','#4A3717','#FBF3DF','#C4A97B','#3A2A0E','#241A0B','#120C04','#2E2210'],
['n3','n','الكوني','بنفسجي فضائي','#9D7BEA','#7B55D4','#0E0819','#190E2E','#21143E','#36235C','#F0EAFB','#A894CC','#2E1A56','#1D1038','#0B0516','#22153F'],
['n4','n','الغابي الليلي','أخضر ليلي مطمئن','#3FA46A','#2C7D4F','#071009','#0D1D12','#122616','#1E4028','#E9F5EC','#8FB598','#12351D','#0C2413','#050F08','#132A19'],
['n5','n','العنابي العميق','أحمر ليلي راقٍ','#C94F6D','#A83A55','#160709','#240C10','#301218','#4E1E28','#FBEDEF','#C08F99','#3D121C','#28090F','#120406','#2E1218'],
['n6','n','أعماق الفيروز','مائي ليلي هادئ','#2BB3A3','#1E8A7D','#051413','#0A201E','#0E2A27','#17423D','#E7F6F3','#84B3AB','#0E3A34','#082723','#03100F','#0E2A26'],
['n7','n','الأسود الذهبي','فخامة ليلية','#D9B64A','#B8942F','#0A0A08','#161511','#1F1E18','#3A3626','#F7F1DC','#B3A87F','#2A2513','#191712','#080806','#23211A'],
['n8','n','القمري','رمادي مزرق هادئ','#8FA3B8','#6C8299','#0D1117','#161C24','#1D2530','#2E3947','#EDF2F7','#97A5B4','#232E3D','#161E29','#090C10','#1C242E'],
['n9','n','الوردي العميق','وردي ليلي أنيق','#DE7FB0','#C2548A','#170710','#260B1A','#321026','#52203C','#FBEFF5','#BE8FA9','#42122C','#2B0A1D','#13040D','#2F0F22'],
['n10','n','النحاسي الليلي','برونزي دافئ داكن','#D08A4A','#AE6C33','#140B06','#211209','#2B190C','#472B15','#FAF0E4','#C09E7C','#38200D','#241305','#100702','#2A190D']
].map(a=>({id:a[0],g:a[1],name:a[2],desc:a[3],v:{'--green':a[4],'--green-d':a[5],'--bg':a[6],'--card':a[7],'--field':a[8],'--line':a[9],'--ink':a[10],'--mut':a[11],'--hero1':a[12],'--hero2':a[13],'--hero3':a[14],'--tint':a[15]}}));
const THEME_VARS=['--green','--green-d','--bg','--card','--field','--line','--ink','--mut','--hero1','--hero2','--hero3','--tint'];
const LIGHT_FACES={
n1:{'--green':'#5B8DEF','--green-d':'#3A66C4','--bg':'#EAF0FD','--card':'#FFFFFF','--field':'#F4F8FE','--line':'#D3DFF5','--ink':'#12233F','--mut':'#5F779E','--hero1':'#7FA6F2','--hero2':'#5B8DEF','--hero3':'#3A66C4','--tint':'#DCE9FC'},
n2:{'--green':'#E8A13A','--green-d':'#C77F1F','--bg':'#FBF3DF','--card':'#FFFFFF','--field':'#FEF9EC','--line':'#F0DFB8','--ink':'#3A2A0E','--mut':'#8C7440','--hero1':'#F2C063','--hero2':'#E8A13A','--hero3':'#C77F1F','--tint':'#FBEED3'},
n3:{'--green':'#9D7BEA','--green-d':'#7B55D4','--bg':'#F1EBFD','--card':'#FFFFFF','--field':'#F8F5FE','--line':'#DED2F7','--ink':'#2A1850','--mut':'#7A68A8','--hero1':'#B79CED','--hero2':'#9D7BEA','--hero3':'#7B55D4','--tint':'#E7DFFC'},
n4:{'--green':'#3FA46A','--green-d':'#2C7D4F','--bg':'#EAF5EE','--card':'#FFFFFF','--field':'#F4FAF5','--line':'#CFE8D6','--ink':'#12301C','--mut':'#5F7E68','--hero1':'#63BE82','--hero2':'#3FA46A','--hero3':'#2C7D4F','--tint':'#DFF2E4'},
n5:{'--green':'#C94F6D','--green-d':'#A83A55','--bg':'#FBEFF1','--card':'#FFFFFF','--field':'#FDF6F7','--line':'#F3D3DA','--ink':'#3A121C','--mut':'#96626E','--hero1':'#E07A90','--hero2':'#C94F6D','--hero3':'#A83A55','--tint':'#F9E0E5'},
n6:{'--green':'#2BB3A3','--green-d':'#1E8A7D','--bg':'#EAF7F4','--card':'#FFFFFF','--field':'#F3FAF8','--line':'#CDE8E2','--ink':'#0C2B27','--mut':'#5E857E','--hero1':'#4CC4B5','--hero2':'#2BB3A3','--hero3':'#1E8A7D','--tint':'#DDF2ED'},
n7:{'--green':'#D9B64A','--green-d':'#B8942F','--bg':'#F8F3DF','--card':'#FFFFFF','--field':'#FCF8EC','--line':'#EADFB9','--ink':'#33290D','--mut':'#877A4E','--hero1':'#E3C86E','--hero2':'#D9B64A','--hero3':'#B8942F','--tint':'#F3EACB'},
n8:{'--green':'#8FA3B8','--green-d':'#6C8299','--bg':'#EEF2F6','--card':'#FFFFFF','--field':'#F6F9FB','--line':'#D9E2EC','--ink':'#1B2836','--mut':'#68798C','--hero1':'#A9BCD2','--hero2':'#8FA3B8','--hero3':'#6C8299','--tint':'#E2EAF1'},
n9:{'--green':'#DE7FB0','--green-d':'#C2548A','--bg':'#FBEFF5','--card':'#FFFFFF','--field':'#FDF6F9','--line':'#F3D3E2','--ink':'#38122A','--mut':'#966A84','--hero1':'#EE9CC4','--hero2':'#DE7FB0','--hero3':'#C2548A','--tint':'#F9E1EC'},
n10:{'--green':'#D08A4A','--green-d':'#AE6C33','--bg':'#F9F0E4','--card':'#FFFFFF','--field':'#FCF6EE','--line':'#EDDCC6','--ink':'#37220E','--mut':'#8C7358','--hero1':'#E0A76A','--hero2':'#D08A4A','--hero3':'#AE6C33','--tint':'#F5E7D3'}};
function applyDark(){
 THEME_VARS.forEach(k=>document.body.style.removeProperty(k));
 document.body.classList.remove('dark');
 const t=THEMES.find(x=>x.id===state.theme);
 if(t&&t.g==='n'){
   const pal=state.dark?t.v:LIGHT_FACES[t.id];
   Object.entries(pal).forEach(([k,val])=>document.body.style.setProperty(k,val));
   $('darkBtn').textContent=state.dark?'☀️':'🌙'; return}
 if(state.dark){document.body.classList.add('dark');$('darkBtn').textContent='☀️';return}
 if(t){Object.entries(t.v).forEach(([k,val])=>document.body.style.setProperty(k,val));$('darkBtn').textContent='🎨'}
 else{$('darkBtn').textContent='🌙'}
}
function toggleDark(){state.dark=!state.dark;save();applyDark();renderThemes();const t=THEMES.find(x=>x.id===state.theme);
 toast(t&&t.g==='n'?(state.dark?'🌙 الوجه الليلي لثيمك':'☀️ الوجه الصباحي لثيمك — نفس الثيم'):(state.dark?'🌙 الوضع الليلي — ثيمك محفوظ وسيعود عند الرجوع للنهاري':'☀️ الوضع النهاري'))}
function pickTheme(id){const t=THEMES.find(x=>x.id===id);state.theme=id;state.dark=!!(t&&t.g==='n');save();applyDark();renderThemes();toast('🎨 تم تطبيق ثيم «'+t.name+'»')}
function renderThemes(){
 const card=t=>'<button class="theme '+(state.theme===t.id?'on':'')+'" onclick="pickTheme(\''+t.id+'\')"><span class="chk">✓</span><div class="prev" style="background:linear-gradient(135deg,'+t.v['--hero1']+','+t.v['--hero3']+')"></div><div class="tn">'+t.name+'</div><div class="td">'+t.desc+'</div></button>';
 const m=$('themesM'),f=$('themesF'),n=$('themesN'); if(!m||!f)return;
 m.innerHTML=THEMES.filter(t=>t.g==='m').map(card).join('');
 f.innerHTML=THEMES.filter(t=>t.g==='f').map(card).join('');
 if(n)n.innerHTML=THEMES.filter(t=>t.g==='n').map(card).join('');
 renderFonts();
}

const FONTS=[
['','الحديث الافتراضي','خط نظام الهاتف','system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'],
['naskh','النسخ الأنيق','كلاسيكي مريح للقراءة','"Noto Naskh Arabic","Traditional Arabic","Times New Roman",serif'],
['kufi','الكوفي الهندسي','حروف هندسية عصرية','"Noto Kufi Arabic","Segoe UI",sans-serif'],
['amiri','الأميري التراثي','روح الخط العربي الأصيل','Amiri,"Noto Naskh Arabic",serif'],
['tahoma','تاهوما الواضح','واضح وحاد على الشاشات','Tahoma,Geneva,"Segoe UI",sans-serif'],
['noto','نوتو العصري','خط جوجل العربي الحديث','"Noto Sans Arabic",Roboto,"Segoe UI",sans-serif']
];
function applyFont(){const f=FONTS.find(x=>x[0]===state.font);if(f&&f[0])document.body.style.setProperty('--font',f[3]);else document.body.style.removeProperty('--font')}
function pickFont(id){state.font=id;save();applyFont();renderFonts();const f=FONTS.find(x=>x[0]===id);toast('✍️ تم تطبيق خط «'+f[1]+'»')}
function renderFonts(){
 const g=$('fontsGrid'); if(!g)return;
 g.innerHTML=FONTS.map(f=>'<button class="theme '+(state.font===f[0]?'on':'')+'" onclick="pickFont(\''+f[0]+'\')"><span class="chk">✓</span><div style="font-family:'+f[3]+';font-size:16.5px;font-weight:700;padding:5px 2px 7px;white-space:nowrap;overflow:hidden">تتبّع المصروفات ١٢٣</div><div class="tn">'+f[1]+'</div><div class="td">'+f[2]+'</div></button>').join('');
}
$('themeReset').onclick=()=>{state.theme='';state.dark=false;save();applyDark();renderThemes();toast('تمت العودة للثيم الافتراضي')};
$('darkBtn').onclick=toggleDark; $('darkBtn2').onclick=toggleDark;

function render(){
 const now=new Date(), hr=now.getHours();
 const greet=hr<12?'صباح الخير':'مساء الخير';
 $('heroDate').textContent=greet+' 👋 • '+now.toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('monthLabel').textContent=view.toLocaleDateString('ar',{month:'long',year:'numeric'});
 const tx=monthTx(), inc=sum(tx,'income'), exp=sum(tx,'expense'), net=inc-exp;
 const daysIn=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 $('heroNet').textContent=fmt(net);
 $('heroHint').textContent=tx.length?('سجّلت '+tx.length+' حركة هذا الشهر • متوسط المصروف اليومي '+fmt(exp/daysIn)+(inc?' • ادّخرت '+Math.max(0,Math.round(net/inc*100))+'% من دخلك':'')):'لا حركات بعد في هذا الشهر — ابدأ بزر ＋';
 $('sumInc').textContent=fmt(inc); $('sumExp').textContent=fmt(exp);
 
 const upto=tx.length||true; const endKey=ym(view);
 $('acctStrip').innerHTML=ACCOUNTS.map(a=>{const bal=state.tx.filter(t=>t.account===a[0]&&t.date.slice(0,7)<=endKey).reduce((s,t)=>s+(t.type==='income'?t.amount:-t.amount),0);
  return '<div class="acct"><div class="ai">'+a[2]+'</div><div class="at">'+a[1]+'</div><div class="av">'+fmt(bal)+'</div></div>'}).join('');
 const b=state.budgets[ym(view)]||0, pct=b?Math.round(exp/b*100):0;
 $('budgetBar').style.width=Math.min(100,pct)+'%'; $('budgetBar').style.background=exp>b&&b?'var(--red)':'var(--green)';
 $('budgetSpent').innerHTML='أُنفق <b>'+fmt(exp)+'</b>'+(b?' من <b>'+fmt(b)+'</b>':'');
 $('budgetPct').textContent=b?(pct+'%'):'لم تُحدَّد ميزانية';
 $('budgetLeft').innerHTML=b?(exp>b?'تجاوز بـ <b style="color:var(--red)">'+fmt(exp-b)+'</b>':'المتبقي <b>'+fmt(b-exp)+'</b>'):'حدّدها من تبويب «المزيد»';
 $('budgetInput').value=b||''; $('currency').value=state.currency;
 renderRecurBanner(); renderDonut(tx,exp); renderRecent(tx); renderGoals(); renderTxList(); renderReports(tx,exp,inc); renderMore(); renderStats(); renderThemes(); try{renderSmart()}catch(e){console.warn('smart',e)}
}
function renderRecurBanner(){
 const cur=monthTx(); const seen=new Set(cur.filter(t=>t.recurring).map(t=>t.cat+'|'+t.amount+'|'+t.type));
 const due=[]; const map={};
 state.tx.filter(t=>t.recurring&&t.date.slice(0,7)<ym(view)).forEach(t=>{const k=t.cat+'|'+t.amount+'|'+t.type; if(!seen.has(k)&&!map[k]){map[k]=1;due.push(t)}});
 const box=$('recurBox');
 if(!due.length){box.style.display='none';return}
 box.style.display='block';
 box.innerHTML='🔁 لديك <b>'+due.length+'</b> حركة متكررة مستحقة لهذا الشهر: '+due.map(t=>esc(t.cat)+' ('+fmt(t.amount)+')').join('، ')+'<br><button id="addDue">إضافتها كلها لهذا الشهر</button>';
 $('addDue').onclick=()=>{due.forEach(t=>{const day=Math.min(parseInt(t.date.slice(8,10))||1,new Date(view.getFullYear(),view.getMonth()+1,0).getDate());
   state.tx.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),type:t.type,amount:t.amount,cat:t.cat,note:t.note||'',account:t.account,date:ym(view)+'-'+String(day).padStart(2,'0'),time:t.time||nowTime(),recurring:true})});
  save();render();toast('تمت إضافة الحركات المتكررة')};
}
function renderDonut(tx,exp){
 const by={}; tx.filter(t=>t.type==='expense').forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
 const entries=Object.entries(by).sort((a,b)=>b[1]-a[1]);
 if(!entries.length){$('donutBox').innerHTML='<div class="empty" style="flex:1"><span class="ei">🧾</span>لا مصروفات هذا الشهر لعرض توزيعها.</div>';return}
 let off=25, segs='';
 entries.forEach((e,i)=>{const p=e[1]/exp*100;segs+='<circle cx="60" cy="60" r="48" fill="none" stroke="'+COLORS[i%COLORS.length]+'" stroke-width="17" stroke-dasharray="'+Math.max(0,p-1.5)+' '+(100-Math.max(0,p-1.5))+'" stroke-dashoffset="'+off+'" transform="rotate(-90 60 60)"/>';off-=p});
 $('donutBox').innerHTML='<svg width="120" height="120" viewBox="0 0 120 120" style="flex-shrink:0"><circle cx="60" cy="60" r="48" fill="none" stroke="var(--line)" stroke-width="17"/>'+segs+'<text x="60" y="57" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--ink)">'+fmt(exp).split(' ')[0]+'</text><text x="60" y="73" text-anchor="middle" font-size="9.5" fill="var(--mut)">إجمالي المصروفات</text></svg>'
 +'<div class="legend">'+entries.slice(0,6).map((e,i)=>'<div class="li"><span class="dot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+esc(e[0])+'<b>'+fmt(e[1])+'</b><span class="pc">'+Math.round(e[1]/exp*100)+'%</span></div>').join('')+'</div>';
}
function txRow(t){
 const a=accOf(t.account);
 return '<div class="tx"><div class="ic" style="background:'+(t.type==='income'?'#E7F6EE':'var(--field)')+'">'+catIcon(t.cat)+'</div><div class="mid"><div class="nm">'+esc(t.cat)+(t.recurring?' 🔁':'')+'</div><div class="ds">'+a[2]+' '+a[1]+(t.note?' • '+esc(t.note):'')+'</div></div><div><div class="am" style="color:'+(t.type==='income'?'var(--green)':'var(--red)')+'">'+(t.type==='income'?'+':'−')+' '+fmt(t.amount)+'</div><div class="tm">'+(t.time?'🕐 '+t.time+' • ':'')+t.date+'</div></div><div class="acts"><button class="iconbtn" onclick="openEdit(\''+t.id+'\')" aria-label="تعديل">✏️</button><button class="iconbtn" onclick="delTx(\''+t.id+'\')" aria-label="حذف">🗑️</button></div></div>';
}
function renderRecent(tx){
 const list=[...tx].sort(byDT).slice(0,5);
 $('recentList').innerHTML=list.length?list.map(txRow).join(''):'<div class="empty"><span class="ei">🌱</span>لا حركات بعد. أضف أول حركة بزر ＋ وستظهر هنا فوراً.</div>';
}
function renderGoals(){
 const has=state.goals.length>0;
 $('goalsPreview').style.display=has?'block':'none';
 $('goalsHome').innerHTML=state.goals.map(g=>{const p=Math.min(100,Math.round(g.saved/g.target*100));
  return '<div class="goal" style="padding:7px 0"><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>🎯 '+esc(g.name)+'</b><span style="color:var(--mut)">'+fmt(g.saved)+' من '+fmt(g.target)+' • '+p+'%</span></div><div class="bar2"><i style="width:'+p+'%"></i></div></div>'}).join('');
 $('goalList').innerHTML=has?state.goals.map(g=>{const p=Math.min(100,Math.round(g.saved/g.target*100));
  return '<div class="goal" style="padding:9px 0;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>🎯 '+esc(g.name)+'</b><span>'+p+'%</span></div><div class="bar2"><i style="width:'+p+'%"></i></div><div class="rowb"><span>المحفوظ: <b>'+fmt(g.saved)+'</b></span><span>المتبقي: <b>'+fmt(Math.max(0,g.target-g.saved))+'</b></span></div><div style="display:flex;gap:6px;margin-top:7px"><button class="iconbtn" style="width:auto;padding:0 12px" onclick="goalAddSaved(\''+g.id+'\')">＋ إضافة ادخار</button><button class="iconbtn" style="width:auto;padding:0 12px" onclick="goalDel(\''+g.id+'\')">حذف الهدف</button></div></div>'}).join(''):'<div class="empty">لا أهداف بعد. أضف هدفك الأول بالأعلى.</div>';
}
window.goalAddSaved=id=>{const g=state.goals.find(x=>x.id===id);const v=parseFloat(prompt('كم تريد أن تضيف إلى ادخار «'+g.name+'»؟'));if(v>0){g.saved+=v;save();render();toast('تمت إضافة الادخار 🎯')}};
window.goalDel=id=>{if(confirm('حذف هذا الهدف؟')){state.goals=state.goals.filter(x=>x.id!==id);save();render()}};
function renderTxList(){
 const cats=[...new Set(monthTx().map(t=>t.cat))];
 $('catChips').innerHTML='<button class="chip '+(catFilter===''?'on':'')+'" data-c="">كل التصنيفات</button>'+cats.map(c=>'<button class="chip '+(catFilter===c?'on':'')+'" data-c="'+esc(c)+'">'+catIcon(c)+' '+esc(c)+'</button>').join('');
 document.querySelectorAll('#catChips .chip').forEach(ch=>ch.onclick=()=>{catFilter=ch.dataset.c;render()});
 const q=$('search').value.trim(), from=$('dateFrom').value, to=$('dateTo').value;
 let list=monthTx().filter(t=>(typeFilter==='all'||t.type===typeFilter)&&(!catFilter||t.cat===catFilter)&&(!acctFilter||t.account===acctFilter||(t.type==='transfer'&&(t.from===acctFilter||t.to===acctFilter)))&&(!q||(t.note||'').includes(q)||t.cat.includes(q))&&(!from||t.date>=from)&&(!to||t.date<=to));
 list.sort(byDT);
 if(!list.length){$('txList').innerHTML='<div class="empty"><span class="ei">🔍</span>لا نتائج مطابقة. جرّب تغيير البحث أو الفترة.</div>';return}
 let html='',day='';
 list.forEach(t=>{
   if(t.date!==day){day=t.date;const dtx=list.filter(x=>x.date===day);const dn=sum(dtx,'income')-sum(dtx,'expense');
     html+='<div class="dayhead"><span>📅 '+relDay(day)+' • '+day+'</span><span>صافي اليوم: '+(dn>=0?'+':'−')+' '+fmt(Math.abs(dn))+'</span></div>'}
   html+=txRow(t)});
 $('txList').innerHTML=html;
}
function renderReports(tx,exp,inc){
 
 const daysIn=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 const isCur=ym(view)===ym(new Date()); const elapsed=isCur?new Date().getDate():daysIn;
 const forecast=isCur&&elapsed>0?exp/elapsed*daysIn:exp;
 const biggest=tx.filter(t=>t.type==='expense').sort((a,b)=>b.amount-a.amount)[0];
 const byDay={}; tx.filter(t=>t.type==='expense').forEach(t=>byDay[t.date]=(byDay[t.date]||0)+t.amount);
 const topDay=Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0];
 $('insightDuo').innerHTML=
  '<div class="mini"><div class="ic" style="background:#FFF3DC">🔮</div><div><div class="t">'+(isCur?'توقّع مصروفات نهاية الشهر':'مصروفات الشهر')+'</div><div class="v">'+fmt(Math.round(forecast))+'</div></div></div>'
 +'<div class="mini"><div class="ic" style="background:#EAF0FE">🐷</div><div><div class="t">معدل الادخار</div><div class="v">'+(inc?Math.max(0,Math.round((inc-exp)/inc*100))+'%':'—')+'</div></div></div>'
 +'<div class="mini"><div class="ic" style="background:#FDECEC">🏆</div><div><div class="t">أكبر حركة هذا الشهر</div><div class="v" style="font-size:13.5px">'+(biggest?esc(biggest.cat)+' • '+fmt(biggest.amount):'—')+'</div></div></div>'
 +'<div class="mini"><div class="ic" style="background:#E7F6EE">📅</div><div><div class="t">أعلى يوم إنفاقاً</div><div class="v" style="font-size:13.5px">'+(topDay?relDay(topDay[0])+' • '+fmt(topDay[1]):'—')+'</div></div></div>';
 let months=[];for(let i=5;i>=0;i--){const d=new Date(view.getFullYear(),view.getMonth()-i,1);months.push({d,v:sum(monthTx(d),'expense')})}
 const max=Math.max(...months.map(m=>m.v),1);
 $('chart').innerHTML=months.map((m,i)=>'<div class="col"><div class="cv">'+(m.v?new Intl.NumberFormat('ar',{notation:'compact'}).format(m.v):'')+'</div><div class="bar '+(i===5?'cur':'')+'" style="height:'+Math.max(3,m.v/max*95)+'px"></div><div class="cl">'+m.d.toLocaleDateString('ar',{month:'short'})+'</div></div>').join('');
 const by={};tx.filter(t=>t.type==='expense').forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
 const entries=Object.entries(by).sort((a,b)=>b[1]-a[1]);
 $('rankList').innerHTML=entries.length?entries.map((e,i)=>'<div class="rank"><div class="n">'+(i+1)+'</div><div><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>'+catIcon(e[0])+' '+esc(e[0])+'</b><span style="color:var(--mut)">'+Math.round(e[1]/exp*100)+'%</span></div><div class="bar2"><i style="width:'+(e[1]/entries[0][1]*100)+'%"></i></div></div><b style="font-size:13.5px">'+fmt(e[1])+'</b></div>').join(''):'<div class="empty">لا مصروفات هذا الشهر.</div>';
 
 const cb=state.catBudgets[ym(view)]||{};
 const cbKeys=Object.keys(cb);
 $('catBudgetCard').style.display=cbKeys.length?'block':'none';
 $('catBudgetList').innerHTML=cbKeys.map(c=>{const spent=by[c]||0,lim=cb[c],p=lim?Math.round(spent/lim*100):0;
  return '<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>'+catIcon(c)+' '+esc(c)+'</b><span style="color:'+(spent>lim?'var(--red)':'var(--mut)')+'">'+fmt(spent)+' / '+fmt(lim)+' • '+p+'%'+(spent>lim?' ⚠️ تجاوز':'')+'</span></div><div class="progress" style="margin-top:6px"><i style="width:'+Math.min(100,p)+'%;background:'+(spent>lim?'var(--red)':'var(--green)')+'"></i></div></div>'}).join('');
 const prev=new Date(view.getFullYear(),view.getMonth()-1,1), ptx=monthTx(prev);
 const pi=sum(ptx,'income'), pe=sum(ptx,'expense');
 const delta=(c,p)=>p===0?(c>0?'<span class="up">جديد</span>':'—'):(c>=p?'<span class="up">▲ '+Math.round((c-p)/p*100)+'%</span>':'<span class="down">▼ '+Math.round((p-c)/p*100)+'%</span>');
 $('cmpBox').innerHTML='<span class="hd">البند</span><span class="hd">هذا الشهر</span><span class="hd">التغيّر</span>'
 +'<span>الدخل</span><b>'+fmt(inc)+'</b>'+delta(inc,pi)
 +'<span>المصروفات</span><b>'+fmt(exp)+'</b>'+delta(exp,pe)
 +'<span>الصافي</span><b>'+fmt(inc-exp)+'</b>'+delta(inc-exp,pi-pe);
 const allI=sum(state.tx,'income'), allE=sum(state.tx,'expense');
 const gm={};state.tx.filter(t=>t.type==='expense').forEach(t=>{const k=t.date.slice(0,7);gm[k]=(gm[k]||0)+t.amount});
 $('totalsBox').innerHTML='<div class="kv"><span>إجمالي الدخل (كل الشهور)</span><b style="color:var(--green)">'+fmt(allI)+'</b></div><div class="kv"><span>إجمالي المصروفات (كل الشهور)</span><b style="color:var(--red)">'+fmt(allE)+'</b></div><div class="kv"><span>الرصيد التراكمي</span><b>'+fmt(allI-allE)+'</b></div><div class="kv"><span>أعلى مصروف في شهر واحد</span><b>'+fmt(Math.max(0,...Object.values(gm),0))+'</b></div>';
}
function renderMore(){
 $('cbCat').innerHTML=CATS.expense.map(c=>'<option value="'+c[0]+'">'+c[1]+' '+c[0]+'</option>').join('');
 const cb=state.catBudgets[ym(view)]||{};
 $('cbManage').innerHTML=Object.entries(cb).map(([c,v])=>'<div class="kv"><span>'+catIcon(c)+' '+esc(c)+' — حتى '+fmt(v)+'</span><button class="iconbtn" onclick="cbDel(\''+esc(c)+'\')">🗑️</button></div>').join('');
}
window.cbDel=c=>{delete state.catBudgets[ym(view)][c];save();render();toast('تم حذف ميزانية التصنيف')};
function renderStats(){
 $('statCount').textContent=state.tx.length;
 if(state.tx.length){const sorted=[...state.tx].sort(byDT);$('statFirst').textContent=sorted[sorted.length-1].date+' '+(sorted[sorted.length-1].time||'');$('statLast').textContent=sorted[0].date+' '+(sorted[0].time||'')}
 else{$('statFirst').textContent='—';$('statLast').textContent='—'}
}

const NEEDS=['طعام','سكن','فواتير','مواصلات','صحة','تعليم','اتصالات'];
const monthShift=(base,delta)=>new Date(base.getFullYear(),base.getMonth()+delta,1);
const prevAvgMonths=(n)=>{let arr=[];for(let i=1;i<=n;i++)arr.push(monthTx(monthShift(view,-i)));return arr};
function digitNorm(s){return s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.').replace(/٬/g,'')}
const KW=[['طعام',['قهوة','قهوه','كافيه','مطعم','اكل','أكل','طعام','غداء','غدا','عشاء','عشا','فطور','سوبرماركت','بقالة','خضار','لحوم','مشروب','عصير','حلويات']],
['مواصلات',['بنزين','وقود','تاكسي','سيارة','سياره','مواصلات','اوبر','أوبر','كريم','موقف','صيانة سيارة']],
['سكن',['ايجار','إيجار','سكن']],['فواتير',['فاتورة','كهرباء','ماء','غاز','فواتير']],
['اتصالات',['انترنت','إنترنت','نت','هاتف','جوال','اتصالات','شحن خط','رصيد']],
['صحة',['دواء','ادوية','أدوية','طبيب','مستشفى','صيدلية','صحة','علاج','تحليل']],
['تعليم',['كتاب','دورة','دوره','تعليم','مدرسة','جامعة','دراسة']],
['ترفيه',['سينما','ترفيه','لعبة','العاب','ألعاب','نتفليكس','اشتراك','رحلة','سفر']],
['تسوق',['تسوق','شراء','اشتريت','محل','سوق']],['ملابس',['ملابس','حذاء','قميص','بنطلون']],
['رياضة',['رياضة','نادي','جيم','لياقة']]];
const INCWORDS=['راتب','استلمت','قبضت','قضبت','دخل','ايداع','إيداع','حوالة','بعت','ارباح','أرباح','مكافأة'];
function parseQuick(text){
 const t=digitNorm(text||''); const m=t.match(/(\d+(?:\.\d+)?)/); if(!m)return null;
 const amount=parseFloat(m[1]); if(!amount||amount<=0)return null;
 const isInc=INCWORDS.some(w=>t.includes(w));
 let cat='أخرى';
 if(isInc){cat=t.includes('راتب')?'راتب':t.includes('بعت')||t.includes('عمل')?'عمل حر':'أخرى'}
 else{for(const [c,words] of KW){if(words.some(w=>t.includes(w))){cat=c;break}}}
 let date=todayStr();
 if(/امس|أمس|امبارح/.test(t))date=new Date(Date.now()-864e5).toISOString().slice(0,10);
 if(/غدا|غداً|بكرة|بكره/.test(t))date=new Date(Date.now()+864e5).toISOString().slice(0,10);
 return{type:isInc?'income':'expense',amount,cat,date,time:nowTime(),note:text.trim(),account:'cash',recurring:/ايجار|إيجار|اشتراك/.test(t)};
}
$('quickBtn').onclick=()=>{
 const raw=$('quickText').value; const p=parseQuick(raw);
 if(!p){toast('لم أفهم المبلغ — اكتب رقماً في الجملة');return}
 state.tx.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),...p});
 save(); $('quickText').value='';
 const d=new Date(p.date+'T12:00'); view=new Date(d.getFullYear(),d.getMonth(),1);
 render(); toast('✨ فهمتها: '+(p.type==='income'?'دخل':'مصروف')+' '+fmt(p.amount)+' • '+p.cat);
};
function healthScore(){
 const tx=monthTx(), inc=sum(tx,'income'), exp=sum(tx,'expense');
 const sr=inc>0?Math.max(0,(inc-exp)/inc):null;
 const fSave=sr===null?10:Math.min(1,sr/0.3)*30;
 const b=state.budgets[ym(view)]||0;
 const fBud=b?(exp<=b?18+7*(1-exp/b):Math.max(0,25-40*(exp/b-1))):12;
 const last3=[0,-1,-2].map(i=>sum(monthTx(monthShift(view,i)),'expense')).filter(v=>v>0);
 let fStab=12; if(last3.length>=2){const mean=last3.reduce((a,c)=>a+c,0)/last3.length;const sd=Math.sqrt(last3.reduce((a,c)=>a+(c-mean)**2,0)/last3.length);fStab=Math.max(0,Math.min(1,1-(mean?sd/mean:0)))*20}
 const allNet=sum(state.tx,'income')-sum(state.tx,'expense');
 const avgExp=last3.length?last3.reduce((a,c)=>a+c,0)/last3.length:exp;
 const fCov=avgExp>0?Math.min(1,Math.max(0,allNet)/avgExp/3)*15:7;
 const daysIn=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 const elapsed=ym(view)===ym(new Date())?new Date().getDate():daysIn;
 const activeDays=new Set(tx.map(t=>t.date)).size;
 const fTrack=Math.min(1,activeDays/Math.max(1,elapsed))*10;
 const total=Math.round(fSave+fBud+fStab+fCov+fTrack);
 return{total,f:[['الادخار من الدخل',fSave,30],['الالتزام بالميزانية',fBud,25],['استقرار المصروفات',fStab,20],['تغطية الطوارئ',fCov,15],['استمرارية التسجيل',fTrack,10]],
 grade:total>=80?'ممتازة 🌟':total>=65?'جيدة 💪':total>=45?'متوسطة — يمكن تحسينها':'تحتاج انتباهاً ⚠️'};
}
function smartInsights(){
 const out=[]; const tx=monthTx(), inc=sum(tx,'income'), exp=sum(tx,'expense');
 const prevs=prevAvgMonths(3);
 const daysIn=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 const isCur=ym(view)===ym(new Date()), elapsed=isCur?new Date().getDate():daysIn;
 if(!state.tx.length){out.push({k:'info',i:'👋',t:'سجّل حركاتك بانتظام وسيبدأ المستشار الذكي بتحليل أنماطك وتقديم نصائح مخصصة لك.'});return out}
 
 const b=state.budgets[ym(view)]||0;
 if(isCur&&b&&elapsed>0){const sp=exp/b, dp=elapsed/daysIn;
  if(sp>dp+0.15)out.push({k:'warn',i:'🚨',t:'تنفق أسرع من إيقاع الشهر: استهلكت '+Math.round(sp*100)+'% من ميزانيتك بينما مضى '+Math.round(dp*100)+'% فقط من الشهر.'});
  else out.push({k:'good',i:'✅',t:'إيقاع إنفاقك ضمن الميزانية حتى الآن ('+Math.round(sp*100)+'% مستهلك مقابل '+Math.round(dp*100)+'% من الشهر).'})}
 
 const prevBy={}; prevs.forEach(p=>p.filter(t=>t.type==='expense').forEach(t=>prevBy[t.cat]=(prevBy[t.cat]||0)+t.amount/3));
 const curBy={}; tx.filter(t=>t.type==='expense').forEach(t=>curBy[t.cat]=(curBy[t.cat]||0)+t.amount);
 Object.entries(curBy).sort((a,c)=>c[1]-a[1]).slice(0,3).forEach(([c,v])=>{const avg=prevBy[c]||0;
  if(avg>0&&v>avg*1.4&&v-avg>=50)out.push({k:'warn',i:'📈',t:'إنفاق غير معتاد في «'+c+'»: '+fmt(v)+' هذا الشهر مقابل متوسط '+fmt(Math.round(avg))+' — زيادة '+Math.round((v/avg-1)*100)+'%.'})});
 
 const th=Math.max(10,inc*0.005); const small=tx.filter(t=>t.type==='expense'&&t.amount<=th);
 if(small.length>=4)out.push({k:'warn',i:'🕳️',t:'تسريبات صغيرة: '+small.length+' مصروفاً صغيراً (≤ '+fmt(th)+') مجموعها '+fmt(sum(small,'expense'))+' هذا الشهر — الصغير المتكرر يصنع رقماً كبيراً.'});
 
 const groups={}; state.tx.filter(t=>t.type==='expense').forEach(t=>{const k=t.cat+'|'+t.amount;(groups[k]=groups[k]||new Set()).add(t.date.slice(0,7))});
 const subs=Object.entries(groups).filter(([k,s])=>s.size>=2&&[...s].some(m=>m>=ym(monthShift(new Date(),-3)))).map(([k])=>k);
 if(subs.length)out.push({k:'info',i:'🔁',t:'اكتشفت '+subs.length+' مصروفاً ثابتاً يتكرر شهرياً بنفس المبلغ ('+subs.slice(0,3).map(k=>k.split('|')[0]+' '+fmt(+k.split('|')[1])).join('، ')+') — راجعها، فربما فيها اشتراك منسي.'});
 
 const wd={}; state.tx.filter(t=>t.type==='expense').forEach(t=>{const d=new Date(t.date+'T12:00').getDay();wd[d]=(wd[d]||0)+t.amount});
 const peak=Object.entries(wd).sort((a,c)=>c[1]-a[1])[0];
 if(peak)out.push({k:'info',i:'📅',t:'أكثر أيام الأسبوع إنفاقاً عندك هو «'+['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][+peak[0]]+'» بإجمالي '+fmt(peak[1])+' عبر كل الشهور.'});
 
 const allNet=sum(state.tx,'income')-sum(state.tx,'expense');
 if(isCur&&elapsed>3){const dailyNet=(inc-exp)/elapsed;
  if(dailyNet<0&&allNet>0)out.push({k:'warn',i:'⏳',t:'بهذا الإيقاع، رصيدك التراكمي ('+fmt(allNet)+') سيكفي حوالي '+Math.max(1,Math.floor(allNet/Math.abs(dailyNet)))+' يوماً — خفّض المصروف اليومي لتمديده.'});
  if(dailyNet>=0)out.push({k:'good',i:'🌱',t:'صافيك اليومي موجب (+'+fmt(Math.round(dailyNet*100)/100)+'/يوم) — رصيدك ينمو بثبات.'})}
 const last3E=[-1,-2,-3].map(i=>sum(monthTx(monthShift(view,i)),'expense'));
 if(last3E.some(v=>v>0)){const avg=last3E.reduce((a,c)=>a+c,0)/3;const trend=(last3E[0]-last3E[2])/2;const fc=Math.max(0,Math.round(avg+trend));
  out.push({k:'info',i:'🔮',t:'توقّع مصروفات الشهر القادم بناءً على اتجاه آخر ٣ شهور: حوالي '+fmt(fc)+'.'})}
 
 if(isCur){const spentDays=new Set(tx.filter(t=>t.type==='expense').map(t=>+t.date.slice(8,10)));let zero=0;for(let d=1;d<=elapsed;d++)if(!spentDays.has(d))zero++;
  if(zero>=3)out.push({k:'good',i:'🏆',t:'لديك '+zero+' أيام بلا أي مصروف هذا الشهر حتى الآن — استمر، هذه قوة الادخار الحقيقية.'})}
 if(!out.length)out.push({k:'good',i:'👍',t:'لا ملاحظات مقلقة — إنفاقك متوازن هذا الشهر.'});
 return out;
}
function renderSmart(){
 const list=smartInsights();
 const h=list.map(x=>'<div class="insight '+x.k+'"><div class="ii">'+x.i+'</div><div>'+x.t+'</div></div>').join('');
 $('smartHome').innerHTML=list.slice(0,3).map(x=>'<div class="insight '+x.k+'"><div class="ii">'+x.i+'</div><div>'+x.t+'</div></div>').join('');
 $('smartAll').innerHTML=h;
 const hs=healthScore();
 let circ='';const C=2*Math.PI*34, off=C*(1-hs.total/100);
 circ='<svg width="92" height="92" viewBox="0 0 92 92"><circle cx="46" cy="46" r="34" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="46" cy="46" r="34" fill="none" stroke="'+(hs.total>=65?'var(--green)':hs.total>=45?'var(--amber)':'var(--red)')+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" transform="rotate(-90 46 46)"/><text x="46" y="44" text-anchor="middle" font-size="19" font-weight="900" fill="var(--ink)">'+hs.total+'</text><text x="46" y="60" text-anchor="middle" font-size="9" fill="var(--mut)">من ١٠٠</text></svg>';
 $('healthBox').innerHTML=circ+'<div class="factors"><div style="font-weight:800;margin-bottom:8px">'+hs.grade+'</div>'+hs.f.map(f=>'<div class="factor"><div class="fl2"><span>'+f[0]+'</span><b>'+Math.round(f[1])+' / '+f[2]+'</b></div><div class="bar2"><i style="width:'+Math.round(f[1]/f[2]*100)+'%"></i></div></div>').join('')+'</div>';
 renderHeat(); renderRule(); renderWhatIf(); renderAchv();
}
function renderHeat(){
 const daysIn=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 const firstDow=new Date(view.getFullYear(),view.getMonth(),1).getDay();
 const byDay={}; monthTx().filter(t=>t.type==='expense').forEach(t=>byDay[+t.date.slice(8,10)]=(byDay[+t.date.slice(8,10)]||0)+t.amount);
 const max=Math.max(...Object.values(byDay),1); const todayD=new Date().getDate(), isCur=ym(view)===ym(new Date());
 let html=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map(d=>'<div class="hd2">'+d+'</div>').join('');
 for(let i=0;i<firstDow;i++)html+='<div></div>';
 for(let d=1;d<=daysIn;d++){const v=byDay[d]||0;const inten=v?0.25+0.75*(v/max):0;
  html+='<div class="cell '+(v?'has':'')+' '+(isCur&&d===todayD?'today':'')+'" data-day="'+d+'" title="'+(v?fmt(v):'لا مصروفات')+'" style="'+(v?'background:rgba(224,82,82,'+inten+')':'')+'">'+d+'</div>'}
 $('heat').innerHTML=html;
 document.querySelectorAll('#heat .cell').forEach(c=>c.onclick=()=>{const ds=ym(view)+'-'+String(c.dataset.day).padStart(2,'0');$('dateFrom').value=ds;$('dateTo').value=ds;go('tx');renderTxList();toast('حركات يوم '+ds)});
}
function renderRule(){
 const tx=monthTx(), inc=sum(tx,'income');
 const needs=tx.filter(t=>t.type==='expense'&&NEEDS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
 const wants=tx.filter(t=>t.type==='expense'&&!NEEDS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
 const saveAmt=Math.max(0,inc-needs-wants);
 const cell=(t,v,target)=>'<div class="rc"><div class="rt">'+t+'</div><div class="rv">'+(inc?Math.round(v/inc*100)+'%':'—')+'</div><div class="rt">المثالي '+target+'% • '+(inc?fmt(v):'')+'</div></div>';
 $('ruleBox').innerHTML=cell('🏠 أساسيات',needs,50)+cell('🎮 رغبات',wants,30)+cell('🐷 ادخار',saveAmt,20);
}
function renderWhatIf(){
 const tx=monthTx(); const by={}; tx.filter(t=>t.type==='expense').forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
 const cats=Object.keys(by); const sel=$('wiCat');
 const keep=sel.value;
 sel.innerHTML=cats.length?cats.map(c=>'<option value="'+esc(c)+'">'+catIcon(c)+' '+esc(c)+' — '+fmt(by[c])+'/شهر</option>').join(''):'<option value="">لا مصروفات بعد</option>';
 if(keep&&cats.includes(keep))sel.value=keep;
 const upd=()=>{const c=sel.value,pct=+($('wiPct').value||20);$('wiPctLbl').textContent=pct+'%';
  if(!c||!by[c]){$('wiOut').innerHTML='أضف مصروفات أولاً لتجربة المحاكاة.';return}
  const m=by[c]*pct/100;
  $('wiOut').innerHTML='لو خفّضت «'+esc(c)+'» بنسبة '+pct+'%:<br>💰 توفّر <b>'+fmt(Math.round(m))+'</b> شهرياً = <b>'+fmt(Math.round(m*12))+'</b> سنوياً.<br><span style="color:var(--mut);font-size:12.5px">هذا المبلغ وحده قد يموّل هدف ادخار كامل خلال سنة.</span>'};
 sel.onchange=upd; $('wiPct').oninput=upd; upd();
}
function streakDays(){
 const set=new Set(state.tx.map(t=>t.date)); let s=0; const d=new Date();
 if(!set.has(d.toISOString().slice(0,10)))d.setDate(d.getDate()-1);
 while(set.has(d.toISOString().slice(0,10))){s++;d.setDate(d.getDate()-1)} return s;
}
function renderAchv(){
 const tx=monthTx(), inc=sum(tx,'income'), exp=sum(tx,'expense');
 const months=new Set(state.tx.map(t=>t.date.slice(0,7))).size;
 const bal=sum(state.tx,'income')-sum(state.tx,'expense');
 const A=[
 ['🌱','الخطوة الأولى','سجّل أول حركة',state.tx.length>=1],
 ['📝','مسجّل نشط','٣٠ حركة مسجلة',state.tx.length>=30],
  ['🏆','بطل التحدّيات','أكمل أول تحدّي توفير في المختبر',state.challenges.some(c=>chalProgress(c).status==='done')],
  ['🧘','سيد التأجيل','تخلّى عن ٣ مشتريات مؤجلة',state.wishes.filter(w=>w.st==='dropped').length>=3],
  ['🐷','المدّخر التلقائي','جمع ٥٠٠ بالتقريب الادخاري',state.sweeps.reduce((s,x)=>s+x.amount,0)>=500],
  ['🤝','سدّدت أول دين','أغلق دينًا بالكامل',state.debts.some(d=>d.total>0&&debtsRemain(d)===0)],
 ['🔥','سلسلة '+streakDays()+' أيام','٧ أيام تسجيل متواصلة',streakDays()>=7],
 ['🐷','مدّخر حكيم','ادخار ≥ ٢٠٪ من دخل شهر',inc>0&&(inc-exp)/inc>=0.2],
 ['🎯','صائد الأهداف','أكمل هدف ادخار',state.goals.some(g=>g.saved>=g.target&&g.target>0)],
 ['🔁','منظّم','فعّل حركة متكررة',state.tx.some(t=>t.recurring)],
 ['💰','رصيد متنامٍ','رصيد تراكمي ≥ ١٠٬٠٠٠',bal>=10000],
 ['📅','مخضرم','بيانات ٣ شهور مختلفة',months>=3],
 ['⚖️','ملتزم','شهر كامل ضمن الميزانية',!!state.budgets[ym(view)]&&exp>0&&exp<=(state.budgets[ym(view)]||0)]];
 $('achvList').innerHTML=A.map(a=>'<div class="badge '+(a[3]?'':'lock')+'"><div class="bi">'+a[0]+'</div><div class="bn">'+a[1]+'</div><div class="bd">'+a[2]+'</div><div class="bd">'+(a[3]?'✅ محقق':'🔒 لم يُفتح بعد')+'</div></div>').join('');
}

function fillCatGrid(){
 $('catGrid').innerHTML=CATS[fType].map(c=>'<button type="button" class="catcell '+(fCat===c[0]?'on':'')+'" data-cat="'+c[0]+'"><span class="ci">'+c[1]+'</span>'+c[0]+'</button>').join('');
 document.querySelectorAll('.catcell').forEach(b=>b.onclick=()=>{fCat=b.dataset.cat;$('fCatCustom').value='';fillCatGrid()});
}
function setType(t){fType=t;fCat=CATS[t][0][0];$('segExp').className=t==='expense'?'onE':'';$('segInc').className=t==='income'?'onI':'';fillCatGrid()}
$('segExp').onclick=()=>setType('expense'); $('segInc').onclick=()=>setType('income');
function openSheet(){$('overlay').classList.add('open')}
function closeSheet(){$('overlay').classList.remove('open');editingId=null}
$('fAccount').innerHTML=ACCOUNTS.map(a=>'<option value="'+a[0]+'">'+a[2]+' '+a[1]+'</option>').join('');
$('fab').onclick=()=>{editingId=null;$('sheetTitle').textContent='إضافة حركة جديدة';$('saveTx').textContent='حفظ الحركة';$('fAmount').value='';$('fNote').value='';$('fCatCustom').value='';$('fDate').value=todayStr();$('fTime').value=nowTime();$('fAccount').value='cash';$('fRecur').checked=false;setType('expense');fMood='';drawMoodChips();openSheet()};
window.openEdit=id=>{const t=state.tx.find(x=>x.id===id);if(!t)return;editingId=id;$('sheetTitle').textContent='تعديل الحركة';$('saveTx').textContent='حفظ التعديل';setType(t.type);fCat=t.cat;fillCatGrid();$('fAmount').value=t.amount;$('fDate').value=t.date;$('fTime').value=t.time||'';$('fNote').value=t.note||'';$('fAccount').value=t.account||'cash';$('fRecur').checked=!!t.recurring;$('fCatCustom').value='';fMood=t.mood||'';drawMoodChips();openSheet()};
window.delTx=id=>{if(confirm('هل تريد حذف هذه الحركة نهائياً؟')){state.tx=state.tx.filter(x=>x.id!==id);save();render();toast('تم حذف الحركة')}};
$('closeSheet').onclick=closeSheet;
$('overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSheet()});
$('saveTx').onclick=()=>{
 const amount=parseFloat($('fAmount').value); const date=$('fDate').value;
 if(!amount||amount<=0){toast('أدخل مبلغاً صحيحاً أكبر من صفر');return}
 if(!date){toast('اختر التاريخ');return}
 const cat=$('fCatCustom').value.trim()||fCat;
 if(!editingId&&state.tx.some(x=>x.date===date&&x.amount===amount&&x.cat===cat&&x.type===fType)){
   if(!confirm('⚠️ توجد حركة مطابقة تماماً (نفس المبلغ والتصنيف والتاريخ). قد تكون مكررة — هل تريد الحفظ على أي حال؟'))return}
  if(!editingId&&fType==='expense'){const pk=normItem($('fNote').value);const pst=pk?priceStats()[pk]:null;if(pst&&pst.n>=2&&amount>pst.avg*1.25){if(!confirm('🏷️ حارس الأسعار: هذا أعلى من متوسط سعرك المعتاد لـ«'+pk+'» ('+fmt(pst.avg)+') بنسبة '+Math.round((amount/pst.avg-1)*100)+'٪ — هل أنت متأكد؟'))return}}
 const data={type:fType,amount,date,time:$('fTime').value||'',cat,note:$('fNote').value.trim(),mood:fMood,account:$('fAccount').value,recurring:$('fRecur').checked};
 if(editingId){Object.assign(state.tx.find(x=>x.id===editingId),data);toast('تم حفظ التعديل بنجاح')}
 else{const nt={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),...data};state.tx.push(nt);const sw=applySweep(nt);toast(sw>0?('تمت الإضافة — وقُرّب '+fmt(sw)+' تلقائيًا إلى هدفك 🐷'):'تمت إضافة الحركة بنجاح')}
 save();closeSheet();
 const d=new Date(date+'T12:00'); if(d.getFullYear()!==view.getFullYear()||d.getMonth()!==view.getMonth()){view=new Date(d.getFullYear(),d.getMonth(),1)}
 render();
};

$('prevM').onclick=()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);render()};
$('nextM').onclick=()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);render()};
$('search').oninput=renderTxList; $('dateFrom').onchange=renderTxList; $('dateTo').onchange=renderTxList;
$('clearRange').onclick=()=>{$('dateFrom').value='';$('dateTo').value='';renderTxList()};
document.querySelectorAll('#typeChips .chip').forEach(ch=>ch.onclick=()=>{typeFilter=ch.dataset.t;document.querySelectorAll('#typeChips .chip').forEach(c=>c.classList.toggle('on',c===ch));renderTxList()});
$('saveBudget').onclick=()=>{state.budgets[ym(view)]=parseFloat($('budgetInput').value)||0;save();render();toast('تم حفظ ميزانية هذا الشهر')};
$('cbSave').onclick=()=>{const v=parseFloat($('cbAmount').value);if(!v||v<=0){toast('أدخل حداً صحيحاً للتصنيف');return}(state.catBudgets[ym(view)]=state.catBudgets[ym(view)]||{})[$('cbCat').value]=v;save();render();toast('تم حفظ ميزانية التصنيف')};
$('goalAdd').onclick=()=>{const name=$('goalName').value.trim(),target=parseFloat($('goalTarget').value);if(!name||!target||target<=0){toast('أدخل اسم الهدف والمبلغ المستهدف');return}state.goals.push({id:Date.now().toString(36),name,target,saved:0});save();$('goalName').value='';$('goalTarget').value='';render();toast('تمت إضافة الهدف 🎯')};
$('currency').onchange=e=>{state.currency=e.target.value;save();render();toast('تم تغيير العملة')};
$('shareBtn').onclick=async()=>{const tx=monthTx(),inc=sum(tx,'income'),exp=sum(tx,'expense');
 const txt='📊 ملخص مصروفاتي — '+view.toLocaleDateString('ar',{month:'long',year:'numeric'})+'\n💰 الدخل: '+fmt(inc)+'\n💸 المصروفات: '+fmt(exp)+'\n✅ الصافي: '+fmt(inc-exp)+'\n📋 عدد الحركات: '+tx.length;
 if(navigator.share){try{await navigator.share({title:'ملخص المصروفات',text:txt});return}catch(e){}}
 try{await navigator.clipboard.writeText(txt);toast('تم نسخ الملخص — الصقه أين تريد')}catch(e){prompt('انسخ الملخص:',txt)}};
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+content],{type}));a.download=name;a.click()}
$('exportCsv').onclick=()=>{const rows=[['التاريخ','الوقت','النوع','التصنيف','المبلغ','الحساب','متكررة','ملاحظة'],...state.tx.map(t=>[t.date,t.time||'',t.type==='income'?'دخل':'مصروف',t.cat,t.amount,accOf(t.account)[1],t.recurring?'نعم':'لا',(t.note||'').replaceAll(',',' ')])];download('expenses.csv',rows.map(r=>r.join(',')).join('\n'),'text/csv');toast('تم تصدير ملف CSV')};
$('exportJson').onclick=async()=>{const data=JSON.stringify(state,null,2);const BS=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.BackupSaver;
 if(BS){try{await BS.save({name:'expenses-backup.json',content:data});toast('✅ تم حفظ النسخة الاحتياطية في المكان الذي اخترته')}catch(e){const m=(e&&e.message)||'';toast(m.indexOf('cancelled')>-1?'أُلغي الحفظ — لم يُحفَظ أي ملف':'⚠️ تعذّر الحفظ، حاول مرة أخرى')}return}
 download('expenses-backup.json',data,'application/json');toast('تم تنزيل النسخة الاحتياطية')};
$('importBtn').onclick=()=>$('importFile').click();
$('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(txt=>{try{const d=JSON.parse(txt);if(Array.isArray(d.tx)){state=Object.assign({budgets:{},catBudgets:{},goals:[],currency:'LYD',dark:false,theme:'',font:''},d);state.tx.forEach(t=>{t.time=t.time||'';t.account=t.account||'cash'});save();applyDark();render();toast('تم استيراد البيانات بنجاح')}else toast('الملف غير صالح')}catch(_){toast('تعذّرت قراءة الملف')}})};
$('wipeBtn').onclick=()=>{if(confirm('سيتم حذف كل الحركات والميزانيات والأهداف نهائياً. هل أنت متأكد؟')){state={tx:[],budgets:{},catBudgets:{},goals:[],currency:state.currency,dark:state.dark};save();render();toast('تم حذف كل البيانات')}};
applyDark(); applyFont(); render();

const MOODS=[['happy','😊','سعيد'],['calm','😌','هادئ'],['neutral','😐','عادي'],['tired','😩','متعب'],['stressed','😤','متوتر']];
let fMood='';
function drawMoodChips(){const b=$('moodChips');if(!b)return;b.innerHTML=MOODS.map(m=>'<button type="button" class="chip'+(fMood===m[0]?' on':'')+'" data-mood="'+m[0]+'" style="cursor:pointer">'+m[1]+' '+m[2]+'</button>').join('');b.querySelectorAll('[data-mood]').forEach(x=>x.onclick=()=>{fMood=fMood===x.dataset.mood?'':x.dataset.mood;drawMoodChips()})}
function updateWorkHint(){const h=$('workHint');if(!h)return;const a=parseFloat($('fAmount').value);if(fType==='expense'&&a>0&&hourlyRate()>0){h.textContent='⏱️ هذا المصروف يساوي ≈ '+workHours(a).toFixed(1)+' ساعة من عملك'}else{h.textContent=''}}
function normItem(s){return (s||'').trim().replace(/\s+/g,' ').toLowerCase()}
function priceStats(){const m={};state.tx.forEach(t=>{if(t.type!=='expense')return;const k=normItem(t.note);if(k.length<2)return;const e=m[k]=m[k]||{n:0,sum:0,last:0,lastDate:'',amounts:[]};e.n++;e.sum+=t.amount;e.amounts.push({d:t.date,a:t.amount});if(t.date>=e.lastDate){e.last=t.amount;e.lastDate=t.date}});Object.values(m).forEach(e=>{e.avg=e.sum/e.n;e.amounts.sort((a,b)=>a.d<b.d?-1:1)});return m}
function personalInflation(st){let w=0,acc=0;Object.values(st).forEach(e=>{if(e.n>=4){const h=Math.floor(e.n/2);const f=e.amounts.slice(0,h).reduce((s,x)=>s+x.a,0)/h;const l=e.amounts.slice(h).reduce((s,x)=>s+x.a,0)/(e.n-h);if(f>0){acc+=(l/f-1)*e.n;w+=e.n}}});return w?acc/w*100:null}
function monthlyAvg(type){const ms={};state.tx.forEach(t=>{if(t.type===type)ms[t.date.slice(0,7)]=(ms[t.date.slice(0,7)]||0)+t.amount});const ks=Object.keys(ms);return ks.length?ks.reduce((s,k)=>s+ms[k],0)/ks.length:0}
function hourlyRate(){const w=state.work||{salary:0,dpm:22,hpd:8};let base=+w.salary||0;if(!base){const ms={};state.tx.forEach(t=>{if(t.type==='income')ms[t.date.slice(0,7)]=(ms[t.date.slice(0,7)]||0)+t.amount});const ks=Object.keys(ms).sort().slice(-3);if(ks.length)base=ks.reduce((s,k)=>s+ms[k],0)/ks.length}const hrs=(+w.dpm||22)*(+w.hpd||8);return base&&hrs?base/hrs:0}
function workHours(a){const r=hourlyRate();return r?a/r:0}
function coolHoursFor(price){const inc=monthlyAvg('income');if(inc&&price>=inc*0.2)return 72;if(inc&&price>=inc*0.1)return 48;return 24}
function addWish(){const name=$('wishName').value.trim();const price=parseFloat($('wishPrice').value);if(!name||!price||price<=0){toast('أدخل الاسم والسعر أولًا');return}state.wishes.push({id:'w'+Date.now(),name,price,at:Date.now(),cool:coolHoursFor(price),st:'wait'});save();$('wishName').value='';$('wishPrice').value='';renderLab();toast('⏳ أُضيف إلى قائمة التأجيل — خذ وقتك في التفكير')}
window.wishDecide=(id,buy)=>{const w=state.wishes.find(x=>x.id===id);if(!w)return;if(buy){state.tx.push({id:'t'+Date.now(),type:'expense',amount:w.price,date:todayStr(),time:nowTime(),cat:'تسوق',note:w.name,account:'cash',recurring:false,mood:''});w.st='bought';toast('🛍️ سُجّل كمصروف في «تسوق» — استمتع به')}else{w.st='dropped';toast('💪 قرار حكيم! وفّرت '+fmt(w.price))}save();render();renderLab()};
window.wishDel=id=>{state.wishes=state.wishes.filter(x=>x.id!==id);save();renderLab()};
function dayStr(d){return d.toISOString().slice(0,10)}
function chalProgress(c){const startMs=Date.parse(c.start+'T00:00:00Z');const todayMs=Date.parse(todayStr()+'T00:00:00Z');let elapsed=Math.floor((todayMs-startMs)/864e5)+1;if(elapsed<0)elapsed=0;if(elapsed>c.days)elapsed=c.days;let ok=0,spentCat=0;for(let i=0;i<elapsed;i++){const ds=new Date(startMs+i*864e5).toISOString().slice(0,10);const dayTx=state.tx.filter(t=>t.date===ds&&t.type==='expense');if(c.kind==='zero'){if(dayTx.length===0)ok++}else{spentCat+=dayTx.filter(t=>t.cat===c.cat).reduce((s,t)=>s+t.amount,0)}}
 let status;if(c.kind==='zero'){status=elapsed>=c.days?(ok>=c.days?'done':'fail'):'run'}else{status=spentCat>c.cap?'fail':(elapsed>=c.days?'done':'run')}return{elapsed,total:c.days,ok,spentCat,status}}
function addChallenge(){const kind=$('chalKind').value;const days=parseInt($('chalDays').value)||7;const c={id:'c'+Date.now(),kind,days,start:todayStr(),cat:$('chalCat').value,cap:parseFloat($('chalCap').value)||0};if(kind==='catcap'&&!(c.cap>0)){toast('أدخل سقفًا صحيحًا لتحدّي الفئة');return}state.challenges.push(c);save();renderLab();toast('🔥 بدأ التحدّي — بالتوفيق!')}
window.chalDel=id=>{state.challenges=state.challenges.filter(x=>x.id!==id);save();renderLab()};
function moodStats(){const m={};state.tx.forEach(t=>{if(t.type!=='expense'||!t.mood)return;const e=m[t.mood]=m[t.mood]||{n:0,sum:0};e.n++;e.sum+=t.amount});return m}
function renderLab(){
 
 const surplus=monthlyAvg('income')-monthlyAvg('expense');const perDay=surplus/30;
 const act=state.wishes.filter(w=>w.st==='wait');const dropped=state.wishes.filter(w=>w.st==='dropped');const savedSum=dropped.reduce((s,w)=>s+w.price,0);
 $('wishSaved').textContent=dropped.length?('🏆 تخلّيت عن '+dropped.length+' من المشتريات المؤجلة ووفّرت '+fmt(savedSum)):'';
 $('wishBox').innerHTML=act.length?act.map(w=>{const leftMs=w.at+w.cool*36e5-Date.now();const ready=leftMs<=0;let afford='';if(perDay>0){afford='بهذا الإيقاع تقدر تشتريه بعد ≈ '+Math.max(1,Math.ceil(w.price/perDay))+' يوم دون أن يهتز شهرك'}else{afford='إيقاعك الحالي لا يترك فائضًا — التأجيل يحميك الآن'}
   const goal=state.goals.filter(g=>(g.target-(g.saved||0))>0).sort((a,b)=>(a.target-(a.saved||0))-(b.target-(b.saved||0)))[0];let opp='';if(goal&&perDay>0){opp=' ولو وجّهت ثمنه لهدف «'+goal.name+'» لقرّبته ≈ '+Math.max(1,Math.round(w.price/perDay))+' يوم'}
   return '<div class="tx"><div class="mid"><div class="nm">'+esc(w.name)+'</div><div class="ds">'+fmt(w.price)+' • تهدئة '+w.cool+' ساعة'+(ready?' • ✅ انتهت التهدئة':' • ⏳ تبقّى ≈ '+Math.ceil(leftMs/36e5)+' ساعة')+'</div><div class="ds">'+afford+opp+'</div></div>'+(ready?'<button class="chip" style="cursor:pointer" onclick="wishDecide(\''+w.id+'\',true)">اشترِ الآن</button><button class="chip" style="cursor:pointer" onclick="wishDecide(\''+w.id+'\',false)">تخلَّ عنه</button>':'<button class="chip" style="cursor:pointer" onclick="wishDel(\''+w.id+'\')">حذف</button>')+'</div>'}).join(''):'<p class="mut">لا شيء مؤجَّل الآن. أضف أي غرض تفكّر بشرائه وسيمنحك التطبيق مهلة تهدئة محسوبة من دخلك، وتاريخ قدرة آمنًا، وثمن الفرصة البديلة — قبل أن تدفع قرشًا.</p>';
 
 const st=priceStats();const items=Object.entries(st).filter(([,e])=>e.n>=2).sort((a,b)=>b[1].n-a[1].n).slice(0,6);const infl=personalInflation(st);
 $('priceBox').innerHTML=(infl!==null?'<p>📈 <b>مؤشر تضخّمك الشخصي: '+(infl>=0?'+':'')+infl.toFixed(1)+'٪</b> — تغيّر أسعار بنودك المعتادة بين مشترياتك الأولى والأخيرة.</p>':'')+(items.length?items.map(([k,e])=>{const dev=e.avg?((e.last/e.avg)-1)*100:0;return '<div class="tx"><div class="mid"><div class="nm">'+esc(k)+'</div><div class="ds">اشتُري '+e.n+' مرات • متوسط سعرك '+fmt(e.avg)+' • آخر مرة '+fmt(e.last)+'</div></div><div class="am" style="color:'+(dev>5?'var(--red)':dev<-5?'var(--green)':'var(--mut)')+'">'+(dev>5?'⬆':dev<-5?'⬇':'➖')+' '+Math.abs(dev).toFixed(0)+'٪</div></div>'}).join(''):'<p class="mut">سجّل مصروفات بملاحظات واضحة (مثل «قهوة» أو «بنزين») وسيبني لك ذاكرة أسعار شخصية، وينبّهك عند دفع أكثر من معدّلك بـ ٢٥٪، ويحسب تضخّمك الشخصي الحقيقي.</p>');
 
 $('chalCat').innerHTML=CATS.expense.map(c=>'<option value="'+c[0]+'">'+c[1]+' '+c[0]+'</option>').join('');
 const chs=state.challenges.slice().reverse();
 $('chalBox').innerHTML=chs.length?chs.map(c=>{const p=chalProgress(c);const title=c.kind==='zero'?('بلا مصروفات — '+c.days+' أيام'):('سقف «'+c.cat+'» ≤ '+fmt(c.cap)+' خلال '+c.days+' أيام');const detail=c.kind==='zero'?('أيام نظيفة: '+p.ok+' من '+p.elapsed+' انقضت') :('أُنفق من الفئة حتى الآن: '+fmt(p.spentCat));const badge=p.status==='done'?'🏆 أُكمل':p.status==='fail'?'💔 انتهى':'🔥 جارٍ — اليوم '+Math.min(p.elapsed+ (p.status==='run'?0:0),p.total)+' من '+p.total;
  return '<div class="tx"><div class="mid"><div class="nm">'+title+'</div><div class="ds">'+detail+'</div><div class="ds">'+badge+'</div></div><button class="chip" style="cursor:pointer" onclick="chalDel(\''+c.id+'\')">حذف</button></div>'}).join(''):'<p class="mut">تحدَّ نفسك: أيام بلا صرف، أو سقف صارم لفئة واحدة — والتطبيق يتحقق تلقائيًا من حركاتك كل يوم.</p>';
 
 const rate=hourlyRate();const mtx=monthTx();const mexp=sum(mtx,'expense');
 const top3=mtx.filter(t=>t.type==='expense').sort((a,b)=>b.amount-a.amount).slice(0,3);
 $('workBox').innerHTML=rate>0?('<p>ساعة عملك تساوي ≈ <b>'+fmt(rate)+'</b>/ساعة. مصروفات هذا الشهر ('+fmt(mexp)+') كلّفتك <b>≈ '+workHours(mexp).toFixed(1)+' ساعة عمل</b> — أي ≈ '+(workHours(mexp)/((+state.work.hpd)||8)).toFixed(1)+' يوم عمل كامل.</p>'+(top3.length?top3.map(t=>'<div class="tx"><div class="mid"><div class="nm">'+esc(t.cat)+'</div><div class="ds">'+(t.note?esc(t.note)+' • ':'')+t.date+'</div></div><div class="am" style="color:var(--red)">'+fmt(t.amount)+' ≈ '+workHours(t.amount).toFixed(1)+' س</div></div>').join(''):''))
 :'<p class="mut">أدخل راتبك الشهري بالأسفل (أو سجّل دخلك في التطبيق) وسيحوّل كل مصروف إلى ساعات من عمرك العملي — أصدق مقياس لقيمة المال.</p>';
 if(document.activeElement!==$('workSalary'))$('workSalary').value=state.work.salary||'';
 if(document.activeElement!==$('workDpm'))$('workDpm').value=state.work.dpm||22;
 if(document.activeElement!==$('workHpd'))$('workHpd').value=state.work.hpd||8;
 
 const ms=moodStats();const entries=Object.entries(ms);
 if(entries.length){const maxSum=Math.max(...entries.map(([,e])=>e.sum));let ins='';const rich=entries.filter(([,e])=>e.n>=2);if(rich.length>=2){const hi=rich.reduce((a,b)=>b[1].sum/b[1].n>a[1].sum/a[1].n?b:a);const lo=rich.reduce((a,b)=>b[1].sum/b[1].n<a[1].sum/a[1].n?b:a);const ratio=(hi[1].sum/hi[1].n)/(lo[1].sum/lo[1].n);if(ratio>=1.3){const mn=k=>(MOODS.find(m=>m[0]===k)||[])[2]||k;ins='<p>🔍 نمط مكتشف: متوسط صرفك وأنت «'+mn(hi[0])+'» أعلى بـ <b>'+Math.round((ratio-1)*100)+'٪</b> من صرفك وأنت «'+mn(lo[0])+'».</p>'}}
  $('moodBox').innerHTML=ins+entries.sort((a,b)=>b[1].sum-a[1].sum).map(([k,e])=>{const md=MOODS.find(m=>m[0]===k)||['','😐',k];return '<div class="tx"><div class="mid"><div class="nm">'+md[1]+' '+md[2]+'</div><div class="ds">'+e.n+' حركة • المتوسط '+fmt(e.sum/e.n)+'</div></div><div class="am" style="color:var(--red)">'+fmt(e.sum)+'</div></div><div class="progress"><i style="width:'+Math.round(e.sum/maxSum*100)+'%"></i></div>'}).join('')}
 else{$('moodBox').innerHTML='<p class="mut">عند إضافة أي مصروف اختر مزاجك من الأزرار الجديدة في نافذة الإضافة، وبعد أيام سيكشف لك التطبيق كيف يحرّك مزاجُك محفظتَك — بيانات لا يجمعها أي تطبيق مصروفات عادةً.</p>'}
 renderDebts(); renderRadar(); renderRound();
}
$('wishAdd').onclick=addWish;
$('chalAdd').onclick=addChallenge;
$('workSave').onclick=()=>{state.work={salary:parseFloat($('workSalary').value)||0,dpm:parseInt($('workDpm').value)||22,hpd:parseInt($('workHpd').value)||8};save();renderLab();toast('⏱️ حُفظت إعدادات العمل')};
$('fAmount').addEventListener('input',updateWorkHint);
drawMoodChips();

function debtsRemain(d){return Math.max(0,(+d.total||0)-(+d.paid||0))}
function addDebt(){const name=$('debtName').value.trim();const total=parseFloat($('debtTotal').value);const due=$('debtDue').value;const dir=$('debtDir').value;if(!name||!total||total<=0){toast('أدخل اسم الدين ومبلغه');return}state.debts.push({id:'d'+Date.now(),name,total,paid:0,due:due||'',dir});save();$('debtName').value='';$('debtTotal').value='';renderLab();toast('📌 سُجّل في الديون والمستحقات')}
window.debtPay=id=>{const d=state.debts.find(x=>x.id===id);if(!d)return;const v=prompt('كم دفعت من «'+d.name+'»؟ المتبقي '+fmt(debtsRemain(d)),'');if(v===null)return;const a=parseFloat(v);if(!a||a<=0){toast('أدخل مبلغًا صحيحًا');return}d.paid=Math.min(d.total,(+d.paid||0)+a);save();render();renderLab();toast(debtsRemain(d)===0?'🎉 سُدّد «'+d.name+'» بالكامل!':'تم تسجيل الدفعة — المتبقي '+fmt(debtsRemain(d)))};
window.debtDel=id=>{if(!confirm('حذف هذا الدين نهائيًا؟'))return;state.debts=state.debts.filter(x=>x.id!==id);save();renderLab()};
function renderDebts(){const box=$('debtBox');if(!box)return;const ds=state.debts.slice().sort((a,b)=>(a.due||'9999')<(b.due||'9999')?-1:1);const oweT=state.debts.filter(d=>d.dir==='owe').reduce((s,d)=>s+debtsRemain(d),0);const owedT=state.debts.filter(d=>d.dir==='owed').reduce((s,d)=>s+debtsRemain(d),0);
 box.innerHTML=(state.debts.length?('<p>إجمالي ما عليك: <b style="color:var(--red)">'+fmt(oweT)+'</b> • وما لك عند الآخرين: <b style="color:var(--green)">'+fmt(owedT)+'</b></p>'):'')+(ds.length?ds.map(d=>{const r=debtsRemain(d);const pct=d.total?Math.round((d.paid||0)/d.total*100):0;const late=d.due&&r>0&&d.due<todayStr();return '<div class="tx"><div class="mid"><div class="nm">'+(d.dir==='owe'?'🔴':'🟢')+' '+esc(d.name)+(r===0?' ✅ سُدّد':'')+'</div><div class="ds">المتبقي '+fmt(r)+' من '+fmt(d.total)+(d.due?' • الاستحقاق '+d.due:'')+(late?' • ⚠️ متأخر!':'')+'</div><div class="progress"><i style="width:'+pct+'%"></i></div></div>'+(r>0?'<button class="chip" style="cursor:pointer" onclick="debtPay(\''+d.id+'\')">دفعة</button>':'')+'<button class="chip" style="cursor:pointer" onclick="debtDel(\''+d.id+'\')">حذف</button></div>'}).join(''):'<p class="mut">لا ديون مسجلة. سجّل ما عليك وما لك، وسيحذّرك التطبيق قبل الاستحقاق ويدخل الديون في حسابات السيولة والأمان تلقائيًا.</p>')}
function recTemplates(){const seen={},out=[];state.tx.filter(t=>t.recurring).forEach(t=>{const k=t.type+'|'+t.cat+'|'+t.amount+'|'+t.date.slice(8,10);if(!seen[k]){seen[k]=1;out.push(t)}});return out}
function safeToday(){const now=new Date();const M=ym(now);const txs=state.tx.filter(t=>t.date.startsWith(M));const incAct=sum(txs,'income'),expAct=sum(txs,'expense');const daysIn=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();const left=Math.max(1,daysIn-now.getDate()+1);const lastDay=M+'-'+String(daysIn).padStart(2,'0');
 const inMonth=(t)=>txs.some(x=>x.type===t.type&&x.cat===t.cat&&x.amount===t.amount);
 const futInc=recTemplates().filter(t=>t.type==='income'&&!inMonth(t)).reduce((s,t)=>s+t.amount,0);
 const futExp=recTemplates().filter(t=>t.type==='expense'&&!inMonth(t)).reduce((s,t)=>s+t.amount,0);
 const debtsDue=state.debts.filter(d=>d.dir==='owe'&&d.due&&d.due<=lastDay).reduce((s,d)=>s+debtsRemain(d),0);
 const instDue=instSchedule().filter(s=>!s.paid&&s.date>=todayStr()&&s.date<=lastDay).reduce((a,s)=>a+s.amt,0);const pool=incAct+futInc-expAct-futExp-debtsDue-instDue;return{safe:Math.max(0,pool/left),pool,left,futInc,futExp,debtsDue,instDue,incAct,expAct}}
function renderSafe(){const b=$('safeBox');if(!b)return;const s=safeToday();const late=state.debts.filter(d=>d.dir==='owe'&&d.due&&d.due<todayStr()&&debtsRemain(d)>0);
 b.innerHTML='<div style="text-align:center;padding:6px 0"><div class="mut">تستطيع صرف هذا المبلغ اليوم بأمان</div><div style="font-size:34px;font-weight:800;color:'+(s.safe>0?'var(--green)':'var(--red)')+'">'+fmt(s.safe)+'</div><div class="mut">لكل يوم من الأيام الـ '+s.left+' المتبقية في الشهر، بعد حجز الالتزامات القادمة'+(s.futExp?' ('+fmt(s.futExp)+' متكررة)':'')+(s.debtsDue?' والديون المستحقة ('+fmt(s.debtsDue)+')':'')+(s.instDue?' والأقساط ('+fmt(s.instDue)+')':'')+'</div></div>'+(late.length?'<p style="color:var(--red)">⚠️ لديك '+late.length+' من الديون المتأخرة — راجع قسم الديون في المختبر.</p>':'')+(s.pool<0?'<p style="color:var(--red)">⚠️ التزاماتك هذا الشهر تتجاوز مواردك المتوقعة بـ '+fmt(-s.pool)+' — خفّف المصروفات المتغيرة فورًا.</p>':'')}
function project60(){let bal=sum(state.tx,'income')-sum(state.tx,'expense');const recs=recTemplates();const days=[];const t0=new Date();
 for(let i=0;i<60;i++){const d=new Date(t0.getTime()+i*864e5);const ds=d.toISOString().slice(0,10);const dom=ds.slice(8,10);recs.forEach(t=>{if(t.date.slice(8,10)===dom)bal+=t.type==='income'?t.amount:-t.amount});state.debts.forEach(db=>{if(db.due===ds&&debtsRemain(db)>0)bal+=db.dir==='owe'?-debtsRemain(db):debtsRemain(db)});instSchedule().forEach(s=>{if(s.date===ds&&!s.paid)bal-=s.amt});days.push({ds,bal})}
 let min=days[0],firstNeg=null,negDays=0;days.forEach(x=>{if(x.bal<min.bal)min=x;if(x.bal<0){negDays++;if(!firstNeg)firstNeg=x}});
 return{days,min,firstNeg,negDays,end:days[days.length-1]}}
function renderRadar(){const b=$('radarBox');if(!b)return;const p=project60();const maxAbs=Math.max(1,...p.days.map(x=>Math.abs(x.bal)));
 b.innerHTML='<p>رصيدك المتوقع خلال ٦٠ يومًا من التزاماتك المتكررة وديونك: ينتهي عند <b>'+fmt(p.end.bal)+'</b>، وأدنى نقطة <b style="color:'+(p.min.bal<0?'var(--red)':'var(--green)')+'">'+fmt(p.min.bal)+'</b> في '+p.min.ds+'.</p>'+(p.firstNeg?'<p style="color:var(--red)">🚨 أول عجز متوقع في '+p.firstNeg.ds+' — أمامك '+(Math.floor((Date.parse(p.firstNeg.ds)-Date.parse(todayStr()))/864e5))+' يوم للتصرّف ('+p.negDays+' يوم تحت الصفر إجمالًا).</p>':'<p style="color:var(--green)">✅ لا عجز متوقعًا في الـ ٦٠ يومًا القادمة بهذا الإيقاع.</p>')+'<div style="display:flex;align-items:flex-end;gap:2px;height:52px;direction:ltr;background:var(--field);border:1px solid var(--line);border-radius:14px;padding:10px 8px 6px">'+p.days.map(x=>'<div title="'+x.ds+': '+fmt(x.bal)+'" style="flex:1;min-width:2px;height:'+Math.max(3,Math.round(Math.abs(x.bal)/maxAbs*36))+'px;background:'+(x.bal<0?'var(--red)':'var(--green)')+';opacity:.9;border-radius:2px 2px 0 0"></div>').join('')+'</div>'}
function applySweep(tx){const r=state.round;if(!r||!r.on||tx.type!=='expense')return 0;const step=+r.step||10;const spare=Math.round((Math.ceil(tx.amount/step)*step-tx.amount)*100)/100;if(spare<=0)return 0;const g=state.goals.find(x=>x.id===r.goalId)||state.goals[0];if(!g)return 0;g.saved=(+g.saved||0)+spare;state.sweeps.push({id:'sw'+Date.now()+Math.floor(Math.random()*999),date:tx.date,amount:spare});return spare}
function renderRound(){const b=$('roundBox');if(!b)return;const M=ym(new Date());const ms=state.sweeps.filter(s=>s.date.startsWith(M));const tot=ms.reduce((s,x)=>s+x.amount,0);const all=state.sweeps.reduce((s,x)=>s+x.amount,0);
 $('roundGoal').innerHTML=state.goals.length?state.goals.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join(''):'<option value="">— أضف هدفًا أولًا —</option>';
 if(document.activeElement!==$('roundGoal'))$('roundGoal').value=state.round.goalId||'';if(document.activeElement!==$('roundStep'))$('roundStep').value=String(state.round.step||10);$('roundOn').checked=!!state.round.on;
 b.innerHTML=state.goals.length?('<p>🐷 قرّبنا تلقائيًا هذا الشهر: <b>'+fmt(tot)+'</b> من '+ms.length+' حركة، وإجمالي ما جُمع بالتقريب منذ البداية: <b>'+fmt(all)+'</b> يذهب إلى هدفك المختار دون أن تشعر.</p>'+(ms.length?ms.slice(-4).reverse().map(s=>'<div class="ds">'+s.date+' • +'+fmt(s.amount)+'</div>').join(''):'')):'<p class="mut">أنشئ هدف ادخار أولًا من «الرئيسية»، ثم فعّل التقريب: كل مصروف يُقرَّب لأعلى خطوة تختارها، ويذهب الفرق تلقائيًا إلى هدفك مع كل حركة.</p>'}
function runStress(){const gap=parseInt($('stGap').value)||0;const emg=parseFloat($('stEmg').value)||0;const inf=parseFloat($('stInf').value)||0;let bal=sum(state.tx,'income')-sum(state.tx,'expense');const inc=monthlyAvg('income');const expA=monthlyAvg('expense')*(1+inf/100);let b=bal-emg;let survive=24,brokeAt=0;const rows=[];
 for(let i=1;i<=24;i++){b+=(i<=gap?0:inc)-expA;rows.push({i,b});if(b<0){survive=i-1;brokeAt=i;break}}
 const verdict=b<0&&emg>0&&rows.length===0?'':'';let head;
 if(bal-emg<0){head='🚨 رصيدك الحالي لا يتحمّل وحده طارئًا بهذا الحجم — أولويتك القصوى بناء وسادة أمان.'}
 else if(brokeAt){head='⚠️ بهذا السيناريو تصمد ≈ '+survive+' شهر ثم ينكسر رصيدك في الشهر '+brokeAt+'.'}
 else{head='🏆 ممتاز — تصمد ٢٤ شهرًا كاملة حتى في هذا السيناريو القاسي.'}
 $('stOut').innerHTML='<p><b>'+head+'</b></p><p class="mut">الافتراضات: دخلك الشهري المتوسط '+fmt(inc)+' (يتوقف '+gap+' شهر)، مصروفاتك '+fmt(expA)+' شهريًا'+(inf?' بعد غلاء '+inf+'٪':'')+', طارئ فوري '+fmt(emg)+'. الرصيد الابتدائي '+fmt(bal)+'.</p>'+rows.slice(0,12).map(r=>'<div class="tx"><div class="mid"><div class="nm">الشهر '+r.i+'</div></div><div class="am" style="color:'+(r.b<0?'var(--red)':'var(--green)')+'">'+fmt(r.b)+'</div></div>').join('')}
const __renderV8=render;render=function(){__renderV8();renderSafe()};
const __goV8=go;go=function(n){__goV8(n);if(n==='lab')renderLab()};
$('debtAdd').onclick=addDebt;
$('stRun').onclick=runStress;
$('roundSave').onclick=()=>{state.round={on:$('roundOn').checked,step:parseInt($('roundStep').value)||10,goalId:$('roundGoal').value};save();renderRound();toast(state.round.on?'🐷 فُعّل التقريب الادخاري':'أُوقف التقريب الادخاري')};
renderSafe();

function accBalance(id,endKey){return state.tx.reduce((s,t)=>{if(endKey&&t.date.slice(0,7)>endKey)return s;
 if(t.type==='income'&&t.account===id)return s+t.amount;
 if(t.type==='expense'&&t.account===id)return s-t.amount;
 if(t.type==='transfer'){if(t.from===id)return s-t.amount;if(t.to===id)return s+t.amount}
 return s},0)}
function renderAcctFix(){const el=$('acctStrip');if(!el)return;const endKey=ym(view);
 el.innerHTML=ACCOUNTS.map(a=>{const bal=accBalance(a[0],endKey);return '<div class="acct"><div class="ai">'+a[2]+'</div><div class="at">'+a[1]+'</div><div class="av">'+fmt(bal)+'</div></div>'}).join('')}
const __txRowV10=txRow;
txRow=function(t){if(t.type==='transfer'){const f=accOf(t.from),to=accOf(t.to);
 return '<div class="tx"><div class="ic" style="background:#EAF0FE">🔄</div><div class="mid"><div class="nm">تحويل بين الحسابات</div><div class="ds">'+f[2]+' '+f[1]+' ← '+to[2]+' '+to[1]+(t.note?' • '+esc(t.note):'')+'</div></div><div><div class="am" style="color:var(--ink)">'+fmt(t.amount)+'</div><div class="tm">'+(t.time?'🕐 '+t.time+' • ':'')+t.date+'</div></div><div class="acts"><button class="iconbtn" onclick="delTx(\''+t.id+'\')" aria-label="حذف">🗑️</button></div></div>'}
 return __txRowV10(t)};
function renderTransfers(){const box=$('acctBox');if(!box)return;
 const tot=ACCOUNTS.reduce((s,a)=>s+accBalance(a[0]),0);
 box.innerHTML=ACCOUNTS.map(a=>{const b=accBalance(a[0]);return '<div class="kv"><span>'+a[2]+' '+a[1]+'</span><b style="color:'+(b<0?'var(--red)':'var(--ink)')+'">'+fmt(b)+'</b></div>'}).join('')
 +'<div class="kv"><span>💰 صافي كل حساباتك</span><b>'+fmt(tot)+'</b></div>'
 +'<div class="grid2" style="margin-top:10px"><div><label class="fl">من حساب</label><select class="fld" id="tfFrom">'+ACCOUNTS.map(a=>'<option value="'+a[0]+'">'+a[2]+' '+a[1]+'</option>').join('')+'</select></div>'
 +'<div><label class="fl">إلى حساب</label><select class="fld" id="tfTo">'+ACCOUNTS.map(a=>'<option value="'+a[0]+'">'+a[2]+' '+a[1]+'</option>').join('')+'</select></div></div>'
 +'<div class="grid2"><input class="fld" type="number" id="tfAmt" placeholder="المبلغ" min="0" step="any"><button class="btn" id="tfGo" style="margin-top:0">🔄 حوّل</button></div>';
 const toEl=$('tfTo');if(toEl)toEl.value='bank';
 const goEl=$('tfGo');if(goEl)goEl.onclick=doTransfer}
function doTransfer(){const f=$('tfFrom').value,t=$('tfTo').value,v=parseFloat($('tfAmt').value);
 if(!(v>0)){toast('أدخل مبلغ التحويل');return}
 if(f===t){toast('اختر حسابين مختلفين');return}
 state.tx.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),type:'transfer',cat:'تحويل',amount:v,date:todayStr(),time:nowTime(),from:f,to:t,account:f,note:''});
 save();render();toast('🔄 تم التحويل بنجاح')}
document.querySelectorAll('#acctChips .chip').forEach(ch=>ch.onclick=()=>{acctFilter=ch.dataset.a;render()});
const __rtlV10=renderTxList;
renderTxList=function(){__rtlV10();document.querySelectorAll('#acctChips .chip').forEach(c=>c.classList.toggle('on',c.dataset.a===acctFilter))};
function momCats(){const cur={},prev={};monthTx().filter(t=>t.type==='expense').forEach(t=>cur[t.cat]=(cur[t.cat]||0)+t.amount);
 monthTx(monthShift(view,-1)).filter(t=>t.type==='expense').forEach(t=>prev[t.cat]=(prev[t.cat]||0)+t.amount);
 const cats=[...new Set([...Object.keys(cur),...Object.keys(prev)])];
 return cats.map(c=>({cat:c,cur:cur[c]||0,prev:prev[c]||0,d:(cur[c]||0)-(prev[c]||0)})).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d))}
function renderMom(){const el=$('momCats');if(!el)return;const rows=momCats();
 el.innerHTML=rows.length?rows.map(r=>{const pct=r.prev?Math.round(r.d/r.prev*100):null;
  return '<div class="kv"><span>'+catIcon(r.cat)+' '+esc(r.cat)+'</span><span>'+fmt(r.cur)+' <small style="color:var(--mut)">(كان '+fmt(r.prev)+')</small> <b style="color:'+(r.d>0?'var(--red)':r.d<0?'var(--green)':'var(--mut)')+'">'+(r.d===0?'—':(r.d>0?'▲':'▼')+' '+fmt(Math.abs(r.d))+(pct!==null?' • '+Math.abs(pct)+'%':''))+'</b></span></div>'}).join(''):'<div class="empty">لا مصروفات للمقارنة بعد.</div>'}
function cumSeries(){const out=[];let run=0;for(let i=11;i>=0;i--){const d=monthShift(view,-i);const tx=monthTx(d);const net=sum(tx,'income')-sum(tx,'expense');run+=net;out.push({d,net,cum:run})}return out}
function renderCum(){const el=$('cumChart');if(!el)return;const s=cumSeries();const max=Math.max(...s.map(x=>Math.abs(x.cum)),1);
 el.innerHTML='<div class="chart">'+s.map((x,i)=>'<div class="col"><div class="cv">'+(x.cum?new Intl.NumberFormat('ar',{notation:'compact'}).format(x.cum):'')+'</div><div class="bar '+(i===s.length-1?'cur':'')+'" style="height:'+Math.max(3,Math.abs(x.cum)/max*95)+'px;'+(x.cum<0?'background:var(--red)':'')+'"></div><div class="cl">'+x.d.toLocaleDateString('ar',{month:'short'})+'</div></div>').join('')+'</div>'
 +'<p class="hintline">المنحنى = مجموع (الدخل − المصروفات) تراكميًا عبر آخر ١٢ شهرًا. ارتفاعه يعني أنك تدّخر فعليًا شهرًا بعد شهر.</p>'}
const __renderV10=render;render=function(){__renderV10();renderAcctFix();renderTransfers();renderMom();renderCum()};

const LOCK_MIN=4, LOCK_MAX=8;
let lockMode='unlock', lockBuf='', lockFirst='', lockFails=0, lockWaitUntil=0, lockHiddenAt=0, lockOnDone=null;
function lockSalt(){let s='';const c='abcdef0123456789';for(let i=0;i<16;i++)s+=c[Math.floor(Math.random()*16)];return s}
async function pinHash(pin,salt){
 if(window.crypto&&crypto.subtle&&crypto.subtle.digest){try{const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return 's256:'+[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){}}
 let h1=5381,h2=52711;const s=salt+':'+pin;for(let i=0;i<s.length;i++){const ch=s.charCodeAt(i);h1=((h1*33)^ch)>>>0;h2=((h2*31)+ch)>>>0}return 'h1:'+h1.toString(16)+'.'+h2.toString(16)}
async function setPin(pin){const salt=lockSalt();state.lock={on:true,hash:await pinHash(pin,salt),salt,mins:(state.lock&&state.lock.mins!=null)?state.lock.mins:5,bio:!!(state.lock&&state.lock.bio),recHash:(state.lock&&state.lock.recHash)||'',recSalt:(state.lock&&state.lock.recSalt)||''};save()}
async function checkPin(pin){if(!state.lock||!state.lock.hash)return false;return (await pinHash(pin,state.lock.salt))===state.lock.hash}
function lockShow(mode,title,msg,onDone){lockMode=mode;lockBuf='';lockOnDone=onDone||null;
 $('lockScr').classList.add('on');$('lockTitle').textContent=title;$('lockMsg').textContent=msg;
 $('lockCancel').style.visibility=(mode==='unlock')?'hidden':'visible';drawLockDots();$('lockBioBtn').style.display=(mode==='unlock'&&state.lock&&state.lock.bio&&nbPlugin())?'block':'none';$('lockForgot').style.display=(mode==='unlock')?'block':'none';$('lockBioBtn').textContent='👆 فتح بالبصمة'}
function lockHide(){$('lockScr').classList.remove('on');lockBuf='';lockOnDone=null}
function drawLockDots(){const n=(lockMode==='recover')?12:LOCK_MAX;let h='';for(let i=0;i<n;i++)h+='<i class="'+(i<lockBuf.length?'f':'')+'"></i>';$('lockDots').innerHTML=h}
function shakeLock(msg){$('lockMsg').textContent=msg;const b=document.querySelector('.lockBox');if(b){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake')}}
async function lockKey(k){
 if(k==='cancel'){if(lockMode==='recover'||cameFromRecovery){cameFromRecovery=false;lockShow('unlock','🔒 التطبيق مقفل','أدخل رمزك ثم اضغط ✓ — أو استخدم بصمتك')}else lockHide();return}
 if(k==='back'){lockBuf=lockBuf.slice(0,-1);drawLockDots();return}
 if(Date.now()<lockWaitUntil)return;
 if(k==='enter'){const need=(lockMode==='recover')?12:LOCK_MIN;if(lockBuf.length>=need)await lockSubmit();return}
 const cap=(lockMode==='recover')?12:LOCK_MAX;
 if(lockBuf.length>=cap)return;
 lockBuf+=k;drawLockDots()}
async function lockSubmit(){
 const pin=lockBuf;
 if(lockMode==='setup1'){lockFirst=pin;lockBuf='';drawLockDots();lockMode='setup2';$('lockTitle').textContent='تأكيد الرمز';$('lockMsg').textContent='أعد إدخال الرمز نفسه ثم اضغط ✓';return}
 if(lockMode==='setup2'){
  if(pin===lockFirst){await setPin(pin);lockHide();renderLockSettings();toast('🔒 تم تفعيل قفل التطبيق');if(cameFromRecovery||!state.lock.recHash){cameFromRecovery=false;const rc=await setRecoveryCode();showRecoveryCode(rc)}}
  else{lockBuf='';drawLockDots();lockMode='setup1';$('lockTitle').textContent='تعيين رمز القفل';shakeLock('الرمزان غير متطابقين — اختر رمزًا من جديد')}
  return}
 if(lockMode==='recover'){
  if(!state.lock.recHash){shakeLock('لا يوجد رمز استرداد محفوظ — استخدم بصمتك بالأعلى');lockBuf='';drawLockDots();return}
  const okR=(await pinHash(pin,state.lock.recSalt))===state.lock.recHash;
  if(okR){cameFromRecovery=true;lockBuf='';lockMode='setup1';drawLockDots();$('lockTitle').textContent='اختر رمزًا جديدًا';$('lockMsg').textContent='تم التحقق من رمز الاسترداد — اختر رمز قفل جديدًا ثم اضغط ✓';$('lockBioBtn').style.display='none';$('lockForgot').style.display='none'}
  else{lockFails++;lockBuf='';drawLockDots();
   if(lockFails>=5){lockWaitUntil=Date.now()+30000;lockFails=0;shakeLock('محاولات كثيرة خاطئة — انتظر ٣٠ ثانية')}
   else shakeLock('رمز الاسترداد غير صحيح — حاول مجددًا')}
  return}
 const ok=await checkPin(pin);
 if(ok){const cb=lockOnDone;lockHide();lockFails=0;if(cb)cb();else toast('🔓 مرحبًا بعودتك')}
 else{lockFails++;lockBuf='';drawLockDots();
  if(lockFails>=5){lockWaitUntil=Date.now()+30000;lockFails=0;shakeLock('محاولات كثيرة خاطئة — انتظر ٣٠ ثانية')}
  else shakeLock('رمز غير صحيح — حاول مجددًا')}}
function nbPlugin(){return (window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.NativeBiometric)||null}
async function bioUnlock(){const NB=nbPlugin();if(!NB)return;
 try{await NB.verifyIdentity({reason:'فتح تطبيق تتبّع المصروفات',title:'🔓 فتح بالبصمة',subtitle:'تتبّع المصروفات',description:'المس مستشعر البصمة للفتح',negativeButtonText:'إلغاء',maxAttempts:3});if(lockMode==='recover'){cameFromRecovery=true;lockMode='setup1';lockBuf='';drawLockDots();$('lockTitle').textContent='اختر رمزًا جديدًا';$('lockMsg').textContent='تم التحقق ببصمتك — اختر رمز قفل جديدًا ثم اضغط ✓';$('lockBioBtn').style.display='none';$('lockForgot').style.display='none';return}lockHide();lockFails=0;toast('🔓 مرحبًا بعودتك')}
 catch(e){}}
function lockNow(){if(state.lock&&state.lock.on&&state.lock.hash){lockShow('unlock','🔒 التطبيق مقفل','أدخل رمزك ثم اضغط ✓ — أو استخدم بصمتك');if(state.lock.bio)setTimeout(()=>{if($('lockScr').classList.contains('on')&&lockMode==='unlock')bioUnlock()},400)}}
function lockSetup(){lockShow('setup1','تعيين رمز القفل','اختر رمزًا من ٤ إلى ٨ أرقام ثم اضغط ✓ — كلما طال صعُب فتحه. احفظه جيدًا: لا يمكن استرجاع البيانات بدونه')}
function renderLockSettings(){const el=$('lockState');if(!el)return;const on=!!(state.lock&&state.lock.on&&state.lock.hash);
 el.textContent=on?('🔒 القفل مفعّل — يُطلب الرمز عند فتح التطبيق، ويُقفل تلقائيًا بعد ترك التطبيق '+((state.lock.mins===0)?'فورًا':(state.lock.mins+' دقيقة/دقائق'))):'🔓 القفل غير مفعّل — أي شخص يمسك هاتفك يستطيع رؤية أموالك';
 const m=$('lockMins');if(m)m.value=String((state.lock&&state.lock.mins!=null)?state.lock.mins:5);
 $('lockEnableBtn').style.display=on?'none':'flex';
 $('lockChangeBtn').style.display=on?'flex':'none';
 $('lockOffBtn').style.display=on?'flex':'none';
 const bb=$('lockBioSetBtn');if(bb){bb.style.display=on?'flex':'none';bb.textContent=(state.lock&&state.lock.bio)?'👆 إيقاف الفتح بالبصمة':'👆 تفعيل الفتح بالبصمة'};const rb=$('lockRecBtn');if(rb)rb.style.display=on?'flex':'none';if(on&&!state.lock.recHash)el.textContent+=' ⚠️ لا يوجد رمز استرداد بعد — أنشئه من الزر بالأسفل حتى لا تفقد بياناتك إن نسيت الرمز'}
const __rmV11=renderMore;renderMore=function(){__rmV11();renderLockSettings()};
$('lockEnableBtn').onclick=lockSetup;
$('lockChangeBtn').onclick=()=>lockShow('verify','تأكيد الرمز الحالي','أدخل رمزك الحالي أولًا',()=>lockSetup());
$('lockOffBtn').onclick=()=>lockShow('verify','إيقاف القفل','أدخل رمزك لإيقاف القفل',()=>{state.lock={on:false,hash:'',salt:'',mins:5,bio:false};save();renderLockSettings();toast('🔓 أُوقف قفل التطبيق')});
$('lockMins').onchange=e=>{state.lock=state.lock||{on:false,hash:'',salt:'',mins:5};state.lock.mins=parseInt(e.target.value)||0;save();renderLockSettings();toast('⏱️ حُفظ توقيت القفل التلقائي')};
$('lockBioSetBtn').onclick=()=>{const NB=nbPlugin();
 if(state.lock&&state.lock.bio){lockShow('verify','إيقاف البصمة','أدخل رمزك ثم اضغط ✓ لإيقاف الفتح بالبصمة',()=>{state.lock.bio=false;save();renderLockSettings();toast('👆 أُوقف الفتح بالبصمة')});return}
 if(!NB){toast('البصمة تعمل داخل التطبيق المثبّت على الهاتف');return}
 lockShow('verify','تفعيل البصمة','أدخل رمزك ثم اضغط ✓',async()=>{try{const av=await NB.isAvailable({useFallback:false});if(!av||!av.isAvailable){toast('لا توجد بصمة مفعّلة على هذا الهاتف — فعّلها من إعدادات الهاتف أولًا');return}
  await NB.verifyIdentity({reason:'ربط بصمتك بتطبيق المصروفات',title:'👆 تفعيل البصمة',subtitle:'تتبّع المصروفات',description:'المس مستشعر البصمة للتفعيل',negativeButtonText:'إلغاء'});
  state.lock.bio=true;save();renderLockSettings();toast('👆 تم تفعيل الفتح بالبصمة')}catch(e){toast('أُلغي تفعيل البصمة')}})};
document.addEventListener('visibilitychange',()=>{if(document.hidden){lockHiddenAt=Date.now()}
 else if(lockHiddenAt&&state.lock&&state.lock.on&&state.lock.hash){const mins=(state.lock.mins!=null)?state.lock.mins:5;if(mins===0||Date.now()-lockHiddenAt>=mins*60000)lockNow();lockHiddenAt=0}});
lockNow();

let dataDirty=false, cameFromRecovery=false, abBusy=false;
const __saveV13=save; save=function(){__saveV13(); dataDirty=true};
function genRecoveryCode(){let code='';const need=12;
 if(window.crypto&&crypto.getRandomValues){const buf=new Uint8Array(64);let i=0;crypto.getRandomValues(buf);
  while(code.length<need){if(i>=buf.length){crypto.getRandomValues(buf);i=0}const b=buf[i++];if(b<250)code+=String(b%10)}}
 else{while(code.length<need)code+=String(Math.floor(Math.random()*10))}
 return code}
async function setRecoveryCode(){const code=genRecoveryCode();const salt=lockSalt();state.lock.recHash=await pinHash(code,salt);state.lock.recSalt=salt;__saveV13();return code}
function showRecoveryCode(code){$('recCode').textContent=code.replace(/(\d{4})(\d{4})(\d{4})/,'$1-$2-$3');$('recScr').classList.add('on')}
$('recDone').onclick=()=>{$('recScr').classList.remove('on');toast('🔑 احتفظ برمز الاسترداد في مكان آمن خارج الهاتف')};
function forgotPin(){
 if(state.lock&&state.lock.recHash){lockMode='recover';lockBuf='';drawLockDots();$('lockTitle').textContent='🔑 استرداد الوصول';$('lockMsg').textContent='أدخل رمز الاسترداد (١٢ رقمًا) الذي حفظته عند تفعيل القفل، ثم اضغط ✓';$('lockCancel').style.visibility='visible';$('lockForgot').style.display='none';const bb=$('lockBioBtn');if(state.lock.bio&&nbPlugin()){bb.style.display='block';bb.textContent='👆 إعادة تعيين الرمز بالبصمة'}else bb.style.display='none'}
 else if(state.lock&&state.lock.bio&&nbPlugin()){lockMode='recover';lockBuf='';drawLockDots();$('lockTitle').textContent='🔑 استرداد الوصول';$('lockMsg').textContent='لا يوجد رمز استرداد محفوظ — استخدم بصمتك لإعادة تعيين الرمز';$('lockCancel').style.visibility='visible';$('lockForgot').style.display='none';const bb=$('lockBioBtn');bb.style.display='block';bb.textContent='👆 إعادة تعيين الرمز بالبصمة'}
 else shakeLock('لا يوجد رمز استرداد ولا بصمة مفعّلة. الحل الوحيد: إعدادات الهاتف ← التطبيقات ← تتبّع المصروفات ← مسح البيانات، ثم استيراد نسختك الاحتياطية')}
$('lockForgot').onclick=forgotPin;
$('lockRecBtn').onclick=()=>lockShow('verify','رمز الاسترداد','أدخل رمزك الحالي ثم اضغط ✓',async()=>{const c=await setRecoveryCode();showRecoveryCode(c);toast('🔑 جدّدت رمز الاسترداد — القديم لم يعد صالحًا')});
function bsPlugin(){return (window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.BackupSaver)||null}
function renderAutoBackup(){const el=$('abState');if(!el)return;const ab=state.autoBackup||{on:false,on2:0};
 $('abOffBtn').style.display=ab.on?'flex':'none';
 $('abPickBtn').textContent=ab.on?'📁 تغيير ملف النسخ التلقائي':'📁 اختيار ملف وتفعيل النسخ التلقائي';
 if(!ab.on){el.textContent='⏸️ النسخ التلقائي غير مفعّل. فعّله واختر ملفًا مرة واحدة فقط، وبعدها تُحفَظ نسخة من بياناتك تلقائيًا كل ٥ دقائق عند وجود تغييرات — دون أن يُطلب منك أي إذن أو تأكيد';return}
 el.textContent='✅ النسخ التلقائي مفعّل ← '+(ab.name||'ملف النسخ')+(ab.last?(' • آخر نسخة ناجحة: '+new Date(ab.last).toLocaleString('ar',{day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'})):' • ستُحفَظ أول نسخة عند أول تغيير')}
async function autoBackupTick(){if(abBusy)return;const ab=state.autoBackup;if(!ab||!ab.on||!dataDirty)return;const BS=bsPlugin();if(!BS||!BS.autoSave)return;abBusy=true;
 try{await BS.autoSave({content:JSON.stringify(state,null,2)});dataDirty=false;ab.last=Date.now();__saveV13();renderAutoBackup()}catch(e){}
 abBusy=false}
$('abPickBtn').onclick=async()=>{const BS=bsPlugin();if(!BS||!BS.pickAutoFile){toast('النسخ التلقائي يعمل داخل التطبيق المثبّت على الهاتف');return}
 try{const r=await BS.pickAutoFile({name:'expenses-auto-backup.json'});state.autoBackup={on:true,name:(r&&r.name)||'expenses-auto-backup.json',last:(state.autoBackup&&state.autoBackup.last)||0};save();await autoBackupTick();renderAutoBackup();toast('✅ فُعّل النسخ التلقائي — لن يُسأل عن أي إذن بعد الآن')}catch(e){toast('أُلغي اختيار الملف — لم يُفعَّل النسخ التلقائي')}};
$('abOffBtn').onclick=()=>{state.autoBackup={on:false,name:'',last:0};save();renderAutoBackup();toast('⏸️ أُوقف النسخ التلقائي')};
setInterval(autoBackupTick,5*60*1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoBackupTick()});
renderAutoBackup();

function addMonthsKey(key,n){const parts=key.split('-').map(Number);const t=new Date(parts[0],parts[1]-1+n,1);const dim=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();const d=Math.min(parts[2],dim);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function instSchedule(){const out=[];(state.inst||[]).forEach(p=>{for(let k=0;k<p.n;k++){const last=k===p.n-1;const amt=last?Math.round((p.total-(+p.down||0)-p.amt*(p.n-1))*100)/100:p.amt;out.push({pid:p.id,name:p.name,k:k+1,date:addMonthsKey(p.start,k),amt,paid:k<(p.paid||0),acct:p.acct,cat:p.cat})}});return out}
function instRemaining(p){if((+p.paid||0)>=p.n)return 0;return Math.max(0,Math.round((p.total-(+p.down||0)-p.amt*(+p.paid||0))*100)/100)}
function addInst(){const name=$('instName').value.trim();const total=parseFloat($('instTotal').value);const down=parseFloat($('instDown').value)||0;const n=parseInt($('instN').value);const start=$('instStart').value;const acct=$('instAcct').value;const cat=$('instCat').value;
 if(!name||!total||total<=0||!n||n<1||!start){toast('أدخل اسم السلعة والسعر الكلي وعدد الأقساط وتاريخ أول قسط');return}
 if(down>=total){toast('الدفعة الأولى يجب أن تكون أقل من السعر الكلي');return}
 const amt=Math.round(((total-down)/n)*100)/100;
 state.inst.push({id:'i'+Date.now(),name,total,down,n,amt,start,account:acct,cat,paid:0});
 if(down>0&&$('instDownTx').checked){const tx={id:'t'+(Date.now()+1),type:'expense',cat,amount:down,date:todayStr(),note:'دفعة أولى: '+name,account:acct};state.tx.push(tx);applySweep(tx)}
 save();$('instName').value='';$('instTotal').value='';$('instDown').value='';renderInst();render();toast('💳 أُضيفت الخطة — '+n+' أقساط × '+fmt(amt))}
function payInst(pid){const p=(state.inst||[]).find(x=>x.id===pid);if(!p||p.paid>=p.n)return;const s=instSchedule().find(x=>x.pid===pid&&!x.paid);if(!s)return;
 const tx={id:'t'+Date.now(),type:'expense',cat:p.cat,amount:s.amt,date:todayStr(),note:'قسط '+(p.paid+1)+'/'+p.n+': '+p.name,account:p.account};state.tx.push(tx);applySweep(tx);p.paid++;save();renderInst();render();toast('✅ دُفع القسط '+p.paid+'/'+p.n+' — المتبقي من الخطة '+fmt(instRemaining(p)))}
function delInst(pid){if(!confirm('حذف خطة الأقساط؟ (الدفعات المسجلة تبقى في حركاتك)'))return;state.inst=state.inst.filter(x=>x.id!==pid);save();renderInst();render();toast('حُذفت خطة الأقساط')}
function renderInst(){const b=$('instBox');if(!b)return;const cs=$('instCat');if(cs&&!cs.innerHTML)cs.innerHTML=CATS.expense.map(c=>'<option value="'+c[0]+'">'+c[1]+' '+c[0]+'</option>').join('');
 const list=state.inst||[];const totRem=list.reduce((s,p)=>s+instRemaining(p),0);
 if(!list.length){b.innerHTML='<p class="mut">لا خطط أقساط بعد. أضف أول خطة بالأسفل وسيتتبع التطبيق دفعاتك، وتدخل أقساطك القادمة تلقائيًا في رادار السيولة وحساب «الآمن للصرف» وقائمة التزاماتك.</p>';return}
 b.innerHTML='<p>إجمالي المتبقي عليك من كل الأقساط: <b>'+fmt(totRem)+'</b></p>'+list.slice().reverse().map(p=>{const next=instSchedule().find(s=>s.pid===p.id&&!s.paid);const pct=p.n?Math.round(p.paid/p.n*100):0;const over=next&&next.date<todayStr();
  return '<div class="tx"><div class="mid"><div class="nm">💳 '+esc(p.name)+' — متبقٍ '+fmt(instRemaining(p))+' من '+fmt(p.total)+'</div><div class="ds">دُفع '+p.paid+' من '+p.n+' أقساط ('+pct+'٪)'+(next?' • القسط القادم '+fmt(next.amt)+' في '+next.date+(over?' ⚠️ متأخر':''):' • 🎉 خُلّصت بالكامل')+'</div><div class="progress"><i style="width:'+pct+'%"></i></div></div><div class="acts">'+(next?'<button class="chip" onclick="payInst(\''+p.id+'\')">دفع القسط</button>':'')+'<button class="chip" onclick="delInst(\''+p.id+'\')">حذف</button></div></div>'}).join('')}
$('instAdd').onclick=addInst;
function nextRecurDate(t){const dom=parseInt(t.date.slice(8,10));const now=new Date();let y=now.getFullYear(),m=now.getMonth();
 const mk=(yy,mm)=>{const dim=new Date(yy,mm+1,0).getDate();return yy+'-'+String(mm+1).padStart(2,'0')+'-'+String(Math.min(dom,dim)).padStart(2,'0')};
 let cand=mk(y,m);const M=ym(now);
 const already=state.tx.some(x=>x.type===t.type&&x.cat===t.cat&&x.amount===t.amount&&x.date.startsWith(M)&&x.date.slice(8,10)===String(Math.min(dom,new Date(y,m+1,0).getDate())).padStart(2,'0'));
 if(cand<todayStr()||already){m++;if(m>11){m=0;y++}cand=mk(y,m)}
 return cand}
function upcomingCommitments(days){days=days||30;const t0=todayStr();const end=new Date(Date.now()+days*864e5).toISOString().slice(0,10);const out=[];
 recTemplates().forEach(t=>{const d=nextRecurDate(t);if(d<=end)out.push({date:d,label:(t.type==='income'?'💰 دخل متكرر: ':'💸 مصروف متكرر: ')+t.cat,amount:t.type==='income'?t.amount:-t.amount,kind:'rec',overdue:false})});
 state.debts.forEach(d=>{const r=debtsRemain(d);if(r>0&&d.due&&d.due<=end)out.push({date:d.due,label:(d.dir==='owe'?'🔴 دَين عليك: ':'🟢 دَين لك: ')+d.name,amount:d.dir==='owe'?-r:r,kind:'debt',overdue:d.due<t0})});
 instSchedule().forEach(s=>{if(!s.paid&&s.date<=end)out.push({date:s.date,label:'💳 قسط '+s.k+': '+s.name,amount:-s.amt,kind:'inst',overdue:s.date<t0})});
 return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)}
function renderCommit(){const b=$('commitBox');if(!b)return;const list=upcomingCommitments(30);const outT=list.filter(x=>x.amount<0).reduce((s,x)=>s-x.amount,0);const incT=list.filter(x=>x.amount>0).reduce((s,x)=>s+x.amount,0);
 if(!list.length){b.innerHTML='<p class="mut">لا التزامات مجدولة في الـ ٣٠ يومًا القادمة — لا متكررات ولا ديونًا مستحقة ولا أقساط. 🎉</p>';return}
 b.innerHTML='<p>الخارج المتوقع: <b style="color:var(--red)">'+fmt(outT)+'</b>'+(incT?' • الداخل المتوقع: <b style="color:var(--green)">'+fmt(incT)+'</b>':'')+'</p>'+list.slice(0,6).map(x=>'<div class="kv"><span>'+x.date+(x.overdue?' ⚠️ متأخر':'')+' • '+esc(x.label)+'</span><b style="color:'+(x.amount>=0?'var(--green)':'var(--red)')+'">'+(x.amount>=0?'+':'−')+fmt(Math.abs(x.amount))+'</b></div>').join('')+(list.length>6?'<p class="mut">و'+(list.length-6)+' التزامات أخرى خلال الشهر.</p>':'')}
function netWorth(){const bal=ACCOUNTS.reduce((s,a)=>s+accBalance(a[0]),0);const owedIn=state.debts.filter(d=>d.dir==='owed').reduce((s,d)=>s+debtsRemain(d),0);const oweOut=state.debts.filter(d=>d.dir==='owe').reduce((s,d)=>s+debtsRemain(d),0);return{bal,owedIn,oweOut,worth:bal+owedIn-oweOut}}
function renderNetWorth(){const b=$('nwBox');if(!b)return;const w=netWorth();const M=ym(new Date());const log=state.netLog;const cur=log.find(e=>e.m===M);
 const logChanged=!cur||cur.v!==w.worth;
 if(!cur)log.push({m:M,v:w.worth});else if(cur.v!==w.worth)cur.v=w.worth;
 if(logChanged)save();
 const sorted=log.slice().sort((a,b)=>a.m<b.m?-1:1).slice(-8);const delta=sorted.length>1?w.worth-sorted[0].v:null;const maxV=Math.max(1,...sorted.map(e=>Math.abs(e.v)));
 b.innerHTML='<div style="text-align:center;padding:4px 0 8px"><div class="mut">صافي ثروتك الآن (حساباتك + ما لك − ما عليك)</div><div style="font-size:32px;font-weight:800;color:'+(w.worth>=0?'var(--green)':'var(--red)')+'">'+fmt(w.worth)+'</div>'+(delta!==null?'<div class="mut">التغيّر منذ '+sorted[0].m+': <b style="color:'+(delta>=0?'var(--green)':'var(--red)')+'">'+(delta>=0?'+':'−')+fmt(Math.abs(delta))+'</b></div>':'<div class="mut">تُحفَظ لقطة كل شهر فتتكوّن صورتك عبر الزمن</div>')+'</div>'
 +'<div class="kv"><span>🏦 أرصدة الحسابات</span><b>'+fmt(w.bal)+'</b></div><div class="kv"><span>🟢 ديون لك عند الآخرين</span><b>'+fmt(w.owedIn)+'</b></div><div class="kv"><span>🔴 ديون عليك</span><b>−'+fmt(w.oweOut)+'</b></div>'
 +(sorted.length?'<div style="display:flex;align-items:flex-end;gap:5px;height:56px;direction:ltr;margin-top:10px">'+sorted.map(e=>'<div style="flex:1;text-align:center"><div title="'+e.m+': '+fmt(e.v)+'" style="height:'+Math.max(4,Math.round(Math.abs(e.v)/maxV*38))+'px;background:'+(e.v>=0?'var(--green)':'var(--red)')+';border-radius:4px 4px 0 0;opacity:.9"></div><div class="ds">'+e.m.slice(5)+'</div></div>').join('')+'</div>':'')}
function renderSplit(){const sel=$('splitTx');if(!sel)return;sel.innerHTML=state.tx.filter(t=>t.type==='expense'&&!t.splitDone).slice(-30).reverse().map(t=>'<option value="'+t.id+'">'+t.date+' • '+esc(t.cat)+' • '+fmt(t.amount)+(t.note?' • '+esc(t.note):'')+'</option>').join('')||'<option value="">— لا مصروفات متاحة للتقسيم —</option>'}
function doSplit(){const t=state.tx.find(x=>String(x.id)===$('splitTx').value);if(!t){toast('اختر مصروفًا أولًا');return}
 const names=$('splitNames').value.split(/[،,]/).map(s=>s.trim()).filter(Boolean);if(!names.length){toast('أدخل أسماء الأشخاص مفصولة بفاصلة');return}
 const share=Math.round((t.amount/(names.length+1))*100)/100;
 names.forEach((nm,i)=>state.debts.push({id:'d'+Date.now()+i,name:nm,total:share,paid:0,due:'',dir:'owed'}));
 t.splitDone=true;save();renderSplit();renderLab();toast('🧮 قُسّم '+fmt(t.amount)+' على '+(names.length+1)+' أشخاص — نصيب كلٍّ '+fmt(share)+' وسُجّل كدَين لك')}
$('splitGo').onclick=doSplit;
let stmtCache='';
function shareTextGeneric(txt){if(navigator.share){navigator.share({text:txt}).catch(()=>{})}else{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('📋 نُسخ النص')}catch(e){toast('تعذّرت المشاركة')}ta.remove()}}
function renderStatement(){const acct=$('stmtAcct').value;const M=$('stmtMonth').value||ym(new Date());const first=M+'-01';const pd=new Date(first+'T00:00:00');pd.setDate(pd.getDate()-1);const prevKey=pd.toISOString().slice(0,10);
 const open=accBalance(acct,prevKey);let bal=open;
 const rows=state.tx.filter(t=>t.date.startsWith(M)&&((t.type!=='transfer'&&t.account===acct)||(t.type==='transfer'&&(t.from===acct||t.to===acct)))).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.id-b.id));
 const lines=rows.map(t=>{let d=0,lab='';if(t.type==='transfer'){if(t.from===acct){d=-t.amount;lab='🔄 تحويل صادر إلى '+(ACCOUNTS.find(a=>a[0]===t.to)||[])[1]}else{d=t.amount;lab='🔄 تحويل وارد من '+(ACCOUNTS.find(a=>a[0]===t.from)||[])[1]}}else{d=t.type==='income'?t.amount:-t.amount;lab=(t.type==='income'?'💰 ':'💸 ')+t.cat+(t.note?' — '+t.note:'')}bal=Math.round((bal+d)*100)/100;return{date:t.date,lab,d,bal}});
 const an=(ACCOUNTS.find(a=>a[0]===acct)||[])[1]||acct;
 stmtCache='🧾 كشف حساب '+an+' — '+M+'\nالرصيد الافتتاحي: '+fmt(open)+'\n'+lines.map(l=>l.date+' • '+l.lab+' • '+(l.d>=0?'+':'−')+fmt(Math.abs(l.d))+' • الرصيد: '+fmt(l.bal)).join('\n')+'\nالرصيد الختامي: '+fmt(bal);
 $('stmtBox').innerHTML='<p>الافتتاحي: <b>'+fmt(open)+'</b> • الختامي: <b>'+fmt(bal)+'</b> • '+lines.length+' حركة</p>'+(lines.length?lines.map(l=>'<div class="kv"><span>'+l.date+' • '+esc(l.lab)+'</span><b style="color:'+(l.d>=0?'var(--green)':'var(--red)')+'">'+(l.d>=0?'+':'−')+fmt(Math.abs(l.d))+'</b></div><div class="ds">الرصيد بعدها: '+fmt(l.bal)+'</div>').join(''):'<p class="mut">لا حركات على هذا الحساب في هذا الشهر.</p>')}
$('stmtGo').onclick=renderStatement;
$('stmtShare').onclick=()=>{if(!stmtCache)renderStatement();shareTextGeneric(stmtCache)};
if($('stmtMonth')&&!$('stmtMonth').value)$('stmtMonth').value=ym(new Date());
const __rV14=render;render=function(){__rV14();renderCommit();renderNetWorth()};
const __rlV14=renderLab;renderLab=function(){__rlV14();renderInst();renderSplit()};

