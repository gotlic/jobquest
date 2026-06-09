module.exports=[79215,a=>{"use strict";var b=a.i(87924),c=a.i(80826);let d={};async function e(a){if(a in d)return d[a];try{let b=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(a)}&format=json&limit=1`,{headers:{"Accept-Language":"fr"}}),c=await b.json(),e=c[0]?{lat:parseFloat(c[0].lat),lon:parseFloat(c[0].lon)}:null;return d[a]=e,e}catch{return d[a]=null,null}}let f={todo:"#6b7280",applied:"#7c3aed",followup:"#ec4899",interview:"#f59e0b",offer:"#10b981",rejected:"#ef4444"};a.s(["default",0,function({jobs:g}){let h=(0,c.useRef)(null),i=(0,c.useRef)(null),[j,k]=(0,c.useState)([]),[l,m]=(0,c.useState)(null);(0,c.useEffect)(()=>{let a=g.filter(a=>"archived"!==a.status&&a.location);if(0===a.length)return void m(null);let b=[...new Set(a.map(a=>a.location))];m({done:0,total:b.length});let c=!1;return(async()=>{for(let a=0;a<b.length;a++){if(c)return;await e(b[a]),c||m({done:a+1,total:b.length}),a<b.length-1&&await new Promise(a=>setTimeout(a,300))}if(!c){let b=[];a.forEach(a=>{let c=d[a.location];c&&b.push({job:a,lat:c.lat,lon:c.lon})}),k(b),m(null)}})(),()=>{c=!0}},[g]),(0,c.useEffect)(()=>{},[]),(0,c.useEffect)(()=>{i.current&&0!==j.length&&a.A(67495).then(a=>{let b=i.current;b.eachLayer(a=>{a._isJobMarker&&b.removeLayer(a)});let c=new Map;j.forEach(a=>{var b,d;let e=(b=a.lat,d=a.lon,`${(Math.round(2*b)/2).toFixed(1)},${(Math.round(2*d)/2).toFixed(1)}`);c.has(e)||c.set(e,[]),c.get(e).push(a)}),c.forEach(c=>{let d=c.reduce((a,b)=>a+b.lat,0)/c.length,e=c.reduce((a,b)=>a+b.lon,0)/c.length,g=c.length,h=g>1,i={};c.forEach(a=>{i[a.job.status]=(i[a.job.status]??0)+1});let j=f[Object.entries(i).sort((a,b)=>b[1]-a[1])[0][0]]??"#6b7280",k=h?36:26,l=a.divIcon({className:"",html:`<div style="
            background:${j};
            color:#fff;
            border-radius:50%;
            width:${k}px;height:${k}px;
            display:flex;align-items:center;justify-content:center;
            font-size:${h?13:11}px;font-weight:700;
            border:2.5px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
            cursor:pointer;
          ">${g}</div>`,iconSize:[k,k],iconAnchor:[k/2,k/2]}),m=c.slice(0,6).map(a=>`<div style="padding:2px 0;line-height:1.4">
            <span style="font-weight:700;font-size:12px">${a.job.title}</span><br>
            <span style="color:#6b7280;font-size:11px">${a.job.company}${a.job.location?` \xb7 ${a.job.location}`:""}</span>
          </div>`).join('<div style="border-top:1px solid #e5e7eb;margin:3px 0"></div>')+(c.length>6?`<div style="color:#9ca3af;font-size:11px;padding-top:4px">+${c.length-6} autres</div>`:""),n=a.marker([d,e],{icon:l});n._isJobMarker=!0,n.bindTooltip(m,{direction:"top",offset:[0,-(k/2)-4],opacity:1,className:"jobs-map-tooltip"}),n.addTo(b)})})},[j]);let n=g.filter(a=>"archived"!==a.status&&a.location).length,o=j.length;return(0,b.jsxs)("div",{className:"relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm",style:{height:480},children:[(0,b.jsx)("style",{children:`
        .jobs-map-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 10px 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,.12) !important;
          font-family: inherit !important;
          pointer-events: none;
          max-width: 260px;
        }
        .jobs-map-tooltip::before { display:none !important; }
        .leaflet-attribution-flag { display:none !important; }
      `}),(0,b.jsx)("div",{ref:h,style:{height:"100%",width:"100%"}}),o>0&&(0,b.jsxs)("div",{className:"absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-gray-100",children:["📍 ",o," offre",o>1?"s":""," localisée",o>1?"s":""]}),l&&(0,b.jsxs)("div",{className:"absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-[1001]",children:[(0,b.jsx)("div",{className:"w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2",children:(0,b.jsx)("div",{className:"h-full bg-violet-500 rounded-full transition-all",style:{width:`${Math.round(l.done/l.total*100)}%`}})}),(0,b.jsxs)("p",{className:"text-xs text-gray-500",children:["Géolocalisation ",l.done,"/",l.total]})]}),o>0&&(0,b.jsx)("div",{className:"absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs shadow-sm border border-gray-100 flex flex-col gap-1",children:Object.entries({todo:"📋 À explorer",applied:"🚀 Postulé",interview:"🤝 Entretien",offer:"🎉 Offre !"}).map(([a,c])=>(0,b.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,b.jsx)("div",{className:"w-2.5 h-2.5 rounded-full flex-shrink-0",style:{background:f[a]}}),(0,b.jsx)("span",{className:"text-gray-600",children:c})]},a))}),!l&&0===n&&(0,b.jsx)("div",{className:"absolute inset-0 flex items-center justify-center bg-gray-50 z-[1001] rounded-2xl",children:(0,b.jsx)("p",{className:"text-sm text-gray-400",children:"Aucune offre avec un lieu renseigné"})})]})}])},67495,a=>{a.v(b=>Promise.all(["server/chunks/ssr/node_modules_leaflet_dist_leaflet-src_1de3iy2.js"].map(b=>a.l(b))).then(()=>b(99661)))}];

//# sourceMappingURL=_0hhbhr6._.js.map