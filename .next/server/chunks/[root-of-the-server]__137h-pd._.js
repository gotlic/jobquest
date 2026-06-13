module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),n=e.i(54799);let i=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function s(e){return(0,n.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,n.createHmac)("sha256",i).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,s],68105);let o=r.default.join(process.cwd(),"jobsearch.db");class T{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:n}}}class E{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new T(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let l=`
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
`;function c(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let n=r[0].columns.indexOf("name");return r[0].values.some(e=>e[n]===a)}catch{return!1}}function d(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let p=null,u=null,N=0;async function L(){return p||(p=await (0,t.default)()),p}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(u&&t===N)return u;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;e.exec(l);var n=e;n.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let i=new Set;try{let e=n.exec("SELECT name FROM migrations");e[0]?.values.forEach(e=>i.add(e[0]))}catch{}if(!i.has("spaces_v1")){for(let e of(d(n,"spaces")||n.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(d(n,e)&&!c(n,e,"space_id"))try{n.exec(`ALTER TABLE ${e} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}d(n,"feed_blocklist")&&!c(n,"feed_blocklist","space_id")&&n.exec(`
        CREATE TABLE feed_blocklist_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          space_id INTEGER NOT NULL DEFAULT 1,
          kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
          value TEXT NOT NULL,
          label TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE (space_id, kind, value)
        );
        INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
          SELECT 1, kind, value, label, created_at FROM feed_blocklist;
        DROP TABLE feed_blocklist;
        ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist;
      `);let e=s("lic12@"),t=s("tomot123");n.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${e}')`),n.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${t}')`),n.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}return a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,u=new E(e,o)}e.s(["getDb",0,R],62294)},22030,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),T=e.i(16795),E=e.i(87718),l=e.i(95169),c=e.i(47587),d=e.i(66012),p=e.i(70101),u=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(52474);var R=e.i(220),A=e.i(89171),U=e.i(62294);function O(e){return parseInt(e.headers.get("x-space-id")??"1",10)||1}let _=[{name:"Amélioration Continue",color:"blue",icon:"⚙️"},{name:"Industrie",color:"orange",icon:"🏭"},{name:"Conception Produit",color:"violet",icon:"🎨"},{name:"Gestion de Projet",color:"green",icon:"📊"},{name:"Supply Chain",color:"amber",icon:"🔗"},{name:"Qualité",color:"red",icon:"✅"}];async function h(e){let t=await (0,U.getDb)(),a=O(e);0===t.prepare("SELECT COUNT(*) as c FROM cv_categories WHERE space_id = ?").get(a).c&&(t.prepare("INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, @name, @color, @icon)"),_.forEach(e=>{t.prepare("INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, ?, ?, ?)").run(a,e.name,e.color,e.icon)}));let r=t.prepare("SELECT * FROM cv_categories WHERE space_id = ? ORDER BY id").all(a);return A.NextResponse.json(r)}async function m(e){let t=await (0,U.getDb)(),a=await e.json(),r=O(e),n=t.prepare("INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, ?, ?, ?)").run(r,a.name,a.color??"violet",a.icon??"📄");return A.NextResponse.json(t.prepare("SELECT * FROM cv_categories WHERE id = ?").get(n.lastInsertRowid),{status:201})}e.s(["GET",0,h,"POST",0,m],97975);var f=e.i(97975);let I=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/cv-categories/route",pathname:"/api/cv-categories",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cv-categories/route.ts",nextConfigOutput:"",userland:f,...{}}),{workAsyncStorage:v,workUnitAsyncStorage:g,serverHooks:x}=I;async function b(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),I.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/cv-categories/route";A=A.replace(/\/index$/,"")||"/";let U=await I.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!U)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:O,deploymentId:_,params:h,nextConfig:m,parsedUrl:f,isDraftMode:v,prerenderManifest:g,routerServerContext:x,isOnDemandRevalidate:b,revalidateOnlyGenerated:w,resolvedPathname:C,clientReferenceManifest:S,serverActionsManifest:X}=U,D=(0,o.normalizeAppPath)(A),y=!!(g.dynamicRoutes[D]||g.routes[C]),F=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,f,!1):t.end("This page could not be found"),null);if(y&&!v){let e=!!g.routes[C],t=g.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(m.adapterPath)return await F();throw new L.NoFallbackError}}let P=null;!y||I.isDev||v||(P="/index"===(P=C)?"/":P);let q=!0===I.isDev||!y,M=y&&!q;X&&S&&(0,s.setManifestsSingleton)({page:A,clientReferenceManifest:S,serverActionsManifest:X});let k=e.method||"GET",j=(0,i.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==x?void 0:x.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await I.getIncrementalCache(e,m,g,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:h,previewProps:g.preview,renderOpts:{experimental:{authInterrupts:!!m.experimental.authInterrupts},cacheComponents:!!m.cacheComponents,supportsDynamicResponse:q,incrementalCache:K,cacheLifeProfiles:m.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>I.onRequestError(e,t,r,n,x)},sharedContext:{buildId:O,deploymentId:_}},$=new T.NodeNextRequest(e),V=new T.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let n,s=async e=>I.handle(W,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${A}`)}),o=async n=>{var i,o;let T=async({previousCacheEntry:a})=>{try{if(!H&&b&&w&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=Y.renderOpts.collectedTags;if(!y)return await (0,d.sendResponse)($,V,i,Y.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(i.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:b})},!1,x),t}},E=await I.handleResponse({req:e,nextConfig:m,cacheKey:P,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:g,isRoutePPREnabled:!1,isOnDemandRevalidate:b,revalidateOnlyGenerated:w,responseGenerator:T,waitUntil:r.waitUntil,isMinimalMode:H});if(!y)return null;if((null==E||null==(i=E.value)?void 0:i.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(o=E.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",b?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,p.fromNodeOutgoingHttpHeaders)(E.value.headers);return H&&y||l.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,u.getCacheControlHeader)(E.cacheControl)),await (0,d.sendResponse)($,V,new Response(E.value.body,{headers:l,status:E.value.status||200})),null};B&&G?await o(G):(n=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(l.BaseServerSpan.handleRequest,{spanName:`${k} ${A}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:b})},!1,x),y)throw t;return await (0,d.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,b,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:g})},"routeModule",0,I,"serverHooks",0,x,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,g],22030)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__137h-pd._.js.map