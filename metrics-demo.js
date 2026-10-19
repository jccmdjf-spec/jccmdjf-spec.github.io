(() => {
  'use strict';
  const examples = {
    telecom: {title:'Atención de solicitudes de un ISP',description:'Ejemplo de seguimiento de solicitudes recibidas, resolución mensual y motivos de atención en una operación de telecomunicaciones.',received:[180,210,195,230,248,260],completed:[166,197,185,221,240,253],labels:['Solicitudes recibidas','Solicitudes resueltas','Tasa de resolución','Por resolver'],series:['Recibidas','Resueltas'],rate:'Resolución mensual',target:93,status:['Resueltas','En seguimiento','Pendientes'],categories:['Soporte de conexión','Instalaciones','Facturación','Cambios de servicio','Otras consultas'],weights:[.34,.26,.18,.14,.08],unit:'solicitudes'},
    logistics: {title:'Control de despachos de almacén',description:'Ejemplo de comparación entre despachos programados y completados, cumplimiento mensual y distribución de materiales.',received:[310,340,325,360,390,410],completed:[300,330,316,350,382,403],labels:['Despachos programados','Despachos completados','Tasa de cumplimiento','Por completar'],series:['Programados','Completados'],rate:'Cumplimiento mensual',target:96,status:['Completados','En preparación','Pendientes'],categories:['Cableado','Equipos de red','Accesorios','Consumibles','Protección personal'],weights:[.32,.27,.20,.13,.08],unit:'despachos'},
    commercial: {title:'Seguimiento de cotizaciones',description:'Ejemplo de seguimiento comercial: cotizaciones generadas, aprobaciones y distribución por tipo de pedido en un negocio de pastelería.',received:[80,96,92,110,122,128],completed:[42,55,53,68,79,84],labels:['Cotizaciones generadas','Cotizaciones aprobadas','Tasa de aprobación','Sin aprobación'],series:['Generadas','Aprobadas'],rate:'Aprobación mensual',target:60,status:['Aprobadas','En seguimiento','Sin cierre'],categories:['Tortas personalizadas','Postres individuales','Eventos','Productos de temporada','Otros pedidos'],weights:[.38,.24,.19,.12,.07],unit:'cotizaciones'}
  };
  const months=['Ene','Feb','Mar','Abr','May','Jun'];
  const fullMonths=['Enero','Febrero','Marzo','Abril','Mayo','Junio'];
  let current='telecom';
  const root=document.getElementById('metricas');
  if (!root) return;
  const number=new Intl.NumberFormat('es-CO');
  const percent=new Intl.NumberFormat('es-CO',{minimumFractionDigits:1,maximumFractionDigits:1});
  const selector=root.querySelector('#demo-period');
  const buttons=[...root.querySelectorAll('[data-example]')];
  const chartNodes=[...root.querySelectorAll('.demo-chart')];
  const charts=window.echarts ? chartNodes.map(node=>echarts.init(node,null,{renderer:'svg'})) : [];
  const palette=['#245c8d','#218577','#ad7a3b','#6d7d90','#9e6e91'];
  const textStyle={fontFamily:'Segoe UI, Arial, sans-serif',fontSize:14,color:'#364d62'};
  const sum=values=>values.reduce((a,b)=>a+b,0);
  function state() {
    const demo=examples[current];const start=selector.value==='3'?3:0;
    const received=demo.received.slice(start),completed=demo.completed.slice(start);
    const total=sum(received),done=sum(completed),remaining=total-done;
    const categories=demo.weights.map(w=>Math.floor(w*total));
    categories[categories.length-1]+=total-sum(categories);
    return {demo,start,received,completed,total,done,remaining,categories,rate:done/total*100};
  }
  function render() {
    const s=state(),d=s.demo;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.example===current)));
    root.querySelector('#demo-title').textContent=d.title;
    root.querySelector('#demo-description').textContent=d.description;
    root.querySelector('#demo-period-caption').textContent=(s.start?'Abril — junio':'Enero — junio')+' · período simulado';
    [s.total,s.done,s.rate,s.remaining].forEach((value,index)=>{
      root.querySelector('#demo-label-'+index).textContent=d.labels[index];
      root.querySelector('#demo-value-'+index).textContent=index===2?percent.format(value)+' %':number.format(value);
    });
    root.querySelector('#demo-status').textContent=d.title+'. '+(s.start?'Últimos tres meses':'Seis meses')+' de datos ficticios. '+d.labels[0]+': '+s.total+'. '+d.labels[1]+': '+s.done+'.';
    root.querySelector('#demo-table-body').replaceChildren();
    s.received.forEach((value,i)=>{
      const row=document.createElement('tr');
      [fullMonths[s.start+i],number.format(value),number.format(s.completed[i]),percent.format(s.completed[i]/value*100)+' %'].forEach((text,j)=>{
        const cell=document.createElement(j?'td':'th');cell.textContent=text;if(!j)cell.scope='row';row.append(cell);
      });root.querySelector('#demo-table-body').append(row);
    });
    root.querySelector('#demo-table-received').textContent=d.series[0];
    root.querySelector('#demo-table-completed').textContent=d.series[1];
    root.querySelector('#demo-bars-title').textContent=d.series.join(' y ');
    root.querySelector('#demo-line-title').textContent=d.rate+' (%)';
    root.querySelector('#demo-distribution-title').textContent='Estado de '+d.unit;
    root.querySelector('#demo-category-title').textContent=current==='telecom'?'Solicitudes por motivo':current==='logistics'?'Despachos programados por material':'Cotizaciones por tipo de pedido';
    if (!charts.length) {
      root.querySelector('#demo-library-note').hidden=false;
      root.querySelector('#demo-table').open=true;
      return;
    }
    const common={animation:false,textStyle,color:palette,tooltip:{confine:true,textStyle:{fontSize:14}},aria:{enabled:true,label:{description:'Demostración con datos completamente ficticios. Los valores mensuales están disponibles en la tabla que acompaña los gráficos.'}}};
    const axis={axisLine:{lineStyle:{color:'#b8c6d4'}},axisTick:{show:false},axisLabel:{color:'#425d75',fontSize:13},splitLine:{lineStyle:{color:'#e1e8ef'}}};
    charts[0].setOption({...common,legend:{bottom:0,textStyle},grid:{left:14,right:15,top:28,bottom:46,containLabel:true},tooltip:{...common.tooltip,trigger:'axis'},xAxis:{...axis,type:'category',data:months.slice(s.start)},yAxis:{...axis,type:'value',min:0},series:[{name:d.series[0],type:'bar',data:s.received,barMaxWidth:23,itemStyle:{color:palette[0]}},{name:d.series[1],type:'bar',data:s.completed,barMaxWidth:23,itemStyle:{color:palette[1]}}]},true);
    charts[1].setOption({...common,legend:{bottom:0,textStyle},grid:{left:14,right:18,top:28,bottom:46,containLabel:true},tooltip:{...common.tooltip,trigger:'axis',valueFormatter:v=>percent.format(v)+' %'},xAxis:{...axis,type:'category',data:months.slice(s.start),boundaryGap:false},yAxis:{...axis,type:'value',min:0,max:100,axisLabel:{...axis.axisLabel,formatter:'{value} %'}},series:[{name:'Resultado simulado',type:'line',data:s.received.map((v,i)=>Number((s.completed[i]/v*100).toFixed(1))),symbol:'circle',symbolSize:8,lineStyle:{width:3},areaStyle:{opacity:.08},itemStyle:{color:palette[0]}},{name:'Meta del ejemplo',type:'line',data:s.received.map(()=>d.target),symbol:'none',lineStyle:{type:'dashed',width:2},itemStyle:{color:palette[2]}}]},true);
    const progress=Math.floor(s.remaining*.65);
    charts[2].setOption({...common,tooltip:{...common.tooltip,trigger:'item',formatter:'{b}: {c} ({d} %)'},legend:{bottom:0,textStyle:{...textStyle,fontSize:13},itemWidth:12},series:[{name:'Datos ficticios',type:'pie',radius:['43%','68%'],center:['50%','43%'],label:{show:false},emphasis:{label:{show:true,fontSize:16,fontWeight:'bold',formatter:'{b}\n{d} %'}},itemStyle:{borderColor:'#fff',borderWidth:3},data:[{name:d.status[0],value:s.done,itemStyle:{color:palette[1]}},{name:d.status[1],value:progress,itemStyle:{color:palette[0]}},{name:d.status[2],value:s.remaining-progress,itemStyle:{color:palette[2]}}]}]},true);
    charts[3].setOption({...common,grid:{left:12,right:38,top:20,bottom:15,containLabel:true},tooltip:{...common.tooltip,trigger:'axis',axisPointer:{type:'shadow'}},xAxis:{...axis,type:'value',min:0},yAxis:{...axis,type:'category',inverse:true,data:d.categories,axisLabel:{...axis.axisLabel,fontSize:12,width:chartNodes[3].clientWidth<400?105:145,overflow:'break'}},series:[{type:'bar',name:'Datos ficticios',data:s.categories,barMaxWidth:23,itemStyle:{color:palette[0]},label:{show:true,position:'right',color:'#364d62',fontSize:13}}]},true);
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{current=button.dataset.example;render();}));
  selector.addEventListener('change',render);
  root.querySelector('#demo-download').addEventListener('click',()=>{
    const s=state(),d=s.demo;
    const rows=[['DEMOSTRACIÓN: DATOS FICTICIOS, SIN INFORMACIÓN EMPRESARIAL'],[d.title],['Mes',d.series[0],d.series[1],'Tasa (%)'],...s.received.map((v,i)=>[fullMonths[s.start+i],v,s.completed[i],(s.completed[i]/v*100).toFixed(1).replace('.',',')])];
    const blob=new Blob(['\ufeff'+rows.map(row=>row.join(';')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ejemplo-'+current+'-'+selector.value+'-meses.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();
  const observer=new ResizeObserver(()=>{charts.forEach(chart=>chart.resize());});
  chartNodes.forEach(node=>observer.observe(node));
})();
