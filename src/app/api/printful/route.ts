import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, designName } = await req.json()

    const printfulApiKey = process.env.PRINTFUL_API_KEY

    if (!printfulApiKey) {
      return NextResponse.json(
        { error: 'Printful API not configured' },
        { status: 500 }
      )
    }

    // Upload file to Printful
    const uploadResponse = await fetch('https://api.printful.com/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        type: 'default',
        filename: `${designName}.png`,
      }),
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to Printful')
    }

    const uploadResult = await uploadResponse.json()

    return NextResponse.json({
      success: true,
      fileId: uploadResult.result?.id,
    })
  } catch (error: any) {
    console.error('Error with Printful:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process Printful request' },
      { status: 500 }
    )
  }
}
