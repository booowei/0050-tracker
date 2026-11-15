async function loadJSON(path){
  try{const r=await fetch(path);if(!r.ok)return null;return await r.json();}catch(e){return null;}
}
function fmt(v,d=0){
  if(v===null||v===undefined||Number.isNaN(v))return '—';
  return Number(v).toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d});
}
// 台股慣例:正數紅、負數綠
function signClass(v){return v>0?'up':v<0?'down':'';}
async function showUpdated(){
  const m=await loadJSON('data/meta.json');
  const el=document.getElementById('updated');
  if(el)el.textContent=m&&m.updated_at?'資料更新:'+m.updated_at:'尚未更新資料';
}
