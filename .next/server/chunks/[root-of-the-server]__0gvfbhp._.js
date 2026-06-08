module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},25302,(e,t,r)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},62294,e=>{"use strict";var t=e.i(25302),r=e.i(22734);let a=e.i(14747).default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,r){this.sqlDb=e,this.dbPath=t,this.sql=r}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let r={};for(let[t,a]of Object.entries(e[0]))r[`@${t}`]=a??null;t.bind(r)}return t}get(...e){let t=this.prepareAndBind(e),r=t.step()?{...t.getAsObject()}:void 0;return t.free(),r}all(...e){let t=this.prepareAndBind(e),r=[];for(;t.step();)r.push({...t.getAsObject()});return t.free(),r}run(...e){let t=this.prepareAndBind(e);t.step();let a=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,n=this.sqlDb.getRowsModified();return t.free(),r.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),d=r.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:a,changes:n}}}class s{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let i=`
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
`,o=null,l=null,d=0;async function u(){return o||(o=await (0,t.default)()),o}async function E(){let e,t=0;try{t=r.default.statSync(a).mtimeMs}catch{}if(l&&t===d)return l;let n=await u();if(r.default.existsSync(a)){let t=r.default.readFileSync(a);e=new n.Database(t)}else e=new n.Database;return e.exec(i),r.default.writeFileSync(a,Buffer.from(e.export())),d=r.default.statSync(a).mtimeMs,l=new s(e,a)}e.s(["getDb",0,E])},9930,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),E=e.i(47587),p=e.i(66012),c=e.i(70101),T=e.i(26937),R=e.i(10372),N=e.i(93695);e.i(52474);var h=e.i(220),f=e.i(89171),A=e.i(62294);async function L(e,{params:t}){let{id:r}=await t,a=await (0,A.getDb)(),n=a.prepare("SELECT * FROM jobs WHERE id = ?").get(r);if(!n)return f.NextResponse.json({error:"Not found"},{status:404});let s=a.prepare("SELECT * FROM activities WHERE job_id = ? ORDER BY created_at ASC").all(r);return f.NextResponse.json({...n,activities:s})}async function x(e,{params:t}){let{id:r}=await t,a=await (0,A.getDb)(),n=await e.json(),s=a.prepare("SELECT * FROM jobs WHERE id = ?").get(r);if(!s)return f.NextResponse.json({error:"Not found"},{status:404});let i=new Set(["url","title","company","location","remote","start_date","salary","contract_type","summary","description","contact_name","contact_email","contact_linkedin","network_connection","status","applied_date","response_date","response_type","response_notes","added_by","priority","tags"]),o=Object.keys(n).filter(e=>i.has(e)).map(e=>`${e} = @${e}`).join(", ");o&&a.prepare(`UPDATE jobs SET ${o} WHERE id = @id`).run({...n,id:r}),n.status&&n.status!==s.status&&a.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'status', ?, ?)
    `).run(r,`Statut → ${{todo:"📋 À explorer",ready:"✏️ À postuler",applied:"🚀 Candidature envoyée",followup:"📣 Relance effectuée",interview:"🤝 Entretien",offer:"🎉 Offre reçue",rejected:"😔 Refus",archived:"📦 Archivé"}[n.status]??n.status}`,n.author??"Équipe"),n.note&&a.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'note', ?, ?)
    `).run(r,n.note,n.author??"Équipe");let l=a.prepare("SELECT * FROM jobs WHERE id = ?").get(r);return f.NextResponse.json(l)}async function b(e,{params:t}){let{id:r}=await t;return(await (0,A.getDb)()).prepare("DELETE FROM jobs WHERE id = ?").run(r),f.NextResponse.json({ok:!0})}e.s(["DELETE",0,b,"GET",0,L,"PATCH",0,x],63272);var m=e.i(63272);let v=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/jobs/[id]/route",pathname:"/api/jobs/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/jobs/[id]/route.ts",nextConfigOutput:"",userland:m,...{}}),{workAsyncStorage:w,workUnitAsyncStorage:y,serverHooks:O}=v;async function _(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),v.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let f="/api/jobs/[id]/route";f=f.replace(/\/index$/,"")||"/";let A=await v.prepare(e,t,{srcPage:f,multiZoneDraftMode:!1});if(!A)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:L,deploymentId:x,params:b,nextConfig:m,parsedUrl:w,isDraftMode:y,prerenderManifest:O,routerServerContext:_,isOnDemandRevalidate:g,revalidateOnlyGenerated:U,resolvedPathname:C,clientReferenceManifest:S,serverActionsManifest:I}=A,D=(0,o.normalizeAppPath)(f),j=!!(O.dynamicRoutes[D]||O.routes[C]),X=async()=>((null==_?void 0:_.render404)?await _.render404(e,t,w,!1):t.end("This page could not be found"),null);if(j&&!y){let e=!!O.routes[C],t=O.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(m.adapterPath)return await X();throw new N.NoFallbackError}}let q=null;!j||v.isDev||y||(q="/index"===(q=C)?"/":q);let F=!0===v.isDev||!j,P=j&&!F;I&&S&&(0,i.setManifestsSingleton)({page:f,clientReferenceManifest:S,serverActionsManifest:I});let M=e.method||"GET",k=(0,s.getTracer)(),H=k.getActiveScopeSpan(),G=!!(null==_?void 0:_.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await v.getIncrementalCache(e,m,O,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:b,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!m.experimental.authInterrupts},cacheComponents:!!m.cacheComponents,supportsDynamicResponse:F,incrementalCache:K,cacheLifeProfiles:m.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>v.onRequestError(e,t,a,n,_)},sharedContext:{buildId:L,deploymentId:x}},$=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>v.handle(V,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${M} ${f}`)}),o=async n=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!B&&g&&U&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=Y.renderOpts.fetchMetrics;let o=Y.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=Y.renderOpts.collectedTags;if(!j)return await (0,p.sendResponse)($,W,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await v.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:g})},!1,_),t}},d=await v.handleResponse({req:e,nextConfig:m,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:U,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!j)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",g?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),y&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,c.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&j||u.delete(R.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,T.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,W,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};G&&H?await o(H):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(u.BaseServerSpan.handleRequest,{spanName:`${M} ${f}`,kind:s.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof N.NoFallbackError||await v.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:g})},!1,_),j)throw t;return await (0,p.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,_,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:y})},"routeModule",0,v,"serverHooks",0,O,"workAsyncStorage",0,w,"workUnitAsyncStorage",0,y],9930)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0gvfbhp._.js.map