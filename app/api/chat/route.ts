import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'API Key 未設定' }, { status: 500 })
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash'})
    const result = await model.generateContent(message)
    const text = result.response.text()
    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ reply: '發生錯誤，請稍後再試' }, { status: 500 })
  }
}