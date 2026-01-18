import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { content, role } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a semantic content masking system for confidential business documents. 
    
Transform the following sensitive content into a safe, professional alternative that preserves meaning but removes specifics.
The result must be suitable for the "${role}" role to understand the general concept without sensitive details.

Original content: "${content}"

Rules:
- Keep it brief (1-2 sentences max)
- Maintain professional tone
- Remove all specific numbers, names, and sensitive details
- Use generic but truthful alternatives
- If it's a risk, describe it as a general business challenge
- If it's financial, describe it in general terms

Respond with ONLY the masked content, no explanation.`

    const result = await model.generateContent(prompt)
    const maskedContent = result.response.text()

    return Response.json({
      original: content,
      masked: maskedContent.trim(),
      role,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Semantic masking error:', error)
    return Response.json(
      { error: 'Failed to mask content' },
      { status: 500 }
    )
  }
}
