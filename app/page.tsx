'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'ai'
  content: string
}

interface Note {
  id: string
  content: string
  time: string
}

export default function HomePage() {
  // 1. 控制目前顯示哪個分頁的狀態：'home' | 'about' | 'projects'
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'projects'>('home')

  // AI 聊天相關狀態
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '> 系統初始化完成。我是由 Gemini 2.5 Flash 驅動的 AI 助理。請輸入你的指令...' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 2. 台灣即時時間狀態
  const [time, setTime] = useState('')

  // 3. 筆記本相關狀態
  const [notes, setNotes] = useState<Note[]>([])
  const [noteInput, setNoteInput] = useState('')

  // 處理滾動到最新聊天訊息
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 每秒更新一次台灣時間
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setTime(formatter.format(now))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // 讀取本地儲存的筆記
  useEffect(() => {
    const savedNotes = localStorage.getItem('shen_dev_notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  // 儲存筆記的功能
  const handleAddNote = () => {
    if (!noteInput.trim()) return
    const newNote: Note = {
      id: Date.now().toString(),
      content: noteInput.trim(),
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false })
    }
    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem('shen_dev_notes', JSON.stringify(updatedNotes))
    setNoteInput('')
  }

  // 刪除筆記的功能
  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id)
    setNotes(updatedNotes)
    localStorage.setItem('shen_dev_notes', JSON.stringify(updatedNotes))
  }

  async function fetchAPI() {
    const res = await fetch('/api/hello')
    const data = await res.json()
    setApiMessage(data.message)
  }

  async function askGemini() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '> ERROR: 連線失敗，請稍後再試。' }])
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'Courier New', 'Consolas', monospace",
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* NAV (導航列) */}
      <nav style={{
        borderBottom: '1px solid #1e3a5f',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10,10,20,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <span style={{ color: '#00d4ff', fontSize: '20px' }}>⬡</span>
          <span style={{ color: '#00d4ff', fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '16px' }}>
            SHEN<span style={{ color: '#ffffff' }}>.DEV</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px', color: '#64748b' }}>
          <span onClick={() => setActiveTab('home')} style={{ color: activeTab === 'home' ? '#00d4ff' : '#64748b', cursor: 'pointer', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>// home</span>
          <span onClick={() => setActiveTab('about')} style={{ color: activeTab === 'about' ? '#00d4ff' : '#64748b', cursor: 'pointer', fontWeight: activeTab === 'about' ? 'bold' : 'normal' }}>// about</span>
          <span onClick={() => setActiveTab('projects')} style={{ color: activeTab === 'projects' ? '#00d4ff' : '#64748b', cursor: 'pointer', fontWeight: activeTab === 'projects' ? 'bold' : 'normal' }}>// projects</span>
        </div>
      </nav>

      {/* TAIWAN CLOCK BANNER */}
      <div style={{ background: '#0f172a', padding: '6px 40px', fontSize: '12px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', color: '#00d4ff' }}>
        <span>[ TAIWAN STANDARD TIME: {time || 'CLOCK_INITIALIZING...'} ]</span>
      </div>

      {/* 條件渲染：根據 activeTab 決定顯示什麼畫面 */}
      
      {/* 1. HOME 主頁 (AI聊天室 + 筆記本) */}
      {activeTab === 'home' && (
        <>
          {/* HERO */}
          <section style={{ padding: '60px 40px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ fontSize: '13px', color: '#00d4ff', marginBottom: '16px', letterSpacing: '0.2em' }}>
              {'>'} INITIALIZING PORTFOLIO...
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '20px', fontFamily: 'system-ui, sans-serif' }}>
              <span style={{ color: '#ffffff' }}>AI-Powered</span><br />
              <span style={{ background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Developer Workspace</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7, maxWidth: '600px', fontFamily: 'system-ui, sans-serif' }}>
              整合 Gemini 2.5 Flash API 的全端工作台。除了智慧對話，右側更提供即時的 Local 便箋，讓你在調試代碼與記錄自動化工程靈感時效率翻倍。
            </p>

            {/* STATS ROW */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '30px', flexWrap: 'wrap' }}>
              {[
                { label: 'MODEL', value: 'Gemini 2.5' },
                { label: 'FRAMEWORK', value: 'Next.js 15+' },
                { label: 'DEPLOY', value: 'Vercel' },
                { label: 'STATUS', value: '● ONLINE' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.15em', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '15px', color: stat.label === 'STATUS' ? '#22c55e' : '#00d4ff', fontWeight: 'bold' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* WORKSPACE (左邊聊天、右邊筆記) */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 80px', width: '100%', padding: '0 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
            
            {/* TERMINAL CHAT */}
            <div style={{ border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,212,255,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0f1729', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e3a5f' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                <span style={{ marginLeft: '12px', fontSize: '13px', color: '#475569' }}>gemini-terminal — AI Chat</span>
              </div>

              <div style={{ background: '#050810', padding: '24px', minHeight: '320px', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: msg.role === 'user' ? '#7c3aed' : '#00d4ff', fontSize: '13px', whiteSpace: 'nowrap', paddingTop: '2px' }}>
                      {msg.role === 'user' ? '~ $' : 'AI >'}
                    </span>
                    <span style={{ color: msg.role === 'user' ? '#c4b5fd' : '#94a3b8', fontSize: '14px', lineHeight: 1.7, fontFamily: msg.role === 'ai' ? 'system-ui, sans-serif' : 'inherit', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#00d4ff', fontSize: '13px' }}>AI {'>'}</span>
                    <span style={{ color: '#475569', fontSize: '14px' }}>
                      <span style={{ animation: 'blink 1s infinite' }}>▋</span> 處理中...
                    </span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div style={{ background: '#0a0f1e', borderTop: '1px solid #1e3a5f', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#7c3aed', fontSize: '13px', whiteSpace: 'nowrap' }}>~ $</span>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askGemini()}
                  placeholder="輸入指令..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#c4b5fd', fontSize: '14px', fontFamily: "'Courier New', monospace" }}
                />
                <button onClick={askGemini} disabled={loading} style={{ padding: '8px 20px', background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #00d4ff22, #7c3aed22)', border: '1px solid', borderColor: loading ? '#1e3a5f' : '#00d4ff', borderRadius: '6px', color: loading ? '#475569' : '#00d4ff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                  {loading ? '...' : 'SEND'}
                </button>
              </div>
            </div>

            {/* SCRATCHPAD NOTE (開發筆記本區塊) */}
            <div style={{ border: '1px solid #1e3a5f', borderRadius: '12px', background: '#050810', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#0f1729', padding: '12px 16px', borderBottom: '1px solid #1e3a5f', color: '#7c3aed', fontSize: '13px', fontWeight: 'bold' }}>
                ✍️ LOCAL_SCRATCHPAD.log (臨時隨手記)
              </div>
              <div style={{ padding: '16px', borderBottom: '1px solid #1e3a5f', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="記錄重要的程式碼或想法..."
                  style={{ flex: 1, background: '#0a0f1e', border: '1px solid #1e3a5f', borderRadius: '4px', padding: '6px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={handleAddNote} style={{ background: '#7c3aed', border: 'none', borderRadius: '4px', color: '#fff', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>新增</button>
              </div>
              <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '330px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {notes.length === 0 ? (
                  <div style={{ color: '#475569', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>目前沒有暫存筆記。</div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', position: 'relative' }}>
                      <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>[{note.time}]</div>
                      <div style={{ color: '#cbd5e1', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'system-ui, sans-serif' }}>{note.content}</div>
                      <button onClick={() => handleDeleteNote(note.id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>
        </>
      )}

      {/* 2. ABOUT 畫面 */}
      {activeTab === 'about' && (
        <section style={{ maxWidth: '800px', margin: '60px auto 80px', width: '100%', padding: '0 40px' }}>
          <div style={{ border: '1px solid #1e3a5f', borderRadius: '12px', background: '#050810', padding: '40px', boxShadow: '0 0 40px rgba(0,212,255,0.02)' }}>
            <div style={{ fontSize: '13px', color: '#00d4ff', marginBottom: '10px' }}>{'>'} cat developer_profile.md</div>
            <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '24px', fontFamily: 'system-ui, sans-serif', borderBottom: '1px solid #1e3a5f', paddingBottom: '12px' }}>關於開發者 / About Me</h2>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
              {/* 自動化概念的科技感裝飾圖圈 */}
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', fontSize: '40px', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>🤖</div>
              <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff' }}>沈益吉 (Yi-Ji, Shen)</div>
                <div style={{ color: '#00d4ff', fontSize: '14px', marginTop: '4px' }}>國立勤益科技大學 | 智慧自動化工程系 (四智四甲)</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>學號：3B161051</div>
              </div>
            </div>

            <div style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.8', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                👋 歡迎來到我的個人網路空間！我是沈益吉。本網站是專門為了修習課程<strong>「雲端運算概論」的期末作業要求</strong>所親手架設的。
              </p>
              <p>
                身為智慧自動化工程系的學生，我平常的研究重點在於硬體控制與自動化流程。然而在雲端運算的課堂上，我接觸到了現代 Web 全端開發的迷人世界。本專案透過 <strong>Next.js</strong> 框架建立，並成功將後端 API 與強大的 <strong>Gemini 2.5 Flash</strong> 人工智慧模型進行深度整合。
              </p>
              <p style={{ borderLeft: '3px solid #7c3aed', paddingLeft: '12px', fontStyle: 'italic', color: '#cbd5e1' }}>
                「我堅信，未來的工業 4.0 智慧工廠，不僅需要精準的硬體控制，更需要結合雲端運算與 AI 大模型的智慧大腦。這個網站就是我跨界整合的第一步。」
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. PROJECTS 畫面 */}
      {activeTab === 'projects' && (
        <section style={{ maxWidth: '900px', margin: '60px auto 80px', width: '100%', padding: '0 40px' }}>
          <div style={{ fontSize: '13px', color: '#00d4ff', marginBottom: '10px' }}>{'>'} query --projects --all</div>
          <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '30px', fontFamily: 'system-ui, sans-serif' }}>技術作品集 / Project Collection</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* 卡片 1 */}
            <div style={{ border: '1px solid #1e3a5f', borderRadius: '12px', background: '#050810', padding: '24px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 'bold' }}>[ NEXT.JS + AI ]</span>
                  <span style={{ color: '#22c55e', fontSize: '12px' }}>● ACTIVE</span>
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px', fontFamily: 'system-ui, sans-serif' }}>Gemini 智能終端工作台</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', fontFamily: 'system-ui, sans-serif' }}>
                  就是你目前所在的網站！整合 Next.js 伺服器路由與對流 API，打造出極簡黑客風格的終端對話介面，並串接了 Local 狀態筆記本。
                </p>
              </div>
              <div style={{ marginTop: '20px', color: '#475569', fontSize: '11px' }}>技術棧: Next.js, TypeScript, Gemini API, LocalStorage</div>
            </div>

            {/* 卡片 2 */}
            <div style={{ border: '1px solid #1e3a5f', borderRadius: '12px', background: '#050810', padding: '24px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 'bold' }}>[ HARDWARE CONTROL ]</span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>○ SIMULATION</span>
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px', fontFamily: 'system-ui, sans-serif' }}>智慧自動化工業物聯網模組</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', fontFamily: 'system-ui, sans-serif' }}>
                  結合智慧自動化系上所學，規劃將 PLC（可程式邏輯控制器）數據透過 MQTT 協議上傳至雲端伺服器，實現遠端生產線狀態的可視化監控。
                </p>
              </div>
              <div style={{ marginTop: '20px', color: '#475569', fontSize: '11px' }}>技術棧: MQTT, Node-RED, PLC Logic, Cloud IoT</div>
            </div>

          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #0f1729',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#334155',
        marginTop: 'auto'
      }}>
        <span>© 2026 沈益吉 (3B161051)</span>
        <span style={{ color: '#1e3a5f' }}>國立勤益科技大學 智慧自動化工程系 期末作業</span>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050810; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </main>
  )
}