import React, { useState } from 'react';
import { Shield, Plus, Trash2, Edit2, Play, Pause, AlertTriangle, Clock, Settings } from 'lucide-react';
import type { AutomatedResponse, ResponseCondition, ResponseAction, UserRole } from '../types';

// Mock data
const mockResponses: AutomatedResponse[] = [
  {
    id: '1',
    name: 'Brute Force Protection',
    description: 'Automatically block IPs attempting brute force attacks',
    conditions: [
      {
        type: 'event',
        operator: 'equals',
        value: 'SSH Login Attempt'
      },
      {
        type: 'count',
        operator: 'greaterThan',
        value: 5,
        timeWindow: 5 // 5 minutes
      }
    ],
    actions: [
      {
        type: 'block_ip',
        config: {
          duration: 60 // 60 minutes
        }
      },
      {
        type: 'notify',
        config: {
          notificationChannels: ['telegram', 'email']
        }
      }
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    lastTriggered: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    triggerCount: 3
  },
  {
    id: '2',
    name: 'SQL Injection Alert',
    description: 'Generate report and notify on SQL injection attempts',
    conditions: [
      {
        type: 'event',
        operator: 'contains',
        value: 'SQL Injection'
      }
    ],
    actions: [
      {
        type: 'report',
        config: {
          reportType: 'incident'
        }
      },
      {
        type: 'notify',
        config: {
          notificationChannels: ['telegram']
        }
      }
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    triggerCount: 1
  }
];

interface AutomatedResponseProps {
  userRole: UserRole;
}

export function AutomatedResponse({ userRole }: AutomatedResponseProps) {
  const [responses, setResponses] = useState<AutomatedResponse[]>(mockResponses);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AutomatedResponse | null>(null);

  const canManageResponses = userRole === 'admin';

  const handleToggleResponse = (id: string) => {
    setResponses(prev =>
      prev.map(response =>
        response.id === id
          ? { ...response, enabled: !response.enabled }
          : response
      )
    );
  };

  const handleDeleteResponse = (id: string) => {
    if (window.confirm('Are you sure you want to delete this automated response?')) {
      setResponses(prev => prev.filter(response => response.id !== id));
    }
  };

  const handleEditResponse = (response: AutomatedResponse) => {
    setSelectedResponse(response);
    setShowEditor(true);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-bold">Automated Responses</h2>
        </div>
        {canManageResponses && (
          <button
            onClick={() => {
              setSelectedResponse(null);
              setShowEditor(true);
            }}
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Response
          </button>
        )}
      </div>

      <div className="space-y-4">
        {responses.map((response) => (
          <div
            key={response.id}
            className={`bg-gray-700 rounded-lg p-4 border-l-4 ${
              response.enabled ? 'border-green-500' : 'border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-lg">{response.name}</h3>
                <p className="text-gray-400 text-sm">{response.description}</p>
              </div>
              {canManageResponses && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleResponse(response.id)}
                    className={`p-2 rounded-md transition-colors ${
                      response.enabled
                        ? 'bg-green-900 hover:bg-green-800 text-green-200'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={response.enabled ? 'Disable' : 'Enable'}
                  >
                    {response.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditResponse(response)}
                    className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteResponse(response.id)}
                    className="p-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  Conditions
                </h4>
                <div className="space-y-1">
                  {response.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="text-sm bg-gray-800 px-3 py-2 rounded"
                    >
                      {condition.type === 'count' ? (
                        <span>
                          More than {condition.value} events in {condition.timeWindow} minutes
                        </span>
                      ) : (
                        <span>
                          {condition.type} {condition.operator} {condition.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-cyan-500" />
                  Actions
                </h4>
                <div className="space-y-1">
                  {response.actions.map((action, index) => (
                    <div
                      key={index}
                      className="text-sm bg-gray-800 px-3 py-2 rounded"
                    >
                      {action.type === 'block_ip' && (
                        <span>
                          Block IP for {action.config.duration} minutes
                        </span>
                      )}
                      {action.type === 'notify' && (
                        <span>
                          Notify via {action.config.notificationChannels?.join(', ')}
                        </span>
                      )}
                      {action.type === 'report' && (
                        <span>
                          Generate {action.config.reportType} report
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Created {new Date(response.createdAt).toLocaleDateString()}
              </div>
              {response.lastTriggered && (
                <div>
                  Last triggered {new Date(response.lastTriggered).toLocaleString()}
                </div>
              )}
              <div>
                Triggered {response.triggerCount} times
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <ResponseEditor
          response={selectedResponse}
          onSave={(updatedResponse) => {
            if (selectedResponse) {
              setResponses(prev =>
                prev.map(r =>
                  r.id === selectedResponse.id ? updatedResponse : r
                )
              );
            } else {
              setResponses(prev => [...prev, {
                ...updatedResponse,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                triggerCount: 0
              }]);
            }
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

interface ResponseEditorProps {
  response: AutomatedResponse | null;
  onSave: (response: AutomatedResponse) => void;
  onCancel: () => void;
}

function ResponseEditor({ response, onSave, onCancel }: ResponseEditorProps) {
  const [name, setName] = useState(response?.name || '');
  const [description, setDescription] = useState(response?.description || '');
  const [conditions, setConditions] = useState<ResponseCondition[]>(
    response?.conditions || []
  );
  const [actions, setActions] = useState<ResponseAction[]>(
    response?.actions || []
  );

  const handleSave = () => {
    const updatedResponse: AutomatedResponse = {
      id: response?.id || '',
      name,
      description,
      conditions,
      actions,
      enabled: response?.enabled ?? true,
      createdAt: response?.createdAt || new Date().toISOString(),
      triggerCount: response?.triggerCount || 0
    };
    onSave(updatedResponse);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-6">
          {response ? 'Edit Response' : 'New Automated Response'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Response name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Describe what this response does"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name || !description}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-md transition-colors"
            >
              Save Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}