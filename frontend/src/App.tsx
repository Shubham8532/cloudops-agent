import React, { useState, useMemo } from 'react';
import { IncidentHeader } from './components/IncidentHeader/IncidentHeader';
import { TelemetryBar } from './components/TelemetryBar/TelemetryBar';
import { DependencyGraph } from './components/DependencyGraph/DependencyGraph';
import { NodeDetailPanel } from './components/NodeDetailPanel/NodeDetailPanel';
import { IncidentTimeline } from './components/IncidentTimeline/IncidentTimeline';
import { RightPanel } from './components/RightPanel/RightPanel';
import { CopilotPanel } from './components/CopilotPanel/CopilotPanel';
import { BottomBar } from './components/BottomBar/BottomBar';
import {
  DEMO_INCIDENT, DEMO_NODES, DEMO_EDGES, DEMO_TIMELINE,
  DEMO_CHANGES, DEMO_IMPACTED_PATHS, DEMO_RECOMMENDATIONS, DEMO_AGENT_ACTIVITY, DEMO_CHAT
} from './data/demoData';
import type { TimeRange } from './types';

export const App: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('15m');
  const [leftTab, setLeftTab] = useState<'graph' | 'timeline'>('graph');

  const selectedNode = useMemo(
    () => DEMO_NODES.find(n => n.id === selectedNodeId) ?? null,
    [selectedNodeId]
  );

  const graphStats = useMemo(() => ({
    healthy:  DEMO_NODES.filter(n => n.status === 'healthy').length,
    degraded: DEMO_NODES.filter(n => n.status === 'degraded').length,
    down:     DEMO_NODES.filter(n => n.status === 'down').length,
  }), []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100vw', height: '100vh',
      background: '#050810', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Top nav bar */}
      <IncidentHeader
        incident={DEMO_INCIDENT}
        timeRange={timeRange}
        onTimeRangeChange={(r) => setTimeRange(r as TimeRange)}
      />

      {/* Telemetry bar */}
      <TelemetryBar nodes={DEMO_NODES} />

      {/* Main content: 3-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* ── LEFT: Graph + Timeline ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          flex: 1, minWidth: 0, borderRight: '1px solid rgba(0,200,240,0.08)',
          overflow: 'hidden',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', flexShrink: 0,
            borderBottom: '1px solid rgba(0,200,240,0.08)',
            background: 'rgba(7,12,24,0.8)',
          }}>
            {(['graph', 'timeline'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                style={{
                  padding: '7px 16px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: leftTab === tab ? '#00c8f0' : '#4a5a80',
                  background: leftTab === tab ? 'rgba(0,200,240,0.06)' : 'transparent',
                  border: 'none', borderBottom: `2px solid ${leftTab === tab ? '#00c8f0' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 120ms',
                }}
              >
                {tab === 'graph' ? '⬡ Live Dependency Graph' : '⏱ Incident Timeline'}
              </button>
            ))}
            {leftTab === 'graph' && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
                <StatusLegendItem color="#10b981" label={`${graphStats.healthy} Healthy`} />
                <StatusLegendItem color="#f59e0b" label={`${graphStats.degraded} Degraded`} />
                <StatusLegendItem color="#ef4444" label={`${graphStats.down} Down`} />
              </div>
            )}
          </div>

          {leftTab === 'graph' ? (
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {/* Grid background */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0,150,200,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,200,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />

              <DependencyGraph
                nodes={DEMO_NODES}
                edges={DEMO_EDGES}
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
              />

              {/* Node detail popup */}
              {selectedNode && (
                <div style={{ position: 'absolute', top: 42, right: 8, zIndex: 200 }}>
                  <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
                color: 'rgba(139,158,199,0.4)', letterSpacing: '0.1em', marginBottom: 8,
              }}>INCIDENT TIMELINE · SIMULATED DATA · INC-4821</div>
              <IncidentTimeline events={DEMO_TIMELINE} />
            </div>
          )}
        </div>

        {/* ── CENTER: Right Info Panel ── */}
        <div style={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid rgba(0,200,240,0.08)',
          overflow: 'hidden',
          background: 'rgba(7,12,24,0.6)',
        }}>
          <RightPanel
            incident={DEMO_INCIDENT}
            changes={DEMO_CHANGES}
            impactedPaths={DEMO_IMPACTED_PATHS}
            recommendations={DEMO_RECOMMENDATIONS}
            selectedNode={selectedNode}
            graphStats={graphStats}
          />
        </div>

        {/* ── RIGHT: Copilot ── */}
        <div style={{
          width: 320,
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(7,12,24,0.7)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            borderBottom: '1px solid rgba(0,200,240,0.08)',
            background: 'rgba(0,200,240,0.03)', flexShrink: 0,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(0,200,240,0.25), rgba(0,96,160,0.25))',
              border: '1px solid rgba(0,200,240,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#00c8f0',
            }}>⬡</div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: '#00c8f0', letterSpacing: '0.08em' }}>
              INCIDENT COPILOT
            </span>
            <div style={{
              marginLeft: 'auto', padding: '1px 5px', borderRadius: 2,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#34d399',
              letterSpacing: '0.08em',
            }}>ONLINE</div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CopilotPanel
              messages={DEMO_CHAT}
              agentActivity={DEMO_AGENT_ACTIVITY}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <BottomBar incident={DEMO_INCIDENT} events={DEMO_TIMELINE} />
    </div>
  );
};

const StatusLegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#8b9ec7' }}>{label}</span>
  </div>
);

export default App;
