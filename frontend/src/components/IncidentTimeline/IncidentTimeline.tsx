import React from 'react';
import type { TimelineEvent } from '../../types';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

const TYPE_ICONS: Record<string, string> = {
  config_change:  '⚙',
  traffic_spike:  '↑',
  error_rate:     '✕',
  deployment:     '⬆',
  db_connection:  '⬡',
  thread_pool:    '⊞',
  latency:        '⏱',
  acknowledgment: '◎',
};

const TYPE_COLORS: Record<string, string> = {
  config_change:  '#f59e0b',
  traffic_spike:  '#f97316',
  error_rate:     '#ef4444',
  deployment:     '#3b82f6',
  db_connection:  '#ef4444',
  thread_pool:    '#f97316',
  latency:        '#ef4444',
  acknowledgment: '#10b981',
};

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {events.map((event, idx) => {
        const color = TYPE_COLORS[event.type] || '#6b7280';
        const icon  = TYPE_ICONS[event.type] || '·';

        return (
          <div key={event.id} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '5px 6px', borderRadius: 3,
            background: idx === events.length - 1 ? 'rgba(16,185,129,0.06)' : 'transparent',
            transition: 'background 200ms',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,200,240,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = idx === events.length - 1 ? 'rgba(16,185,129,0.06)' : 'transparent')}
          >
            {/* Timeline spine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: `${color}22`, border: `1px solid ${color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, color,
              }}>{icon}</div>
              {idx < events.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 6, background: 'rgba(0,200,240,0.1)', margin: '2px 0' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  fontWeight: 600, color, letterSpacing: '0.03em',
                }}>{event.label}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
                  color: 'rgba(139,158,199,0.5)',
                }}>{event.timestamp}</span>
              </div>
              <p style={{ fontSize: 10, color: '#8b9ec7', lineHeight: 1.4, margin: 0 }}>{event.detail}</p>
              {event.actor && (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
                  color: '#4a5a80', marginTop: 1, display: 'block',
                }}>by {event.actor}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
