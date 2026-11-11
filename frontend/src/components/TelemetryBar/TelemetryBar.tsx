import React, { useState, useEffect } from 'react';
import type { ServiceNode } from '../../types';

interface TelemetryBarProps {
  nodes: ServiceNode[];
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ nodes }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // Compute aggregate stats
  const affectedNodes = nodes.filter(n => n.status !== 'healthy');
  const totalRps      = nodes.reduce((s, n) => s + n.throughput, 0);

  // Jitter simulated metrics slightly
  const jitter = (v: number, pct = 0.02) => v * (1 + (Math.random() - 0.5) * pct);

  const metricGroups = [
    {
      title: 'CHECKOUT-SVC',
      metrics: [
        { label: 'ERR RATE', value: `${(jitter(93)).toFixed(1)}%`, color: '#f87171' },
        { label: 'P99',      value: `${(jitter(8200) / 1000).toFixed(1)}s`,  color: '#f87171' },
        { label: 'RPS',      value: `${Math.round(jitter(180))}`, color: '#fbbf24' },
      ],
    },
    {
      title: 'PAYMENT-SVC',
      metrics: [
        { label: 'ERR RATE', value: `${(jitter(71)).toFixed(1)}%`, color: '#f87171' },
        { label: 'P99',      value: `${(jitter(4100) / 1000).toFixed(1)}s`,  color: '#fbbf24' },
        { label: 'RPS',      value: `${Math.round(jitter(95))}`,  color: '#fbbf24' },
      ],
    },
    {
      title: 'DB POOL',
      metrics: [
        { label: 'AVAIL',  value: '0/50',   color: '#f87171' },
        { label: 'WAIT',   value: `${Math.round(jitter(2800))}ms`, color: '#f87171' },
        { label: 'QUEUE',  value: `${Math.round(jitter(1842))}`,   color: '#fbbf24' },
      ],
    },
    {
      title: 'STRIPE API',
      metrics: [
        { label: 'ERR RATE', value: `${(jitter(82)).toFixed(1)}%`, color: '#f87171' },
        { label: 'P99',      value: `${(jitter(9800) / 1000).toFixed(1)}s`,  color: '#f87171' },
        { label: 'TIMEOUT',  value: `${Math.round(jitter(28))}`,   color: '#fbbf24' },
      ],
    },
    {
      title: 'SYSTEM',
      metrics: [
        { label: 'AFFECTED', value: `${affectedNodes.length}/${nodes.length}`, color: '#fbbf24' },
        { label: 'TOTAL RPS', value: `${Math.round(totalRps / 1000)}k`,         color: '#8b9ec7' },
        { label: 'AI CONF',   value: '78%',                                      color: '#00c8f0' },
      ],
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: 'rgba(5,8,16,0.9)',
      borderBottom: '1px solid rgba(0,200,240,0.1)',
      flexShrink: 0, height: 38, overflow: 'hidden',
    }}>
      {/* Label */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 12px',
        borderRight: '1px solid rgba(0,200,240,0.08)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
          color: 'rgba(0,200,240,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>LIVE TELEMETRY</span>
        <div style={{
          width: 5, height: 5, borderRadius: '50%', background: '#ef4444',
          marginLeft: 6, animation: 'pulse-red 1.5s infinite',
          boxShadow: '0 0 6px #ef4444',
        }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#4a5a80', marginLeft: 4 }}>SIM</span>
      </div>

      {/* Metric groups */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {metricGroups.map((group, gi) => (
          <div key={gi} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 14px',
            borderRight: gi < metricGroups.length - 1 ? '1px solid rgba(0,200,240,0.07)' : 'none',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5,
              color: 'rgba(139,158,199,0.45)', letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>{group.title}</span>
            {group.metrics.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: 'rgba(139,158,199,0.4)', letterSpacing: '0.08em' }}>{m.label}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
                  color: m.color, transition: 'color 200ms',
                  textShadow: m.color === '#f87171' ? '0 0 8px rgba(239,68,68,0.5)' : undefined,
                }}>{m.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Scrolling alerts ticker */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 12px',
        borderLeft: '1px solid rgba(0,200,240,0.08)', overflow: 'hidden',
        maxWidth: 280, flexShrink: 0,
      }}>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#f87171' }}>
            ⚠ DB pool exhausted · checkout-svc cascading · payment latency critical
          </span>
        </div>
      </div>
    </div>
  );
};
