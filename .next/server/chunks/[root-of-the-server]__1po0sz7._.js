module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let a=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:a,changes:n}}}class s{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let i=`
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
`,o=null,l=null,d=0;async function u(){return o||(o=await (0,t.default)()),o}async function c(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await u();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(i),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new s(e,a)}e.s(["getDb",0,c])},78143,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),E=e.i(70101),T=e.i(26937),h=e.i(10372),m=e.i(93695);e.i(52474);var N=e.i(220),R=e.i(89171);e.i(36701);var x=e.i(37709),x=x,f=e.i(62294);let y=new x.Anthropic,g=new Map,L=new TextEncoder;function _(e){return L.encode(`data: ${JSON.stringify(e)}

`)}async function v(e){let t;try{t=await e.json()}catch{return R.NextResponse.json({error:"Corps de requête invalide"},{status:400})}let r=t?.url;if(!r)return R.NextResponse.json({error:"URL requise"},{status:400});let a=function(e){try{let t=new URL(e.trim());return t.hash="",t.toString().replace(/\/$/,"").toLowerCase()}catch{return e.trim().toLowerCase()}}(r);function n(e){return new Response(new ReadableStream({start(t){t.enqueue(_(e)),t.close()}}),{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache","X-Accel-Buffering":"no"}})}if(g.has(a))return n({...g.get(a),url:r,_cached:!0,done:!0});try{let e=(await (0,f.getDb)()).prepare("SELECT * FROM jobs WHERE url = ? LIMIT 1").get(r);if(e){let t={title:e.title,company:e.company,location:e.location,remote:e.remote,start_date:e.start_date,salary:e.salary,contract_type:e.contract_type,summary:e.summary,contact_name:e.contact_name,contact_email:e.contact_email,contact_linkedin:e.contact_linkedin};return g.set(a,t),n({...t,url:r,_cached:!0,done:!0})}}catch(e){console.error("[analyze] db lookup error (non-blocking):",e)}let s=new ReadableStream({async start(e){try{e.enqueue(_({status:"fetching"}));let t="";try{let e=await fetch(r,{headers:{"User-Agent":"Mozilla/5.0 (compatible; JobSearchBot/1.0)"},signal:AbortSignal.timeout(1e4)});t=(t=await e.text()).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,12e3)}catch{e.enqueue(_({error:"Impossible de lire cette URL",done:!0})),e.close();return}e.enqueue(_({status:"analyzing"}));let n=y.messages.stream({model:"claude-sonnet-4-6",max_tokens:1024,messages:[{role:"user",content:`Tu analyses une offre d'emploi pour un outil de suivi de candidatures. Extrais les informations suivantes du contenu de la page et r\xe9ponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication.

Note: si le lieu n'est pas explicite dans le contenu, cherche des indices dans le slug de l'URL (ex: "paris", "lyon", "bordeaux", "pierre-benite" dans l'URL indique Pierre-B\xe9nite pr\xe8s de Lyon).

URL: ${r}
Contenu de la page: ${t}

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
}`}]}),s=0;n.on("text",()=>{if(++s%5==1)try{e.enqueue(_({status:"thinking",tick:s}))}catch{}});let i=await n.finalMessage(),o="text"===i.content[0].type?i.content[0].text:"",l=o.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim(),d=l.match(/\{[\s\S]*\}/);try{let t=JSON.parse(d?d[0]:l);g.set(a,t),e.enqueue(_({...t,url:r,done:!0}))}catch{e.enqueue(_({error:"Erreur parsing IA",raw:o,done:!0}))}}catch(t){console.error("[POST /api/analyze] error:",t),e.enqueue(_({error:"Erreur serveur lors de l'analyse",done:!0}))}finally{e.close()}}});return new Response(s,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache","X-Accel-Buffering":"no"}})}e.s(["POST",0,v],23892);var A=e.i(23892);let b=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/analyze/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:w,workUnitAsyncStorage:O,serverHooks:U}=b;async function C(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),b.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/analyze/route";R=R.replace(/\/index$/,"")||"/";let x=await b.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,deploymentId:y,params:g,nextConfig:L,parsedUrl:_,isDraftMode:v,prerenderManifest:A,routerServerContext:w,isOnDemandRevalidate:O,revalidateOnlyGenerated:U,resolvedPathname:C,clientReferenceManifest:I,serverActionsManifest:S}=x,D=(0,o.normalizeAppPath)(R),q=!!(A.dynamicRoutes[D]||A.routes[C]),X=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,_,!1):t.end("This page could not be found"),null);if(q&&!v){let e=!!A.routes[C],t=A.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await X();throw new m.NoFallbackError}}let P=null;!q||b.isDev||v||(P="/index"===(P=C)?"/":P);let j=!0===b.isDev||!q,F=q&&!j;S&&I&&(0,i.setManifestsSingleton)({page:R,clientReferenceManifest:I,serverActionsManifest:S});let k=e.method||"GET",M=(0,s.getTracer)(),B=M.getActiveScopeSpan(),G=!!(null==w?void 0:w.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await b.getIncrementalCache(e,L,A,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let $={params:g,previewProps:A.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:j,incrementalCache:K,cacheLifeProfiles:L.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>b.onRequestError(e,t,a,n,w)},sharedContext:{buildId:f,deploymentId:y}},Y=new l.NodeNextRequest(e),z=new l.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>b.handle(W,$).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${k} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${k} ${R}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!H&&O&&U&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=$.renderOpts.fetchMetrics;let o=$.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=$.renderOpts.collectedTags;if(!q)return await (0,p.sendResponse)(Y,z,s,$.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,a=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:$.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:O})},!1,w),t}},d=await b.handleResponse({req:e,nextConfig:L,cacheKey:P,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:U,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!q)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",O?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,E.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&q||u.delete(h.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(Y,z,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};G&&B?await o(B):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${R}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof m.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:O})},!1,w),q)throw t;return await (0,p.sendResponse)(Y,z,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:O})},"routeModule",0,b,"serverHooks",0,U,"workAsyncStorage",0,w,"workUnitAsyncStorage",0,O],78143)},6714,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_fs_1t1l-4-._.js"].map(t=>e.l(t))).then(()=>t(2157)))},11105,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_path_1pmhwj3._.js"].map(t=>e.l(t))).then(()=>t(50227)))},46735,e=>{e.v(t=>Promise.all(["server/chunks/[externals]__1j5vgk-._.js","server/chunks/[root-of-the-server]__1fbyaci._.js"].map(t=>e.l(t))).then(()=>t(83085)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1po0sz7._.js.map