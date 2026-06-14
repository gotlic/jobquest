module.exports=[93695,(e,t,T)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,T)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,T)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,T)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,T)=>{t.exports=e.x("crypto",()=>require("crypto"))},25302,(e,t,T)=>{t.exports=e.x("sql.js-59d66b30daa0a8d2",()=>require("sql.js-59d66b30daa0a8d2"))},22734,(e,t,T)=>{t.exports=e.x("fs",()=>require("fs"))},62294,68105,e=>{"use strict";var t=e.i(25302),T=e.i(22734),E=e.i(14747),a=e.i(54799);let s=process.env.TOKEN_SECRET??"jq_tok_s3cr3t_d3f4ult_k3y_2024";function r(e){return(0,a.createHash)("sha256").update(e+"jq_pw_salt_2024").digest("hex")}e.s(["SPACE_COOKIE",0,"jq_space","createSpaceToken",0,function(e){let t=String(e),T=(0,a.createHmac)("sha256",s).update(t).digest("hex");return`${t}.${T}`},"hashPassword",0,r],68105);let i=E.default.join(process.cwd(),"jobsearch.db");class n{sqlDb;dbPath;sql;constructor(e,t,T){this.sqlDb=e,this.dbPath=t,this.sql=T}prepareAndBind(e){let t=this.sqlDb.prepare(this.sql);if(0===e.length)return t;if(1!==e.length||"object"!=typeof e[0]||null===e[0]||Array.isArray(e[0]))t.bind(e.map(e=>void 0===e?null:e));else{let T={};for(let[t,E]of Object.entries(e[0]))T[`@${t}`]=E??null;t.bind(T)}return t}get(...e){let t=this.prepareAndBind(e),T=t.step()?{...t.getAsObject()}:void 0;return t.free(),T}all(...e){let t=this.prepareAndBind(e),T=[];for(;t.step();)T.push({...t.getAsObject()});return t.free(),T}run(...e){let t=this.prepareAndBind(e);t.step();let E=this.sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0]??0,a=this.sqlDb.getRowsModified();return t.free(),T.default.writeFileSync(this.dbPath,Buffer.from(this.sqlDb.export())),p=T.default.statSync(this.dbPath).mtimeMs,{lastInsertRowid:E,changes:a}}}class N{sqlDb;dbPath;constructor(e,t){this.sqlDb=e,this.dbPath=t}prepare(e){return new n(this.sqlDb,this.dbPath,e)}exec(e){this.sqlDb.exec(e)}pragma(e){return null}}let d=`
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
`;function l(e,t,T){try{let E=e.exec(`PRAGMA table_info(${t})`);if(!E[0])return!1;let a=E[0].columns.indexOf("name");return E[0].values.some(e=>e[a]===T)}catch{return!1}}function c(e,t){try{let T=e.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${t}'`);return!!T[0]?.values?.length}catch{return!1}}let L=null,o=null,p=0;async function _(){return L||(L=await (0,t.default)()),L}async function U(){let e,t=0;try{t=T.default.statSync(i).mtimeMs}catch{}if(o&&t===p)return o;let E=await _();if(T.default.existsSync(i)){let t=T.default.readFileSync(i);e=new E.Database(t)}else e=new E.Database;return e.exec(d),!function(e){e.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");let t=new Set;try{let T=e.exec("SELECT name FROM migrations");T[0]?.values.forEach(e=>t.add(e[0]))}catch{}let T=c(e,"feed_blocklist"),E=c(e,"feed_blocklist_new");if(!T&&E)try{e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist")}catch{}if(!t.has("spaces_v1")){for(let t of(c(e,"spaces")||e.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),["jobs","cvs","cv_categories","cover_letters"]))if(c(e,t)&&!l(e,t,"space_id"))try{e.exec(`ALTER TABLE ${t} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`)}catch{}c(e,"feed_blocklist")&&!l(e,"feed_blocklist","space_id")&&(c(e,"feed_blocklist_new")&&e.exec("DROP TABLE feed_blocklist_new"),e.exec(`CREATE TABLE feed_blocklist_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id INTEGER NOT NULL DEFAULT 1,
        kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
        value TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (space_id, kind, value)
      )`),e.exec(`INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
        SELECT 1, kind, value, label, created_at FROM feed_blocklist`),e.exec("DROP TABLE feed_blocklist"),e.exec("ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist"));let t=r("lic12@"),T=r("tomot123");e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${t}')`),e.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${T}')`),e.exec("INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')")}}(e),T.default.writeFileSync(i,Buffer.from(e.export())),p=T.default.statSync(i).mtimeMs,o=new N(e,i)}e.s(["getDb",0,U],62294)},88942,e=>{"use strict";var t=e.i(37709);e.s(["default",()=>t.Anthropic])},6714,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_fs_1t1l-4-._.js"].map(t=>e.l(t))).then(()=>t(2157)))},11105,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_path_1pmhwj3._.js"].map(t=>e.l(t))).then(()=>t(50227)))},46735,e=>{e.v(t=>Promise.all(["server/chunks/[externals]__1j5vgk-._.js","server/chunks/[root-of-the-server]__1fbyaci._.js"].map(t=>e.l(t))).then(()=>t(83085)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1jmijiq._.js.map