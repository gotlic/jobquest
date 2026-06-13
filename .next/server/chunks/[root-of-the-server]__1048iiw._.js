module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},62294,68105,e=>{"use strict";var t=e.i(25302),r=e.i(22734),s=e.i(14747),a=e.i(54799);let n=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function i(e){return(0,a.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),r=(0,a.createHmac)("sha256",n).update(t).digest("hex");return`${t}.${r}`},"hashPassword",0,i],68105);let o=s.default.join(process.cwd(),"jobsearch.db");class E{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,s]of Object.entries(e[0]))r[`@${t}`]=s??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let s=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,a=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:s,changes:a}}}class T{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new E(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let l=`
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
`;function d(e,t,r){try{let s=e.exec(`PRAGMA table_info(${t})`);if(!s[0])return!1;let a=s[0].columns.indexOf("name");return s[0].values.some(e=>e[a]===r)}catch{return!1}}function c(e,t){try{let r=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!r[0]?.values?.length}catch{return!1}}let p=null,u=null,N=0;async function R(){return p||(p=await (0,t.default)()),p}async function L(){let e,t=0;try{t=r.default.statSync(o).mtimeMs}catch{}if(u&&t===N)return u;let s=await R();if(r.default.existsSync(o)){let t=r.default.readFileSync(o);e=new s.Database(t)}else e=new s.Database;e.exec(l);var a=e;a.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let n=new Set;try{let e=a.exec("SELECT name FROM migrations");e[0]?.values.forEach(e=>n.add(e[0]))}catch{}if(!n.has("spaces_v1")){for(let e of(c(a,"spaces")||a.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(c(a,e)&&!d(a,e,"space_id"))try{a.exec(`ALTER TABLE ${e} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}c(a,"feed_blocklist")&&!d(a,"feed_blocklist","space_id")&&a.exec(`
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
      `);let e=i("lic12@"),t=i("tomot123");a.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${e}')`),a.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${t}')`),a.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}return r.default.writeFileSync(o,Buffer.from(e.export())),N=r.default.statSync(o).mtimeMs,u=new T(e,o)}e.s(["getDb",0,L],62294)},73512,e=>{"use strict";var t=e.i(47909),r=e.i(74017),s=e.i(96250),a=e.i(59756),n=e.i(61916),i=e.i(74677),o=e.i(69741),E=e.i(16795),T=e.i(87718),l=e.i(95169),d=e.i(47587),c=e.i(66012),p=e.i(70101),u=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),O=e.i(89171),A=e.i(62294),_=e.i(68105);function h(e){let t=parseInt(e.headers.get("x-space-id")??"",10);return isNaN(t)||t<=0?null:t}async function U(){try{let e=(await (0,A.getDb)()).prepare("SELECT id, name, slug FROM spaces ORDER BY id").all();return O.NextResponse.json(e)}catch(e){return console.error("[GET /api/spaces]",e),O.NextResponse.json([],{status:500})}}async function f(e){if(!h(e))return O.NextResponse.json({error:"Non authentifié"},{status:401});try{let t=await e.json(),r=String(t.name??"").trim(),s=String(t.slug??"").trim().toLowerCase().replace(/[^a-z0-9-]/g,""),a=String(t.password??"");if(!r||!s||!a)return O.NextResponse.json({error:"Nom, slug et mot de passe requis"},{status:400});let n=await (0,A.getDb)();if(n.prepare("SELECT id FROM spaces WHERE slug = ?").get(s))return O.NextResponse.json({error:"Cet identifiant est déjà pris"},{status:409});let i=n.prepare("INSERT INTO spaces (slug, name, password_hash) VALUES (?, ?, ?)").run(s,r,(0,_.hashPassword)(a)),o=n.prepare("SELECT id, name, slug FROM spaces WHERE id = ?").get(i.lastInsertRowid);return O.NextResponse.json(o,{status:201})}catch(e){return console.error("[POST /api/spaces]",e),O.NextResponse.json({error:"Erreur serveur"},{status:500})}}async function m(e){let t=h(e);if(!t)return O.NextResponse.json({error:"Non authentifié"},{status:401});try{let r=await e.json(),s=await (0,A.getDb)(),a=s.prepare("SELECT * FROM spaces WHERE id = ?").get(t);if(!a)return O.NextResponse.json({error:"Espace introuvable"},{status:404});let n={};if("settings"in r){let e=JSON.parse(a.settings||"{}");n.settings=JSON.stringify({...e,...r.settings})}if("serpapi_key"in r&&(n.serpapi_key=r.serpapi_key??""),"ft_client_id"in r&&(n.ft_client_id=r.ft_client_id??""),"ft_client_secret"in r&&(n.ft_client_secret=r.ft_client_secret??""),0===Object.keys(n).length)return O.NextResponse.json({error:"Rien à mettre à jour"},{status:400});let i=Object.keys(n).map(e=>`${e} = @${e}`).join(", ");return s.prepare(`UPDATE spaces SET ${i} WHERE id = @id`).run({...n,id:t}),O.NextResponse.json({ok:!0})}catch(e){return console.error("[PATCH /api/spaces]",e),O.NextResponse.json({error:"Erreur serveur"},{status:500})}}async function x(e){let t=h(e);if(!t)return O.NextResponse.json({error:"Non authentifié"},{status:401});try{let r=await e.json(),s=parseInt(r.id??"",10),a=String(r.password??"");if(!s||!a)return O.NextResponse.json({error:"id et mot de passe requis"},{status:400});let n=await (0,A.getDb)();if(n.prepare("SELECT COUNT(*) as c FROM spaces").get().c<=1)return O.NextResponse.json({error:"Impossible de supprimer le dernier espace"},{status:400});let i=n.prepare("SELECT * FROM spaces WHERE id = ?").get(s);if(!i)return O.NextResponse.json({error:"Espace introuvable"},{status:404});if(i.password_hash!==(0,_.hashPassword)(a))return O.NextResponse.json({error:"Mot de passe incorrect"},{status:401});n.prepare("DELETE FROM jobs WHERE space_id = ?").run(s),n.prepare("DELETE FROM feed_blocklist WHERE space_id = ?").run(s),n.prepare("DELETE FROM cvs WHERE space_id = ?").run(s),n.prepare("DELETE FROM cv_categories WHERE space_id = ?").run(s),n.prepare("DELETE FROM cover_letters WHERE space_id = ?").run(s),n.prepare("DELETE FROM spaces WHERE id = ?").run(s);let o=O.NextResponse.json({ok:!0});return s===t&&o.cookies.delete(_.SPACE_COOKIE),o}catch(e){return console.error("[DELETE /api/spaces]",e),O.NextResponse.json({error:"Erreur serveur"},{status:500})}}e.s(["DELETE",0,x,"GET",0,U,"PATCH",0,m,"POST",0,f],9378);var I=e.i(9378);let g=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/spaces/route",pathname:"/api/spaces",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/spaces/route.ts",nextConfigOutput:"",userland:I,...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:b}=g;async function D(e,t,s){s.requestMeta&&(0,a.setRequestMeta)(e,s.requestMeta),g.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let O="/api/spaces/route";O=O.replace(/\/index$/,"")||"/";let A=await g.prepare(e,t,{srcPage:O,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve()),null;let{buildId:_,deploymentId:h,params:U,nextConfig:f,parsedUrl:m,isDraftMode:x,prerenderManifest:I,routerServerContext:v,isOnDemandRevalidate:w,revalidateOnlyGenerated:b,resolvedPathname:D,clientReferenceManifest:C,serverActionsManifest:S}=A,y=(0,o.normalizeAppPath)(O),F=!!(I.dynamicRoutes[y]||I.routes[D]),X=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,m,!1):t.end("This page could not be found"),null);if(F&&!x){let e=!!I.routes[D],t=I.dynamicRoutes[y];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await X();throw new R.NoFallbackError}}let j=null;!F||g.isDev||x||(j="/index"===(j=D)?"/":j);let M=!0===g.isDev||!F,P=F&&!M;S&&C&&(0,i.setManifestsSingleton)({page:O,clientReferenceManifest:C,serverActionsManifest:S});let k=e.method||"GET",q=(0,n.getTracer)(),G=q.getActiveScopeSpan(),H=!!(null==v?void 0:v.isWrappedByNextServer),B=!!(0,a.getRequestMeta)(e,"minimalMode"),K=(0,a.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,f,I,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:U,previewProps:I.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:M,incrementalCache:K,cacheLifeProfiles:f.cacheLife,waitUntil:s.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s,a)=>g.onRequestError(e,t,s,a,v)},sharedContext:{buildId:_,deploymentId:h}},$=new E.NodeNextRequest(e),W=new E.NodeNextResponse(t),V=T.NextRequestAdapter.fromNodeNextRequest($,(0,T.signalFromNodeResponse)(t));try{let a,i=async e=>g.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=q.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${k} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",s),a.updateName(t))}else e.updateName(`${k} ${O}`)}),o=async a=>{var n,o;let E=async({previousCacheEntry:r})=>{try{if(!B&&w&&b&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&s.waitUntil&&(s.waitUntil(o),o=void 0);let E=Y.renderOpts.collectedTags;if(!F)return await (0,c.sendResponse)($,W,n,Y.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,s=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==r?void 0:r.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:O,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:w})},!1,v),t}},T=await g.handleResponse({req:e,nextConfig:f,cacheKey:j,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:I,isRoutePPREnabled:!1,isOnDemandRevalidate:w,revalidateOnlyGenerated:b,responseGenerator:E,waitUntil:s.waitUntil,isMinimalMode:B});if(!F)return null;if((null==T||null==(n=T.value)?void 0:n.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==T||null==(o=T.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",w?"REVALIDATED":T.isMiss?"MISS":T.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,p.fromNodeOutgoingHttpHeaders)(T.value.headers);return B&&F||l.delete(N.NEXT_CACHE_TAGS_HEADER),!T.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,u.getCacheControlHeader)(T.cacheControl)),await (0,c.sendResponse)($,W,new Response(T.value.body,{headers:l,status:T.value.status||200})),null};H&&G?await o(G):(a=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(l.BaseServerSpan.handleRequest,{spanName:`${k} ${O}`,kind:n.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:w})},!1,v),F)throw t;return await (0,c.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,D,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})},"routeModule",0,g,"serverHooks",0,b,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,w],73512)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1048iiw._.js.map