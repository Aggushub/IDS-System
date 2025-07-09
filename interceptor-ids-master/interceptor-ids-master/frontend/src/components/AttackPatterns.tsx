import React, { useEffect, useState } from 'react';
import { Crosshair, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { Log, MitreAttackTactic, MitreAttackTechnique } from '../types';

interface AttackPatternsProps {
  logs: Log[];
}

// Updated MITRE ATT&CK mappings for specified attacks
const MITRE_MAPPINGS: Record<string, { tactic: string; technique: string; techniqueId: string }> = {
  'SSH Login Attempt': { tactic: 'Initial Access', technique: 'Brute Force', techniqueId: 'T1110' },
  'SQL Injection Attempt': { tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', techniqueId: 'T1190' },
  'Command Injection': { tactic: 'Execution', technique: 'Command and Scripting Interpreter', techniqueId: 'T1059' },
  'File Download': { tactic: 'Command and Control', technique: 'Ingress Tool Transfer', techniqueId: 'T1105' },
  'Port Scan': { tactic: 'Discovery', technique: 'Network Service Scanning', techniqueId: 'T1046' },
  'Remote Code Execution': { tactic: 'Execution', technique: 'Exploitation for Client Execution', techniqueId: 'T1203' },
  'Phishing Attempt': { tactic: 'Initial Access', technique: 'Phishing', techniqueId: 'T1566' },
};

export function AttackPatterns({ logs }: AttackPatternsProps) {
  const [tactics, setTactics] = useState<MitreAttackTactic[]>([]);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<MitreAttackTechnique | null>(null);

  useEffect(() => {
    const tacticsMap = new Map<string, Map<string, MitreAttackTechnique>>();

    logs.forEach((log) => {
      const mapping = MITRE_MAPPINGS[log.event];
      if (mapping) {
        if (!tacticsMap.has(mapping.tactic)) {
          tacticsMap.set(mapping.tactic, new Map());
        }
        const techniqueMap = tacticsMap.get(mapping.tactic)!;
        if (!techniqueMap.has(mapping.techniqueId)) {
          techniqueMap.set(mapping.techniqueId, {
            id: mapping.techniqueId,
            name: mapping.technique,
            tactic: mapping.tactic,
            count: 0,
            description: getTechniqueDescription(mapping.techniqueId),
            events: [],
          });
        }
        const technique = techniqueMap.get(mapping.techniqueId)!;
        technique.count++;
        technique.events.push(log);
      }
    });

    const processedTactics: MitreAttackTactic[] = Array.from(tacticsMap.entries())
      .map(([tacticName, techniques]) => ({
        name: tacticName,
        techniques: Array.from(techniques.values()).sort((a, b) => b.count - a.count),
        totalCount: Array.from(techniques.values()).reduce((sum, t) => sum + t.count, 0),
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    setTactics(processedTactics);
  }, [logs]);

  const getTechniqueDescription = (techniqueId: string): string => {
    const descriptions: Record<string, string> = {
      T1110: 'Adversaries may attempt to gain access by brute-forcing passwords.',
      T1190: 'Adversaries exploit vulnerabilities in public-facing applications.',
      T1059: 'Adversaries execute malicious commands via interpreters.',
      T1105: 'Adversaries transfer tools or malware into the environment.',
      T1046: 'Adversaries scan networks to discover services and vulnerabilities.',
      T1203: 'Adversaries exploit software vulnerabilities for code execution.',
      T1566: 'Adversaries use phishing to gain initial access.',
    };
    return descriptions[techniqueId] || 'No description available.';
  };

  const getIntensityClass = (count: number, maxCount: number): string => {
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'bg-red-900 border-red-700';
    if (intensity > 0.5) return 'bg-red-800 border-red-600';
    if (intensity > 0.25) return 'bg-red-700 border-red-500';
    return 'bg-red-600 border-red-400';
  };

  const maxCount = Math.max(...tactics.flatMap((t) => t.techniques.map((tech) => tech.count)), 1);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Crosshair className="w-6 h-6 text-cyan-500 mr-3" />
        <h2 className="text-xl font-bold">MITRE ATT&CK Patterns</h2>
      </div>
      <div className="space-y-4">
        {tactics.map((tactic) => (
          <div key={tactic.name} className="bg-gray-700 rounded-lg">
            <button
              onClick={() => setExpandedTactic(expandedTactic === tactic.name ? null : tactic.name)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div>
                <h3 className="font-medium">{tactic.name}</h3>
                <p className="text-sm text-gray-400">
                  {tactic.techniques.length} techniques detected
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-cyan-500 font-medium">{tactic.totalCount} events</span>
                {expandedTactic === tactic.name ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>
            {expandedTactic === tactic.name && (
              <div className="p-4 space-y-3">
                {tactic.techniques.map((technique) => (
                  <div
                    key={technique.id}
                    className={`border rounded-md p-3 ${getIntensityClass(technique.count, maxCount)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium flex items-center">
                          {technique.name}
                          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded ml-2">
                            {technique.id}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-300 mt-1">
                          {technique.count} occurrences detected
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedTechnique(
                            selectedTechnique?.id === technique.id ? null : technique
                          )
                        }
                        className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                        title="View details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedTechnique?.id === technique.id && (
                      <div className="mt-3 border-t border-gray-600 pt-3">
                        <p className="text-sm text-gray-300 mb-3">{technique.description}</p>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Recent Events:</h5>
                          {technique.events.slice(0, 3).map((event, index) => (
                            <div key={index} className="text-xs bg-gray-800 p-2 rounded">
                              <p className="text-gray-400">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                              <p className="text-cyan-500">
                                {event.sourceIP} - {event.details}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
