"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, ExternalLink, Zap } from "lucide-react";

interface Transaction {
  id: string;
  fromAgentName: string;
  toAgentName: string;
  amount: string;
  purpose: string;
  txHash?: string;
  timestamp: number;
}

interface NotificationContextType {
  addNotification: (transaction: Transaction) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  onNotificationClick?: (transaction: Transaction) => void;
}

export function NotificationProvider({ 
  children, 
  onNotificationClick 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Transaction[]>([]);

  const addNotification = (transaction: Transaction) => {
    setNotifications(prev => [transaction, ...prev].slice(0, 5)); // Keep last 5

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== transaction.id));
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      {/* Notification Container - Top Right */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto"
            >
              <div
                onClick={() => onNotificationClick?.(notification)}
                className="group relative w-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4 shadow-2xl shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
              >
                {/* Success Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>

                {/* Content */}
                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                      Transaction Complete
                      <Zap className="w-3 h-3 text-cyan-400" />
                    </h3>
                    
                    <div className="space-y-1 text-xs text-zinc-300">
                      <p>
                        <span className="text-emerald-400 font-medium">{notification.fromAgentName}</span>
                        {" → "}
                        <span className="text-cyan-400 font-medium">{notification.toAgentName}</span>
                      </p>
                      <p className="text-white/80">
                        Amount: <span className="font-mono font-semibold">{notification.amount}</span>
                      </p>
                      <p className="text-zinc-400 truncate">{notification.purpose}</p>
                    </div>

                    {notification.txHash && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <a
                          href={`https://testnet.kitescan.ai/tx/${notification.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Kitescan
                        </a>
                      </div>
                    )}

                    {/* Click Hint */}
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-[10px] text-cyan-400/80 uppercase tracking-wider">
                        Click to see X402 protocol demo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
