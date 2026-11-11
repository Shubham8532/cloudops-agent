import type {
  Incident, ServiceNode, ServiceEdge, TimelineEvent,
  RecentChange, AgentActivity, ChatMessage, ImpactedPath, Recommendation
} from '../types';

// ── Incident ────────────────────────────────────────────────────────────────
export const DEMO_INCIDENT: Incident = {
  id: 'INC-4821',
  severity: 'SEV-1',
  title: 'Checkout Service Cascade Failure — Payment Degradation',
  startedAt: '2025-05-21T14:32:11Z',
  duration: '00:21:34',
  durationSeconds: 1294,
  owner: {
    team: 'Payments',
    oncall: 'kpay',
    escalation: 'Resolution',
    schedule: '24x7',
    runbook: 'rb://checkout-cascade',
  },
  epicenterNodeId: 'checkout-svc',
  aiConfidence: 0.78,
  timeToDetection: '00:15:02',
  timeToAck: '00:06:34',
  estimatedImpact: '~$4,200 / min',
};

// ── Service Graph Nodes ──────────────────────────────────────────────────────
export const DEMO_NODES: ServiceNode[] = [
  { id: 'frontend-web',        label: 'frontend-web',        type: 'frontend',    status: 'degraded', errorRate: 0.12, latencyP99: 1240, throughput: 4200, x: 120,  y: 160, },
  { id: 'api-gateway',         label: 'api-gateway',         type: 'api-gateway', status: 'degraded', errorRate: 0.18, latencyP99: 980,  throughput: 3800, x: 280,  y: 160, },
  { id: 'user-svc',            label: 'user-svc',            type: 'service',     status: 'healthy',  errorRate: 0.01, latencyP99: 45,   throughput: 900,  x: 420,  y: 100, },
  { id: 'recommendation-svc',  label: 'recommendation-svc',  type: 'service',     status: 'healthy',  errorRate: 0.02, latencyP99: 120,  throughput: 600,  x: 120,  y: 280, },
  { id: 'checkout-svc',        label: 'checkout-svc',        type: 'service',     status: 'down',     errorRate: 0.93, latencyP99: 8200, throughput: 180,  x: 280,  y: 270, isEpicenter: true },
  { id: 'payment-svc',         label: 'payment-svc',         type: 'service',     status: 'degraded', errorRate: 0.71, latencyP99: 4100, throughput: 95,   x: 420,  y: 260, },
  { id: 'inventory-svc',       label: 'inventory-svc',       type: 'service',     status: 'degraded', errorRate: 0.38, latencyP99: 1800, throughput: 310,  x: 160,  y: 400, },
  { id: 'postgresql-primary',  label: 'PostgreSQL\nPrimary DB', type: 'database', status: 'degraded', errorRate: 0.44, latencyP99: 3200, throughput: 210,  x: 200,  y: 510, },
  { id: 'redis-cache',         label: 'Redis\nCache',        type: 'cache',       status: 'degraded', errorRate: 0.55, latencyP99: 2100, throughput: 1200, x: 310,  y: 510, },
  { id: 'kafka-queue',         label: 'Kafka\nQueue',        type: 'queue',       status: 'healthy',  errorRate: 0.03, latencyP99: 88,   throughput: 4500, x: 430,  y: 510, },
  { id: 'rds-proxy',           label: 'RDS Proxy\nAWS',      type: 'proxy',       status: 'degraded', errorRate: 0.41, latencyP99: 1900, throughput: 180,  x: 210,  y: 620, },
  { id: 's3-bucket',           label: 'S3 Bucket\nAWS',      type: 'storage',     status: 'healthy',  errorRate: 0.00, latencyP99: 120,  throughput: 90,   x: 380,  y: 620, },
  { id: 'stripe-api',          label: 'Stripe API\nExternal', type: 'external',   status: 'degraded', errorRate: 0.82, latencyP99: 9800, throughput: 42,   x: 530,  y: 260, },
  { id: 'cloudfront',          label: 'CloudFront\nExternal', type: 'external',   status: 'healthy',  errorRate: 0.00, latencyP99: 28,   throughput: 6200, x: 330,  y: 80,  },
  { id: 'dns',                 label: 'DNS',                 type: 'external',    status: 'healthy',  errorRate: 0.00, latencyP99: 4,    throughput: 9000, x: 200,  y: 80,  },
];

