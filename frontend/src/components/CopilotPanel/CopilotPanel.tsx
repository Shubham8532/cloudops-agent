import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AgentActivity } from '../../types';

interface CopilotPanelProps {
  messages: ChatMessage[];
  agentActivity: AgentActivity[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  thinking:       '◌',
  querying:       '⬡',
  analyzing:      '⊞',
  hypothesis:     '◈',
  recommendation: '→',
  complete:       '✓',
};

const ACTIVITY_COLORS: Record<string, string> = {
  thinking:       '#8b9ec7',
  querying:       '#00c8f0',
  analyzing:      '#f59e0b',
  hypothesis:     '#a78bfa',
  recommendation: '#34d399',
  complete:       '#10b981',
};

const SAMPLE_QUESTIONS = [
  'What is the root cause?',
  'What is the blast radius?',
  'Which deployment caused this?',
  'How do I fix this?',
];

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ messages, agentActivity }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(messages);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString().substring(11, 16),
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulated agent response
    setTimeout(() => {
      setIsTyping(false);
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'agent',
        content: getSimulatedResponse(query),
        timestamp: new Date().toISOString().substring(11, 16),
      };
      setChatHistory(prev => [...prev, agentMsg]);
    }, 1400 + Math.random() * 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,200,240,0.1)', flexShrink: 0 }}>
        {(['chat', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '7px 0',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: activeTab === tab ? '#00c8f0' : '#4a5a80',
              background: activeTab === tab ? 'rgba(0,200,240,0.06)' : 'transparent',
              border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#00c8f0' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 120ms',
            }}
          >
            {tab === 'chat' ? '◈ Investigate' : '⬡ Agent Activity'}
          </button>
        ))}
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Sim notice */}
            <div style={{
              padding: '5px 8px', borderRadius: 3,
              background: 'rgba(139,158,199,0.06)', border: '1px solid rgba(139,158,199,0.12)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
              color: 'rgba(139,158,199,0.5)', letterSpacing: '0.05em',
            }}>
              ⚠ SIMULATED AGENT — NOT CONNECTED TO AZURE · Demo responses only
            </div>

            {chatHistory.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AgentAvatar />
                <div style={{
                  padding: '8px 12px', borderRadius: '0 6px 6px 6px',
                  background: 'rgba(0,200,240,0.06)', border: '1px solid rgba(0,200,240,0.15)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: '50%', background: '#00c8f0',
                      animation: `pulse-amber ${0.8 + i * 0.15}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick questions */}
          <div style={{
            padding: '6px 12px', borderTop: '1px solid rgba(0,200,240,0.08)',
            display: 'flex', flexWrap: 'wrap', gap: 4,
          }}>
            {SAMPLE_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  padding: '3px 8px', borderRadius: 3,
                  background: 'rgba(0,200,240,0.06)', border: '1px solid rgba(0,200,240,0.15)',
                  color: '#8b9ec7', fontSize: 9, cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.03em',
                  transition: 'all 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,240,0.12)'; e.currentTarget.style.color = '#00c8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,240,0.06)'; e.currentTarget.style.color = '#8b9ec7'; }}
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 12px', borderTop: '1px solid rgba(0,200,240,0.1)',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this incident…"
              style={{
                flex: 1, background: 'rgba(13,21,40,0.8)',
                border: '1px solid rgba(0,200,240,0.2)', borderRadius: 4,
                color: '#e0eaff', fontSize: 11, padding: '6px 10px',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,200,240,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,200,240,0.2)'; }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                padding: '6px 14px', borderRadius: 4,
                background: 'rgba(0,200,240,0.15)', border: '1px solid rgba(0,200,240,0.35)',
                color: '#00c8f0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
                transition: 'all 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,240,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,240,0.15)'; }}
            >SEND</button>
          </div>
        </>
      ) : (
        /* Agent activity stream */
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(139,158,199,0.4)',
            letterSpacing: '0.1em', marginBottom: 4,
          }}>SIMULATED AGENT TRACE · INC-4821 ANALYSIS</div>
          {agentActivity.map((item, idx) => {
            const color = ACTIVITY_COLORS[item.type];
            const icon  = ACTIVITY_ICONS[item.type];
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '5px 6px', borderRadius: 3,
                  background: item.type === 'complete' ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${item.type === 'complete' ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
                  animation: `fadeIn 300ms ${idx * 50}ms ease both`,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color,
                }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <span style={{ fontSize: 10, color: '#c0cce8', fontWeight: 500 }}>{item.message}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4a5a80', flexShrink: 0, marginLeft: 6 }}>{item.timestamp}</span>
                  </div>
                  {item.detail && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: color, opacity: 0.7 }}>
                      {item.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AgentAvatar: React.FC = () => (
  <div style={{
    width: 22, height: 22, borderRadius: 4, flexShrink: 0,
    background: 'linear-gradient(135deg, rgba(0,200,240,0.3), rgba(0,96,160,0.3))',
    border: '1px solid rgba(0,200,240,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, color: '#00c8f0',
  }}>⬡</div>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '80%', padding: '7px 10px',
          background: 'rgba(0,200,240,0.08)', border: '1px solid rgba(0,200,240,0.2)',
          borderRadius: '6px 0 6px 6px',
          fontSize: 11, color: '#c0cce8', lineHeight: 1.5,
        }}>{message.content}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <AgentAvatar />
      <div style={{
        maxWidth: '88%', padding: '8px 10px',
        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,200,240,0.1)',
        borderRadius: '0 6px 6px 6px',
        fontSize: 11, color: '#c0cce8', lineHeight: 1.6,
      }}>
        <FormattedText text={message.content} />
        <div style={{
          marginTop: 4, fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8, color: 'rgba(139,158,199,0.4)',
        }}>{message.timestamp} · SIMULATED</div>
      </div>
    </div>
  );
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: '#00c8f0', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('root cause') || q.includes('why')) {
    return '**Root cause (91% confidence):** DB connection pool was reduced from 200→50 by jane.doe at 14:17 UTC.\n\nThis caused pool exhaustion during a flash-sale traffic spike (+420% baseline), creating a cascade: checkout → payment → Stripe timeout chain.';
  }
  if (q.includes('blast') || q.includes('radius') || q.includes('impact')) {
    return '**Blast radius:** ~3,820 checkout requests/min failing. Estimated 847 orders affected since 14:32 UTC. Revenue impact: ~$4,200/min. Kafka queue is healthy — orders will replay on recovery.';
  }
  if (q.includes('deploy') || q.includes('change')) {
    return '3 changes detected in the last 2h:\n\n1. **Config change** (15m ago) — max_connections 200→50 · jane.doe · **91% correlated**\n2. Deployment payment-svc v2.4.2 (38m ago) · ci-bot · 34% correlated\n3. Feature flag enable_new_checkout_flow (76m ago) · alice.z · 22% correlated';
  }
  if (q.includes('fix') || q.includes('how') || q.includes('resolve')) {
    return '**Immediate fix:**\n1. Revert max_connections to 200 in checkout-svc config (ETA ~3min)\n2. If errors persist after revert → scale pods from 4→12 replicas\n3. Enable Stripe circuit breaker to drain retry queue\n\nRunbook: rb://checkout-cascade';
  }
  return `I'm analyzing your question about "${query}" in the context of INC-4821. Based on current telemetry, the checkout service cascade is the primary focus. What specific aspect would you like to investigate?`;
}
