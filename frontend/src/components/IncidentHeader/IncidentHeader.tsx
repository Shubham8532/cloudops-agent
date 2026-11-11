import React from 'react';
import type { Incident } from '../../types';

interface IncidentHeaderProps {
  incident: Incident;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const SEV_COLORS: Record<string, string> = {
  'SEV-1': '#ef4444',
  'SEV-2': '#f97316',
  'SEV-3': '#f59e0b',
  'SEV-4': '#3b82f6',
};

const TIME_RANGES = ['5m', '15m', '1h', '3h', '24h'];

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({
  incident, timeRange, onTimeRangeChange
}) => {
  const sevColor = SEV_COLORS[incident.severity];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '0 16px',
      height: 44,
      background: 'rgba(5,8,16,0.95)',
      borderBottom: '1px solid rgba(0,200,240,0.1)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 4,
          background: 'linear-gradient(135deg, #00c8f0 0%, #0060a0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>⬡</div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          fontWeight: 700, color: '#00c8f0', letterSpacing: '0.05em',
        }}>CloudOps</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
          color: 'rgba(139,158,199,0.5)', background: 'rgba(0,200,240,0.08)',
          border: '1px solid rgba(0,200,240,0.15)', borderRadius: 2,
          padding: '1px 4px', letterSpacing: '0.1em',
        }}>AGENT · V1</span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 28, background: 'rgba(0,200,240,0.1)', marginRight: 20 }} />

      {/* Incident ID */}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        fontWeight: 700, color: '#e0eaff', marginRight: 12, letterSpacing: '0.02em',
      }}>
        INCIDENT <span style={{ color: '#00c8f0' }}>{incident.id}</span>
      </div>

      {/* Severity badge */}
      <div style={{
        padding: '2px 8px', borderRadius: 3, marginRight: 16,
        background: `${sevColor}22`,
        border: `1px solid ${sevColor}66`,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, fontWeight: 800, color: sevColor,
        letterSpacing: '0.05em', animation: 'pulse-red 2s infinite',
      }}>
        {incident.severity}
      </div>

      {/* Title */}
      <div style={{
        flex: 1, fontSize: 12, color: '#c0cce8',
        fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        marginRight: 24,
      }}>
        {incident.title}
      </div>

      {/* Duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginRight: 20 }}>
        <MetricItem label="DURATION" value={incident.duration} color="#f59e0b" />
        <MetricItem label="STARTED" value="14:32:11 UTC" color="#8b9ec7" />
        <MetricItem label="AI CONF" value={`${Math.round(incident.aiConfidence * 100)}%`} color="#00c8f0" />
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 28, background: 'rgba(0,200,240,0.1)', marginRight: 16 }} />

      {/* Time range selector */}
      <div style={{ display: 'flex', gap: 2 }}>
        {TIME_RANGES.map(r => (
          <button
            key={r}
            onClick={() => onTimeRangeChange(r)}
            style={{
              padding: '3px 8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, fontWeight: 600, letterSpacing: '0.05em',
              background: timeRange === r ? 'rgba(0,200,240,0.15)' : 'transparent',
              border: `1px solid ${timeRange === r ? 'rgba(0,200,240,0.4)' : 'rgba(0,200,240,0.1)'}`,
              borderRadius: 3, color: timeRange === r ? '#00c8f0' : '#4a5a80',
              cursor: 'pointer', transition: 'all 120ms ease',
            }}
          >{r}</button>
        ))}
      </div>

      {/* Sim indicator */}
      <div style={{
        marginLeft: 16, padding: '2px 6px',
        background: 'rgba(139,158,199,0.06)',
        border: '1px solid rgba(139,158,199,0.12)',
        borderRadius: 2,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
        color: 'rgba(139,158,199,0.45)', letterSpacing: '0.1em',
      }}>DEMO DATA</div>
    </header>
  );
};

const MetricItem: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(139,158,199,0.5)', letterSpacing: '0.1em' }}>{label}</span>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color }}>{value}</span>
  </div>
);
