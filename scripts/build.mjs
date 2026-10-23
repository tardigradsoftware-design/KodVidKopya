#!/usr/bin/env node
// KodVid derleme betigi.
// 1) awesome-claude-video-skills listesini + extras.json'i okur
// 2) Her reponun GitHub bilgisini (lisans, yildiz, skill dosyasi) toplar
// 3) Izinli lisansli ve guvenli olanlarin skill dosyalarini sabit commit'ten skills/ altina indirir
// 4) catalog/ altinda makine ve insan icin katalog uretir
// Gereken: Node 18+, giris yapilmis GitHub CLI (gh). Indirilen dosyalar asla calistirilmaz.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { selectFiles, applyBudget, TEXT } from './select.mjs';

const ex = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');
const CATALOG = path.join(ROOT, 'catalog');
const LIST_REPO = 'zhuyansen/awesome-claude-video-skills';
const PERMISSIVE = ['MIT', 'MIT-0', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'Unlicense', 'CC0-1.0'];
// Copyleft lisanslar da lisans metniyle birlikte yeniden dagitima izin verir; bu klasorler kendi lisanslarini korur
const COPYLEFT = ['AGPL-3.0', 'GPL-3.0', 'GPL-2.0', 'LGPL-3.0', 'LGPL-2.1', 'MPL-2.0', 'CC-BY-4.0', 'CC-BY-SA-4.0'];
const REDISTRIBUTABLE = [...PERMISSIVE, ...COPYLEFT];
const CATEGORY_TR = {
  engine: 'Motorlar', general: 'Cerceveler ve arac kitleri', promo: 'Tanitim ve demo', explainer: 'Egitici ve anlatim',
  editing: 'Kurgu ve duzenleme', shorts: 'Kisa video ve sosyal medya', avatar: 'Avatar ve dudak senkronu',
  story: 'Hikaye ve animasyon', motion: 'Hareketli grafik', craft: 'Senaryo ve on hazirlik', music: 'Muzik videosu',
  media: 'Medya cekirdegi ve altyapi', editor: 'Ajan uyumlu video editorleri', mcp: 'MCP sunuculari',
  pipeline: 'Uctan uca uretim hatlari', audio: 'Ses, altyazi ve muzik', meta: 'Skill standardi ve guvenlik', list: 'Kuratorlu listeler',
};
const ENGINES = [
  ['remotion', /remotion/i], ['hyperframes', /hyperframes?/i], ['manim', /\bmanim/i], ['motion-canvas', /motion[- ]canvas/i],
  ['revideo', /revideo/i], ['ffmpeg', /ffmpeg/i], ['moviepy', /moviepy/i], ['lottie', /lottie/i], ['gsap', /\bgsap\b/i],
  ['threejs', /three\.?js|\bthree\b.*webgl/i], ['p5js', /\bp5(\.js|\.brush)?\b/i], ['blender', /blender/i],
  ['html-canvas', /\bcanvas\b|\bhtml\b.*\bvideo\b/i], ['ai-video-model', /\b(veo|sora|kling|runway|seedance|ltx|wan2|hailuo|minimax)\b/i],
  ['tts', /\b(tts|text[- ]to[- ]speech|elevenlabs|voiceover|narration)\b/i],
];

const log = (...a) => console.error(...a);
const gh = async (args) => (await ex('gh', args, { maxBuffer: 1 << 28 })).stdout;
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } })); }
const slug = (repo) => repo.replace('/', '__');
const safePath = (p) => !/[:*?"<>|]/.test(p) && !p.split('/').some((s) => s === '..' || s === '' || /[. ]$/.test(s));

// 1) Liste
function parseList(md) {
  const out = new Map(); let section = null;
  for (const l of md.split('\n')) {
    const a = l.match(/<a id="type-([a-z]+)"><\/a>/); if (a) { section = a[1]; continue; }
    if (/<a id="(tested|made-with-opus-55)">/.test(l)) { section = null; continue; }
    if (!section) continue;
    const m = l.match(/^\| \[[^\]]+\]\(https:\/\/github\.com\/([^)]+?)\/?\) \| [^|]* \| (.*) \| \[([A-Z]+)\]/);
    if (m && !out.has(m[1].toLowerCase())) out.set(m[1].toLowerCase(), { repo: m[1], category: section, securityGrade: m[3], source: LIST_REPO });
  }
  return [...out.values()];
}

