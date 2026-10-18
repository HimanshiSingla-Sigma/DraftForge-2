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
    if (key === 'supabase_postgresql') return 'Primary Database & User Directory';
    if (key === 'qdrant_cloud') return 'Statutory Precedent Vector Index';
    if (key === 'neo4j_aura') return 'Doctrinal Fallacy Knowledge Graph';
    return key.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Architecture & Connectivity"
      subtitle="Live connectivity and response status across core platform databases"
      icon={<Activity className="w-4 h-4" />}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" label="Checking database connectivity..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Connectivity Check Failed</p>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        ) : health ? (
          <>
            {/* Top Status Banner */}
            <div
              className={`p-4 rounded-lg border flex items-center justify-between ${
                health.status === 'healthy'
                  ? 'bg-[#E8F3ED] border-[#557B68]/30 text-[#557B68]'
                  : 'bg-[#FBF0E4] border-[#C78335]/30 text-[#C78335]'
              }`}
            >
              <div className="flex items-center gap-3">
                {health.status === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#557B68]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#C78335]" />
                )}
                <div>
                  <h4 className="font-serif font-medium text-sm capitalize text-[#20344A]">
                    Operational Status: {health.status}
                  </h4>
                  <p className="text-xs font-mono text-[#74777D]">
                    DraftForge Platform v{health.app_version}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchHealth}
                className="p-1.5 rounded bg-white hover:bg-[#F3EFE6] text-[#20344A] border border-[#E5DED2] transition-colors shadow-xs"
                title="Refresh connectivity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-mono font-medium text-[#74777D] uppercase tracking-wider">
                Connected Core Services
              </h5>
              {Object.entries(health.services).map(([key, s]) => {
                if (!s) return null;
                return (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white border border-[#E5DED2] flex items-center justify-center text-[#20344A] shadow-xs">
                        {getServiceIcon(key)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#20344A]">
                          {getServiceLabel(key)}
                        </p>
                        <p className="text-[11px] text-[#74777D] font-mono">{s.details}</p>
                      </div>
                    </div>
                    <div>
                      {s.reachable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#E8F3ED] text-[#557B68] border border-[#557B68]/30 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#557B68] animate-pulse" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 font-mono">
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
            className="px-4 py-2 text-xs font-medium text-[#20344A] bg-[#FBF8F2] hover:bg-[#F3EFE6] rounded border border-[#E5DED2] transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
