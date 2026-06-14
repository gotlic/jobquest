module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},25302,(e,t,a)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},62294,68105,e=>{"use strict";var t=e.i(25302),a=e.i(22734),r=e.i(14747),n=e.i(54799);let s=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function i(e){return(0,n.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),a=(0,n.createHmac)("sha256",s).update(t).digest("hex");return`${t}.${a}`},"hashPassword",0,i],68105);let o=r.default.join(process.cwd(),"jobsearch.db");class d{sqlDb;dbPath;sql;constructor(e,t,a){this.sqlDb=e,this.dbPath=t,this.sql=a}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let a={};for(let[t,r]of Object.entries(e[0]))a[`@${t}`]=r??null;t.bind(a)}return t}get(...e){let t=this.prepareAndBind(e),a=t.step()?{...t.getAsObject()}:void 0;return t.free(),a}all(...e){let t=this.prepareAndBind(e),a=[];for(;t.step();)a.push({...t.getAsObject()});return t.free(),a}run(...e){let t=this.prepareAndBind(e);t.step();let r=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),a.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),N=a.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:r,changes:n}}}class l{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new d(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let T=`
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
`;function E(e,t,a){try{let r=e.exec(`PRAGMA table_info(${t})`);if(!r[0])return!1;let n=r[0].columns.indexOf("name");return r[0].values.some(e=>e[n]===a)}catch{return!1}}function c(e,t){try{let a=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!a[0]?.values?.length}catch{return!1}}let u=null,p=null,N=0;async function L(){return u||(u=await (0,t.default)()),u}async function R(){let e,t=0;try{t=a.default.statSync(o).mtimeMs}catch{}if(p&&t===N)return p;let r=await L();if(a.default.existsSync(o)){let t=a.default.readFileSync(o);e=new r.Database(t)}else e=new r.Database;return e.exec(T),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let a=e.exec("SELECT name FROM migrations");a[0]?.values.forEach(e=>t.add(e[0]))}catch{}let a=c(e,"feed_blocklist"),r=c(e,"feed_blocklist_new");if(!a&&r)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(c(e,"spaces")||e.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(c(e,t)&&!E(e,t,"space_id"))try{e.exec(`ALTER TABLE ${t} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}c(e,"feed_blocklist")&&!E(e,"feed_blocklist","space_id")&&(c(e,"feed_blocklist_new")&&e.exec("DROP TABLE feed_blocklist_new"),e.exec(`CREATE TABLE feed_blocklist_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id INTEGER NOT NULL DEFAULT 1,
        kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
        value TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (space_id, kind, value)
      )`),e.exec(`INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=i("lic12@"),a=i("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${a}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),a.default.writeFileSync(o,Buffer.from(e.export())),N=a.default.statSync(o).mtimeMs,p=new l(e,o)}e.s(["getDb",0,R],62294)},16793,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),d=e.i(16795),l=e.i(87718),T=e.i(95169),E=e.i(47587),c=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(20232);var R=e.i(220),x=e.i(89171),m=e.i(62294);function A(e){return parseInt(e.headers.get("x-space-id")??"1",10)||1}let O=[{title:"Lettre type — Amélioration Continue",category_id:null,content:`Madame, Monsieur,

Passionn\xe9(e) par l'optimisation des processus industriels, je me permets de vous adresser ma candidature pour le poste de [INTITUL\xc9 DU POSTE] au sein de [ENTREPRISE].

Au cours de mes exp\xe9riences, j'ai d\xe9velopp\xe9 une solide expertise en m\xe9thodologies Lean et Six Sigma, en conduite de chantiers Kaizen et en d\xe9ploiement d'indicateurs de performance (KPI). Mon approche terrain me permet d'identifier rapidement les sources de gaspillage et de f\xe9d\xe9rer les \xe9quipes autour de solutions durables.

Ce qui m'attire particuli\xe8rement chez [ENTREPRISE], c'est [POINT SP\xc9CIFIQUE \xc0 L'ENTREPRISE]. Je suis convaincu(e) que ma rigueur m\xe9thodologique et mon sens du travail collaboratif seraient de v\xe9ritables atouts pour contribuer \xe0 vos projets d'am\xe9lioration.

Dans l'attente d'un \xe9change, je reste disponible pour tout entretien \xe0 votre convenance.

Cordialement,
[PR\xc9NOM NOM]`},{title:"Lettre type — Industrie / Production",category_id:null,content:`Madame, Monsieur,

Fort(e) d'une exp\xe9rience en environnement industriel, je vous soumets ma candidature pour le poste de [INTITUL\xc9 DU POSTE] au sein de [ENTREPRISE].

Ma ma\xeetrise des outils de gestion de production (ERP, GPAO) et mon exp\xe9rience du pilotage d'\xe9quipes en production me permettent d'assurer fiabilit\xe9, s\xe9curit\xe9 et performance sur le terrain. J'ai notamment contribu\xe9 \xe0 [R\xc9ALISATION CLEF : ex. r\xe9duction des temps d'arr\xeat machine de X%].

Votre site de [LIEU] est reconnu pour [POINT FORT ENTREPRISE], et c'est pr\xe9cis\xe9ment ce type de challenge industriel qui m'anime.

Je serais ravi(e) de vous pr\xe9senter mon parcours lors d'un entretien.

Cordialement,
[PR\xc9NOM NOM]`},{title:"Lettre type — Conception Produit",category_id:null,content:`Madame, Monsieur,

La conception de produits innovants et fonctionnels est au cœur de ma d\xe9marche professionnelle. C'est pourquoi je vous adresse ma candidature pour le poste de [INTITUL\xc9 DU POSTE] chez [ENTREPRISE].

Ma\xeetrisant les outils CAO (SolidWorks, CATIA) et les d\xe9marches de conception centr\xe9e utilisateur, j'ai men\xe9 des projets de bout en bout : de l'analyse du besoin jusqu'aux phases de prototypage et de validation. Mon souci du d\xe9tail et ma vision syst\xe9mique me permettent d'anticiper les contraintes de fabrication d\xe8s la phase de conception.

[ENTREPRISE] d\xe9veloppe des produits qui [CONTEXTE / MARCH\xc9], et je suis particuli\xe8rement motiv\xe9(e) \xe0 contribuer \xe0 cette mission.

Dans l'attente de vous rencontrer, je reste \xe0 votre disposition.

Cordialement,
[PR\xc9NOM NOM]`}];async function _(e){let t=await (0,m.getDb)(),a=A(e);0===t.prepare("SELECT COUNT(*) as c FROM cover_letters WHERE space_id = ?").get(a).c&&O.forEach(e=>{t.prepare("INSERT INTO cover_letters (space_id, title, content, category_id) VALUES (?, ?, ?, ?)").run(a,e.title,e.content,e.category_id)});let r=t.prepare("SELECT * FROM cover_letters WHERE space_id = ? ORDER BY id").all(a);return x.NextResponse.json(r)}async function U(e){let t=await (0,m.getDb)(),a=await e.json(),r=A(e),n=t.prepare(`
    INSERT INTO cover_letters (space_id, title, content, category_id, is_default)
    VALUES (?, ?, ?, ?, ?)
  `).run(r,a.title,a.content??"",a.category_id??null,+!!a.is_default);return x.NextResponse.json(t.prepare("SELECT * FROM cover_letters WHERE id = ?").get(n.lastInsertRowid),{status:201})}e.s(["GET",0,_,"POST",0,U],29712);var h=e.i(29712);let I=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/cover-letters/route",pathname:"/api/cover-letters",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cover-letters/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:f,workUnitAsyncStorage:v,serverHooks:b}=I;async function g(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),I.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/cover-letters/route";x=x.replace(/\/index$/,"")||"/";let m=await I.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:A,deploymentId:O,params:_,nextConfig:U,parsedUrl:h,isDraftMode:f,prerenderManifest:v,routerServerContext:b,isOnDemandRevalidate:g,revalidateOnlyGenerated:S,resolvedPathname:C,clientReferenceManifest:y,serverActionsManifest:w}=m,D=(0,o.normalizeAppPath)(x),X=!!(v.dynamicRoutes[D]||v.routes[C]),F=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,h,!1):t.end("This page could not be found"),null);if(X&&!f){let e=!!v.routes[C],t=v.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(U.adapterPath)return await F();throw new L.NoFallbackError}}let P=null;!X||I.isDev||f||(P="/index"===(P=C)?"/":P);let M=!0===I.isDev||!X,q=X&&!M;w&&y&&(0,i.setManifestsSingleton)({page:x,clientReferenceManifest:y,serverActionsManifest:w});let k=e.method||"GET",j=(0,s.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==b?void 0:b.isWrappedByNextServer),K=!!(0,n.getRequestMeta)(e,"minimalMode"),H=(0,n.getRequestMeta)(e,"incrementalCache")||await I.getIncrementalCache(e,U,v,K);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let Y={params:_,previewProps:v.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts},cacheComponents:!!U.cacheComponents,supportsDynamicResponse:M,incrementalCache:H,cacheLifeProfiles:U.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>I.onRequestError(e,t,r,n,b)},sharedContext:{buildId:A,deploymentId:O}},$=new d.NodeNextRequest(e),V=new d.NodeNextResponse(t),W=l.NextRequestAdapter.fromNodeNextRequest($,(0,l.signalFromNodeResponse)(t));try{let n,i=async e=>I.handle(W,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${x}`)}),o=async n=>{var s,o;let d=async({previousCacheEntry:a})=>{try{if(!K&&g&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let d=Y.renderOpts.collectedTags;if(!X)return await (0,c.sendResponse)($,V,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[N.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,b),t}},l=await I.handleResponse({req:e,nextConfig:U,cacheKey:P,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:v,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:S,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:K});if(!X)return null;if((null==l||null==(s=l.value)?void 0:s.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(o=l.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",g?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,u.fromNodeOutgoingHttpHeaders)(l.value.headers);return K&&X||T.delete(N.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,p.getCacheControlHeader)(l.cacheControl)),await (0,c.sendResponse)($,V,new Response(l.value.body,{headers:T,status:l.value.status||200})),null};B&&G?await o(G):(n=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(T.BaseServerSpan.handleRequest,{spanName:`${k} ${x}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!B))}catch(t){if(t instanceof L.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,b),X)throw t;return await (0,c.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,g,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:v})},"routeModule",0,I,"serverHooks",0,b,"workAsyncStorage",0,f,"workUnitAsyncStorage",0,v],16793)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ria9ap._.js.map