// 2) GitHub bilgisi (40'arli GraphQL)
async function enrich(list) {
  for (let s = 0; s < list.length; s += 40) {
    const chunk = list.slice(s, s + 40);
    const q = 'query{' + chunk.map((r, i) => { const [o, n] = r.repo.split('/');
      return `r${i}: repository(owner:${JSON.stringify(o)}, name:${JSON.stringify(n)}) { nameWithOwner url description stargazerCount isArchived pushedAt licenseInfo{spdxId} primaryLanguage{name} defaultBranchRef{name target{oid}} a: object(expression:"HEAD:SKILL.md"){id} b: object(expression:"HEAD:skills"){id} c: object(expression:"HEAD:.claude/skills"){id} }`; }).join('\n') + '}';
    let res; try { res = await gh(['api', 'graphql', '-f', `query=${q}`]); } catch (e) { res = e.stdout; }
    const data = JSON.parse(res || '{}').data || {};
    chunk.forEach((r, i) => { const d = data[`r${i}`]; if (!d) { r.missing = true; return; }
      Object.assign(r, { repo: d.nameWithOwner, url: d.url, description: d.description, stars: d.stargazerCount, archived: d.isArchived,
        pushedAt: d.pushedAt, license: d.licenseInfo?.spdxId ?? null, language: d.primaryLanguage?.name ?? null,
        branch: d.defaultBranchRef?.name, sha: d.defaultBranchRef?.target?.oid, hasSkillFiles: !!(d.a || d.b || d.c) }); });
    log(`bilgi: ${Math.min(s + 40, list.length)}/${list.length}`);
  }
}

function decide(r) {
  if (r.missing) return ['catalog-only', 'Repo bulunamadi veya erisilemiyor'];
  if (r.securityGrade === 'CAUTION') return ['catalog-only', 'Guvenlik notu CAUTION, icerik alinmadi'];
  if (extras.exclude?.[r.repo]?.includes('*')) return ['catalog-only', 'Elle haric tutuldu: video disi genel amacli skill seti'];
  // Izinli lisansta tum agac taranir; SKILL.md bulunmazsa sonradan catalog-only olur
  if (REDISTRIBUTABLE.includes(r.license)) return ['vendored', null];
  if (!r.hasSkillFiles) return ['catalog-only', 'Bilinen konumda SKILL.md yok (motor veya arac reposu)'];
  if (!r.license) return ['local-sync', 'Lisans yok: buraya kopyalanmaz; skill dizinde var, ajan gerektiginde klonlar'];
  return ['local-sync', `${r.license} lisansi: buraya kopyalanmaz; skill dizinde var, ajan gerektiginde klonlar`];
}

// 3) Dosyalari indir
async function fetchRaw(repo, sha, p) {
  const url = `https://raw.githubusercontent.com/${repo}/${sha}/${p.split('/').map(encodeURIComponent).join('/')}`;
  for (let t = 0; t < 3; t++) { try { const r = await fetch(url); if (r.ok) return Buffer.from(await r.arrayBuffer()); if (r.status === 404) return null; } catch {} await new Promise((s) => setTimeout(s, 1000 * (t + 1))); }
  return null;
}
async function vendor(r) {
  const dir = path.join(SKILLS, slug(r.repo));
  const srcFile = path.join(dir, 'SOURCE.json');
  const excl = (extras.exclude?.[r.repo] || []).map((s) => new RegExp(s));
  const exclKey = (extras.exclude?.[r.repo] || []).join('|');
  if (fs.existsSync(srcFile)) { const old = JSON.parse(fs.readFileSync(srcFile, 'utf8')); if (old.sha === r.sha && (old.exclude || '') === exclKey) { r.vendor = old; return; } }
  const tree = JSON.parse(await gh(['api', `repos/${r.repo}/git/trees/${r.sha}?recursive=1`])).tree;
  let { roots, files, kind } = selectFiles(tree);
  if (r.mode === 'examples') { // ornek kod reposu: tum metin dosyalari, butce icinde
    kind = 'examples'; roots = [''];
    files = tree.filter((x) => x.type === 'blob' && TEXT.test(x.path) && x.size < 150000 && !/(^|\/)(node_modules|dist|\.git)(\/|$)|lock(\.json|\.yaml)?$/i.test(x.path));
  }
  const { keep, dropped } = applyBudget(files.filter((f) => safePath(f.path) && !excl.some((re) => re.test(f.path))));
  fs.rmSync(dir, { recursive: true, force: true });
  if (!keep.length) { r.vendor = { files: 0 }; return; }
  fs.mkdirSync(dir, { recursive: true });
  let ok = 0;
  await pool(keep, 12, async (f) => { const buf = await fetchRaw(r.repo, r.sha, f.path); if (!buf) return; const out = path.join(dir, 'files', f.path); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf); ok++; });
  try { const lic = JSON.parse(await gh(['api', `repos/${r.repo}/license`])); fs.writeFileSync(path.join(dir, 'LICENSE'), Buffer.from(lic.content, 'base64')); } catch {}
  const notice = tree.find((x) => x.type === 'blob' && /^NOTICE(\.md|\.txt)?$/i.test(x.path));
  if (notice) { const b = await fetchRaw(r.repo, r.sha, notice.path); if (b) fs.writeFileSync(path.join(dir, 'NOTICE'), b); }
  r.vendor = { repo: r.repo, url: r.url, sha: r.sha, license: r.license, fetchedAt: new Date().toISOString(), kind, exclude: exclKey, skillRoots: roots, files: ok, droppedByBudget: dropped };
  fs.writeFileSync(srcFile, JSON.stringify(r.vendor, null, 2));
}

