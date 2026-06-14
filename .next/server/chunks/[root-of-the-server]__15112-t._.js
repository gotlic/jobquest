module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),s=e.i(54799);let i=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function n(e){return(0,s.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,s.createHmac)("sha256",i).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,n],68105);let T=r.default.join(process.cwd(),"jobsearch.db");class o{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,s=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:s}}}class E{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new o(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let l=`
  CREATE TABLE IF NOT EXISTS migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    serpapi_key TEXT NOT NULL DEFAULT '',
    ft_client_id TEXT NOT NULL DEFAULT '',
    ft_client_secret TEXT NOT NULL DEFAULT '',
    settings TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
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
    space_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'violet',
    icon TEXT NOT NULL DEFAULT '📄',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
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
    space_id INTEGER NOT NULL DEFAULT 1,
    kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
    value TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (space_id, kind, value)
  );

  CREATE TABLE IF NOT EXISTS cover_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
    category_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE SET NULL
  );
`;function d(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let s=r[0].columns.indexOf("name");return r[0].values.some(e=>e[s]===a)}catch{return!1}}function c(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let p=null,u=null,N=0;async function L(){return p||(p=await (0,t.default)()),p}async function R(){let e,t=0;try{t=a.default.statSync(T).mtimeMs}catch{}if(u&&t===N)return u;let r=await L();if(a.default.existsSync(T)){let t=a.default.readFileSync(T);e=new r.Database(t)}else e=new r.Database;return e.exec(l),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let a=e.exec("SELECT name FROM migrations");a[0]?.values.forEach(e=>t.add(e[0]))}catch{}let a=c(e,"feed_blocklist"),r=c(e,"feed_blocklist_new");if(!a&&r)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(c(e,"spaces")||e.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(c(e,t)&&!d(e,t,"space_id"))try{e.exec(`ALTER TABLE ${t} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}c(e,"feed_blocklist")&&!d(e,"feed_blocklist","space_id")&&(c(e,"feed_blocklist_new")&&e.exec("DROP TABLE feed_blocklist_new"),e.exec(`CREATE TABLE feed_blocklist_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id INTEGER NOT NULL DEFAULT 1,
        kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
        value TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (space_id, kind, value)
      )`),e.exec(`INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=n("lic12@"),a=n("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${a}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),a.default.writeFileSync(T,Buffer.from(e.export())),N=a.default.statSync(T).mtimeMs,u=new E(e,T)}e.s(["getDb",0,R],62294)},25045,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),s=e.i(59756),i=e.i(61916),n=e.i(74677),T=e.i(69741),o=e.i(16795),E=e.i(87718),l=e.i(95169),d=e.i(47587),c=e.i(66012),p=e.i(70101),u=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(20232);var R=e.i(220),A=e.i(89171),U=e.i(62294);async function _(e,{params:t}){let{id:a}=await t,r=parseInt(a,10);if(!r)return A.NextResponse.json({error:"ID invalide"},{status:400});let s=await (0,U.getDb)(),i=parseInt(e.headers.get("x-space-id")??"1",10)||1;return s.prepare("SELECT id FROM cv_categories WHERE id = ? AND space_id = ?").get(r,i)?(s.prepare("DELETE FROM cv_categories WHERE id = ? AND space_id = ?").run(r,i),A.NextResponse.json({ok:!0})):A.NextResponse.json({error:"Profil introuvable"},{status:404})}e.s(["DELETE",0,_],70438);var O=e.i(70438);let h=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/cv-categories/[id]/route",pathname:"/api/cv-categories/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cv-categories/[id]/route.ts",nextConfigOutput:"",userland:O,...{}}),{workAsyncStorage:f,workUnitAsyncStorage:I,serverHooks:m}=h;async function x(e,t,r){r.requestMeta&&(0,s.setRequestMeta)(e,r.requestMeta),h.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/cv-categories/[id]/route";A=A.replace(/\/index$/,"")||"/";let U=await h.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!U)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:_,deploymentId:O,params:f,nextConfig:I,parsedUrl:m,isDraftMode:x,prerenderManifest:v,routerServerContext:b,isOnDemandRevalidate:g,revalidateOnlyGenerated:w,resolvedPathname:D,clientReferenceManifest:X,serverActionsManifest:C}=U,y=(0,T.normalizeAppPath)(A),S=!!(v.dynamicRoutes[y]||v.routes[D]),F=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,m,!1):t.end("This page could not be found"),null);if(S&&!x){let e=!!v.routes[D],t=v.dynamicRoutes[y];if(t&&!1===t.fallback&&!e){if(I.adapterPath)return await F();throw new L.NoFallbackError}}let k=null;!S||h.isDev||x||(k="/index"===(k=D)?"/":k);let P=!0===h.isDev||!S,q=S&&!P;C&&X&&(0,n.setManifestsSingleton)({page:A,clientReferenceManifest:X,serverActionsManifest:C});let M=e.method||"GET",j=(0,i.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==b?void 0:b.isWrappedByNextServer),K=!!(0,s.getRequestMeta)(e,"minimalMode"),H=(0,s.getRequestMeta)(e,"incrementalCache")||await h.getIncrementalCache(e,I,v,K);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let Y={params:f,previewProps:v.preview,renderOpts:{experimental:{authInterrupts:!!I.experimental.authInterrupts},cacheComponents:!!I.cacheComponents,supportsDynamicResponse:P,incrementalCache:H,cacheLifeProfiles:I.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>h.onRequestError(e,t,r,s,b)},sharedContext:{buildId:_,deploymentId:O}},$=new o.NodeNextRequest(e),W=new o.NodeNextResponse(t),V=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let s,n=async e=>h.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${M} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",r),s.updateName(t))}else e.updateName(`${M} ${A}`)}),T=async s=>{var i,T;let o=async({previousCacheEntry:a})=>{try{if(!K&&g&&w&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await n(s);e.fetchMetrics=Y.renderOpts.fetchMetrics;let T=Y.renderOpts.pendingWaitUntil;T&&r.waitUntil&&(r.waitUntil(T),T=void 0);let o=Y.renderOpts.collectedTags;if(!S)return await (0,c.sendResponse)($,W,i,Y.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(i.headers);o&&(t[N.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await h.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,b),t}},E=await h.handleResponse({req:e,nextConfig:I,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:v,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:w,responseGenerator:o,waitUntil:r.waitUntil,isMinimalMode:K});if(!S)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",g?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,p.fromNodeOutgoingHttpHeaders)(E.value.headers);return K&&S||l.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,u.getCacheControlHeader)(E.cacheControl)),await (0,c.sendResponse)($,W,new Response(E.value.body,{headers:l,status:E.value.status||200})),null};B&&G?await T(G):(s=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(l.BaseServerSpan.handleRequest,{spanName:`${M} ${A}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},T),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await h.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,b),S)throw t;return await (0,c.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,x,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:I})},"routeModule",0,h,"serverHooks",0,m,"workAsyncStorage",0,f,"workUnitAsyncStorage",0,I],25045)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__15112-t._.js.map