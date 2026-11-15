let rows=[],sortKey='code',asc=true;
const tbody=document.querySelector('#tbl tbody');

function render(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  const list=rows.filter(r=>(r.code+r.name).toLowerCase().includes(q));
  list.sort((a,b)=>{
    const x=a[sortKey],y=b[sortKey];
    if(x===null||x===undefined)return 1;
    if(y===null||y===undefined)return -1;
    return (x>y?1:x<y?-1:0)*(asc?1:-1);
  });
  tbody.innerHTML=list.length?list.map(r=>`<tr>
    <td>${r.code}</td><td><a href="stock.html?code=${r.code}">${r.name}</a></td><td>${r.industry}</td>
    <td class="num">${fmt(r.weight,2)}</td><td class="num">${fmt(r.eps,2)}</td>
    <td class="num ${signClass(r.net)}">${fmt(r.net)}</td></tr>`).join('')
    :'<tr><td colspan="6" class="empty">找不到符合的公司</td></tr>';
}

async function init(){
  showUpdated();
  const list=await loadJSON('data/constituents.json')||[];
  rows=await Promise.all(list.map(async c=>{
    const fin=await loadJSON(`data/financials/${c.code}.json`);
    const chip=await loadJSON(`data/chips/${c.code}.json`);
    const q=fin&&fin.quarters&&fin.quarters.length?fin.quarters[fin.quarters.length-1]:null;
    const d=chip&&chip.daily?chip.daily.slice(-5):[];
    const net=d.length?d.reduce((s,x)=>s+(x.foreign||0)+(x.investment_trust||0)+(x.dealer||0),0)/1000:null;
    return {...c,eps:q?q.eps:null,net};
  }));
  render();
}
document.getElementById('q').addEventListener('input',render);
document.querySelectorAll('#tbl th').forEach(th=>th.addEventListener('click',()=>{
  const k=th.dataset.k;asc=sortKey===k?!asc:true;sortKey=k;render();
}));
init();
