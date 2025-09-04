import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import Storage from '../data/storage'
import type { Message, User } from '../data/models'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentSession } from '../lib/auth'
import { achievementTriggers } from '../store/achievements'

export function Chat() {
  const session = getCurrentSession()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [peerId, setPeerId] = useState('')
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ;(async () => {
      setUsers(await Storage.getAll<User>('users'))
      setMessages(await Storage.getAll<Message>('messages'))
    })()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, peerId])

  const thread = useMemo(() => {
    if (!session || !peerId) return [] as Message[]
    return messages
      .filter(m => (m.fromUserId === session.userId && m.toUserId === peerId) || (m.fromUserId === peerId && m.toUserId === session.userId))
      .sort((a,b) => a.timestamp - b.timestamp)
  }, [messages, peerId])

  const send = async () => {
    if (!session || !peerId || !text.trim()) return
    const msg: Message = {
      id: Storage.generateId('msg'),
      fromUserId: session.userId,
      toUserId: peerId,
      timestamp: Date.now(),
      text: text.trim(),
    }
    await Storage.put('messages', msg)
    setMessages(await Storage.getAll<Message>('messages'))
    setText('')
    
    // Trigger achievement
    achievementTriggers.onMessageSent()
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="chat-page">
        <div className="container">
          <div className="chat-header">
            <h1 className="chat-title">Poruke</h1>
            <p className="chat-subtitle">
              {session?.role === 'trainer' 
                ? 'Komunicirajte s klijentima i pružite podršku' 
                : 'Ostanite u kontaktu s trenerima i postavite pitanja'
              }
            </p>
          </div>

          <div className="chat-content">
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="contacts-card">
                  <div className="contacts-header">
                    <div className="contacts-title">
                      <i className="bi bi-people"></i>
                      <span>Kontakti</span>
                    </div>
                    <div className="contacts-count">
                      {users.filter(u => u.id !== session?.userId).length}
                    </div>
                  </div>
                  
                  <div className="contacts-list">
                    {users.filter(u => u.id !== session?.userId).length === 0 ? (
                      <div className="contacts-empty">
                        <div className="empty-contacts-icon">
                          <i className="bi bi-person-plus"></i>
                        </div>
                        <p className="empty-contacts-text">Nema dostupnih kontakata</p>
                      </div>
                    ) : (
                      users.filter(u => u.id !== session?.userId).map((u) => (
                        <div 
                          key={u.id} 
                          className={`contact-item ${peerId === u.id ? 'active' : ''}`}
                          onClick={() => setPeerId(u.id)}
                        >
                          <div className="contact-avatar">
                            <div className="avatar-circle">
                              <i className="bi bi-person"></i>
                            </div>
                            <div className="status-indicator online"></div>
                          </div>
                          <div className="contact-info">
                            <div className="contact-name">{u.name}</div>
                            <div className="contact-role">
                              {u.role === 'trainer' ? 'Trener' : 'Klijent'}
                            </div>
                          </div>
                          <div className="contact-meta">
                            <i className="bi bi-chevron-right"></i>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="chat-window">
                  <div className="chat-window-header">
                    <div className="chat-peer-info">
                      {peerId ? (
                        <>
                          <div className="peer-avatar">
                            <div className="avatar-circle">
                              <i className="bi bi-person"></i>
                            </div>
                            <div className="status-indicator online"></div>
                          </div>
                          <div className="peer-details">
                            <div className="peer-name">{users.find(u => u.id === peerId)?.name}</div>
                            <div className="peer-status">Online</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="peer-avatar">
                            <div className="avatar-circle">
                              <i className="bi bi-chat-dots"></i>
                            </div>
                          </div>
                          <div className="peer-details">
                            <div className="peer-name">Chat</div>
                            <div className="peer-status">Odaberite kontakt</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="chat-messages">
                    {!peerId ? (
                      <div className="chat-empty-state">
                        <div className="empty-chat-icon">
                          <i className="bi bi-chat-square-text"></i>
                        </div>
                        <h4 className="empty-chat-title">Započnite razgovor</h4>
                        <p className="empty-chat-text">
                          Odaberite kontakt s lijeve strane da započnete razgovor
                        </p>
                      </div>
                    ) : thread.length === 0 ? (
                      <div className="chat-empty-state">
                        <div className="empty-chat-icon">
                          <i className="bi bi-chat-heart"></i>
                        </div>
                        <h4 className="empty-chat-title">Nema poruka</h4>
                        <p className="empty-chat-text">
                          Pošaljite prvu poruku da započnete razgovor s {users.find(u => u.id === peerId)?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="messages-thread">
                        {thread.map((m, index) => {
                          const isMyMessage = m.fromUserId === session?.userId
                          const showAvatar = index === 0 || thread[index - 1].fromUserId !== m.fromUserId
                          const user = users.find(u => u.id === m.fromUserId)
                          
                          return (
                            <div key={m.id} className={`message-group ${isMyMessage ? 'my-message' : 'their-message'}`}>
                              {showAvatar && (
                                <div className="message-avatar">
                                  <div className="avatar-circle">
                                    <i className="bi bi-person"></i>
                                  </div>
                                </div>
                              )}
                              <div className="message-content">
                                {showAvatar && (
                                  <div className="message-sender">
                                    {user?.name}
                                  </div>
                                )}
                                <div className="message-bubble">
                                  <div className="message-text">{m.text}</div>
                                  <div className="message-time">
                                    {new Date(m.timestamp).toLocaleTimeString('bs-BA', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={endRef} />
                      </div>
                    )}
                  </div>

                  <div className="chat-input">
                    <div className="input-wrapper">
                      <input 
                        className="message-input" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                        placeholder={peerId ? "Napišite poruku..." : "Odaberite kontakt da pošaljete poruku"}
                        disabled={!peerId}
                      />
                      <button 
                        className="send-button" 
                        onClick={send} 
                        disabled={!peerId || !text.trim()}
                      >
                        <i className="bi bi-send-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Chat


