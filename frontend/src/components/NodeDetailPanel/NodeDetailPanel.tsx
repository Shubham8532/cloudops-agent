import React from 'react';
import type { ServiceNode } from '../../types';

interface NodeDetailPanelProps {
  node: ServiceNode | null;
  onClose: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;

  const statusColor: Record<string, string> = {
    healthy: '#10b981', degraded: '#f59e0b', down: '#ef4444', unknown: '#6b7280'
  };

  const color = statusColor[node.status];
  const errPercent = Math.round(node.errorRate * 100);

  return (
    <div style={{
      position: 'absolute', top: 42, right: 0,
      width: 240, zIndex: 200,
      background: 'rgba(7,12,24,0.97)',
      border: '1px solid rgba(0,200,240,0.2)',
      borderRadius: 6,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      animation: 'fadeIn 200ms ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(0,200,240,0.1)',
        background: 'rgba(0,200,240,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: '#e0eaff' }}>
            {node.label.replace('\n', ' ')}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#4a5a80', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
        >×</button>
      </div>

      {/* Metrics */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MetricRow label="Status" value={node.status.toUpperCase()} valueColor={color} />
        <MetricRow label="Type" value={node.type} />
        <div className="divider" />
        <MetricRow
          label="Error Rate"
          value={`${errPercent}%`}
          valueColor={errPercent > 70 ? '#f87171' : errPercent > 30 ? '#fbbf24' : '#34d399'}
          bar={node.errorRate}
          barColor={errPercent > 70 ? '#ef4444' : errPercent > 30 ? '#f59e0b' : '#10b981'}
        />
        <MetricRow
          label="Latency P99"
          value={node.latencyP99 >= 1000 ? `${(node.latencyP99 / 1000).toFixed(1)}s` : `${node.latencyP99}ms`}
          valueColor={node.latencyP99 > 2000 ? '#f87171' : node.latencyP99 > 500 ? '#fbbf24' : '#34d399'}
        />
        <MetricRow label="Throughput" value={`${node.throughput.toLocaleString()} req/s`} />

        {node.isEpicenter && (
          <div style={{
            marginTop: 4, padding: '6px 8px', borderRadius: 4,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#f87171', letterSpacing: '0.05em' }}>
              ◉ INCIDENT EPICENTER
            </div>
            <div style={{ fontSize: 10, color: '#8b9ec7', marginTop: 3 }}>
              Root cause candidate — DB pool exhaustion detected
            </div>
          </div>
        )}

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(139,158,199,0.4)', marginTop: 2 }}>
          SIMULATED METRICS · NOT LIVE
        </div>
      </div>
    </div>
  );
};

const MetricRow: React.FC<{
  label: string; value: string; valueColor?: string;
  bar?: number; barColor?: string;
}> = ({ label, value, valueColor = '#e0eaff', bar, barColor }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: '#8b9ec7' }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
    {bar !== undefined && (
      <div style={{ marginTop: 3, height: 2, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${bar * 100}%`, background: barColor, borderRadius: 2, transition: 'width 500ms' }} />
      </div>
    )}
  </div>
);
