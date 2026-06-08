module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);return t.step(),t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),{lastInsertRowid:this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,changes:this.sqlDb.getRowsModified()}}}class i{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let s=`
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
`,o=null,d=null;async function l(){return o||(d||(d=(async()=>{let e,n=await (0,t.default)();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(s),r.default.writeFileSync(a,Buffer.from(e.export())),o=new i(e,a)})()),d)}e.s(["getDb",0,l])},16793,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),d=e.i(16795),l=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),E=e.i(70101),T=e.i(26937),x=e.i(10372),N=e.i(93695);e.i(52474);var R=e.i(220),m=e.i(89171),h=e.i(62294);let v=[{title:"Lettre type — Amélioration Continue",category_id:null,content:`Madame, Monsieur,

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
[PR\xc9NOM NOM]`}];async function L(){let e=await (0,h.getDb)();if(0===e.prepare("SELECT COUNT(*) as c FROM cover_letters").get().c){let t=e.prepare("INSERT INTO cover_letters (title, content, category_id) VALUES (@title, @content, @category_id)");v.forEach(e=>t.run(e))}let t=e.prepare("SELECT * FROM cover_letters ORDER BY id").all();return m.NextResponse.json(t)}async function A(e){let t=await (0,h.getDb)(),r=await e.json(),a=t.prepare(`
    INSERT INTO cover_letters (title, content, category_id, is_default)
    VALUES (@title, @content, @category_id, @is_default)
  `).run({title:r.title,content:r.content??"",category_id:r.category_id??null,is_default:+!!r.is_default});return m.NextResponse.json(t.prepare("SELECT * FROM cover_letters WHERE id = ?").get(a.lastInsertRowid),{status:201})}e.s(["GET",0,L,"POST",0,A],29712);var f=e.i(29712);let g=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/cover-letters/route",pathname:"/api/cover-letters",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/cover-letters/route.ts",nextConfigOutput:"",userland:f,...{}}),{workAsyncStorage:O,workUnitAsyncStorage:I,serverHooks:b}=g;async function _(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),g.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/cover-letters/route";m=m.replace(/\/index$/,"")||"/";let h=await g.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!h)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:v,deploymentId:L,params:A,nextConfig:f,parsedUrl:O,isDraftMode:I,prerenderManifest:b,routerServerContext:_,isOnDemandRevalidate:y,revalidateOnlyGenerated:U,resolvedPathname:C,clientReferenceManifest:S,serverActionsManifest:w}=h,P=(0,o.normalizeAppPath)(m),D=!!(b.dynamicRoutes[P]||b.routes[C]),q=async()=>((null==_?void 0:_.render404)?await _.render404(e,t,O,!1):t.end("This page could not be found"),null);if(D&&!I){let e=!!b.routes[C],t=b.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await q();throw new N.NoFallbackError}}let X=null;!D||g.isDev||I||(X="/index"===(X=C)?"/":X);let F=!0===g.isDev||!D,j=D&&!F;w&&S&&(0,s.setManifestsSingleton)({page:m,clientReferenceManifest:S,serverActionsManifest:w});let M=e.method||"GET",k=(0,i.getTracer)(),G=k.getActiveScopeSpan(),H=!!(null==_?void 0:_.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,f,b,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:A,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:F,incrementalCache:K,cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>g.onRequestError(e,t,a,n,_)},sharedContext:{buildId:v,deploymentId:L}},$=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),V=l.NextRequestAdapter.fromNodeNextRequest($,(0,l.signalFromNodeResponse)(t));try{let n,s=async e=>g.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${M} ${m}`)}),o=async n=>{var i,o;let d=async({previousCacheEntry:r})=>{try{if(!B&&y&&U&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let d=Y.renderOpts.collectedTags;if(!D)return await (0,p.sendResponse)($,W,i,Y.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[x.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,_),t}},l=await g.handleResponse({req:e,nextConfig:f,cacheKey:X,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:U,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:B});if(!D)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(o=l.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",y?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,E.fromNodeOutgoingHttpHeaders)(l.value.headers);return B&&D||u.delete(x.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,T.getCacheControlHeader)(l.cacheControl)),await (0,p.sendResponse)($,W,new Response(l.value.body,{headers:u,status:l.value.status||200})),null};H&&G?await o(G):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(u.BaseServerSpan.handleRequest,{spanName:`${M} ${m}`,kind:i.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!H))}catch(t){if(t instanceof N.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:y})},!1,_),D)throw t;return await (0,p.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,_,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:I})},"routeModule",0,g,"serverHooks",0,b,"workAsyncStorage",0,O,"workUnitAsyncStorage",0,I],16793)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__03c-96x._.js.map