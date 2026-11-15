const code=new URLSearchParams(location.search).get('code');

function emptyRow(tb,n,msg){tb.innerHTML=`<tr><td colspan="${n}" class="empty">${msg}</td></tr>`;}

async function init(){
  showUpdated();
  const list=await loadJSON('data/constituents.json')||[];
  const info=list.find(c=>c.code===code);
  document.getElementById('title').textContent=info?`${info.code} ${info.name}`:'找不到這檔股票';
  if(!info)return;
  document.title=`${info.name} | 0050 成分股追蹤`;

  const fin=await loadJSON(`data/financials/${code}.json`);
  const ft=document.querySelector('#fin tbody');
  const qs=fin&&fin.quarters?fin.quarters:[];
  if(!qs.length)emptyRow(ft,5,'尚無財報資料,請執行 scripts/fetch_data.py 更新。');
  else{
    ft.innerHTML=[...qs].reverse().map(q=>`<tr><td>${q.period}</td><td class="num">${fmt(q.revenue,2)}</td>
      <td class="num">${fmt(q.gross_margin,2)}</td><td class="num">${fmt(q.net_income,2)}</td><td class="num">${fmt(q.eps,2)}</td></tr>`).join('');
    new Chart(document.getElementById('epsChart'),{type:'bar',
      data:{labels:qs.map(q=>q.period),datasets:[{label:'EPS',data:qs.map(q=>q.eps),backgroundColor:'#2f5d8c'}]},
      options:{maintainAspectRatio:false}});
  }

  const chip=await loadJSON(`data/chips/${code}.json`);
  const ct=document.querySelector('#chip tbody');
  const ds=chip&&chip.daily?chip.daily:[];
  if(!ds.length)emptyRow(ct,4,'尚無籌碼資料,請執行 scripts/fetch_data.py 更新。');
  else{
    const k=v=>v===null||v===undefined?null:v/1000;
    ct.innerHTML=[...ds].reverse().slice(0,20).map(d=>`<tr><td>${d.date}</td>
      ${['foreign','investment_trust','dealer'].map(f=>`<td class="num ${signClass(d[f])}">${fmt(k(d[f]))}</td>`).join('')}</tr>`).join('');
    const r=ds.slice(-20);
    new Chart(document.getElementById('chipChart'),{type:'bar',
      data:{labels:r.map(d=>d.date.slice(5)),datasets:[
        {label:'外資',data:r.map(d=>k(d.foreign)),backgroundColor:'#16202e'},
        {label:'投信',data:r.map(d=>k(d.investment_trust)),backgroundColor:'#2f5d8c'},
        {label:'自營商',data:r.map(d=>k(d.dealer)),backgroundColor:'#9aa7b8'}]},
      options:{maintainAspectRatio:false,scales:{x:{stacked:true},y:{stacked:true}}}});
  }
}
init();
