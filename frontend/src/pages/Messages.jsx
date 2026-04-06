import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchRecentContacts, fetchChatThread, sendDirectMessage, blockUser, unblockUser, updateUserPrivacy } from '../services/api';
import { Send, User, Shield, ShieldOff, Eye, EyeOff, MessageSquare, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import '../index.css';

const Messages = () => {
  const { user, updateUserLocal } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const chatEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadContacts();
    return () => clearInterval(pollingRef.current);
  }, []);

  const loadContacts = async () => {
    try {
      const data = await fetchRecentContacts();
      setContacts(data);
      if (data.length > 0 && !activePartner) {
        // Automatically select first contact if none selected
        setActivePartner(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePartner) {
      loadThread(activePartner.id);
      
      // Real-time polling every 3 seconds
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => loadThread(activePartner.id, false), 3000);
    }
  }, [activePartner]);

  const loadThread = async (id, showLoading = true) => {
    try {
      const data = await fetchChatThread(id);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activePartner) return;

    try {
      await sendDirectMessage(activePartner.id, input);
      setInput('');
      loadThread(activePartner.id, false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send message.");
    }
  };

  const handleToggleBlock = async () => {
    if (!activePartner) return;
    try {
      if (activePartner.isBlockedByMe) {
        await unblockUser(activePartner.id);
      } else {
        await blockUser(activePartner.id);
      }
      loadContacts();
      // Update local partner state
      setActivePartner(prev => ({ ...prev, isBlockedByMe: !prev.isBlockedByMe }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const newStatus = !user.allowReadReceipts;
      await updateUserPrivacy(newStatus);
      updateUserLocal({ allowReadReceipts: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', height: '85vh', padding: 0, overflow: 'hidden' }}>
      
      {/* Sidebar: Contacts */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <MessageSquare size={18} color="var(--accent-blue)" /> Messages
          </h3>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px', fontSize: '0.9rem' }}>
              No private conversations yet. Start chatting from the Section Lounge!
            </p>
          )}
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setActivePartner(contact)}
              style={{ 
                padding: '16px 24px', 
                cursor: 'pointer', 
                background: activePartner?.id === contact.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                {contact.name.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {contact.name}
                  {(contact.isBlockedByMe || contact.isBlockedByThem) && <Shield size={12} color="#ef4444" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.course}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Shortcuts */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={handleTogglePrivacy}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border-subtle)', 
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            {user.allowReadReceipts ? <Eye size={14} /> : <EyeOff size={14} />}
            {user.allowReadReceipts ? 'Read Receipts: ON' : 'Read Receipts: OFF'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                    {activePartner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{activePartner.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>
                      {activePartner.isBlockedByMe ? 'You blocked this user' : activePartner.isBlockedByThem ? 'User unavailable' : 'Connected'}
                    </span>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleToggleBlock}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activePartner.isBlockedByMe ? 'var(--accent-blue)' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  >
                    {activePartner.isBlockedByMe ? <ShieldOff size={18} /> : <Shield size={18} />}
                    {activePartner.isBlockedByMe ? 'Unblock' : 'Block'}
                  </button>
               </div>
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {messages.length === 0 && (
                 <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
                    <p>Start a new private discussion with {activePartner.name}!</p>
                 </div>
               )}
               {messages.map(msg => (
                 <div 
                   key={msg.id} 
                   style={{ 
                     alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                     maxWidth: '70%',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '4px'
                   }}
                 >
                    <div style={{ 
                      padding: '12px 18px', 
                      borderRadius: msg.senderId === user.id ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.senderId === user.id ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                      color: 'white',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      border: msg.senderId === user.id ? 'none' : '1px solid var(--border-subtle)'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--text-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.senderId === user.id && (
                        <span style={{ color: msg.isRead ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                          {msg.isRead === null ? '' : (msg.isRead ? '• Read' : '• Sent')}
                        </span>
                      )}
                    </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  className="glass-input" 
                  placeholder={activePartner.isBlockedByMe || activePartner.isBlockedByThem ? "Messaging restricted" : "Type a message..." }
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={activePartner.isBlockedByMe || activePartner.isBlockedByThem}
                />
                <button 
                  type="submit" 
                  className="primary-button" 
                  style={{ width: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={!input.trim() || activePartner.isBlockedByMe || activePartner.isBlockedByThem}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '16px' }}>
             <MessageSquare size={64} style={{ opacity: 0.1 }} />
             <p>Select a contact to start chatting privately.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
