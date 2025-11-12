import { NextRequest, NextResponse } from 'next/server'
import potrace from 'potrace'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Remove background using remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        size: 'auto',
        format: 'png',
      }),
    })

    if (!removeBgResponse.ok) {
      throw new Error('Failed to remove background')
    }

    const removedBgBuffer = Buffer.from(await removeBgResponse.arrayBuffer())

    // Convert to base64 for returning to client
    const processedImageBase64 = `data:image/png;base64,${removedBgBuffer.toString('base64')}`

    // Generate cut path using Potrace
    // First convert to bitmap
    const bitmap = await sharp(removedBgBuffer)
      .greyscale()
      .threshold(128)
      .toBuffer()

    // Trace the bitmap to SVG path
    const cutPath = await new Promise<string>((resolve, reject) => {
      potrace.trace(bitmap, (err: any, svg: string) => {
        if (err) {
          reject(err)
        } else {
          // Extract just the path data from SVG
          const pathMatch = svg.match(/d="([^"]+)"/)
          resolve(pathMatch ? pathMatch[1] : '')
        }
      })
    })

    return NextResponse.json({
      imageUrl: processedImageBase64,
      cutPath: cutPath,
    })
  } catch (error: any) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}
