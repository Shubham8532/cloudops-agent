import React from 'react';
import type { Incident, ServiceNode } from '../../types';
import type { RecentChange, ImpactedPath, Recommendation } from '../../types';

interface RightPanelProps {
  incident: Incident;
  changes: RecentChange[];
  impactedPaths: ImpactedPath[];
  recommendations: Recommendation[];
  selectedNode: ServiceNode | null;
  graphStats: { healthy: number; degraded: number; down: number };
}

export const RightPanel: React.FC<RightPanelProps> = ({
  incident, changes, impactedPaths, recommendations, graphStats
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', padding: '8px' }}>
      {/* Ownership Context */}
      <Section title="OWNERSHIP CONTEXT" icon="◈">
        <Grid2>
          <KV label="Team"       value={incident.owner.team} />
          <KV label="On-call"    value={incident.owner.oncall} />
          <KV label="Escalation" value={incident.owner.escalation} />
          <KV label="Schedule"   value={incident.owner.schedule} />
        </Grid2>
        <div style={{ marginTop: 6 }}>
          <a
            href="#"
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              color: '#00c8f0', textDecoration: 'none', letterSpacing: '0.03em',
            }}
          >↗ {incident.owner.runbook}</a>
        </div>
      </Section>

      {/* Dependency Health */}
      <Section title="DEPENDENCY HEALTH" icon="⬡">
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <StatChip label="HEALTHY"  value={graphStats.healthy}  color="#10b981" />
          <StatChip label="DEGRADED" value={graphStats.degraded} color="#f59e0b" />
          <StatChip label="DOWN"     value={graphStats.down}     color="#ef4444" />
        </div>
        <div style={{ height: 4, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          {[
            { pct: graphStats.healthy  / (graphStats.healthy + graphStats.degraded + graphStats.down), color: '#10b981' },
            { pct: graphStats.degraded / (graphStats.healthy + graphStats.degraded + graphStats.down), color: '#f59e0b' },
            { pct: graphStats.down     / (graphStats.healthy + graphStats.degraded + graphStats.down), color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{ height: '100%', width: `${s.pct * 100}%`, background: s.color, transition: 'width 500ms' }} />
          ))}
        </div>
      </Section>

      {/* Recent Changes */}
      <Section title="RECENT CHANGES" icon="⚙">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {changes.map(c => (
            <div key={c.id} style={{
              padding: '5px 8px', borderRadius: 3,
              background: c.confidence && c.confidence > 0.8 ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${c.confidence && c.confidence > 0.8 ? 'rgba(239,68,68,0.2)' : 'rgba(0,200,240,0.06)'}`,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4a5a80' }}>{c.timeAgo}</span>
                {c.confidence && (
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700,
                    color: c.confidence > 0.8 ? '#f87171' : c.confidence > 0.5 ? '#fbbf24' : '#6b7280',
                  }}>{Math.round(c.confidence * 100)}% corr.</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: '#c0cce8', marginBottom: 2 }}>{c.action}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4a5a80' }}>
                {c.actor} · {c.service}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Impacted Paths */}
      <Section title="IMPACTED PATHS" icon="→">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {impactedPaths.map(path => (
            <div key={path.id} style={{ padding: '5px 8px', borderRadius: 3, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{
                  fontSize: 10, color: '#8b9ec7',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, marginRight: 6,
                }}>{path.label}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, flexShrink: 0,
                  color: path.errorRate > 0.7 ? '#f87171' : '#fbbf24',
                }}>{Math.round(path.errorRate * 100)}% err</span>
              </div>
              <div style={{ height: 2, background: 'rgba(0,0,0,0.4)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${path.errorRate * 100}%`, background: path.errorRate > 0.7 ? '#ef4444' : '#f59e0b', transition: 'width 500ms' }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Recommendations */}
      <Section title="RECOMMENDED NEXT ACTIONS" icon="✓">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {recommendations.map(rec => (
            <div key={rec.id} style={{
              padding: '6px 8px', borderRadius: 3,
              background: rec.priority === 1 ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${rec.priority === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(0,200,240,0.06)'}`,
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 2, flexShrink: 0,
                  background: rec.priority === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(0,200,240,0.1)',
                  border: `1px solid ${rec.priority === 1 ? 'rgba(16,185,129,0.4)' : 'rgba(0,200,240,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700,
                  color: rec.priority === 1 ? '#34d399' : '#00c8f0',
                }}>{rec.priority}</div>
                <span style={{ fontSize: 10, color: '#c0cce8', fontWeight: 500, flex: 1 }}>{rec.action}</span>
              </div>
              <div style={{ fontSize: 9, color: '#6b7280', paddingLeft: 22 }}>{rec.detail}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, paddingLeft: 22 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(0,0,0,0.4)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rec.confidence * 100}%`, background: '#00c8f0', opacity: 0.6 }} />
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4a5a80' }}>
                  {Math.round(rec.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated confidence */}
        <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 3, background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4a5a80' }}>AI CONFIDENCE</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>
              {Math.round(incident.aiConfidence * 100)}%
            </span>
          </div>
          <div style={{ height: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${incident.aiConfidence * 100}%`, background: 'linear-gradient(90deg, #00c8f0, #fbbf24)', borderRadius: 2 }} />
          </div>
        </div>
      </Section>

      {/* KPIs */}
      <Section title="INCIDENT KPIS" icon="⏱">
        <Grid2>
          <KV label="Time to Detect" value={incident.timeToDetection} mono />
          <KV label="Time to Ack"    value={incident.timeToAck} mono />
          <KV label="Est. Impact"    value={incident.estimatedImpact} valueColor="#f87171" />
          <KV label="Duration"       value={incident.duration} mono valueColor="#fbbf24" />
        </Grid2>
      </Section>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(139,158,199,0.3)', padding: '4px 2px', letterSpacing: '0.08em' }}>
        ⚠ ALL DATA SIMULATED — NOT CONNECTED TO AZURE
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div style={{
    background: 'rgba(10,16,32,0.8)', border: '1px solid rgba(0,200,240,0.08)',
    borderRadius: 5, overflow: 'hidden',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
      background: 'rgba(0,200,240,0.03)', borderBottom: '1px solid rgba(0,200,240,0.07)',
    }}>
      <span style={{ fontSize: 9, color: '#00c8f0' }}>{icon}</span>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700,
        letterSpacing: '0.1em', color: 'rgba(0,200,240,0.7)',
      }}>{title}</span>
    </div>
    <div style={{ padding: '8px 10px' }}>{children}</div>
  </div>
);

const KV: React.FC<{ label: string; value: string; mono?: boolean; valueColor?: string }> = ({ label, value, mono, valueColor }) => (
  <div>
    <div style={{ fontSize: 9, color: '#4a5a80', marginBottom: 1 }}>{label}</div>
    <div style={{
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
      fontSize: 10, fontWeight: 600, color: valueColor || '#c0cce8',
    }}>{value}</div>
  </div>
);

const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{children}</div>
);

const StatChip: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ flex: 1, padding: '4px 6px', borderRadius: 3, background: `${color}12`, border: `1px solid ${color}33`, textAlign: 'center' }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: `${color}88`, letterSpacing: '0.08em' }}>{label}</div>
  </div>
);
