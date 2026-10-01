import { NextRequest, NextResponse } from 'next/server';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Saves the showreel picker's clip list (/reel) to content/home.yaml as
 * `reelClips`, keeping every other line of that file (e.g. showreelUrl).
 *
 * Auth: x-admin-secret must match THUMBNAIL_ADMIN_SECRET (same passphrase as
 * the frame picker). On Vercel it commits via the GitHub Git Data API using
 * GITHUB_TOKEN, exactly like /api/set-thumbnail, so the save redeploys the
 * site. In local dev without a token it writes the file on disk instead.
 */

const OWNER = 'aravian69';
const REPO = 'Aravian-Portfolio';
const BRANCH = 'main';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const HOME_YAML = 'content/home.yaml';
const MAX_CLIPS = 30;

function gh(token: string) {
  return async (path: string, step: string, init?: RequestInit) => {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.headers || {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`[${step}] ${res.status} ${json?.message || ''}`.trim());
    }
    return json;
  };
}

/** Replace (or add) the reelClips block, leaving the rest of the file alone. */
function withReelClips(yaml: string, ids: string[]): string {
  const block = ids.length ? `reelClips:\n${ids.map((id) => `  - ${id}`).join('\n')}\n` : 'reelClips: []\n';
  const rest = yaml.replace(/^reelClips:.*\n?(?:[ \t]+-.*\n?)*/m, '').replace(/\n*$/, '');
  return rest ? `${rest}\n${block}` : block;
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const secret = process.env.THUMBNAIL_ADMIN_SECRET;
  const localDev = process.env.NODE_ENV === 'development' && !token;

  if (!localDev && (!token || !secret)) {
    return NextResponse.json({ error: 'Server not configured (missing GITHUB_TOKEN / THUMBNAIL_ADMIN_SECRET).' }, { status: 500 });
  }
  if (secret && req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Wrong passphrase.' }, { status: 401 });
  }

  const { ids } = await req.json().catch(() => ({}));
  if (
    !Array.isArray(ids) ||
    ids.length > MAX_CLIPS ||
    !ids.every((id) => typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id))
  ) {
    return NextResponse.json({ error: `Send up to ${MAX_CLIPS} project ids.` }, { status: 400 });
  }
  const clean: string[] = [...new Set(ids as string[])];
  // Each id must be a real project file. (Hidden or non-playable ones are
  // skipped when the reel is built, so existence is all that matters here.)
  // Checked against the repo / disk rather than the content reader, whose
  // files aren't guaranteed to be bundled with this function on Vercel.
  const projectPath = (id: string) => `content/projects/${id}.yaml`;
  const unknown = (have: (path: string) => boolean | Promise<boolean>) =>
    Promise.all(clean.map(async (id) => ((await have(projectPath(id))) ? null : id))).then((r) => r.filter(Boolean));

  if (localDev) {
    const missing = await unknown((p) => access(join(process.cwd(), p)).then(() => true, () => false));
    if (missing.length) return NextResponse.json({ error: `Unknown project: ${missing.join(', ')}` }, { status: 400 });
    const file = join(process.cwd(), HOME_YAML);
    const current = await readFile(file, 'utf8').catch(() => '');
    await writeFile(file, withReelClips(current, clean));
    return NextResponse.json({ ok: true, local: true });
  }

  const api = gh(token!);
  try {
    const ref = await api(`/git/ref/heads/${BRANCH}`, 'get-ref');
    const latestSha = ref.object.sha;
    const baseCommit = await api(`/git/commits/${latestSha}`, 'get-commit');

    const projectsDir = await api(`/contents/content/projects?ref=${BRANCH}`, 'list-projects');
    const inRepo = new Set<string>((projectsDir as { path: string }[]).map((f) => f.path));
    const missing = await unknown((p) => inRepo.has(p));
    if (missing.length) return NextResponse.json({ error: `Unknown project: ${missing.join(', ')}` }, { status: 400 });

    // home.yaml may not exist yet (nothing ever saved on the Home page).
    let current = '';
    try {
      const file = await api(`/contents/${HOME_YAML}?ref=${BRANCH}`, 'get-yaml');
      current = Buffer.from(file.content, 'base64').toString('utf8');
    } catch { /* new file */ }

    const blob = await api('/git/blobs', 'yaml-blob', {
      method: 'POST',
      body: JSON.stringify({ content: withReelClips(current, clean), encoding: 'utf-8' }),
    });
    const tree = await api('/git/trees', 'create-tree', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseCommit.tree.sha,
        tree: [{ path: HOME_YAML, mode: '100644', type: 'blob', sha: blob.sha }],
      }),
    });
    const message = clean.length
      ? `Set showreel clips from picker (${clean.length})`
      : 'Reset showreel to the automatic pick';
    const commit = await api('/git/commits', 'create-commit', {
      method: 'POST',
      body: JSON.stringify({ message, tree: tree.sha, parents: [latestSha] }),
    });
    await api(`/git/refs/heads/${BRANCH}`, 'update-ref', { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });

    return NextResponse.json({ ok: true, commit: commit.sha });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'commit failed' }, { status: 502 });
  }
}
