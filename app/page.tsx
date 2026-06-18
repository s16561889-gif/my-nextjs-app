'use client'

import { useState } from 'react'

export default function HomePage() {
  const [likes, setLikes] = useState(0)
  const [message, setMessage] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchAPI() {
    const res = await fetch('/api/hello')
    const data = await res.json()
    setMessage(data.message)
  }

  async function askGemini() {
    if (!question.trim()) return
    setLoading(true)
    setAnswer('')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    })
    const data = await res.json()
    setAnswer(data.reply)
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6 p-8">
      <h1 className="text-5xl font-bold text-blue-600">
        我的第一個 Next.js 網站
      </h1>
      <p className="text-xl text-gray-500">期末作業，我做到了！</p>

      <button
        onClick={() => setLikes(likes + 1)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 text-lg"
      >
        Like ({likes})
      </button>

      <button
        onClick={fetchAPI}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 text-lg"
      >
        呼叫後端 API
      </button>

      {message && (
        <p className="text-lg text-green-600 font-medium">{message}</p>
      )}

      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-purple-600">Gemini AI 對話</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askGemini()}
          placeholder="輸入問題，按 Enter 或送出..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-purple-400"
        />
        <button
          onClick={askGemini}
          disabled={loading}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-lg"
        >
          {loading ? '思考中...' : '送出問題'}
        </button>
        {answer && (
          <div className="bg-purple-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">
        作者：{process.env.NEXT_PUBLIC_AUTHOR}
      </p>
    </main>
  )
}