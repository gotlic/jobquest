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
`;function d(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let s=r[0].columns.indexOf("name");return r[0].values.some(e=>e[s]===a)}catch{return!1}}function c(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let p=null,u=null,N=0;async function L(){return p||(p=await (0,t.default)()),p}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(u&&t===N)return u;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;return e.exec(l),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let a=e.exec("SELECT name FROM migrations");a[0]?.values.forEach(e=>t.add(e[0]))}catch{}let a=c(e,"feed_blocklist"),r=c(e,"feed_blocklist_new");if(!a&&r)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(c(e,"spaces")||e.exec(`CREATE TABLE spaces (
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
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=i("lic12@"),a=i("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${a}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,u=new E(e,o)}e.s(["getDb",0,R],62294)},9930,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),s=e.i(59756),n=e.i(61916),i=e.i(74677),o=e.i(69741),T=e.i(16795),E=e.i(87718),l=e.i(95169),d=e.i(47587),c=e.i(66012),p=e.i(70101),u=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(20232);var R=e.i(220),A=e.i(89171),_=e.i(62294);function O(e){return parseInt(e.headers.get("x-space-id")??"1",10)||1}async function U(e,{params:t}){try{let{id:a}=await t,r=await (0,_.getDb)(),s=r.prepare("SELECT * FROM jobs WHERE id = ? AND space_id = ?").get(a,O(e));if(!s)return A.NextResponse.json({error:"Not found"},{status:404});let n=r.prepare("SELECT * FROM activities WHERE job_id = ? ORDER BY created_at ASC").all(a);return A.NextResponse.json({...s,activities:n})}catch(e){return console.error("[GET /api/jobs/[id]] error:",e),A.NextResponse.json({error:String(e)},{status:500})}}async function h(e,{params:t}){try{let{id:a}=await t,r=await (0,_.getDb)(),s=await e.json(),n=O(e),i=r.prepare("SELECT * FROM jobs WHERE id = ? AND space_id = ?").get(a,n);if(!i)return A.NextResponse.json({error:"Not found"},{status:404});let o=new Set(["url","title","company","location","remote","start_date","salary","contract_type","summary","description","contact_name","contact_email","contact_linkedin","network_connection","status","applied_date","response_date","response_type","response_notes","added_by","priority","tags"]),T=Object.keys(s).filter(e=>o.has(e)).map(e=>`${e} = @${e}`).join(", ");T&&r.prepare(`UPDATE jobs SET ${T} WHERE id = @id AND space_id = @space_id`).run({...s,id:a,space_id:n}),s.status&&s.status!==i.status&&r.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'status', ?, ?)
    `).run(a,`Statut → ${{todo:"📋 À explorer",ready:"✏️ À postuler",applied:"🚀 Candidature envoyée",followup:"📣 Relance effectuée",interview:"🤝 Entretien",offer:"🎉 Offre reçue",rejected:"😔 Refus",archived:"📦 Archivé"}[s.status]??s.status}`,s.author??"Équipe"),s.note&&r.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'note', ?, ?)
    `).run(a,s.note,s.author??"Équipe");let E=r.prepare("SELECT * FROM jobs WHERE id = ?").get(a);return A.NextResponse.json(E)}catch(e){return console.error("[PATCH /api/jobs/[id]] error:",e),A.NextResponse.json({error:String(e)},{status:500})}}async function f(e,{params:t}){try{let{id:a}=await t;return(await (0,_.getDb)()).prepare("DELETE FROM jobs WHERE id = ? AND space_id = ?").run(a,O(e)),A.NextResponse.json({ok:!0})}catch(e){return console.error("[DELETE /api/jobs/[id]] error:",e),A.NextResponse.json({error:String(e)},{status:500})}}e.s(["DELETE",0,f,"GET",0,U,"PATCH",0,h],63272);var m=e.i(63272);let b=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/jobs/[id]/route",pathname:"/api/jobs/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/jobs/[id]/route.ts",nextConfigOutput:"",userland:m,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:I,serverHooks:w}=b;async function v(e,t,r){r.requestMeta&&(0,s.setRequestMeta)(e,r.requestMeta),b.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/jobs/[id]/route";A=A.replace(/\/index$/,"")||"/";let _=await b.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!_)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:O,deploymentId:U,params:h,nextConfig:f,parsedUrl:m,isDraftMode:x,prerenderManifest:I,routerServerContext:w,isOnDemandRevalidate:v,revalidateOnlyGenerated:g,resolvedPathname:y,clientReferenceManifest:D,serverActionsManifest:S}=_,C=(0,o.normalizeAppPath)(A),X=!!(I.dynamicRoutes[C]||I.routes[y]),F=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,m,!1):t.end("This page could not be found"),null);if(X&&!x){let e=!!I.routes[y],t=I.dynamicRoutes[C];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await F();throw new L.NoFallbackError}}let j=null;!X||b.isDev||x||(j="/index"===(j=y)?"/":j);let k=!0===b.isDev||!X,P=X&&!k;S&&D&&(0,i.setManifestsSingleton)({page:A,clientReferenceManifest:D,serverActionsManifest:S});let M=e.method||"GET",q=(0,n.getTracer)(),G=q.getActiveScopeSpan(),H=!!(null==w?void 0:w.isWrappedByNextServer),B=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await b.getIncrementalCache(e,f,I,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:h,previewProps:I.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:k,incrementalCache:K,cacheLifeProfiles:f.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>b.onRequestError(e,t,r,s,w)},sharedContext:{buildId:O,deploymentId:U}},$=new T.NodeNextRequest(e),W=new T.NodeNextResponse(t),V=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let s,i=async e=>b.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${M} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",r),s.updateName(t))}else e.updateName(`${M} ${A}`)}),o=async s=>{var n,o;let T=async({previousCacheEntry:a})=>{try{if(!B&&v&&g&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(s);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=Y.renderOpts.collectedTags;if(!X)return await (0,c.sendResponse)($,W,n,Y.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:v})},!1,w),t}},E=await b.handleResponse({req:e,nextConfig:f,cacheKey:j,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:I,isRoutePPREnabled:!1,isOnDemandRevalidate:v,revalidateOnlyGenerated:g,responseGenerator:T,waitUntil:r.waitUntil,isMinimalMode:B});if(!X)return null;if((null==E||null==(n=E.value)?void 0:n.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(o=E.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",v?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,p.fromNodeOutgoingHttpHeaders)(E.value.headers);return B&&X||l.delete(N.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,u.getCacheControlHeader)(E.cacheControl)),await (0,c.sendResponse)($,W,new Response(E.value.body,{headers:l,status:E.value.status||200})),null};H&&G?await o(G):(s=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(l.BaseServerSpan.handleRequest,{spanName:`${M} ${A}`,kind:n.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof L.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:C,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:v})},!1,w),X)throw t;return await (0,c.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,v,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:I})},"routeModule",0,b,"serverHooks",0,w,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,I],9930)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0lo6bgr._.js.map