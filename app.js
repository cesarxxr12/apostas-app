// Filtros do método — dois laboratórios
function n(v){const x=parseFloat(v);return isNaN(x)?null:x}
function lab1Check(j){
  const o=n(j.oddFavorito),r=[];
  if(o===null||o<1.45||o>1.90) r.push('odd fora de 1.45–1.90');
  if(!j.favoritoCasa&&!j.desnivelExtremo) r.push('favorito fora sem desnível extremo');
  if(!j.adversarioFraco) r.push('adversário não é fraco');
  if(j.derby) r.push('derby/clássico');
  if(j.lesoesGraves) r.push('lesões graves no favorito');
  return r;
}
function lab2Check(j){
  const o=n(j.oddFavorito),r=[];
  if(o===null||o>1.40) r.push('favorito acima de 1.40');
  if(!j.favoritoEsteril) r.push('favorito sem contexto negativo');
  if(!j.outsiderBloco) r.push('outsider sem bloco');
  if(!(j.lacuna&&String(j.lacuna).trim())) r.push('lacuna não documentada');
  let m=null;
  if(n(j.oddEmpate)>=3.50) m={nome:'Empate',odd:n(j.oddEmpate)};
  else if(n(j.oddOutsider)>=5.00) m={nome:'Vitória '+(j.favoritoCasa?j.fora:j.casa),odd:n(j.oddOutsider)};
  else if(n(j.oddUnder25)>=2.20) m={nome:'Under 2.5',odd:n(j.oddUnder25)};
  if(!m) r.push('mercado derivado abaixo do gatilho');
  return {r,m};
}
function avaliar(jogos){
  const lab1=[],lab2=[],usados=new Set();
  jogos.forEach((j,i)=>{
    if(lab1.length>=3) return;
    if(lab1Check(j).length===0){
      const stake=(j.favoritoCasa&&j.desnivelExtremo)?15:10;
      lab1.push({...j,stake});usados.add(i);
    }
  });
  jogos.forEach((j,i)=>{
    if(usados.has(i)||lab2.length>=2) return;
    const {r,m}=lab2Check(j);
    if(r.length===0) lab2.push({...j,mercado:m,stake:3});
  });
  return {lab1,lab2};
}
function fav(j){return j.favoritoCasa?j.casa:j.fora}
function txt1(j){return `Lab 1 · ${j.casa} vs ${j.fora} · Vitória ${fav(j)} · Odd: ${n(j.oddFavorito).toFixed(2)} · Stake: ${j.stake} € · Motivo: ${j.motivo||''}`}
function txt2(j){return `Lab 2 · ${j.casa} vs ${j.fora} · ${fav(j)} a ${n(j.oddFavorito).toFixed(2)} → ${j.mercado.nome} a ${j.mercado.odd.toFixed(2)} · Stake: 3 € · Lacuna: ${j.lacuna}`}
if(typeof module!=='undefined'){module.exports={avaliar,lab1Check,lab2Check,txt1,txt2};}

