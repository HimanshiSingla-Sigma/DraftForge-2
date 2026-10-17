import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Database, Network } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../../services/api';
import { HealthCheckResponse } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkHealth();
      setHealth(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to connect to backend telemetry service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHealth();
  }, [isOpen]);

  const getServiceIcon = (key: string) => {
    if (key.includes('postgresql')) return <Database className="w-5 h-5 text-indigo-400" />;
    if (key.includes('qdrant')) return <Server className="w-5 h-5 text-cyan-400" />;
    if (key.includes('neo4j')) return <Network className="w-5 h-5 text-amber-400" />;
    return <Activity className="w-5 h-5 text-primary-400" />;
  };

  const getServiceLabel = (key: string) => {
    if (key === 'supabase_postgresql') return 'Supabase PostgreSQL';
    if (key === 'qdrant_cloud') return 'Qdrant Cloud Vector DB';
    if (key === 'neo4j_aura') return 'Neo4j Aura Knowledge Graph';
    return key.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Architecture Health"
      subtitle="Live end-to-end telemetry across managed database clusters"
      icon={<Activity className="w-5 h-5" />}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" label="Querying cloud infrastructure status..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-sm flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Health Verification Failed</p>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        ) : health ? (
          <>
            {/* Top Status Banner */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                health.status === 'healthy'
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                  : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              }`}
            >
              <div className="flex items-center gap-3">
                {health.status === 'healthy' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#059669]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#D97706]" />
                )}
                <div>
                  <h4 className="font-serif font-black text-sm capitalize text-[#0B192C]">
                    System State: {health.status}
                  </h4>
                  <p className="text-xs font-mono opacity-80">
                    DraftForge API Runtime v{health.app_version}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchHealth}
                className="p-2 rounded-xl bg-white hover:bg-[#F3F0EA] text-[#0B192C] border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] tactile-btn transition-colors"
                title="Refresh telemetry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-[#5A6A80] uppercase tracking-wider font-mono">
                Managed Cloud Nodes
              </h5>
              {Object.entries(health.services).map(([key, s]) => {
                if (!s) return null;
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E6E2D8] flex items-center justify-center shadow-sm">
                        {getServiceIcon(key)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B192C]">
                          {getServiceLabel(key)}
                        </p>
                        <p className="text-xs text-[#5A6A80] font-mono">{s.details}</p>
                      </div>
                    </div>
                    <div>
                      {s.reachable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] tactile-btn transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
