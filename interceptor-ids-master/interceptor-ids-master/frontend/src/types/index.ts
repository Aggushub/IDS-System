export interface Log {
  id: string;
  timestamp: string;
  sourceIP: string;
  event:
    | 'SSH Login Attempt'
    | 'SQL Injection Attempt'
    | 'Command Injection'
    | 'File Download'
    | 'Port Scan'
    | 'Remote Code Execution'
    | 'Phishing Attempt';
  classification: 'malicious' | 'benign';
  details: string;
  severity?: 'low' | 'medium' | 'high'; // Added for filtering
}

export interface Stats {
  totalLogs: number;
  maliciousCount: number;
  benignCount: number;
  accuracy: number;
}

export interface TrainingData {
  samples: number;
  features: string[];
  accuracy: number;
  validationScore: number;
  confusionMatrix: number[][];
}

export interface ThreatIntelligence {
  id: string;
  ip: string;
  type: 'malware' | 'botnet' | 'ransomware' | 'phishing' | 'other';
  severity: 'high' | 'medium' | 'low';
  lastSeen: string;
  source: 'VirusTotal' | 'AbuseIPDB' | 'Shodan';
  details: string;
  confidence: number;
  tags: string[];
  matches?: { ip: string; timestamp: string; event: string }[];
}

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  action: string;
  description: string;
  roles: UserRole[];
}

export interface MitreAttackTechnique {
  id: string;
  name: string;
  tactic: string;
  count: number;
  description: string;
  events: Log[];
}

export interface MitreAttackTactic {
  name: string;
  techniques: MitreAttackTechnique[];
  totalCount: number;
}

export interface AutomatedResponse {
  id: string;
  name: string;
  description: string;
  conditions: ResponseCondition[];
  actions: ResponseAction[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface ResponseCondition {
  type: 'ip' | 'event' | 'classification' | 'count' | 'timeWindow';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: string | number | string[];
  timeWindow?: number;
}

export interface ResponseAction {
  type: 'block_ip' | 'notify' | 'report' | 'custom_script';
  config: {
    duration?: number;
    notificationChannels?: string[];
    reportType?: string;
    scriptPath?: string;
    scriptParams?: Record<string, string>;
  };
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
  autoResponseId?: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
