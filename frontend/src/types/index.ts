// Core domain types for CloudOps Agent V1

export type Severity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
export type NodeStatus = 'healthy' | 'degraded' | 'down' | 'unknown';
export type ServiceType = 'frontend' | 'api-gateway' | 'service' | 'database' | 'cache' | 'queue' | 'external' | 'proxy' | 'storage';

export interface ServiceNode {
  id: string;
  label: string;
  type: ServiceType;
  status: NodeStatus;
  errorRate: number;    // 0-1
  latencyP99: number;  // ms
  throughput: number;  // req/s
  x: number;
  y: number;
  isEpicenter?: boolean;
}

export interface ServiceEdge {
  id: string;
  source: string;
  target: string;
  latency: number;       // ms
  errorRate: number;     // 0-1
  throughput: number;    // req/s
  isAffected: boolean;
}

export interface Incident {
  id: string;
  severity: Severity;
  title: string;
  startedAt: string;     // ISO string
  duration: string;      // human readable
  durationSeconds: number;
  owner: {
    team: string;
    oncall: string;
    escalation: string;
    schedule: string;
    runbook: string;
  };
  epicenterNodeId: string;
  aiConfidence: number;  // 0-1
  timeToDetection: string;
  timeToAck: string;
  estimatedImpact: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'config_change' | 'traffic_spike' | 'error_rate' | 'deployment' | 'db_connection' | 'thread_pool' | 'latency' | 'acknowledgment';
  label: string;
  detail: string;
  severity?: 'critical' | 'warning' | 'info';
  actor?: string;
}

export interface RecentChange {
  id: string;
  timeAgo: string;
  action: string;
  actor: string;
  service: string;
  confidence?: number;
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  type: 'thinking' | 'querying' | 'analyzing' | 'hypothesis' | 'recommendation' | 'complete';
  message: string;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ImpactedPath {
  id: string;
  label: string;
  nodes: string[];
  errorRate: number;
}

export interface Recommendation {
  id: string;
  priority: number;
  action: string;
  detail: string;
  confidence: number;
}

export type TimeRange = '5m' | '15m' | '1h' | '3h' | '24h';
export type InvestigationTab = 'overview' | 'timeline' | 'changes' | 'graph' | 'copilot';
