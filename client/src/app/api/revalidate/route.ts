import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

async function isAuthorizedRevalidateRequest(request: NextRequest, bodySecret?: string | null): Promise<boolean> {
  const { searchParams } = new URL(request.url);
  const secret = bodySecret ?? searchParams.get('secret');

  if (REVALIDATION_SECRET && secret && secret === REVALIDATION_SECRET) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/analytics/settings/`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
      return verifyRes.ok;
    } catch {
      return false;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);

    const authorized = await isAuthorizedRevalidateRequest(request, body.secret);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid admin session or revalidation secret required' },
        { status: 401 }
      );
    }

    const paths: string[] = Array.isArray(body.paths)
      ? body.paths
      : body.path
      ? [body.path]
      : searchParams.get('path')
      ? [searchParams.get('path')!]
      : [];

    const tags: string[] = Array.isArray(body.tags)
      ? body.tags
      : body.tag
      ? [body.tag]
      : searchParams.get('tag')
      ? [searchParams.get('tag')!]
      : [];

    if (paths.length === 0 && tags.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Please provide at least one path or tag to revalidate.' },
        { status: 400 }
      );
    }

    const revalidatedPaths: string[] = [];
    for (const p of paths) {
      try {
        revalidatePath(p);
        revalidatedPaths.push(p);
      } catch (e) {
        console.error(`[Revalidate] Failed to revalidate path: ${p}`, e);
      }
    }

    const revalidatedTags: string[] = [];
    for (const t of tags) {
      try {
        revalidateTag(t);
        revalidatedTags.push(t);
      } catch (e) {
        console.error(`[Revalidate] Failed to revalidate tag: ${t}`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'On-demand revalidation executed successfully.',
      revalidatedPaths,
      revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Revalidate API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during revalidation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const tag = searchParams.get('tag');

  const authorized = await isAuthorizedRevalidateRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized: Valid admin session or revalidation secret required' }, { status: 401 });
  }

  if (!path && !tag) {
    return NextResponse.json({ error: 'Please provide path or tag parameter' }, { status: 400 });
  }

  if (path) {
    revalidatePath(path);
  }
  if (tag) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    success: true,
    revalidatedPath: path || null,
    revalidatedTag: tag || null,
    timestamp: new Date().toISOString(),
  });
}
