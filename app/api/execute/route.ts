import { NextRequest, NextResponse } from 'next/server'

const WANDBOX_API = 'https://wandbox.org/api/compile.json'
const CODE_MAX = 65_536
const STDIN_MAX = 65_536
const RATE_LIMIT = 20   // requests per window
const RATE_WINDOW = 60_000  // 1-minute sliding window (ms)

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const prev = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW)
  if (prev.length >= RATE_LIMIT) {
    rateLimitMap.set(ip, prev)
    return true
  }
  prev.push(now)
  rateLimitMap.set(ip, prev)
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before running again.' },
      { status: 429 }
    )
  }

  try {
    const { code, compiler, stdin } = await request.json()

    if (!code || !compiler) {
      return NextResponse.json(
        { error: 'Missing required fields: code and compiler' },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length > CODE_MAX) {
      return NextResponse.json(
        { error: `Code exceeds the ${CODE_MAX}-character limit.` },
        { status: 413 }
      )
    }

    if (stdin && (typeof stdin !== 'string' || stdin.length > STDIN_MAX)) {
      return NextResponse.json(
        { error: `Input exceeds the ${STDIN_MAX}-character limit.` },
        { status: 413 }
      )
    }

    const wandboxPayload: Record<string, string> = { code, compiler }
    if (stdin) wandboxPayload.stdin = stdin

    const response = await fetch(WANDBOX_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wandboxPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Wandbox API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('API route error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
