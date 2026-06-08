module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let a=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:a,changes:n}}}class s{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let i=`
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
`,o=null,l=null,d=0;async function c(){return o||(o=await (0,t.default)()),o}async function u(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await c();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(i),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new s(e,a)}e.s(["getDb",0,u])},69243,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),E=e.i(70101),T=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var h=e.i(220),m=e.i(89171),y=e.i(62294);async function _(){try{let e=(await (0,y.getDb)()).prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();return m.NextResponse.json(e)}catch(e){return console.error("[GET /api/jobs] error:",e),m.NextResponse.json([],{status:500})}}async function b(e){try{let t=await e.json(),r=await (0,y.getDb)(),a=r.prepare(`
      INSERT INTO jobs (url, title, company, location, remote, start_date, salary, contract_type,
        summary, description, contact_name, contact_email, contact_linkedin,
        network_connection, status, added_by, priority, tags)
      VALUES (@url, @title, @company, @location, @remote, @start_date, @salary, @contract_type,
        @summary, @description, @contact_name, @contact_email, @contact_linkedin,
        @network_connection, @status, @added_by, @priority, @tags)
    `).run({url:t.url??null,title:t.title??"",company:t.company??"",location:t.location??null,remote:t.remote??null,start_date:t.start_date??null,salary:t.salary??null,contract_type:t.contract_type??null,summary:t.summary??null,description:t.description??null,contact_name:t.contact_name??null,contact_email:t.contact_email??null,contact_linkedin:t.contact_linkedin??null,network_connection:t.network_connection??null,status:t.status??"todo",added_by:t.added_by??"Équipe",priority:t.priority??"medium",tags:JSON.stringify(t.tags??[])}),n=r.prepare("SELECT * FROM jobs WHERE id = ?").get(a.lastInsertRowid);return r.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'added', ?, ?)
    `).run(a.lastInsertRowid,`Offre ajout\xe9e par ${t.added_by??"Équipe"}`,t.added_by??"Équipe"),m.NextResponse.json(n,{status:201})}catch(e){return console.error("[POST /api/jobs] error:",e),m.NextResponse.json({error:String(e)},{status:500})}}e.s(["GET",0,_,"POST",0,b],50909);var A=e.i(50909);let x=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/jobs/route",pathname:"/api/jobs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/jobs/route.ts",nextConfigOutput:"",userland:A,...{}}),{workAsyncStorage:f,workUnitAsyncStorage:L,serverHooks:g}=x;async function O(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/jobs/route";m=m.replace(/\/index$/,"")||"/";let y=await x.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,deploymentId:b,params:A,nextConfig:f,parsedUrl:L,isDraftMode:g,prerenderManifest:O,routerServerContext:w,isOnDemandRevalidate:v,revalidateOnlyGenerated:U,resolvedPathname:I,clientReferenceManifest:S,serverActionsManifest:C}=y,D=(0,o.normalizeAppPath)(m),X=!!(O.dynamicRoutes[D]||O.routes[I]),j=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,L,!1):t.end("This page could not be found"),null);if(X&&!g){let e=!!O.routes[I],t=O.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await j();throw new R.NoFallbackError}}let q=null;!X||x.isDev||g||(q="/index"===(q=I)?"/":q);let F=!0===x.isDev||!X,P=X&&!F;C&&S&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:S,serverActionsManifest:C});let k=e.method||"GET",M=(0,s.getTracer)(),G=M.getActiveScopeSpan(),B=!!(null==w?void 0:w.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,f,O,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:A,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:F,incrementalCache:K,cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>x.onRequestError(e,t,a,n,w)},sharedContext:{buildId:_,deploymentId:b}},$=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>x.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${k} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${k} ${m}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!H&&v&&U&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!X)return await (0,p.sendResponse)($,W,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:v})},!1,w),t}},d=await x.handleResponse({req:e,nextConfig:f,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:v,revalidateOnlyGenerated:U,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!X)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",v?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),g&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,E.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&X||c.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,W,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};B&&G?await o(G):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof R.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:v})},!1,w),X)throw t;return await (0,p.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,O,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:L})},"routeModule",0,x,"serverHooks",0,g,"workAsyncStorage",0,f,"workUnitAsyncStorage",0,L],69243)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__11ov-yv._.js.map