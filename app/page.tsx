'use client'

import { useState } from 'react'

export default function HomePage() {
  const [likes, setLikes] = useState(0)
  const [message, setMessage] = useState('')

  async function fetchAPI() {
    const res = await fetch('/api/hello')
    const data = await res.json()
    setMessage(data.message)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6">
      <h1 className="text-5xl font-bold text-blue-600">
        我的第一個 Next.js 網站
      </h1>
      <p className="text-xl text-gray-500">期末作業，我做到了！🎉</p>

      {/* useState 互動按鈕 */}
      <button
        onClick={() => setLikes(likes + 1)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 text-lg"
      >
        👍 Like ({likes})
      </button>

      {/* 呼叫後端 API 按鈕 */}
      <button
        onClick={fetchAPI}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 text-lg"
      >
        呼叫後端 API
      </button>

      {message && (
        <p className="text-lg text-green-600 font-medium">{message}</p>
      )}
      <p className="text-sm text-gray-400">
  作者：{process.env.NEXT_PUBLIC_AUTHOR}
</p>
    </main>
  )
}