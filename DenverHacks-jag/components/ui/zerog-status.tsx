'use client';

import { useEffect, useState } from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface ZeroGStatusProps {
  apiBaseUrl?: string;
}

export default function ZeroGStatus({ apiBaseUrl = 'http://localhost:3000' }: ZeroGStatusProps) {
  const [status, setStatus] = useState<{ minted: number; total: number } | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/zg/agents/status`)
      .then(res => res.json())
      .then(data => {
        setStatus({ minted: data.minted || 0, total: data.total || 0 });
      })
      .catch(console.error);
  }, [apiBaseUrl]);

  if (!status) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-zinc-900/90 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-white/40 mb-1">0G Identity NFTs</div>
          <div className="text-lg font-bold text-white">
            {status.minted}<span className="text-white/40">/{status.total}</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1">Agents on-chain</div>
        </div>
        <a
          href="https://explorer-testnet.0g.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 transition-colors ml-2"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