// ── Service Graph Edges ──────────────────────────────────────────────────────
export const DEMO_EDGES: ServiceEdge[] = [
  { id: 'e1',  source: 'dns',            target: 'cloudfront',       latency: 4,    errorRate: 0.00, throughput: 9000, isAffected: false },
  { id: 'e2',  source: 'cloudfront',     target: 'frontend-web',     latency: 28,   errorRate: 0.00, throughput: 6200, isAffected: false },
  { id: 'e3',  source: 'frontend-web',   target: 'api-gateway',      latency: 240,  errorRate: 0.12, throughput: 4200, isAffected: true  },
  { id: 'e4',  source: 'api-gateway',    target: 'user-svc',         latency: 45,   errorRate: 0.01, throughput: 900,  isAffected: false },
  { id: 'e5',  source: 'api-gateway',    target: 'checkout-svc',     latency: 8200, errorRate: 0.93, throughput: 180,  isAffected: true  },
  { id: 'e6',  source: 'api-gateway',    target: 'recommendation-svc',latency: 120, errorRate: 0.02, throughput: 600,  isAffected: false },
  { id: 'e7',  source: 'checkout-svc',   target: 'payment-svc',      latency: 4100, errorRate: 0.71, throughput: 95,   isAffected: true  },
  { id: 'e8',  source: 'checkout-svc',   target: 'inventory-svc',    latency: 1800, errorRate: 0.38, throughput: 310,  isAffected: true  },
  { id: 'e9',  source: 'checkout-svc',   target: 'redis-cache',      latency: 2100, errorRate: 0.55, throughput: 1200, isAffected: true  },
  { id: 'e10', source: 'payment-svc',    target: 'stripe-api',       latency: 9800, errorRate: 0.82, throughput: 42,   isAffected: true  },
  { id: 'e11', source: 'payment-svc',    target: 'postgresql-primary',latency: 3200, errorRate: 0.44, throughput: 210, isAffected: true  },
  { id: 'e12', source: 'inventory-svc',  target: 'postgresql-primary',latency: 1900, errorRate: 0.41, throughput: 180, isAffected: true  },
  { id: 'e13', source: 'postgresql-primary', target: 'rds-proxy',    latency: 1900, errorRate: 0.41, throughput: 180,  isAffected: true  },
  { id: 'e14', source: 'checkout-svc',   target: 'kafka-queue',      latency: 88,   errorRate: 0.03, throughput: 4500, isAffected: false },
  { id: 'e15', source: 'kafka-queue',    target: 's3-bucket',        latency: 120,  errorRate: 0.00, throughput: 90,   isAffected: false },
];

// ── Timeline Events ──────────────────────────────────────────────────────────
export const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 't1', timestamp: '14:17:05', type: 'config_change', label: 'Config Change', detail: 'Connection pool max_connections reduced from 200→50 by jane.doe', severity: 'critical', actor: 'jane.doe' },
  { id: 't2', timestamp: '14:24:11', type: 'traffic_spike',  label: 'Traffic Spike', detail: 'checkout-svc req/s +420% above baseline — flash sale trigger', severity: 'warning' },
  { id: 't3', timestamp: '14:27:33', type: 'error_rate',     label: 'Error Rate↑',   detail: 'checkout-svc error rate crossed 40% threshold', severity: 'critical' },
  { id: 't4', timestamp: '14:29:18', type: 'db_connection',  label: 'DB Connections', detail: 'DB connection pool exhausted — 0/50 available', severity: 'critical' },
  { id: 't5', timestamp: '14:30:44', type: 'latency',        label: 'Latency Spike', detail: 'payment-svc P99 latency → 9.8s (SLO: 500ms)', severity: 'critical' },
  { id: 't6', timestamp: '14:31:02', type: 'thread_pool',    label: 'Thread Pool',   detail: 'Thread pool queue depth > 2000 — request shedding active', severity: 'warning' },
  { id: 't7', timestamp: '14:32:11', type: 'acknowledgment', label: 'INC-4821 Fired', detail: 'PagerDuty INC-4821 created — SEV-1 declared', severity: 'info' },
];

// ── Recent Changes ───────────────────────────────────────────────────────────
export const DEMO_CHANGES: RecentChange[] = [
  { id: 'c1', timeAgo: '15m ago',  action: 'Config Change — DB pool max_connections 200→50',  actor: 'jane.doe',  service: 'checkout-svc', confidence: 0.91 },
  { id: 'c2', timeAgo: '38m ago',  action: 'Deployment — payment-svc v2.4.1→v2.4.2',         actor: 'ci-bot',    service: 'payment-svc',  confidence: 0.34 },
  { id: 'c3', timeAgo: '76m ago',  action: 'Feature Flag — enable_new_checkout_flow=true',    actor: 'alice.z',   service: 'frontend-web', confidence: 0.22 },
];

