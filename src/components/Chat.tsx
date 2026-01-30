'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'

const SUGGESTED_QUESTIONS = [
  '¿Cómo está mi market share esta semana?',
  '¿Cuáles son mis productos top?',
  '¿Dónde tengo oportunidades de crecimiento?',
  '¿Cómo está mi precio vs competencia?',
  'Dame el Perfect Store Score por región'
]

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intentá de nuevo.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Asistente PerfectStore</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Preguntame sobre tus ventas, market share, o cualquier métrica
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-4">
              Probá alguna de estas preguntas:
            </p>
            {SUGGESTED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => sendMessage(question)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm text-gray-700"
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu pregunta..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
