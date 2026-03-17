import { NextRequest, NextResponse } from 'next/server'

const WANDBOX_API = 'https://wandbox.org/api/compile.json'

export async function POST(request: NextRequest) {
  try {
    const { code, compiler, stdin } = await request.json()

    if (!code || !compiler) {
      return NextResponse.json(
        { error: 'Missing required fields: code and compiler' },
        { status: 400 }
      )
    }

    const wandboxPayload: Record<string, string> = {
      code,
      compiler,
    }

    if (stdin) {
      wandboxPayload.stdin = stdin
    }

    const response = await fetch(WANDBOX_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
