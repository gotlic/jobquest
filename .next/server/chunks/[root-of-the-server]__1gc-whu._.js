module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),n=e.i(54799);let s=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function i(e){return(0,n.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,n.createHmac)("sha256",s).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,i],68105);let o=r.default.join(process.cwd(),"jobsearch.db");class T{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:n}}}class l{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new T(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let E=`
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
`;function d(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let n=r[0].columns.indexOf("name");return r[0].values.some(e=>e[n]===a)}catch{return!1}}function c(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let u=null,p=null,N=0;async function L(){return u||(u=await (0,t.default)()),u}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(p&&t===N)return p;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;e.exec(E);var n=e;n.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let s=new Set;try{let e=n.exec("SELECT name FROM migrations");e[0]?.values.forEach(e=>s.add(e[0]))}catch{}if(!s.has("spaces_v1")){for(let e of(c(n,"spaces")||n.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(c(n,e)&&!d(n,e,"space_id"))try{n.exec(`ALTER TABLE ${e} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}c(n,"feed_blocklist")&&!d(n,"feed_blocklist","space_id")&&n.exec(`
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
      `);let e=i("lic12@"),t=i("tomot123");n.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${e}')`),n.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${t}')`),n.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}return a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,p=new l(e,o)}e.s(["getDb",0,R],62294)},69243,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),T=e.i(16795),l=e.i(87718),E=e.i(95169),d=e.i(47587),c=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(52474);var R=e.i(220),_=e.i(89171),A=e.i(62294);function O(e){return parseInt(e.headers.get("x-space-id")??"1",10)||1}async function U(e){try{let t=await (0,A.getDb)(),a=O(e),r=t.prepare("SELECT * FROM jobs WHERE space_id = ? ORDER BY created_at DESC").all(a);return _.NextResponse.json(r)}catch(e){return console.error("[GET /api/jobs] error:",e),_.NextResponse.json([],{status:500})}}async function m(e){try{let t=await e.json(),a=await (0,A.getDb)(),r=O(e),n=a.prepare(`
      INSERT INTO jobs (space_id, url, title, company, location, remote, start_date, salary, contract_type,
        summary, description, contact_name, contact_email, contact_linkedin,
        network_connection, status, added_by, priority, tags)
      VALUES (@space_id, @url, @title, @company, @location, @remote, @start_date, @salary, @contract_type,
        @summary, @description, @contact_name, @contact_email, @contact_linkedin,
        @network_connection, @status, @added_by, @priority, @tags)
    `).run({space_id:r,url:t.url??null,title:t.title??"",company:t.company??"",location:t.location??null,remote:t.remote??null,start_date:t.start_date??null,salary:t.salary??null,contract_type:t.contract_type??null,summary:t.summary??null,description:t.description??null,contact_name:t.contact_name??null,contact_email:t.contact_email??null,contact_linkedin:t.contact_linkedin??null,network_connection:t.network_connection??null,status:t.status??"todo",added_by:t.added_by??"Équipe",priority:t.priority??"medium",tags:JSON.stringify(t.tags??[])}),s=a.prepare("SELECT * FROM jobs WHERE id = ?").get(n.lastInsertRowid);return a.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'added', ?, ?)
    `).run(n.lastInsertRowid,`Offre ajout\xe9e par ${t.added_by??"Équipe"}`,t.added_by??"Équipe"),_.NextResponse.json(s,{status:201})}catch(e){return console.error("[POST /api/jobs] error:",e),_.NextResponse.json({error:String(e)},{status:500})}}e.s(["GET",0,U,"POST",0,m],50909);var h=e.i(50909);let f=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/jobs/route",pathname:"/api/jobs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/jobs/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:I,workUnitAsyncStorage:y,serverHooks:b}=f;async function x(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),f.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let _="/api/jobs/route";_=_.replace(/\/index$/,"")||"/";let A=await f.prepare(e,t,{srcPage:_,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:O,deploymentId:U,params:m,nextConfig:h,parsedUrl:I,isDraftMode:y,prerenderManifest:b,routerServerContext:x,isOnDemandRevalidate:g,revalidateOnlyGenerated:v,resolvedPathname:w,clientReferenceManifest:S,serverActionsManifest:X}=A,D=(0,o.normalizeAppPath)(_),C=!!(b.dynamicRoutes[D]||b.routes[w]),F=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,I,!1):t.end("This page could not be found"),null);if(C&&!y){let e=!!b.routes[w],t=b.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(h.adapterPath)return await F();throw new L.NoFallbackError}}let k=null;!C||f.isDev||y||(k="/index"===(k=w)?"/":k);let j=!0===f.isDev||!C,q=C&&!j;X&&S&&(0,i.setManifestsSingleton)({page:_,clientReferenceManifest:S,serverActionsManifest:X});let P=e.method||"GET",M=(0,s.getTracer)(),G=M.getActiveScopeSpan(),B=!!(null==x?void 0:x.isWrappedByNextServer),K=!!(0,n.getRequestMeta)(e,"minimalMode"),Y=(0,n.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,h,b,K);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let H={params:m,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!h.experimental.authInterrupts},cacheComponents:!!h.cacheComponents,supportsDynamicResponse:j,incrementalCache:Y,cacheLifeProfiles:h.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>f.onRequestError(e,t,r,n,x)},sharedContext:{buildId:O,deploymentId:U}},$=new T.NodeNextRequest(e),V=new T.NodeNextResponse(t),W=l.NextRequestAdapter.fromNodeNextRequest($,(0,l.signalFromNodeResponse)(t));try{let n,i=async e=>f.handle(W,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=M.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==E.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${P} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${P} ${_}`)}),o=async n=>{var s,o;let T=async({previousCacheEntry:a})=>{try{if(!K&&g&&v&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=H.renderOpts.fetchMetrics;let o=H.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=H.renderOpts.collectedTags;if(!C)return await (0,c.sendResponse)($,V,s,H.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(s.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,r=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,x),t}},l=await f.handleResponse({req:e,nextConfig:h,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:v,responseGenerator:T,waitUntil:r.waitUntil,isMinimalMode:K});if(!C)return null;if((null==l||null==(s=l.value)?void 0:s.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(o=l.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",g?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,u.fromNodeOutgoingHttpHeaders)(l.value.headers);return K&&C||E.delete(N.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,p.getCacheControlHeader)(l.cacheControl)),await (0,c.sendResponse)($,V,new Response(l.value.body,{headers:E,status:l.value.status||200})),null};B&&G?await o(G):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(E.BaseServerSpan.handleRequest,{spanName:`${P} ${_}`,kind:s.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,x),C)throw t;return await (0,c.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,x,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:y})},"routeModule",0,f,"serverHooks",0,b,"workAsyncStorage",0,I,"workUnitAsyncStorage",0,y],69243)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1gc-whu._.js.map