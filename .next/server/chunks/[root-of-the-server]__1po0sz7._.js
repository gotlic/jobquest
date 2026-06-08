module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),a=e.i(22734);let r=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:n}}}class s{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let i=`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    remote TEXT,
    start_date TEXT,
    salary TEXT,
    contract_type TEXT,
    summary TEXT,
    description TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_linkedin TEXT,
    network_connection TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    applied_date TEXT,
    response_date TEXT,
    response_type TEXT,
    response_notes TEXT,
    added_by TEXT DEFAULT 'Inconnu',
    priority TEXT DEFAULT 'medium',
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT '\xc9quipe',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TRIGGER IF NOT EXISTS update_jobs_timestamp
    AFTER UPDATE ON jobs
    BEGIN
      UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

  CREATE TABLE IF NOT EXISTS cv_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'violet',
    icon TEXT NOT NULL DEFAULT '📄',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    version TEXT,
    notes TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cover_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE SET NULL
  );
`,o=null,l=null,d=0;async function u(){return o||(o=await (0,t.default)()),o}async function c(){let e,t=0;try{t=a.default.statSync(r).mtimeMs}catch{}if(l&&t===d)return l;let n=await u();if(a.default.existsSync(r)){let t=a.default.readFileSync(r);e=new n.Database(t)}else e=new n.Database;return e.exec(i),a.default.writeFileSync(r,Buffer.from(e.export())),d=a.default.statSync(r).mtimeMs,l=new s(e,r)}e.s(["getDb",0,c])},78143,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),E=e.i(70101),T=e.i(26937),m=e.i(10372),h=e.i(93695);e.i(52474);var N=e.i(220),R=e.i(89171);e.i(36701);var x=e.i(37709),x=x,f=e.i(62294);let _=new x.Anthropic,A=new Map;async function L(e){let{url:t}=await e.json();if(!t)return R.NextResponse.json({error:"URL requise"},{status:400});let a=function(e){try{let t=new URL(e.trim());return t.hash="",t.toString().replace(/\/$/,"").toLowerCase()}catch{return e.trim().toLowerCase()}}(t);if(A.has(a))return R.NextResponse.json({...A.get(a),url:t,_cached:!0});let r=(await (0,f.getDb)()).prepare("SELECT * FROM jobs WHERE url = ? LIMIT 1").get(t);if(r){let e={title:r.title,company:r.company,location:r.location,remote:r.remote,start_date:r.start_date,salary:r.salary,contract_type:r.contract_type,summary:r.summary,contact_name:r.contact_name,contact_email:r.contact_email,contact_linkedin:r.contact_linkedin};return A.set(a,e),R.NextResponse.json({...e,url:t,_cached:!0})}let n="";try{let e=await fetch(t,{headers:{"User-Agent":"Mozilla/5.0 (compatible; JobSearchBot/1.0)"},signal:AbortSignal.timeout(1e4)});n=(n=await e.text()).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,8e3)}catch{return R.NextResponse.json({error:"Impossible de lire cette URL"},{status:422})}let s=await _.messages.create({model:"claude-sonnet-4-6",max_tokens:1024,messages:[{role:"user",content:`Tu analyses une offre d'emploi pour un outil de suivi de candidatures. Extrais les informations suivantes du contenu de la page et r\xe9ponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication.

URL: ${t}
Contenu de la page: ${n}

JSON attendu:
{
  "title": "Intitul\xe9 exact du poste",
  "company": "Nom de l'entreprise",
  "location": "Ville, Pays (ou null)",
  "remote": "full / partial / no / null",
  "start_date": "Date de d\xe9but si mentionn\xe9e (ou null)",
  "salary": "Fourchette salariale si mentionn\xe9e (ou null)",
  "contract_type": "CDI / CDD / Stage / Freelance / etc (ou null)",
  "summary": "R\xe9sum\xe9 du poste en 30-50 mots maximum, percutant et informatif",
  "contact_name": "Pr\xe9nom Nom du recruteur si mentionn\xe9 (ou null)",
  "contact_email": "Email recruteur si mentionn\xe9 (ou null)",
  "contact_linkedin": "Profil LinkedIn recruteur si mentionn\xe9 (ou null)"
}`}]}),i="text"===s.content[0].type?s.content[0].text:"",o=i.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim(),l=o.match(/\{[\s\S]*\}/);try{let e=JSON.parse(l?l[0]:o);return A.set(a,e),R.NextResponse.json({...e,url:t})}catch{return R.NextResponse.json({error:"Erreur parsing IA",raw:i},{status:500})}}e.s(["POST",0,L],23892);var v=e.i(23892);let y=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/analyze/route.ts",nextConfigOutput:"",userland:v,...{}}),{workAsyncStorage:g,workUnitAsyncStorage:w,serverHooks:b}=y;async function O(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),y.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/analyze/route";R=R.replace(/\/index$/,"")||"/";let x=await y.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:f,deploymentId:_,params:A,nextConfig:L,parsedUrl:v,isDraftMode:g,prerenderManifest:w,routerServerContext:b,isOnDemandRevalidate:O,revalidateOnlyGenerated:U,resolvedPathname:I,clientReferenceManifest:C,serverActionsManifest:S}=x,D=(0,o.normalizeAppPath)(R),X=!!(w.dynamicRoutes[D]||w.routes[I]),j=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,v,!1):t.end("This page could not be found"),null);if(X&&!g){let e=!!w.routes[I],t=w.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await j();throw new h.NoFallbackError}}let P=null;!X||y.isDev||g||(P="/index"===(P=I)?"/":P);let q=!0===y.isDev||!X,F=X&&!q;S&&C&&(0,i.setManifestsSingleton)({page:R,clientReferenceManifest:C,serverActionsManifest:S});let k=e.method||"GET",M=(0,s.getTracer)(),B=M.getActiveScopeSpan(),G=!!(null==b?void 0:b.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await y.getIncrementalCache(e,L,w,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let $={params:A,previewProps:w.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:q,incrementalCache:K,cacheLifeProfiles:L.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>y.onRequestError(e,t,r,n,b)},sharedContext:{buildId:f,deploymentId:_}},Y=new l.NodeNextRequest(e),z=new l.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>y.handle(W,$).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=M.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${R}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:a})=>{try{if(!H&&O&&U&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=$.renderOpts.fetchMetrics;let o=$.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let l=$.renderOpts.collectedTags;if(!X)return await (0,p.sendResponse)(Y,z,s,$.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[m.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,r=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:$.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:O})},!1,b),t}},d=await y.handleResponse({req:e,nextConfig:L,cacheKey:P,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:U,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:H});if(!X)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",O?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,E.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&X||u.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(Y,z,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};G&&B?await o(B):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${R}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof h.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:O})},!1,b),X)throw t;return await (0,p.sendResponse)(Y,z,new Response(null,{status:500})),null}}e.s(["handler",0,O,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:w})},"routeModule",0,y,"serverHooks",0,b,"workAsyncStorage",0,g,"workUnitAsyncStorage",0,w],78143)},6714,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_fs_1t1l-4-._.js"].map(t=>e.l(t))).then(()=>t(2157)))},11105,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_path_1pmhwj3._.js"].map(t=>e.l(t))).then(()=>t(50227)))},46735,e=>{e.v(t=>Promise.all(["server/chunks/[externals]__1j5vgk-._.js","server/chunks/[root-of-the-server]__1fbyaci._.js"].map(t=>e.l(t))).then(()=>t(83085)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1po0sz7._.js.map