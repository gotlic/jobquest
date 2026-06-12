module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let a=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:a,changes:n}}}class i{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let s=`
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
`,o=null,l=null,d=0;async function E(){return o||(o=await (0,t.default)()),o}async function T(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await E();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(s),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new i(e,a)}e.s(["getDb",0,T])},95783,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),E=e.i(95169),T=e.i(47587),u=e.i(66012),c=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var h=e.i(220),L=e.i(89171),A=e.i(62294);async function f(e,{params:t}){let{id:r}=await t,a=await (0,A.getDb)(),n=await e.json(),i=Object.keys(n).map(e=>`${e} = @${e}`).join(", ");return a.prepare(`UPDATE cover_letters SET ${i}, updated_at = datetime('now') WHERE id = @id`).run({...n,id:r}),L.NextResponse.json(a.prepare("SELECT * FROM cover_letters WHERE id = ?").get(r))}async function x(e,{params:t}){let{id:r}=await t;return(await (0,A.getDb)()).prepare("DELETE FROM cover_letters WHERE id = ?").run(r),L.NextResponse.json({ok:!0})}e.s(["DELETE",0,x,"PATCH",0,f],54748);var v=e.i(54748);let m=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/cover-letters/[id]/route",pathname:"/api/cover-letters/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cover-letters/[id]/route.ts",nextConfigOutput:"",userland:v,...{}}),{workAsyncStorage:O,workUnitAsyncStorage:U,serverHooks:b}=m;async function w(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),m.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let L="/api/cover-letters/[id]/route";L=L.replace(/\/index$/,"")||"/";let A=await m.prepare(e,t,{srcPage:L,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,deploymentId:x,params:v,nextConfig:O,parsedUrl:U,isDraftMode:b,prerenderManifest:w,routerServerContext:g,isOnDemandRevalidate:y,revalidateOnlyGenerated:_,resolvedPathname:C,clientReferenceManifest:I,serverActionsManifest:D}=A,X=(0,o.normalizeAppPath)(L),S=!!(w.dynamicRoutes[X]||w.routes[C]),F=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,U,!1):t.end("This page could not be found"),null);if(S&&!b){let e=!!w.routes[C],t=w.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(O.adapterPath)return await F();throw new R.NoFallbackError}}let q=null;!S||m.isDev||b||(q="/index"===(q=C)?"/":q);let P=!0===m.isDev||!S,j=S&&!P;D&&I&&(0,s.setManifestsSingleton)({page:L,clientReferenceManifest:I,serverActionsManifest:D});let M=e.method||"GET",k=(0,i.getTracer)(),H=k.getActiveScopeSpan(),G=!!(null==g?void 0:g.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await m.getIncrementalCache(e,O,w,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:v,previewProps:w.preview,renderOpts:{experimental:{authInterrupts:!!O.experimental.authInterrupts},cacheComponents:!!O.cacheComponents,supportsDynamicResponse:P,incrementalCache:K,cacheLifeProfiles:O.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>m.onRequestError(e,t,a,n,g)},sharedContext:{buildId:f,deploymentId:x}},$=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>m.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${M} ${L}`)}),o=async n=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!B&&y&&_&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!S)return await (0,u.sendResponse)($,W,i,Y.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:L,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,g),t}},d=await m.handleResponse({req:e,nextConfig:O,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:_,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!S)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,c.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&S||E.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)($,W,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};G&&H?await o(H):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(E.BaseServerSpan.handleRequest,{spanName:`${M} ${L}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof R.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,g),S)throw t;return await (0,u.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,w,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:U})},"routeModule",0,m,"serverHooks",0,b,"workAsyncStorage",0,O,"workUnitAsyncStorage",0,U],95783)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1tqcipd._.js.map