// 4) Skill dizini
function frontmatter(txt) {
  const m = txt.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/); const fm = {}; if (!m) return fm;
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const k = lines[i].match(/^([A-Za-z_-]+):\s*(.*)$/); if (!k) continue;
    let v = k[2].trim();
    if (/^[>|][-+]?$/.test(v) || v === '') { const buf = []; while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) buf.push(lines[++i].trim()); v = buf.join(' '); }
    fm[k[1]] = v.replace(/^(['"])([\s\S]*)\1$/, '$2');
  }
  return fm;
}
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }
function engines(text) { return ENGINES.filter(([, re]) => re.test(text)).map(([n]) => n); }

// Lisansi kopyalamaya izin vermeyen repolarin skill'lerini sadece dizine ekler (ad, kisa aciklama, yol).
// Icerik bu repoya kopyalanmaz; ajan gerektiginde repoyu kendi ortamina klonlar.
async function indexExternal(repos) {
  const out = [];
  await pool(repos.filter((r) => r.status === 'local-sync' && r.sha), 6, async (r) => {
    try {
      const tree = JSON.parse(await gh(['api', `repos/${r.repo}/git/trees/${r.sha}?recursive=1`])).tree;
      const { roots, kind } = selectFiles(tree);
      if (kind !== 'skill') return;
      const seen = new Set();
      for (const root of roots.sort((a, b) => /(^|\/)\./.test(a) - /(^|\/)\./.test(b) || a.localeCompare(b))) {
        const p = tree.find((x) => x.type === 'blob' && x.path.toLowerCase() === (root ? root + '/' : '').toLowerCase() + 'skill.md');
        if (!p) continue;
        const buf = await fetchRaw(r.repo, r.sha, p.path); if (!buf) continue;
        const txt = buf.toString('utf8'); const fm = frontmatter(txt);
        const h = crypto.createHash('sha1').update(txt.replace(/\r\n/g, '\n').trim()).digest('hex');
        if (seen.has(h)) continue; seen.add(h);
        const dir = root || '.';
        out.push({ id: `ext/${slug(r.repo)}/${dir}`, name: fm.name || path.basename(root || r.repo), description: (fm.description || '').slice(0, 600),
          path: p.path, dir, repo: r.repo, category: r.category, license: r.license, stars: r.stars, kind: 'skill', external: true,
          clone: `git clone -q --depth 1 https://github.com/${r.repo}.git /home/user/ext/${slug(r.repo)}`,
          localDir: `/home/user/ext/${slug(r.repo)}${root ? '/' + root : ''}`,
          engines: engines(`${fm.description || ''}\n${txt.slice(0, 20000)}\n${r.description || ''}`), sizeKB: Math.round(p.size / 1024), hash: h });
      }
    } catch (e) { log(`dis dizin hatasi ${r.repo}: ${String(e.message).slice(0, 100)}`); }
  });
  log(`dis skill: ${out.length}`);
  return out;
}

