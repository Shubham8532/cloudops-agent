import React from 'react';
import type { Incident, TimelineEvent } from '../../types';

interface BottomBarProps {
  incident: Incident;
  events: TimelineEvent[];
}

const EVENT_COLORS: Record<string, string> = {
  config_change:  '#f59e0b',
  traffic_spike:  '#f97316',
  error_rate:     '#ef4444',
  deployment:     '#3b82f6',
  db_connection:  '#ef4444',
  thread_pool:    '#f97316',
  latency:        '#ef4444',
  acknowledgment: '#10b981',
};

const EVENT_LABELS: Record<string, string> = {
  config_change:  'Config Change',
  traffic_spike:  'Traffic Spike',
  error_rate:     'Error Rate↑',
  deployment:     'Deployment',
  db_connection:  'DB Exhaust',
  thread_pool:    'Thread Pool',
  latency:        'Latency Spike',
  acknowledgment: 'INC Fired',
};

export const BottomBar: React.FC<BottomBarProps> = ({ incident, events }) => {
  // Map events to x% positions on timeline (14:17 → 14:32 window = 15 min)
  const windowStart = 14 * 60 + 17; // minutes
  const windowEnd   = 14 * 60 + 33;
  const windowDur   = windowEnd - windowStart;

  const toX = (ts: string) => {
    const [h, m] = ts.split(':').map(Number);
    const mins = h * 60 + m;
    return Math.min(100, Math.max(0, ((mins - windowStart) / windowDur) * 100));
  };

  return (
    <div style={{
      height: 64, flexShrink: 0,
      background: 'rgba(5,8,16,0.95)',
      borderTop: '1px solid rgba(0,200,240,0.1)',
      display: 'flex', alignItems: 'stretch',
      overflow: 'hidden',
    }}>
      {/* KPIs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRight: '1px solid rgba(0,200,240,0.08)', flexShrink: 0 }}>
        <BottomKPI label="TIME TO DETECTION" value={incident.timeToDetection} color="#f59e0b" />
        <div style={{ width: 1, height: 32, background: 'rgba(0,200,240,0.08)' }} />
        <BottomKPI label="TIME TO ACK" value={incident.timeToAck} color="#00c8f0" />
        <div style={{ width: 1, height: 32, background: 'rgba(0,200,240,0.08)' }} />
        <BottomKPI label="AI CONFIDENCE" value={`${Math.round(incident.aiConfidence * 100)}%`} color="#fbbf24" />
      </div>

      {/* Timeline ruler */}
      <div style={{ flex: 1, position: 'relative', padding: '6px 16px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
          color: 'rgba(0,200,240,0.4)', letterSpacing: '0.1em', marginBottom: 4,
        }}>INCIDENT TIMELINE · 14:17 – 14:33 UTC</div>

        {/* Ruler track */}
        <div style={{ position: 'relative', height: 28, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(0,200,240,0.08)' }}>
          {/* Incident active region */}
          <div style={{
            position: 'absolute',
            left: `${toX('14:32')}%`,
            width: '100%',
            height: '100%',
            background: 'rgba(239,68,68,0.06)',
            borderLeft: '1px solid rgba(239,68,68,0.3)',
          }} />

          {/* Events */}
          {events.map(event => {
            const x = toX(event.timestamp);
            const color = EVENT_COLORS[event.type] || '#6b7280';
            const label = EVENT_LABELS[event.type] || event.label;
            return (
              <div
                key={event.id}
                title={`${event.timestamp} — ${event.detail}`}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 1, height: '100%', background: `${color}60` }} />
                <div style={{
                  position: 'absolute', top: 2,
                  background: `${color}20`, border: `1px solid ${color}50`,
                  borderRadius: 2, padding: '1px 4px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 6.5,
                  color, whiteSpace: 'nowrap',
                  transform: 'translateX(-50%)',
                }}>{label}</div>
                <div style={{
                  position: 'absolute', bottom: 3,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 6,
                  color: `${color}90`, whiteSpace: 'nowrap',
                  transform: 'translateX(-50%)',
                }}>{event.timestamp}</div>
              </div>
            );
          })}

          {/* "Now" cursor */}
          <div style={{
            position: 'absolute', right: 0, top: 0, height: '100%',
            width: 2, background: 'rgba(0,200,240,0.6)',
            boxShadow: '0 0 6px rgba(0,200,240,0.4)',
          }} />
        </div>
      </div>
    </div>
  );
};

const BottomKPI: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, color: 'rgba(139,158,199,0.4)', letterSpacing: '0.1em' }}>{label}</span>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color }}>{value}</span>
  </div>
);
