import React from 'react';
import { ArrowLeft, Brain, Target, Database, GitBranch } from 'lucide-react';
import type { TrainingData, User } from '../types';

// Mock training data - replace with actual data in production
const mockTrainingData: TrainingData = {
  samples: 15000,
  features: ['eventid', 'timestamp', 'source_ip', 'protocol', 'duration', 'bytes', 'packets'],
  accuracy: 95.5,
  validationScore: 94.8,
  confusionMatrix: [
    [2500, 150],
    [200, 2150]
  ]
};

interface ModelDetailsProps {
  onBack: () => void;
  user: User;
}

export function ModelDetails({ onBack, user }: ModelDetailsProps) {
  const canViewDetails = user.role === 'admin' || user.role === 'analyst';

  if (!canViewDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to view model details.</p>
          <button
            onClick={onBack}
            className="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-cyan-500 mr-3" />
              <h3 className="text-lg font-medium">Dataset Overview</h3>
            </div>
            <p className="text-3xl font-bold text-cyan-500 mb-2">
              {mockTrainingData.samples.toLocaleString()}
            </p>
            <p className="text-gray-400">Total Training Samples</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-lg font-medium">Model Performance</h3>
            </div>
            <p className="text-3xl font-bold text-green-500 mb-2">
              {mockTrainingData.accuracy}%
            </p>
            <p className="text-gray-400">Training Accuracy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 text-purple-500 mr-3" />
              <h2 className="text-xl font-bold">Model Features</h2>
            </div>
            <div className="space-y-3">
              {mockTrainingData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-700 p-3 rounded-md"
                >
                  <GitBranch className="w-4 h-4 text-cyan-500 mr-3" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Confusion Matrix</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900 bg-opacity-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-300 mb-2">True Negative</p>
                  <p className="text-2xl font-bold text-green-400">
                    {mockTrainingData.confusionMatrix[0][0]}
                  </p>
                </div>
                <div className="bg-red-900 bg-opacity-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-300 mb-2">False Positive</p>
                  <p className="text-2xl font-bold text-red-400">
                    {mockTrainingData.confusionMatrix[0][1]}
                  </p>
                </div>
                <div className="bg-red-900 bg-opacity-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-300 mb-2">False Negative</p>
                  <p className="text-2xl font-bold text-red-400">
                    {mockTrainingData.confusionMatrix[1][0]}
                  </p>
                </div>
                <div className="bg-green-900 bg-opacity-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-300 mb-2">True Positive</p>
                  <p className="text-2xl font-bold text-green-400">
                    {mockTrainingData.confusionMatrix[1][1]}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Validation Results</h2>
              <div className="flex items-center justify-between bg-gray-700 p-4 rounded-md">
                <div>
                  <p className="text-sm text-gray-400">Validation Score</p>
                  <p className="text-2xl font-bold text-cyan-500">
                    {mockTrainingData.validationScore}%
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-cyan-500 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {Math.round((mockTrainingData.validationScore / mockTrainingData.accuracy) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}