function buildSkillIndex(repos, extra = []) {
  const skills = [...extra];
  for (const r of repos.filter((x) => x.status === 'vendored')) {
    const base = path.join(SKILLS, slug(r.repo), 'files'); if (!fs.existsSync(base)) continue;
    let entries = walk(base).filter((p) => /^skill\.md$/i.test(path.basename(p)));
    if (!entries.length) { // rehber reposu: en uygun kok dosyayi giris noktasi yap
      const pick = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'].map((n) => path.join(base, n)).find((p) => fs.existsSync(p))
        || fs.readdirSync(base).filter((n) => /GUIDE.*\.md$/i.test(n)).map((n) => path.join(base, n))[0]
        || [path.join(base, 'README.md')].find((p) => fs.existsSync(p));
      if (pick) entries = [pick];
    }
    // Gizli klasordeki (.claude/.agents) aynalar sonra gelsin; ayni icerik repo icinde bir kez sayilir
    const isDot = (p) => /[\\/]\.[a-z]+[\\/]/i.test(path.relative(base, p));
    entries.sort((a, b) => isDot(a) - isDot(b) || a.localeCompare(b));
    const seenHash = new Set();
    for (const f of entries) {
      const txt = fs.readFileSync(f, 'utf8'); const fm = frontmatter(txt);
      const h = crypto.createHash('sha1').update(txt.replace(/\r\n/g, '\n').trim()).digest('hex');
      if (seenHash.has(h)) continue; seenHash.add(h);
      if (!/^skill\.md$/i.test(path.basename(f))) { fm.name ||= r.repo.split('/')[1]; fm.description ||= r.description || r.note || ''; }
      const rel = path.relative(ROOT, f).split(path.sep).join('/');
      const skillDir = path.dirname(rel);
      skills.push({ id: `${slug(r.repo)}/${path.relative(base, path.dirname(f)).split(path.sep).join('/') || '.'}`, name: fm.name || path.basename(path.dirname(f)),
        description: (fm.description || '').slice(0, 600), path: rel, dir: skillDir, repo: r.repo, category: r.category, license: r.license,
        stars: r.stars, kind: r.mode === 'examples' ? 'examples' : /^skill\.md$/i.test(path.basename(f)) ? 'skill' : 'guide', engines: engines(`${fm.description || ''}\n${txt.slice(0, 20000)}\n${r.description || ''}`), sizeKB: Math.round(fs.statSync(f).size / 1024), hash: h });
    }
  }
  skills.sort((a, b) => (b.stars || 0) - (a.stars || 0) || a.id.localeCompare(b.id));
  // Repolar arasi birebir kopyalar: en cok yildizli olan asil, digerleri duplicateOf ile isaretlenir
  const first = new Map();
  for (const s of skills) { if (first.has(s.hash)) s.duplicateOf = first.get(s.hash); else first.set(s.hash, s.id); delete s.hash; }
  return skills;
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').slice(0, 140);
function catalogMd(repos, skills) {
  const st = { vendored: 'Icerik repoda', 'local-sync': 'Dizinde, ajan klonlar', 'catalog-only': 'Sadece katalog' };
  let md = `# KodVid Katalogu\n\nBu dosya \`node scripts/build.mjs\` ile uretilir, elle duzenlemeyin.\n\n`;
  md += `| Durum | Repo sayisi |\n|---|---:|\n`; for (const k of Object.keys(st)) md += `| ${st[k]} | ${repos.filter((r) => r.status === k).length} |\n`;
  md += `\nToplam skill: **${skills.length}**\n\n`;
  for (const cat of Object.keys(CATEGORY_TR)) {
    const rs = repos.filter((r) => r.category === cat).sort((a, b) => (b.stars || 0) - (a.stars || 0)); if (!rs.length) continue;
    md += `## ${CATEGORY_TR[cat]} (${rs.length})\n\n| Repo | Yildiz | Lisans | Durum | Skill | Aciklama |\n|---|---:|---|---|---:|---|\n`;
    for (const r of rs) md += `| [${r.repo}](${r.url || 'https://github.com/' + r.repo}) | ${r.stars ?? '?'} | ${r.license ?? 'yok'} | ${st[r.status]} | ${skills.filter((s) => s.repo === r.repo).length || ''} | ${esc(r.description || r.note)} |\n`;
    md += '\n';
  }
  return md;
}
function noticesMd(repos) {
  let md = `# Ucuncu Taraf Lisanslari\n\n\`skills/\` altindaki her klasor kendi lisansini tasir. Asil lisans metni her klasorun \`LICENSE\` dosyasindadir.\nBu icerikler KodVid'in kendi lisansina tabi degildir.\n\n| Klasor | Kaynak | Commit | Lisans |\n|---|---|---|---|\n`;
  for (const r of repos.filter((x) => x.status === 'vendored').sort((a, b) => a.repo.localeCompare(b.repo)))
    md += `| skills/${slug(r.repo)} | [${r.repo}](${r.url}) | \`${(r.sha || '').slice(0, 10)}\` | ${r.license} |\n`;
  return md + `\nKatalog verileri kismen [${LIST_REPO}](https://github.com/${LIST_REPO}) listesinden derlenmistir (kategori ve guvenlik notlari).\n`;
}

// Calistir
const listMd = await gh(['api', `repos/${LIST_REPO}/contents/README.md`, '-H', 'Accept: application/vnd.github.raw']);
const repos = parseList(listMd);
const seen = new Set(repos.map((r) => r.repo.toLowerCase()));
const extras = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'extras.json'), 'utf8'));
for (const e of extras.repos) {
  if (!seen.has(e.repo.toLowerCase())) { repos.push({ ...e, securityGrade: null, source: 'KodVid' }); seen.add(e.repo.toLowerCase()); }
  else Object.assign(repos.find((r) => r.repo.toLowerCase() === e.repo.toLowerCase()), { ...(e.note && { note: e.note }), ...(e.mode && { mode: e.mode }), ...(e.category && { category: e.category }) });
}
// Diger kuratorlu listelerdeki github linkleri
const NOT_REPO = /^(topics|sponsors|user-attachments|orgs|features|marketplace|apps|settings|login|about|collections|trending|search|issues|pulls|notifications)$/i;
for (const l of extras.lists) {
  let md = ''; try { md = await gh(['api', `repos/${l.repo}/contents/README.md`, '-H', 'Accept: application/vnd.github.raw']); } catch { log(`liste okunamadi: ${l.repo}`); continue; }
  let added = 0;
  for (const [, o, n] of md.matchAll(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g)) {
    const repo = `${o}/${n.replace(/\.git$/, '')}`;
    if (NOT_REPO.test(o) || repo.toLowerCase() === l.repo.toLowerCase() || seen.has(repo.toLowerCase())) continue;
    seen.add(repo.toLowerCase()); repos.push({ repo, category: l.category, securityGrade: null, source: l.repo }); added++;
  }
  log(`liste ${l.repo}: ${added} yeni repo`);
}
log(`liste: ${repos.length} repo`);
await enrich(repos);
const missing = repos.filter((r) => r.missing).map((r) => r.repo);
if (missing.length) { log(`bulunamayan ${missing.length} repo katalogdan cikarildi:\n  ${missing.join('\n  ')}`); fs.mkdirSync(CATALOG, { recursive: true }); fs.writeFileSync(path.join(CATALOG, 'missing.json'), JSON.stringify(missing, null, 2)); }
// Yonlendirilen (yeniden adlandirilmis) repolar ayni gercek ada duser: ilkini tut
const uniq = new Map(); for (const r of repos.filter((x) => !x.missing)) { const k = r.repo.toLowerCase(); if (!uniq.has(k)) uniq.set(k, r); else Object.assign(uniq.get(k), { note: uniq.get(k).note || r.note }); }
repos.splice(0, repos.length, ...uniq.values());
for (const r of repos) [r.status, r.reason] = decide(r);
const todo = repos.filter((r) => r.status === 'vendored');
let done = 0;
await pool(todo, 4, async (r) => { try { await vendor(r); } catch (e) { r.status = 'catalog-only'; r.reason = `Indirme hatasi: ${String(e.message).slice(0, 120)}`; } log(`indirme: ${++done}/${todo.length} ${r.repo}`); });
for (const r of repos.filter((x) => x.status === 'vendored' && !(x.vendor?.files > 0))) { r.status = 'catalog-only'; r.reason = 'Secilebilir skill dosyasi bulunamadi'; fs.rmSync(path.join(SKILLS, slug(r.repo)), { recursive: true, force: true }); }
const keepDirs = new Set(repos.filter((r) => r.status === 'vendored').map((r) => slug(r.repo)));
if (fs.existsSync(SKILLS)) for (const d of fs.readdirSync(SKILLS)) if (!keepDirs.has(d)) fs.rmSync(path.join(SKILLS, d), { recursive: true, force: true });

const skills = buildSkillIndex(repos, await indexExternal(repos));
fs.mkdirSync(CATALOG, { recursive: true });
const repoOut = repos.map(({ vendor: v, ...r }) => ({ ...r, skillCount: skills.filter((s) => s.repo === r.repo).length, vendoredFiles: v?.files ?? 0 }))
  .sort((a, b) => (b.stars || 0) - (a.stars || 0));
fs.writeFileSync(path.join(CATALOG, 'repos.json'), JSON.stringify(repoOut, null, 2));
fs.writeFileSync(path.join(CATALOG, 'skills.json'), JSON.stringify(skills, null, 2));
fs.writeFileSync(path.join(CATALOG, 'CATALOG.md'), catalogMd(repoOut, skills));
fs.writeFileSync(path.join(ROOT, 'THIRD_PARTY_NOTICES.md'), noticesMd(repos));
console.log((await ex('node', [path.join(ROOT, 'scripts', 'make-index.mjs')])).stdout.trim());
const by = (s) => repoOut.filter((r) => r.status === s).length;
console.log(`Bitti. repo=${repoOut.length} repoda=${by('vendored')} yerel=${by('local-sync')} katalog=${by('catalog-only')} skill=${skills.length}`);
