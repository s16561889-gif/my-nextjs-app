import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: '你好！這是從後端傳來的訊息！',
    time: new Date().toLocaleString('zh-TW'),
  })
}