// ── Impacted Paths ───────────────────────────────────────────────────────────
export const DEMO_IMPACTED_PATHS: ImpactedPath[] = [
  { id: 'p1', label: 'Clients → checkout-svc → PostgreSQL → RDS Proxy', nodes: ['frontend-web','api-gateway','checkout-svc','postgresql-primary','rds-proxy'], errorRate: 0.93 },
  { id: 'p2', label: 'checkout-svc → payment-svc → Stripe API',         nodes: ['checkout-svc','payment-svc','stripe-api'],                                    errorRate: 0.82 },
  { id: 'p3', label: 'checkout-svc → Redis Cache',                       nodes: ['checkout-svc','redis-cache'],                                                 errorRate: 0.55 },
];

// ── Recommendations ──────────────────────────────────────────────────────────
export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  { id: 'r1', priority: 1, action: 'Increase DB pool max_connections to ≥200', detail: 'Revert jane.doe\'s config change immediately — pool exhaustion is root cause', confidence: 0.91 },
  { id: 'r2', priority: 2, action: 'If errors persist → scale checkout-svc pods ×3', detail: 'Current replicas: 4. Scale to 12 to absorb pending request queue', confidence: 0.76 },
  { id: 'r3', priority: 3, action: 'Validate traffic routing to Stripe fallback', detail: 'Enable Stripe retry queue and circuit breaker — 82% external error rate', confidence: 0.64 },
];

// ── Agent Activity Stream ────────────────────────────────────────────────────
export const DEMO_AGENT_ACTIVITY: AgentActivity[] = [
  { id: 'a1', timestamp: '14:32:14', type: 'thinking',       message: 'Incident INC-4821 received — analyzing dependency graph…',            },
  { id: 'a2', timestamp: '14:32:15', type: 'querying',       message: 'Fetching metrics: checkout-svc [P99, error_rate, throughput]',          detail: 'Azure Monitor · 15m window' },
  { id: 'a3', timestamp: '14:32:17', type: 'querying',       message: 'Querying recent deployments and config changes',                         detail: 'Last 2h · 3 changes found' },
  { id: 'a4', timestamp: '14:32:19', type: 'analyzing',      message: 'Correlating DB connection pool exhaustion with config change at 14:17',  },
  { id: 'a5', timestamp: '14:32:21', type: 'hypothesis',     message: 'Hypothesis: DB pool reduction (200→50) is root cause',                  detail: 'Confidence: 91%' },
  { id: 'a6', timestamp: '14:32:23', type: 'analyzing',      message: 'Tracing cascade: checkout-svc → payment-svc → Stripe latency spike',    },
  { id: 'a7', timestamp: '14:32:26', type: 'recommendation', message: 'Primary action: revert max_connections — estimated recovery <5min',     detail: 'Runbook: rb://checkout-cascade' },
  { id: 'a8', timestamp: '14:32:31', type: 'complete',       message: 'Analysis complete — 3 recommendations generated',                        detail: 'AI confidence: 0.78' },
];

// ── Chat History ─────────────────────────────────────────────────────────────
export const DEMO_CHAT: ChatMessage[] = [
  {
    id: 'msg1', role: 'agent', timestamp: '14:32:31',
    content: 'INC-4821 analysis complete. Root cause identified with **91% confidence**: a DB connection pool config change (max_connections 200→50) by jane.doe at 14:17 UTC is causing pool exhaustion, cascading to checkout → payment → Stripe.\n\n**Immediate action:** Revert the config change. ETA to recovery: ~3–5 minutes.',
  },
  {
    id: 'msg2', role: 'user', timestamp: '14:33:01',
    content: 'What is the blast radius on customer orders?',
  },
  {
    id: 'msg3', role: 'agent', timestamp: '14:33:04',
    content: 'Based on throughput data at time of incident:\n\n- **Checkout requests failing:** ~3,820 req/min (93% error rate)\n- **Orders lost in flight:** est. 847 orders since 14:32\n- **Revenue impact:** ~$4,200/min at avg basket $42\n\nNo data loss confirmed — Kafka queue is healthy and events are persisted. Orders will replay successfully once the pool is restored.',
  },
];
