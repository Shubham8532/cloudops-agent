import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ServiceNode, ServiceEdge } from '../../types';

interface DependencyGraphProps {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

const SERVICE_ICONS: Record<string, string> = {
  'frontend':    '◈',
  'api-gateway': '⬡',
  'service':     '⬡',
  'database':    '⬢',
  'cache':       '⬡',
  'queue':       '⬡',
  'external':    '◇',
  'proxy':       '⬡',
  'storage':     '⬡',
};

const STATUS_COLORS: Record<string, string> = {
  healthy:  '#10b981',
  degraded: '#f59e0b',
  down:     '#ef4444',
  unknown:  '#6b7280',
};

const STATUS_GLOW: Record<string, string> = {
  healthy:  'rgba(16,185,129,0.3)',
  degraded: 'rgba(245,158,11,0.4)',
  down:     'rgba(239,68,68,0.5)',
  unknown:  'rgba(107,114,128,0.2)',
};

function getEdgeColor(edge: ServiceEdge): string {
  if (!edge.isAffected) return 'rgba(0,150,200,0.25)';
  if (edge.errorRate > 0.7) return 'rgba(239,68,68,0.7)';
  if (edge.errorRate > 0.3) return 'rgba(245,158,11,0.6)';
  return 'rgba(0,200,240,0.4)';
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  nodes, edges, selectedNodeId, onNodeSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 30, y: 30, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [tick, setTick] = useState(0);

  // Animate flowing edges
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest('[data-node]')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(t => ({
      ...t,
      x: dragStart.current.tx + (e.clientX - dragStart.current.x),
      y: dragStart.current.ty + (e.clientY - dragStart.current.y),
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(2, Math.max(0.4, t.scale * delta)) }));
  }, []);

  // Map nodeId → position
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const getCurvedPath = (sx: number, sy: number, tx: number, ty: number) => {
    const cx = (sx + tx) / 2;
    const cy = (sy + ty) / 2 - 20;
    return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
  };

  const NODE_W = 80;
  const NODE_H = 52;

  return (
    <div className="dep-graph-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 4,
        background: 'rgba(5,8,16,0.85)', border: '1px solid rgba(0,200,240,0.1)',
        borderRadius: 4, padding: '6px 10px',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(0,200,240,0.5)', letterSpacing: '0.1em', marginBottom: 2 }}>LEGEND</div>
        {['healthy','degraded','down'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[s], boxShadow: `0 0 5px ${STATUS_COLORS[s]}` }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#8b9ec7', textTransform: 'uppercase' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 4 }}>
        {['+', '−', '⟳'].map((icon, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === 0) setTransform(t => ({ ...t, scale: Math.min(2, t.scale * 1.2) }));
              else if (i === 1) setTransform(t => ({ ...t, scale: Math.max(0.4, t.scale * 0.8) }));
              else setTransform({ x: 30, y: 30, scale: 1 });
            }}
            style={{
              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,200,240,0.08)', border: '1px solid rgba(0,200,240,0.2)',
              borderRadius: 3, color: '#00c8f0', cursor: 'pointer', fontSize: 12,
            }}
          >{icon}</button>
        ))}
      </div>

      {/* Sim label */}
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 10,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
        color: 'rgba(139,158,199,0.5)', letterSpacing: '0.1em',
        background: 'rgba(5,8,16,0.7)', padding: '2px 6px',
        border: '1px solid rgba(139,158,199,0.1)', borderRadius: 3,
      }}>SIMULATED TOPOLOGY</div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Grid */}
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,150,200,0.07)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filters */}
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Arrow markers */}
          <marker id="arrow-normal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(0,200,240,0.4)" />
          </marker>
          <marker id="arrow-affected" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(239,68,68,0.7)" />
          </marker>
          <marker id="arrow-warning" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(245,158,11,0.6)" />
          </marker>
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Draw edges */}
          {edges.map(edge => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const sx = src.x + NODE_W / 2;
            const sy = src.y + NODE_H / 2;
            const tx = tgt.x + NODE_W / 2;
            const ty = tgt.y + NODE_H / 2;
            const path = getCurvedPath(sx, sy, tx, ty);
            const strokeColor = getEdgeColor(edge);
            const dashOffset = -(tick * (edge.isAffected ? 3 : 1)) % 30;
            const markerId = edge.errorRate > 0.7 ? 'arrow-affected' : edge.errorRate > 0.3 ? 'arrow-warning' : 'arrow-normal';

            return (
              <g key={edge.id}>
                {/* Glow path */}
                {edge.isAffected && (
                  <path
                    d={path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={4}
                    opacity={0.15}
                    strokeLinecap="round"
                  />
                )}
                {/* Main path */}
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={edge.isAffected ? 1.5 : 1}
                  strokeDasharray={edge.isAffected ? "8 4" : "4 6"}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                  opacity={0.85}
                />
                {/* Latency label on affected edges */}
                {edge.isAffected && (
                  <text
                    x={(sx + tx) / 2}
                    y={(sy + ty) / 2 - 24}
                    textAnchor="middle"
                    fontSize={7}
                    fontFamily="JetBrains Mono, monospace"
                    fill={edge.errorRate > 0.7 ? '#f87171' : '#fbbf24'}
                    opacity={0.85}
                  >
                    {edge.latency >= 1000 ? `${(edge.latency / 1000).toFixed(1)}s` : `${edge.latency}ms`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map(node => {
            const color = STATUS_COLORS[node.status];
            const glow  = STATUS_GLOW[node.status];
            const isSelected = selectedNodeId === node.id;
            const isEpicenter = node.isEpicenter;

            return (
              <g
                key={node.id}
                data-node={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onNodeSelect(isSelected ? null : node.id)}
              >
                {/* Selection ring */}
                {isSelected && (
                  <rect
                    x={-4} y={-4}
                    width={NODE_W + 8} height={NODE_H + 8}
                    rx={6}
                    fill="none"
                    stroke="rgba(0,200,240,0.6)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                )}

                {/* Epicenter pulse ring */}
                {isEpicenter && (
                  <>
                    <rect
                      x={-8} y={-8}
                      width={NODE_W + 16} height={NODE_H + 16}
                      rx={8}
                      fill="none"
                      stroke="rgba(239,68,68,0.3)"
                      strokeWidth={1}
                    />
                    <rect
                      x={-14} y={-14}
                      width={NODE_W + 28} height={NODE_H + 28}
                      rx={10}
                      fill="none"
                      stroke="rgba(239,68,68,0.15)"
                      strokeWidth={1}
                    />
                  </>
                )}

                {/* Node background glow */}
                <rect
                  x={0} y={0}
                  width={NODE_W} height={NODE_H}
                  rx={4}
                  fill={glow}
                  opacity={0.4}
                />

                {/* Node body */}
                <rect
                  x={0} y={0}
                  width={NODE_W} height={NODE_H}
                  rx={4}
                  fill={isEpicenter ? 'rgba(30,8,8,0.95)' : 'rgba(7,12,24,0.92)'}
                  stroke={isSelected ? 'rgba(0,200,240,0.8)' : color}
                  strokeWidth={isEpicenter ? 1.5 : 1}
                  strokeOpacity={isEpicenter ? 0.9 : 0.6}
                />

                {/* Status bar (top) */}
                <rect
                  x={0} y={0}
                  width={NODE_W} height={2}
                  rx={4}
                  fill={color}
                  opacity={0.8}
                />

                {/* Service type icon */}
                <text
                  x={NODE_W / 2} y={16}
                  textAnchor="middle"
                  fontSize={10}
                  fill={color}
                  opacity={0.7}
                  fontFamily="sans-serif"
                >
                  {SERVICE_ICONS[node.type] || '⬡'}
                </text>

                {/* Label */}
                {node.label.split('\n').map((line, i) => (
                  <text
                    key={i}
                    x={NODE_W / 2} y={26 + i * 9}
                    textAnchor="middle"
                    fontSize={7.5}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={600}
                    fill={isEpicenter ? '#f87171' : '#e0eaff'}
                    opacity={0.9}
                  >
                    {line}
                  </text>
                ))}

                {/* Error rate badge (bottom) */}
                {node.errorRate > 0.05 && (
                  <g transform={`translate(${NODE_W / 2 - 18}, ${NODE_H - 13})`}>
                    <rect width={36} height={10} rx={2} fill="rgba(0,0,0,0.5)" />
                    <text
                      x={18} y={7.5}
                      textAnchor="middle"
                      fontSize={6.5}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={700}
                      fill={node.errorRate > 0.7 ? '#f87171' : node.errorRate > 0.3 ? '#fbbf24' : '#34d399'}
                    >
                      ERR {Math.round(node.errorRate * 100)}%
                    </text>
                  </g>
                )}

                {/* Epicenter label */}
                {isEpicenter && (
                  <text
                    x={NODE_W / 2} y={NODE_H + 12}
                    textAnchor="middle"
                    fontSize={6.5}
                    fontFamily="JetBrains Mono, monospace"
                    fill="rgba(239,68,68,0.7)"
                    letterSpacing="0.1em"
                  >
                    ◉ EPICENTER
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
