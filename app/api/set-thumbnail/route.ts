import { NextRequest, NextResponse } from 'next/server';

/**
 * Commits a captured video frame as a project's thumbnail, in one atomic commit:
 *   - public/uploads/thumbnails/<id>.jpg   (the image)
 *   - content/projects/<id>.yaml           (thumbnailUpload set to the image)
 *
 * Auth: requires the x-admin-secret header to match THUMBNAIL_ADMIN_SECRET.
 * Writes via the GitHub Git Data API using GITHUB_TOKEN (Contents: read/write).
 */

const OWNER = 'aravian69';
const REPO = 'Aravian-Portfolio';
const BRANCH = 'main';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

function gh(token: string) {
  return (path: string, init?: RequestInit) =>
    fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.headers || {}),
      },
    });
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const secret = process.env.THUMBNAIL_ADMIN_SECRET;
  if (!token || !secret) {
    return NextResponse.json({ error: 'Server not configured (missing GITHUB_TOKEN / THUMBNAIL_ADMIN_SECRET).' }, { status: 500 });
  }
  if (req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, imageBase64 } = await req.json().catch(() => ({}));
  if (typeof projectId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 });
  }
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    return NextResponse.json({ error: 'Missing image' }, { status: 400 });
  }
  // Accept a data URL or raw base64.
  const b64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const api = gh(token);
  const filename = `${projectId}.jpg`;
  const imagePath = `public/uploads/thumbnails/${filename}`;
  const yamlPath = `content/projects/${projectId}.yaml`;

  try {
    // 1. Current branch tip + base tree
    const refRes = await api(`/git/ref/heads/${BRANCH}`);
    if (!refRes.ok) throw new Error(`ref ${refRes.status}`);
    const latestSha = (await refRes.json()).object.sha;
    const baseTree = (await (await api(`/git/commits/${latestSha}`)).json()).tree.sha;

    // 2. Current project YAML (must exist)
    const fileRes = await api(`/contents/${yamlPath}?ref=${BRANCH}`);
    if (!fileRes.ok) return NextResponse.json({ error: `Unknown project: ${projectId}` }, { status: 404 });
    let yaml = Buffer.from((await fileRes.json()).content, 'base64').toString('utf8');
    // Point thumbnailUpload at the new image (replace if present, else insert before thumbnail:).
    if (/^thumbnailUpload:.*$/m.test(yaml)) {
      yaml = yaml.replace(/^thumbnailUpload:.*$/m, `thumbnailUpload: ${filename}`);
    } else if (/^thumbnail:/m.test(yaml)) {
      yaml = yaml.replace(/^thumbnail:/m, `thumbnailUpload: ${filename}\nthumbnail:`);
    } else {
      yaml = `thumbnailUpload: ${filename}\n${yaml}`;
    }

    // 3. Blobs (image + yaml), tree, commit, move the branch
    const imageBlob = (await (await api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: b64, encoding: 'base64' }) })).json()).sha;
    const yamlBlob = (await (await api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: yaml, encoding: 'utf-8' }) })).json()).sha;

    const tree = (await (await api('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTree,
        tree: [
          { path: imagePath, mode: '100644', type: 'blob', sha: imageBlob },
          { path: yamlPath, mode: '100644', type: 'blob', sha: yamlBlob },
        ],
      }),
    })).json()).sha;

    const commit = (await (await api('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: `Set ${projectId} thumbnail from frame picker`, tree, parents: [latestSha] }),
    })).json()).sha;

    const move = await api(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit }) });
    if (!move.ok) throw new Error(`ref update ${move.status}`);

    return NextResponse.json({ ok: true, commit });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'commit failed' }, { status: 502 });
  }
}
