/**
 * MessagesLayout — Desktop split-pane inbox.
 * Mobile: just renders <Outlet /> (existing behaviour).
 * Desktop (lg+): shows a two-panel layout:
 *   LEFT  320px — conversation list
 *   RIGHT flex-1 — Outlet (empty state or ChatPage)
 */
import { MessageSquareDashed } from 'lucide-react'
import { Outlet, useParams } from 'react-router-dom'
import ConversationList from '../chat/ConversationList'

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4"
      style={{ background: '#0c0c10' }}>
      <div className="w-16 h-16 rounded-[22px] flex items-center justify-center"
        style={{ background: 'rgba(124,106,247,0.07)', border: '1px solid rgba(124,106,247,0.14)' }}>
        <MessageSquareDashed size={28} style={{ color: '#7c6af7', opacity: 0.6 }} />
      </div>
      <div className="text-center">
        <p className="font-bold text-[15px]" style={{ color: '#eeeef2' }}>Select a conversation</p>
        <p className="text-[12px] mt-1.5" style={{ color: '#55555f' }}>
          Choose from your chats on the left to start messaging
        </p>
      </div>
    </div>
  )
}

export default function MessagesLayout() {
  const { chatId } = useParams()

  return (
    <>
      {/* ── Mobile: just the outlet ── */}
      <div className="lg:hidden">
        <Outlet />
      </div>

      {/* ── Desktop: split pane ── */}
      <div
        className="hidden lg:flex"
        style={{
          height: '100vh',   /* full viewport — topbar is hidden on /messages routes */
          background: '#0c0c10',
        }}
      >
        {/* Left panel — conversation list */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: 300,
            borderRight: '1px solid rgba(255,255,255,0.055)',
            background: '#0a0a0e',
          }}
        >
          <ConversationList compact activeChatId={chatId} />
        </div>

        {/* Right panel — chat content or empty state */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {chatId ? <Outlet /> : <EmptyState />}
        </div>
      </div>
    </>
  )
}
