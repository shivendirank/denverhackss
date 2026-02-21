"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { NotificationProvider, useNotifications } from "@/components/ui/transaction-notifications";
import { X402Demo } from "@/components/ui/x402-demo-modal";
import SpatialProductShowcase from "@/components/ui/spatial-product-showcase";
import type { AgentDetail } from "@/lib/agents";

interface Transaction {
  id: string;
  fromAgentName: string;
  toAgentName: string;
  amount: string;
  purpose: string;
  txHash?: string;
  timestamp: number;
}

interface AgentPageContentProps {
  agent: AgentDetail;
  onModalOpen: (transaction: Transaction) => void;
}

function AgentPageContent({ agent, onModalOpen }: AgentPageContentProps) {
  const { addNotification } = useNotifications();

  return (
    <SpatialProductShowcase 
      data={agent}
      onTransactionComplete={(transaction: Transaction) => {
        addNotification(transaction);
      }}
    />
  );
}

export function AgentPageWrapper({ agent }: { agent: AgentDetail }) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <NotificationProvider
      onNotificationClick={(transaction) => {
        setSelectedTransaction(transaction);
      }}
    >
      <AgentPageContent agent={agent} onModalOpen={setSelectedTransaction} />
      
      {/* X402 Demo Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <X402Demo
            fromAgent={selectedTransaction.fromAgentName}
            toAgent={selectedTransaction.toAgentName}
            amount={selectedTransaction.amount}
            purpose={selectedTransaction.purpose}
            txHash={selectedTransaction.txHash}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </NotificationProvider>
  );
}
