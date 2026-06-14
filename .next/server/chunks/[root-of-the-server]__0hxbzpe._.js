module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),s=e.i(54799);let n=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function i(e){return(0,s.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,s.createHmac)("sha256",n).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,i],68105);let o=r.default.join(process.cwd(),"jobsearch.db");class T{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,s=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:s}}}class E{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new T(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let l=`
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
`;function d(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let s=r[0].columns.indexOf("name");return r[0].values.some(e=>e[s]===a)}catch{return!1}}function c(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let u=null,p=null,N=0;async function L(){return u||(u=await (0,t.default)()),u}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(p&&t===N)return p;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;return e.exec(l),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let a=e.exec("SELECT name FROM migrations");a[0]?.values.forEach(e=>t.add(e[0]))}catch{}let a=c(e,"feed_blocklist"),r=c(e,"feed_blocklist_new");if(!a&&r)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(c(e,"spaces")||e.exec(`CREATE TABLE spaces (
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
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=i("lic12@"),a=i("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${a}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,p=new E(e,o)}e.s(["getDb",0,R],62294)},12919,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),s=e.i(59756),n=e.i(61916),i=e.i(74677),o=e.i(69741),T=e.i(16795),E=e.i(87718),l=e.i(95169),d=e.i(47587),c=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(20232);var R=e.i(220),A=e.i(89171),O=e.i(68105),h=e.i(62294);async function U(e){try{let{slug:t,password:a}=await e.json();if(!t||!a)return A.NextResponse.json({error:"Espace et mot de passe requis"},{status:400});let r=(await (0,h.getDb)()).prepare("SELECT * FROM spaces WHERE slug = ?").get(t);if(!r||r.password_hash!==(0,O.hashPassword)(a))return A.NextResponse.json({error:"Espace ou mot de passe incorrect"},{status:401});let s=(0,O.createSpaceToken)(r.id),n=A.NextResponse.json({ok:!0,space:{id:r.id,name:r.name,slug:r.slug}});return n.cookies.set(O.SPACE_COOKIE,s,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:31536e3}),n}catch(e){return console.error("[POST /api/auth]",e),A.NextResponse.json({error:"Erreur serveur"},{status:500})}}async function _(){let e=A.NextResponse.json({ok:!0});return e.cookies.delete(O.SPACE_COOKIE),e}e.s(["DELETE",0,_,"POST",0,U],59182);var f=e.i(59182);let m=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/route",pathname:"/api/auth",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/auth/route.ts",nextConfigOutput:"",userland:f,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:I,serverHooks:b}=m;async function v(e,t,r){r.requestMeta&&(0,s.setRequestMeta)(e,r.requestMeta),m.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/auth/route";A=A.replace(/\/index$/,"")||"/";let O=await m.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!O)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:h,deploymentId:U,params:_,nextConfig:f,parsedUrl:x,isDraftMode:I,prerenderManifest:b,routerServerContext:v,isOnDemandRevalidate:w,revalidateOnlyGenerated:g,resolvedPathname:C,clientReferenceManifest:X,serverActionsManifest:D}=O,S=(0,o.normalizeAppPath)(A),y=!!(b.dynamicRoutes[S]||b.routes[C]),F=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,x,!1):t.end("This page could not be found"),null);if(y&&!I){let e=!!b.routes[C],t=b.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await F();throw new L.NoFallbackError}}let k=null;!y||m.isDev||I||(k="/index"===(k=C)?"/":k);let P=!0===m.isDev||!y,q=y&&!P;D&&X&&(0,i.setManifestsSingleton)({page:A,clientReferenceManifest:X,serverActionsManifest:D});let M=e.method||"GET",j=(0,n.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==v?void 0:v.isWrappedByNextServer),K=!!(0,s.getRequestMeta)(e,"minimalMode"),Y=(0,s.getRequestMeta)(e,"incrementalCache")||await m.getIncrementalCache(e,f,b,K);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let H={params:_,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:P,incrementalCache:Y,cacheLifeProfiles:f.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>m.onRequestError(e,t,r,s,v)},sharedContext:{buildId:h,deploymentId:U}},$=new T.NodeNextRequest(e),V=new T.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let s,i=async e=>m.handle(W,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${M} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",r),s.updateName(t))}else e.updateName(`${M} ${A}`)}),o=async s=>{var n,o;let T=async({previousCacheEntry:a})=>{try{if(!K&&w&&g&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(s);e.fetchMetrics=H.renderOpts.fetchMetrics;let o=H.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=H.renderOpts.collectedTags;if(!y)return await (0,c.sendResponse)($,V,n,H.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,r=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:w})},!1,v),t}},E=await m.handleResponse({req:e,nextConfig:f,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:w,revalidateOnlyGenerated:g,responseGenerator:T,waitUntil:r.waitUntil,isMinimalMode:K});if(!y)return null;if((null==E||null==(n=E.value)?void 0:n.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(o=E.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",w?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,u.fromNodeOutgoingHttpHeaders)(E.value.headers);return K&&y||l.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,p.getCacheControlHeader)(E.cacheControl)),await (0,c.sendResponse)($,V,new Response(E.value.body,{headers:l,status:E.value.status||200})),null};B&&G?await o(G):(s=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(l.BaseServerSpan.handleRequest,{spanName:`${M} ${A}`,kind:n.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:w})},!1,v),y)throw t;return await (0,c.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,v,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:I})},"routeModule",0,m,"serverHooks",0,b,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,I],12919)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0hxbzpe._.js.map