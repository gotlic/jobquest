module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),n=e.i(54799);let s=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function i(e){return(0,n.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,n.createHmac)("sha256",s).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,i],68105);let o=r.default.join(process.cwd(),"jobsearch.db");class l{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:n}}}class c{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new l(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let T=`
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
`;function d(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let n=r[0].columns.indexOf("name");return r[0].values.some(e=>e[n]===a)}catch{return!1}}function E(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let u=null,p=null,N=0;async function L(){return u||(u=await (0,t.default)()),u}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(p&&t===N)return p;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;return e.exec(T),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let a=e.exec("SELECT name FROM migrations");a[0]?.values.forEach(e=>t.add(e[0]))}catch{}let a=E(e,"feed_blocklist"),r=E(e,"feed_blocklist_new");if(!a&&r)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(E(e,"spaces")||e.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(E(e,t)&&!d(e,t,"space_id"))try{e.exec(`ALTER TABLE ${t} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}E(e,"feed_blocklist")&&!d(e,"feed_blocklist","space_id")&&(E(e,"feed_blocklist_new")&&e.exec("DROP TABLE feed_blocklist_new"),e.exec(`CREATE TABLE feed_blocklist_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id INTEGER NOT NULL DEFAULT 1,
        kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
        value TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (space_id, kind, value)
      )`),e.exec(`INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=i("lic12@"),a=i("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${a}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,p=new c(e,o)}e.s(["getDb",0,R],62294)},88942,e=>{"use strict";var t=e.i(37709);e.s(["default",()=>t.Anthropic])},78143,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),c=e.i(87718),T=e.i(95169),d=e.i(47587),E=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(20232);var R=e.i(220),m=e.i(89171);e.i(36701);var h=e.i(88942),_=e.i(62294);let A=new h.default,f=new Map,U=new TextEncoder;function x(e){return U.encode(`data: ${JSON.stringify(e)}

`)}async function O(e){let t;try{t=await e.json()}catch{return m.NextResponse.json({error:"Corps de requête invalide"},{status:400})}let a=t?.url,r=t?.text?.trim()??"";if(!a)return m.NextResponse.json({error:"URL requise"},{status:400});let n=function(e){try{let t=new URL(e.trim());return t.hash="",t.toString().replace(/\/$/,"").toLowerCase()}catch{return e.trim().toLowerCase()}}(a);function s(e){return new Response(new ReadableStream({start(t){t.enqueue(x(e)),t.close()}}),{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache","X-Accel-Buffering":"no"}})}if(f.has(n))return s({...f.get(n),url:a,_cached:!0,done:!0});try{let e=(await (0,_.getDb)()).prepare("SELECT * FROM jobs WHERE url = ? LIMIT 1").get(a);if(e){let t={title:e.title,company:e.company,location:e.location,remote:e.remote,start_date:e.start_date,salary:e.salary,contract_type:e.contract_type,summary:e.summary,contact_name:e.contact_name,contact_email:e.contact_email,contact_linkedin:e.contact_linkedin};return f.set(n,t),s({...t,url:a,_cached:!0,done:!0})}}catch(e){console.error("[analyze] db lookup error (non-blocking):",e)}let i=new ReadableStream({async start(e){try{e.enqueue(x({status:"fetching"}));let t="";try{let e=new URL(a),r={};e.searchParams.forEach((e,t)=>{r[t]=e});let n=e.pathname;t=`Slug URL: ${n}
Param\xe8tres URL: ${JSON.stringify(r)}`}catch{}let s=r,i=!1;if(!r)try{let e=await fetch(a,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","Accept-Language":"fr-FR,fr;q=0.9"},signal:AbortSignal.timeout(1e4)}),t=await e.text(),r=((s=t.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,12e3)).match(/\b[a-zA-ZÀ-ÿ]{3,}\b/g)||[]).length;(r<150||t.includes("window.ddjskey")||t.includes("angular-output")||t.includes("__NEXT_DATA__")&&r<300)&&(i=!0)}catch{e.enqueue(x({error:"Impossible de lire cette URL",done:!0})),e.close();return}if(i){e.enqueue(x({_spa:!0,url:a,done:!0})),e.close();return}e.enqueue(x({status:"analyzing"}));let o=A.messages.stream({model:"claude-sonnet-4-6",max_tokens:1024,messages:[{role:"user",content:`Tu analyses une offre d'emploi pour un outil de suivi de candidatures. Extrais les informations suivantes et r\xe9ponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication.

Note: si le lieu n'est pas explicite dans le contenu, cherche des indices dans le slug de l'URL (ex: "paris", "lyon", "pierre-benite" → Pierre-B\xe9nite pr\xe8s de Lyon).

URL: ${a}
${t}
Contenu de la page: ${s}

JSON attendu:
{
  "title": "Intitul\xe9 exact du poste",
  "company": "Nom de l'entreprise",
  "location": "Ville, Pays (ou null)",
  "remote": "full / partial / no / null",
  "start_date": "Date de d\xe9but si mentionn\xe9e (ou null)",
  "salary": "Fourchette salariale si mentionn\xe9e (ou null)",
  "contract_type": "CDI / CDD / Stage / Alternance / Freelance / etc (ou null)",
  "summary": "R\xe9sum\xe9 du poste en 30-50 mots maximum, percutant et informatif",
  "contact_name": "Pr\xe9nom Nom du recruteur si mentionn\xe9 (ou null)",
  "contact_email": "Email recruteur si mentionn\xe9 (ou null)",
  "contact_linkedin": "Profil LinkedIn recruteur si mentionn\xe9 (ou null)"
}`}]}),l=0;o.on("text",()=>{if(++l%5==1)try{e.enqueue(x({status:"thinking",tick:l}))}catch{}});let c=await o.finalMessage(),T="text"===c.content[0].type?c.content[0].text:"",d=T.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim(),E=d.match(/\{[\s\S]*\}/);try{let t=JSON.parse(E?E[0]:d);f.set(n,t),e.enqueue(x({...t,url:a,done:!0}))}catch{e.enqueue(x({error:"Erreur parsing IA",raw:T,done:!0}))}}catch(t){console.error("[POST /api/analyze] error:",t),e.enqueue(x({error:"Erreur serveur lors de l'analyse",done:!0}))}finally{e.close()}}});return new Response(i,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache","X-Accel-Buffering":"no"}})}e.s(["POST",0,O],23892);var y=e.i(23892);let g=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/analyze/route.ts",nextConfigOutput:"",userland:y,...{}}),{workAsyncStorage:I,workUnitAsyncStorage:b,serverHooks:v}=g;async function w(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),g.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/analyze/route";m=m.replace(/\/index$/,"")||"/";let h=await g.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!h)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:_,deploymentId:A,params:f,nextConfig:U,parsedUrl:x,isDraftMode:O,prerenderManifest:y,routerServerContext:I,isOnDemandRevalidate:b,revalidateOnlyGenerated:v,resolvedPathname:w,clientReferenceManifest:C,serverActionsManifest:S}=h,X=(0,o.normalizeAppPath)(m),D=!!(y.dynamicRoutes[X]||y.routes[w]),F=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,x,!1):t.end("This page could not be found"),null);if(D&&!O){let e=!!y.routes[w],t=y.dynamicRoutes[X];if(t&&!1===t.fallback&&!e){if(U.adapterPath)return await F();throw new L.NoFallbackError}}let k=null;!D||g.isDev||O||(k="/index"===(k=w)?"/":k);let q=!0===g.isDev||!D,P=D&&!q;S&&C&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:C,serverActionsManifest:S});let M=e.method||"GET",j=(0,s.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==I?void 0:I.isWrappedByNextServer),K=!!(0,n.getRequestMeta)(e,"minimalMode"),H=(0,n.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,U,y,K);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let Y={params:f,previewProps:y.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts},cacheComponents:!!U.cacheComponents,supportsDynamicResponse:q,incrementalCache:H,cacheLifeProfiles:U.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>g.onRequestError(e,t,r,n,I)},sharedContext:{buildId:_,deploymentId:A}},$=new l.NodeNextRequest(e),z=new l.NodeNextResponse(t),W=c.NextRequestAdapter.fromNodeNextRequest($,(0,c.signalFromNodeResponse)(t));try{let n,i=async e=>g.handle(W,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${M} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${M} ${m}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:a})=>{try{if(!K&&b&&v&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!D)return await (0,E.sendResponse)($,z,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:b})},!1,I),t}},c=await g.handleResponse({req:e,nextConfig:U,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:b,revalidateOnlyGenerated:v,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:K});if(!D)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(o=c.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",b?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,u.fromNodeOutgoingHttpHeaders)(c.value.headers);return K&&D||T.delete(N.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,p.getCacheControlHeader)(c.cacheControl)),await (0,E.sendResponse)($,z,new Response(c.value.body,{headers:T,status:c.value.status||200})),null};B&&G?await o(G):(n=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(T.BaseServerSpan.handleRequest,{spanName:`${M} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:X,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:b})},!1,I),D)throw t;return await (0,E.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,w,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:b})},"routeModule",0,g,"serverHooks",0,v,"workAsyncStorage",0,I,"workUnitAsyncStorage",0,b],78143)},6714,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_fs_1t1l-4-._.js"].map(t=>e.l(t))).then(()=>t(2157)))},11105,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_path_1pmhwj3._.js"].map(t=>e.l(t))).then(()=>t(50227)))},46735,e=>{e.v(t=>Promise.all(["server/chunks/[externals]__1j5vgk-._.js","server/chunks/[root-of-the-server]__1fbyaci._.js"].map(t=>e.l(t))).then(()=>t(83085)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__06evh5a._.js.map