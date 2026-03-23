import { NextResponse } from 'next/server';

type JsonBody = Parameters<typeof NextResponse.json>[0];
type JsonInit = Parameters<typeof NextResponse.json>[1];

export function jsonUtf8(body: JsonBody, init?: JsonInit) {
  const headers = new Headers(init?.headers);
  const contentType = headers.get('content-type');

  if (!contentType) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  } else if (contentType.toLowerCase().startsWith('application/json') && !/charset=/i.test(contentType)) {
    headers.set('Content-Type', `${contentType}; charset=utf-8`);
  }

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}
