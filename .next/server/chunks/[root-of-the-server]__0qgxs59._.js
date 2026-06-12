module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let a=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:a,changes:n}}}class i{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let s=`
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

  CREATE TABLE IF NOT EXISTS feed_blocklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
    value TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (kind, value)
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
`,o=null,l=null,d=0;async function c(){return o||(o=await (0,t.default)()),o}async function u(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await c();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(s),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new i(e,a)}e.s(["getDb",0,u])},19357,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),T=e.i(70101),E=e.i(26937),h=e.i(10372),f=e.i(93695);e.i(52474);var m=e.i(220),N=e.i(89171),R=e.i(62294);let g=new Map;function w(e){return e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"")}async function A(){let e=new Set,t=new Set;try{(await (0,R.getDb)()).prepare("SELECT kind, value FROM feed_blocklist").all().forEach(r=>("company"===r.kind?e:t).add(r.value))}catch(e){console.error("[feed] blocklist load error (non-blocking):",e)}return{companies:e,offers:t}}function v(e,t){return 0===t.companies.size&&0===t.offers.size?e:e.filter(e=>!t.companies.has(w(e.company))&&!t.offers.has(w(`${e.title} ${e.company}`)))}function L(e){if(!e)return 0;let t=new Date(e);if(!isNaN(t.getTime()))return t.getTime();let r=e.match(/(\d+)\s*(minute|min\b|heure|hour|jour|day|semaine|week|mois|month)/i);if(r){let e=parseInt(r[1],10),t=r[2].toLowerCase(),a=t.startsWith("min")?6e4:t.startsWith("heure")||t.startsWith("hour")?36e5:t.startsWith("jour")||t.startsWith("day")?864e5:t.startsWith("semaine")||t.startsWith("week")?6048e5:2592e6;return Date.now()-e*a}return/aujourd/i.test(e)?Date.now():/hier/i.test(e)?Date.now()-864e5:0}let S=null;async function y(e,t){if(S&&Date.now()<S.expiresAt-3e4)return S.value;let r=await fetch("https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:e,client_secret:t,scope:"api_offresdemploiv2 o2dsoffre"}),signal:AbortSignal.timeout(1e4)});if(!r.ok)throw Error(`Auth FT failed: ${r.status}`);let a=await r.json();return(S={value:a.access_token,expiresAt:Date.now()+1e3*a.expires_in}).value}async function x(e,t,r){let a=await y(t,r),n=new URLSearchParams({motsCles:e,range:"0-49",sort:"1",minCreationDate:new Date(Date.now()-6048e5).toISOString().replace(/\.\d{3}Z$/,"Z"),maxCreationDate:new Date().toISOString().replace(/\.\d{3}Z$/,"Z")}),i=await fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${n}`,{headers:{Authorization:`Bearer ${a}`,Accept:"application/json"},signal:AbortSignal.timeout(15e3)});if(!i.ok)throw Error(`FT API ${i.status}`);return((await i.json()).resultats??[]).map(e=>{let t=e.lieuTravail,r=e.entreprise,a=e.salaire,n=String(e.dateCreation??"");return{id:`ft-${e.id}`,title:String(e.intitule??""),company:String(r?.nom??""),location:String(t?.libelle??""),url:`https://candidat.francetravail.fr/offres/emploi/detail/${e.id}`,summary:String(e.description??"").slice(0,300),pubDate:n,postedTs:L(n),salary:String(a?.libelle??""),contract_type:String(e.typeContratLibelle??""),source:"France Travail"}})}async function _(e,t){let r=new URLSearchParams({engine:"google_jobs",q:e,google_domain:"google.fr",gl:"fr",hl:"fr",location:"France",chips:"date_posted:week",api_key:t}),a=await fetch(`https://serpapi.com/search.json?${r}`,{signal:AbortSignal.timeout(2e4)}),n=await a.json();if(n.error){let e=String(n.error);if(/invalid api key/i.test(e))throw Error("SERP_AUTH");if(/run out of searches/i.test(e))throw Error("SERP_QUOTA");if(/returned any results/i.test(e))return[];throw Error(`SerpAPI: ${e.slice(0,150)}`)}return(n.jobs_results??[]).map(e=>{let t=e.detected_extensions,r=e.apply_options,a=r?.[0]?.link??String(e.related_links?.[0]?.link??"")??"",n=String(t?.posted_at??"");return{id:`gj-${e.job_id??a}`,title:String(e.title??""),company:String(e.company_name??""),location:String(e.location??"").replace(/^via .*$/i,"").trim(),url:a||String(e.share_link??""),summary:String(e.description??"").slice(0,300),pubDate:n,postedTs:L(n),salary:String(t?.salary??""),contract_type:String(t?.schedule_type??""),source:String(e.via??"Google Jobs").replace(/^via\s+/i,"")}}).filter(e=>e.title&&e.url)}async function b(e){let t=e.nextUrl.searchParams,r=t.get("q")??"ingénieur alternance",a="1"===t.get("force"),n=t.get("cid")??"",i=t.get("cs")??"",s=t.get("serp")||process.env.SERPAPI_KEY||"";if(!s&&(!n||!i))return N.NextResponse.json({items:[],error:"NO_CREDENTIALS"});let o=await A(),l=`${n}|${s.slice(0,8)}|${r.toLowerCase().trim()}`,d=g.get(l);if(!a&&d&&Date.now()-d.at<216e5)return N.NextResponse.json({items:v(d.items,o),cachedAt:d.at,cached:!0});let c=[],u=await Promise.allSettled([s?_(r,s):Promise.resolve([]),n&&i?x(r,n,i):Promise.resolve([])]),p=[];u.forEach((e,t)=>{if("fulfilled"===e.status)p.push(...e.value);else{let r=e.reason instanceof Error?e.reason.message:String(e.reason);"SERP_AUTH"===r?c.push("Clé SerpAPI invalide"):"SERP_QUOTA"===r?c.push("Quota SerpAPI épuisé (250/mois)"):r.includes("Auth FT")?c.push("Identifiants France Travail invalides"):c.push(0===t?`Google Jobs : ${r}`:`France Travail : ${r}`)}});let T=Date.now()-6048e5,E=p.filter(e=>0===e.postedTs||e.postedTs>=T),h=new Set,f=E.filter(e=>{let t=w(`${e.title} ${e.company}`);return!h.has(t)&&(h.add(t),!0)});return(f.sort((e,t)=>(t.postedTs||0)-(e.postedTs||0)),0===f.length&&c.length>0)?N.NextResponse.json({items:[],error:c.join(" · ")},{status:502}):(g.set(l,{items:f,at:Date.now()}),N.NextResponse.json({items:v(f,o),cachedAt:Date.now(),cached:!1,warnings:c.length?c:void 0}))}e.s(["GET",0,b],85935);var U=e.i(85935);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/feed/route",pathname:"/api/feed",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/feed/route.ts",nextConfigOutput:"",userland:U,...{}}),{workAsyncStorage:C,workUnitAsyncStorage:D,serverHooks:I}=O;async function P(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let N="/api/feed/route";N=N.replace(/\/index$/,"")||"/";let R=await O.prepare(e,t,{srcPage:N,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:g,deploymentId:w,params:A,nextConfig:v,parsedUrl:L,isDraftMode:S,prerenderManifest:y,routerServerContext:x,isOnDemandRevalidate:_,revalidateOnlyGenerated:b,resolvedPathname:U,clientReferenceManifest:C,serverActionsManifest:D}=R,I=(0,o.normalizeAppPath)(N),P=!!(y.dynamicRoutes[I]||y.routes[U]),X=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,L,!1):t.end("This page could not be found"),null);if(P&&!S){let e=!!y.routes[U],t=y.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(v.adapterPath)return await X();throw new f.NoFallbackError}}let F=null;!P||O.isDev||S||(F="/index"===(F=U)?"/":F);let j=!0===O.isDev||!P,k=P&&!j;D&&C&&(0,s.setManifestsSingleton)({page:N,clientReferenceManifest:C,serverActionsManifest:D});let q=e.method||"GET",M=(0,i.getTracer)(),$=M.getActiveScopeSpan(),G=!!(null==x?void 0:x.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),B=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,v,y,H);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let K={params:A,previewProps:y.preview,renderOpts:{experimental:{authInterrupts:!!v.experimental.authInterrupts},cacheComponents:!!v.cacheComponents,supportsDynamicResponse:j,incrementalCache:B,cacheLifeProfiles:v.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>O.onRequestError(e,t,a,n,x)},sharedContext:{buildId:g,deploymentId:w}},Y=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),z=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>O.handle(z,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${q} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${q} ${N}`)}),o=async n=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!H&&_&&b&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=K.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)(Y,W,i,K.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:N,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:_})},!1,x),t}},d=await O.handleResponse({req:e,nextConfig:v,cacheKey:F,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:b,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!P)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",_?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&P||c.delete(h.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,E.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(Y,W,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};G&&$?await o($):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(c.BaseServerSpan.handleRequest,{spanName:`${q} ${N}`,kind:i.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof f.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:_})},!1,x),P)throw t;return await (0,p.sendResponse)(Y,W,new Response(null,{status:500})),null}}e.s(["handler",0,P,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:D})},"routeModule",0,O,"serverHooks",0,I,"workAsyncStorage",0,C,"workUnitAsyncStorage",0,D],19357)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0qgxs59._.js.map