if(typeof document!=='undefined'){
const EX=[{casa:"Benfica",fora:"Casa Pia",oddFavorito:1.67,favoritoCasa:true,adversarioFraco:true,desnivelExtremo:true,derby:false,lesoesGraves:false,motivo:"Favorito em casa, adversário 16.º, forma negativa."},
{casa:"Porto",fora:"Arouca",oddFavorito:1.32,favoritoCasa:true,adversarioFraco:false,favoritoEsteril:true,outsiderBloco:true,oddEmpate:3.8,oddOutsider:7.5,oddUnder25:2.1,lacuna:"Favorito sem o médio criativo, outsider com 4 clean sheets em casa."}];
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let card=JSON.parse(localStorage.getItem('card')||'[]'),reg=JSON.parse(localStorage.getItem('registo')||'[]');
const save=()=>{localStorage.setItem('card',JSON.stringify(card));localStorage.setItem('registo',JSON.stringify(reg))};
function copiar(t,b){navigator.clipboard?.writeText(t);b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',1200)}
function registar(t){reg.unshift({t,res:'aberta',d:new Date().toISOString().slice(0,10)});save();render()}
function zero(){return '<div class="card zero"><b>Zero.</b> Nenhum jogo passou os filtros.</div>'}
function render(){
  const {lab1,lab2}=avaliar(card);
  $('#lab1').innerHTML=lab1.length?lab1.map((j,i)=>`<div class="card"><div class="t">${esc(j.casa)}  vs  ${esc(j.fora)}</div>
  <div class="row"><span>Odd: <span class="green">${n(j.oddFavorito).toFixed(2)}</span></span><span class="stake">Stake: ${j.stake} €</span></div>
  <div class="sub m">Motivo: ${esc(j.motivo)}</div>${j.fontes?`<div class="sub fontes">Fontes: ${esc(j.fontes)}</div>`:''}<button data-l="1" data-i="${i}">Copiar</button> <button data-r="1" data-i="${i}">Registar</button></div>`).join(''):zero();
  $('#lab2').innerHTML=lab2.length?lab2.map((j,i)=>`<div class="card"><div class="t">${esc(fav(j))} a <span class="red">${n(j.oddFavorito).toFixed(2)}</span>  →  ${esc(j.mercado.nome)} a <span class="green">${j.mercado.odd.toFixed(2)}</span></div>
  <div class="row"><span class="stake">Stake: 3 €</span></div>
  <div class="sub m">Lacuna: ${esc(j.lacuna)}</div>${j.fontes?`<div class="sub fontes">Fontes: ${esc(j.fontes)}</div>`:''}<button data-l="2" data-i="${i}">Copiar</button> <button data-r="2" data-i="${i}">Registar</button></div>`).join(''):zero();
  document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>copiar(b.dataset.l==='1'?txt1(lab1[b.dataset.i]):txt2(lab2[b.dataset.i]),b));
  document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>registar(b.dataset.r==='1'?txt1(lab1[b.dataset.i]):txt2(lab2[b.dataset.i])));
  $('#card').innerHTML=card.map((j,i)=>`<li>${esc(j.casa)} vs ${esc(j.fora)} · ${esc(j.oddFavorito)} <button data-del="${i}">×</button></li>`).join('')||'<li>Vazio.</li>';
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{card.splice(b.dataset.del,1);save();render()});
  $('#reg').innerHTML=reg.map((r,i)=>`<li>${esc(r.d)} · ${esc(r.t)}<select data-g="${i}">${['aberta','ganha','perdida'].map(o=>`<option${o===r.res?' selected':''}>${o}</option>`).join('')}</select></li>`).join('')||'<li>Sem apostas registadas.</li>';
  document.querySelectorAll('[data-g]').forEach(s=>s.onchange=()=>{reg[s.dataset.g].res=s.value;save()});
}
$('#ex').textContent=JSON.stringify(EX,null,2);
$('#f').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),j={};
  for(const [k,v] of fd) j[k]=v;
  ['adversarioFraco','desnivelExtremo','derby','lesoesGraves','favoritoEsteril','outsiderBloco'].forEach(k=>j[k]=fd.has(k));
  j.favoritoCasa=j.favoritoCasa==='true';
  ['oddFavorito','oddEmpate','oddOutsider','oddUnder25'].forEach(k=>j[k]=n(j[k]));
  card.push(j);save();render();e.target.reset()};
$('#imp').onclick=()=>{try{const d=JSON.parse($('#json').value);card=card.concat(Array.isArray(d)?d:[d]);save();render();$('#msg').textContent='Importado.'}catch{$('#msg').textContent='JSON inválido.'}};
$('#clr').onclick=()=>{card=[];save();render()};
if(location.search.includes('demo')&&!card.length) card=EX.slice();
render();
function carregar(){fetch('./card-hoje.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(f=>{
  if(!f||!Array.isArray(f.jogos)) return;
  const d=String(f.data||''),old=localStorage.getItem('cardData')||'';
  if(d>old){card=f.jogos;localStorage.setItem('cardData',d);save();}
  if(d>=old) $('#upd').textContent='Actualizado: '+(f.actualizado||d);
  render();
}).catch(()=>{});}
carregar();setInterval(carregar,5*60*1000);
}
