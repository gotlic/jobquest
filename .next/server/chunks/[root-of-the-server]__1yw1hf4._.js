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

  CREATE TABLE IF NOT EXISTS feed_blocklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
    value TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (kind, value)
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
`,o=null,l=null,d=0;async function E(){return o||(o=await (0,t.default)()),o}async function T(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await E();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(i),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new s(e,a)}e.s(["getDb",0,T])},83995,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),E=e.i(95169),T=e.i(47587),u=e.i(66012),c=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var h=e.i(220),L=e.i(89171),f=e.i(62294);async function A(){try{let e=(await (0,f.getDb)()).prepare("SELECT * FROM feed_blocklist ORDER BY created_at DESC").all();return L.NextResponse.json(e)}catch(e){return console.error("[blocklist GET]",e),L.NextResponse.json([],{status:500})}}async function x(e){try{let t=await e.json(),r=t?.kind,a=String(t?.label??"").trim();if("company"!==r&&"offer"!==r||!a)return L.NextResponse.json({error:"kind (company|offer) et label requis"},{status:400});let n=String(t?.value??a).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"");if(!n)return L.NextResponse.json({error:"Valeur vide"},{status:400});return(await (0,f.getDb)()).prepare("INSERT OR IGNORE INTO feed_blocklist (kind, value, label) VALUES (?, ?, ?)").run(r,n,a),L.NextResponse.json({ok:!0})}catch(e){return console.error("[blocklist POST]",e),L.NextResponse.json({error:"Erreur serveur"},{status:500})}}async function b(e){try{let t=await e.json(),r=t?.id;if(!r)return L.NextResponse.json({error:"id requis"},{status:400});return(await (0,f.getDb)()).prepare("DELETE FROM feed_blocklist WHERE id = ?").run(r),L.NextResponse.json({ok:!0})}catch(e){return console.error("[blocklist DELETE]",e),L.NextResponse.json({error:"Erreur serveur"},{status:500})}}e.s(["DELETE",0,b,"GET",0,A,"POST",0,x],43031);var m=e.i(43031);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/blocklist/route",pathname:"/api/blocklist",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/blocklist/route.ts",nextConfigOutput:"",userland:m,...{}}),{workAsyncStorage:v,workUnitAsyncStorage:U,serverHooks:g}=O;async function w(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let L="/api/blocklist/route";L=L.replace(/\/index$/,"")||"/";let f=await O.prepare(e,t,{srcPage:L,multiZoneDraftMode:!1});if(!f)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:A,deploymentId:x,params:b,nextConfig:m,parsedUrl:v,isDraftMode:U,prerenderManifest:g,routerServerContext:w,isOnDemandRevalidate:y,revalidateOnlyGenerated:I,resolvedPathname:_,clientReferenceManifest:C,serverActionsManifest:D}=f,S=(0,o.normalizeAppPath)(L),X=!!(g.dynamicRoutes[S]||g.routes[_]),F=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,v,!1):t.end("This page could not be found"),null);if(X&&!U){let e=!!g.routes[_],t=g.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(m.adapterPath)return await F();throw new R.NoFallbackError}}let q=null;!X||O.isDev||U||(q="/index"===(q=_)?"/":q);let j=!0===O.isDev||!X,k=X&&!j;D&&C&&(0,i.setManifestsSingleton)({page:L,clientReferenceManifest:C,serverActionsManifest:D});let P=e.method||"GET",M=(0,s.getTracer)(),G=M.getActiveScopeSpan(),B=!!(null==w?void 0:w.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,m,g,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:b,previewProps:g.preview,renderOpts:{experimental:{authInterrupts:!!m.experimental.authInterrupts},cacheComponents:!!m.cacheComponents,supportsDynamicResponse:j,incrementalCache:K,cacheLifeProfiles:m.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>O.onRequestError(e,t,a,n,w)},sharedContext:{buildId:A,deploymentId:x}},$=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>O.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${P} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${P} ${L}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!H&&y&&I&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!X)return await (0,u.sendResponse)($,W,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:L,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:y})},!1,w),t}},d=await O.handleResponse({req:e,nextConfig:m,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:g,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:I,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!X)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,c.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&X||E.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)($,W,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};B&&G?await o(G):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(E.BaseServerSpan.handleRequest,{spanName:`${P} ${L}`,kind:s.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof R.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:y})},!1,w),X)throw t;return await (0,u.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,w,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:U})},"routeModule",0,O,"serverHooks",0,g,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,U],83995)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1yw1hf4._.js.map