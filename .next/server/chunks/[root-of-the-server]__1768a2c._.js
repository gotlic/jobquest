module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);return t.step(),t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,changes:this.sqlDb.getRowsModified()}}}class s{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let i=`
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
`,o=null,l=null,d=0;async function c(){return o||(o=await (0,t.default)()),o}async function u(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await c();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(i),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new s(e,a)}e.s(["getDb",0,u])},49701,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),E=e.i(70101),T=e.i(26937),h=e.i(10372),N=e.i(93695);e.i(52474);var R=e.i(220),f=e.i(89171),m=e.i(62294);let L=new Set(["de","du","des","le","la","les","un","une","et","en","the","a","an","of","for","in","at","to","and","or","h","f","hf","senior","junior","stage","alternance","cdi","cdd","freelance"]);function A(e){return new Set(e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim().split(" ").filter(e=>e.length>1&&!L.has(e)))}function x(e,t){return 0===e.size&&0===t.size?1:[...e].filter(e=>t.has(e)).length/new Set([...e,...t]).size}function b(e){try{let t=new URL(e.trim());return(t.hostname+t.pathname).toLowerCase().replace(/\/$/,"")}catch{return e.toLowerCase().trim()}}async function w(e){try{let t=await (0,m.getDb)(),r=await e.json(),a={title:r.title??"",company:r.company??"",location:r.location,url:r.url},n=t.prepare("SELECT * FROM jobs WHERE status != ?").all("archived").map(e=>({title:e.title??"",company:e.company??"",location:e.location,url:e.url,...e})).map(e=>({job:e,...function(e,t){if(e.url&&t.url){let r=b(e.url),a=b(t.url);if(r===a)return{isDuplicate:!0,score:1,reason:"url"};try{let n=new URL(e.url).hostname,s=new URL(t.url).hostname;if(n===s){let e=x(A(r),A(a));if(e>=.8)return{isDuplicate:!0,score:e,reason:"url"}}}catch{}}let r=A(e.company),a=x(r,A(t.company));if(a<.5)return{isDuplicate:!1,score:0,reason:"content"};let n=A(e.title),s=x(n,A(t.title)),i=0;e.location&&t.location&&(i=.15*x(A(e.location),A(t.location)));let o=Math.min(1,.4*a+.6*s+i);return{isDuplicate:o>=.55,score:o,reason:"content"}}(a,e)})).filter(e=>e.isDuplicate).sort((e,t)=>t.score-e.score)[0];if(n)return f.NextResponse.json({duplicate:n.job,score:Math.round(100*n.score),reason:n.reason},{status:409});return f.NextResponse.json({ok:!0})}catch(e){return console.error("[check-duplicate] error:",e),f.NextResponse.json({ok:!0})}}e.s(["POST",0,w],24338);var g=e.i(24338);let v=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/jobs/check-duplicate/route",pathname:"/api/jobs/check-duplicate",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/jobs/check-duplicate/route.ts",nextConfigOutput:"",userland:g,...{}}),{workAsyncStorage:y,workUnitAsyncStorage:O,serverHooks:U}=v;async function C(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),v.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let f="/api/jobs/check-duplicate/route";f=f.replace(/\/index$/,"")||"/";let m=await v.prepare(e,t,{srcPage:f,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:L,deploymentId:A,params:x,nextConfig:b,parsedUrl:w,isDraftMode:g,prerenderManifest:y,routerServerContext:O,isOnDemandRevalidate:U,revalidateOnlyGenerated:C,resolvedPathname:_,clientReferenceManifest:D,serverActionsManifest:I}=m,S=(0,o.normalizeAppPath)(f),X=!!(y.dynamicRoutes[S]||y.routes[_]),j=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,w,!1):t.end("This page could not be found"),null);if(X&&!g){let e=!!y.routes[_],t=y.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(b.adapterPath)return await j();throw new N.NoFallbackError}}let q=null;!X||v.isDev||g||(q="/index"===(q=_)?"/":q);let F=!0===v.isDev||!X,P=X&&!F;I&&D&&(0,i.setManifestsSingleton)({page:f,clientReferenceManifest:D,serverActionsManifest:I});let M=e.method||"GET",k=(0,s.getTracer)(),G=k.getActiveScopeSpan(),H=!!(null==O?void 0:O.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await v.getIncrementalCache(e,b,y,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:x,previewProps:y.preview,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:F,incrementalCache:K,cacheLifeProfiles:b.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>v.onRequestError(e,t,a,n,O)},sharedContext:{buildId:L,deploymentId:A}},$=new l.NodeNextRequest(e),z=new l.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>v.handle(W,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${M} ${f}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!B&&U&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!X)return await (0,p.sendResponse)($,z,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await v.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:U})},!1,O),t}},d=await v.handleResponse({req:e,nextConfig:b,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:U,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!X)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",U?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,E.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&X||c.delete(h.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,z,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};H&&G?await o(G):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(c.BaseServerSpan.handleRequest,{spanName:`${M} ${f}`,kind:s.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof N.NoFallbackError||await v.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:U})},!1,O),X)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:O})},"routeModule",0,v,"serverHooks",0,U,"workAsyncStorage",0,y,"workUnitAsyncStorage",0,O],49701)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1768a2c._.js.map