import { NextRequest, NextResponse } from 'next/server'
import { localHeuristicCheck } from '@/lib/detector'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (text.length < 10) {
      return NextResponse.json(
        { error: 'Text must be at least 10 characters' },
        { status: 400 }
      )
    }

    const result = localHeuristicCheck(text)

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Detection failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Stop Slop Drop Top - Heuristic Detector',
    version: '1.0.0',
    methods: ['POST'],
    description: 'Local pattern-based AI text detection',
  })
}
