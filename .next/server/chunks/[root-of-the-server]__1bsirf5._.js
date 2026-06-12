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
`,o=null,l=null,d=0;async function E(){return o||(o=await (0,t.default)()),o}async function T(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await E();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(s),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new i(e,a)}e.s(["getDb",0,T])},24868,(e,t,r)=>{t.exports=e.x("fs/promises",()=>require("fs/promises"))},84668,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),E=e.i(95169),T=e.i(47587),u=e.i(66012),c=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var f=e.i(220),h=e.i(89171),L=e.i(62294),A=e.i(24868),m=e.i(14747);async function v(e){let t=await (0,L.getDb)(),{searchParams:r}=new URL(e.url),a=r.get("category_id"),n=a?t.prepare("SELECT * FROM cvs WHERE category_id = ? ORDER BY is_default DESC, created_at DESC").all(a):t.prepare("SELECT * FROM cvs ORDER BY category_id, is_default DESC, created_at DESC").all();return h.NextResponse.json(n)}async function g(e){let t=await (0,L.getDb)(),r=await e.formData(),a=r.get("file"),n=r.get("category_id"),i=r.get("version")||"v1",s=r.get("notes")||"",o="true"===r.get("is_default");if(!a||!n)return h.NextResponse.json({error:"Fichier et catégorie requis"},{status:400});let l=m.default.join(process.cwd(),"uploads");await (0,A.mkdir)(l,{recursive:!0});let d=m.default.extname(a.name),E=`cv_${Date.now()}${d}`,T=m.default.join(l,E),u=await a.arrayBuffer();await (0,A.writeFile)(T,Buffer.from(u)),o&&t.prepare("UPDATE cvs SET is_default = 0 WHERE category_id = ?").run(n);let c=t.prepare(`
    INSERT INTO cvs (category_id, filename, original_name, version, notes, is_default)
    VALUES (@category_id, @filename, @original_name, @version, @notes, @is_default)
  `).run({category_id:parseInt(n),filename:E,original_name:a.name,version:i,notes:s,is_default:+!!o});return h.NextResponse.json(t.prepare("SELECT * FROM cvs WHERE id = ?").get(c.lastInsertRowid),{status:201})}e.s(["GET",0,v,"POST",0,g],73720);var x=e.i(73720);let _=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/cvs/route",pathname:"/api/cvs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cvs/route.ts",nextConfigOutput:"",userland:x,...{}}),{workAsyncStorage:O,workUnitAsyncStorage:w,serverHooks:U}=_;async function y(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),_.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let h="/api/cvs/route";h=h.replace(/\/index$/,"")||"/";let L=await _.prepare(e,t,{srcPage:h,multiZoneDraftMode:!1});if(!L)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:A,deploymentId:m,params:v,nextConfig:g,parsedUrl:x,isDraftMode:O,prerenderManifest:w,routerServerContext:U,isOnDemandRevalidate:y,revalidateOnlyGenerated:b,resolvedPathname:C,clientReferenceManifest:I,serverActionsManifest:D}=L,S=(0,o.normalizeAppPath)(h),X=!!(w.dynamicRoutes[S]||w.routes[C]),F=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,x,!1):t.end("This page could not be found"),null);if(X&&!O){let e=!!w.routes[C],t=w.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await F();throw new R.NoFallbackError}}let q=null;!X||_.isDev||O||(q="/index"===(q=C)?"/":q);let P=!0===_.isDev||!X,j=X&&!P;D&&I&&(0,s.setManifestsSingleton)({page:h,clientReferenceManifest:I,serverActionsManifest:D});let M=e.method||"GET",k=(0,i.getTracer)(),B=k.getActiveScopeSpan(),H=!!(null==U?void 0:U.isWrappedByNextServer),G=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await _.getIncrementalCache(e,g,w,G);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:v,previewProps:w.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:P,incrementalCache:K,cacheLifeProfiles:g.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>_.onRequestError(e,t,a,n,U)},sharedContext:{buildId:A,deploymentId:m}},$=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>_.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${M} ${h}`)}),o=async n=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!G&&y&&b&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!X)return await (0,u.sendResponse)($,W,i,Y.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await _.onRequestError(e,t,{routerKind:"App Router",routePath:h,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,U),t}},d=await _.handleResponse({req:e,nextConfig:g,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:b,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:G});if(!X)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});G||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,c.fromNodeOutgoingHttpHeaders)(d.value.headers);return G&&X||E.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)($,W,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};H&&B?await o(B):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(E.BaseServerSpan.handleRequest,{spanName:`${M} ${h}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await _.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,U),X)throw t;return await (0,u.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,y,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:w})},"routeModule",0,_,"serverHooks",0,U,"workAsyncStorage",0,O,"workUnitAsyncStorage",0,w],84668)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1bsirf5._.js.map