import { Log } from '../../frontend/src/types'; // Adjust path if needed

export function transformCowrieLog(log: any): Log {
  const eventMapping: Record<string, { 
    event: "SSH Login Attempt" | "Command Injection" | "Port Scan" | "Remote Code Execution" | "SQL Injection Attempt" | "File Download" | "Phishing Attempt"; 
    classification: 'malicious' | 'benign'; 
    severity: 'low' | 'medium' | 'high' 
  }> = {
    'cowrie.login.failed': { event: 'SSH Login Attempt', classification: 'malicious', severity: 'high' },
    'cowrie.login.success': { event: 'SSH Login Attempt', classification: 'benign', severity: 'medium' },
    'cowrie.command.input': { event: 'Command Injection', classification: 'malicious', severity: 'high' },
    'cowrie.session.connect': { event: 'Port Scan', classification: 'malicious', severity: 'medium' },
    'cowrie.direct-tcpip': { event: 'Remote Code Execution', classification: 'malicious', severity: 'high' },
    'cowrie.session.file_download': { event: 'File Download', classification: 'malicious', severity: 'high' },
    'cowrie.session.file_upload': { event: 'File Download', classification: 'malicious', severity: 'high' }, // Adjust if "File Upload" is intended
    'cowrie.session.closed': { event: 'SSH Login Attempt', classification: 'benign', severity: 'low' }, // Adjust if needed
    'cowrie.log.closed': { event: 'SSH Login Attempt', classification: 'benign', severity: 'low' } // Adjust if needed
  };

  const mapped = eventMapping[log.eventid] || {
    event: 'SSH Login Attempt' as const, // Default to a valid event
    classification: 'benign' as const,
    severity: 'low' as const,
  };

  return {
    id: log._id.toString(),
    timestamp: log.timestamp,
    sourceIP: log.src_ip,
    event: mapped.event,
    classification: mapped.classification,
    details: log.message || log.input || '',
    severity: log.severity || mapped.severity, // Use MongoDB severity if present
  };
}

export function calculateStats(logs: Log[]): { totalLogs: number; maliciousCount: number; benignCount: number; accuracy: number } {
  const totalLogs = logs.length;
  const maliciousCount = logs.filter(log => log.classification === 'malicious').length;
  const benignCount = totalLogs - maliciousCount;
  const accuracy = totalLogs > 0 ? Math.round((benignCount / totalLogs) * 100) : 0;

  return { totalLogs, maliciousCount, benignCount, accuracy };
}
