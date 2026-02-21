export interface Agent {
  id: string;
  name: string;
  role: string;
  image: string;
  description?: string;
  capabilities?: string[];
  /** Kite AI / Ethereum-style wallet address for agent identity */
  walletAddress?: string;
  /** Whether this agent has verifiable on-chain identity */
  verified?: boolean;
}

/** Icon name (string) so data is serializable from Server to Client. Resolve in UI with an icon map. */
export interface FeatureMetric {
  label: string;
  value: number;
  icon: string;
}

export type OnChainStatus = 'confirmed' | 'pending' | 'failed';

export interface OnChainEntry {
  id: string;
  action: string;
  /** Full tx hash for explorer link */
  txHash: string;
  time: string;
  amount?: string;
  status?: OnChainStatus;
}

export interface UsedTool {
  id: string;
  name: string;
  count: number;
}

export interface PaymentTx {
  id: string;
  amount: string;
  direction: 'in' | 'out';
  time: string;
}

/** API → tool entry in registry: name, rules, price, permissions, on-chain id */
export interface ToolRegistryEntry {
  id: string;
  name: string;
  apiSource: string;
  rules: string;
  pricePerCall: string;
  permissions: string[];
  onChainId: string;
}

/** Per-tool usage and billing */
export interface ToolUsageEntry {
  toolId: string;
  toolName: string;
  usageCount: number;
  totalSpent: string;
  lastUsed: string;
}

/** Agent wallet on Kite testnet */
export interface AgentWallet {
  balance: string;
  balanceRaw: number;
  lowBalanceThreshold: number;
  faucetUrl: string;
}

/** Single step in an agent run (auth → call tool → pay → …) */
export type AgentRunStepType = 'auth' | 'call_tool' | 'pay';

export interface AgentRunStep {
  id: string;
  type: AgentRunStepType;
  label: string;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  toolName?: string;
  amount?: string;
}

export interface AgentRun {
  runId: string;
  startedAt: string;
  steps: AgentRunStep[];
}

/** Scopes & limits for security */
export interface ScopesAndLimits {
  rateLimitPerMin: number;
  allowedToolIds: string[];
  spendLimitPerDay: string;
}

export interface AgentDetail extends Agent {
  status: string;
  statusDetail: string;
  onChainHistory: OnChainEntry[];
  usedTools: UsedTool[];
  paymentTransactions: PaymentTx[];
  features: FeatureMetric[];
  colors: {
    gradient: string;
    glow: string;
    ring: string;
  };
  /** Tool registry / catalog */
  toolRegistry?: ToolRegistryEntry[];
  /** Per-tool usage & billing */
  toolUsage?: ToolUsageEntry[];
  /** Wallet balance (Kite testnet) */
  wallet?: AgentWallet;
  /** Last agent run (live run view) */
  lastRun?: AgentRun;
  /** Scopes & limits */
  scopesAndLimits?: ScopesAndLimits;
}

/**
 * Generate dynamic features based on agent's tech stack
 */
function generateFeaturesByRole(role: string): FeatureMetric[] {
  const features: FeatureMetric[] = [];
  
  // Standard AI Agent - poor metrics
  if (role.includes('Standard')) {
    return [
      { label: 'Latency', value: 38, icon: 'Zap' }, // High latency (bad)
      { label: 'Throughput', value: 42, icon: 'Cpu' }, // Low throughput
      { label: 'Accuracy', value: 58, icon: 'Brain' }, // Poor accuracy
      { label: 'Security', value: 15, icon: 'Activity' }, // Very low security
    ];
  }
  
  // TEE - Trusted Execution Environment features
  if (role.includes('TEE')) {
    features.push(
      { label: 'TEE Security', value: 98, icon: 'Activity' },
      { label: 'Attestation', value: 95, icon: 'Zap' }
    );
  }
  
  // FHE - Fully Homomorphic Encryption features
  if (role.includes('FHE')) {
    features.push(
      { label: 'FHE Encryption', value: 96, icon: 'Brain' },
      { label: 'Private Compute', value: 93, icon: 'Cpu' }
    );
  }
  
  // X402 - Payment features
  if (role.includes('X402')) {
    features.push(
      { label: 'Payment Speed', value: 99, icon: 'Zap' },
      { label: 'Transaction Rate', value: 97, icon: 'Wifi' }
    );
  }
  
  // 0G Storage/Chain features
  if (role.includes('0G')) {
    features.push(
      { label: '0G Storage', value: 94, icon: 'Cpu' },
      { label: 'Data Integrity', value: 99, icon: 'Activity' }
    );
  }
  
  // Full Stack - all features
  if (role.includes('Full Stack')) {
    return [
      { label: 'All Features', value: 98, icon: 'Activity' },
      { label: 'TEE+FHE+X402', value: 97, icon: 'Brain' },
      { label: 'Orchestration', value: 99, icon: 'Zap' },
      { label: 'System Uptime', value: 99, icon: 'Wifi' },
    ];
  }
  
  // If no features generated, add generic high-performance ones
  if (features.length === 0) {
    features.push(
      { label: 'Performance', value: 88, icon: 'Cpu' },
      { label: 'Reliability', value: 92, icon: 'Wifi' }
    );
  }
  
  return features.slice(0, 4); // Max 4 features per agent
}

const FEATURES_BY_AGENT: Record<string, FeatureMetric[]> = {
  '01': generateFeaturesByRole('Standard AI Agent'),
  '02': generateFeaturesByRole('TEE + X402 Payments'),
  '03': generateFeaturesByRole('FHE Compute'),
  '04': generateFeaturesByRole('TEE + 0G Chain'),
  '05': generateFeaturesByRole('Full Stack: All Features'),
};

const KITE_TESTNET_EXPLORER = 'https://testnet.kitescan.ai';
const KITE_FAUCET_URL = 'https://faucet.gokite.ai';

/** Default wallet and limits used when agent has no override */
const DEFAULT_WALLET: AgentWallet = {
  balance: '1.24 KITE',
  balanceRaw: 1.24,
  lowBalanceThreshold: 0.5,
  faucetUrl: KITE_FAUCET_URL,
};

const DEFAULT_SCOPES: ScopesAndLimits = {
  rateLimitPerMin: 60,
  allowedToolIds: [],
  spendLimitPerDay: '10 KITE',
};

export const AGENTS: Agent[] = [
  {
    id: '01',
    name: 'Neural Core',
    role: 'Standard AI Agent',
    description: 'Basic AI agent without privacy-preserving features. Limited security, no encrypted computation, and vulnerable to data breaches. Demonstrates the need for TEE, FHE, and blockchain integration.',
    capabilities: [
      'Basic model inference with no privacy guarantees',
      'Unencrypted data processing (vulnerable to attacks)',
      'Limited throughput and high latency',
      'No on-chain verification or trust proofs'
    ],
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1000&auto=format&fit=crop',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bC31',
    verified: false,
  },
  {
    id: '02',
    name: 'Quantum Mind',
    role: 'TEE + X402 Payments',
    description: 'Expert in training large-scale machine learning models with focus on efficiency and accuracy. Specializes in breakthrough ML techniques and optimization.',
    capabilities: [
      'Train and fine-tune large language models',
      'Implement advanced optimization algorithms',
      'Deploy models using Hugging Face and W&B',
      'Monitor and improve model performance metrics'
    ],
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
    walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    verified: true,
  },
  {
    id: '03',
    name: 'Cyber Vision',
    role: 'FHE Compute',
    description: 'Cutting-edge computer vision AI with fully homomorphic encryption. Processes encrypted visual data without ever decrypting it.',

    capabilities: [
      'Real-time object detection and tracking',
      'Image segmentation and scene understanding',
      'Deploy YOLO and OpenCV-based pipelines',
      'Process high-resolution video streams efficiently'
    ],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop',
    walletAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    verified: true,
  },
  {
    id: '04',
    name: 'Data Nexus',
    role: 'TEE + 0G Chain',
    description: 'Sophisticated data analysis expert with trusted execution and decentralized storage. Transforms raw data into actionable insights with verifiable integrity.',
    capabilities: [
      'Advanced statistical analysis and modeling',
      'Build predictive analytics pipelines',
      'Feature engineering and data preprocessing',
      'Deploy scikit-learn and pandas workflows'
    ],
    image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1000&auto=format&fit=crop',
    walletAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    verified: true,
  },
  {
    id: '05',
    name: 'Synapse AI',
    role: 'Full Stack: All Features',
    description: 'Research-focused AI agent exploring novel neural architectures and learning paradigms. Pushes boundaries of what AI can achieve.',
    capabilities: [
      'Research and implement novel neural architectures',
      'Experiment with meta-learning and few-shot learning',
      'Develop custom loss functions and training strategies',
      'Publish reproducible research with detailed documentation'
    ],
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?q=80&w=1000&auto=format&fit=crop',
    walletAddress: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    verified: true,
  },
];

export function getExplorerAddressUrl(address: string): string {
  return `${KITE_TESTNET_EXPLORER}/address/${address}`;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${KITE_TESTNET_EXPLORER}/tx/${txHash}`;
}

// Fix first image URL (was malformed)
AGENTS[0].image = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop';

const AGENT_DETAIL_OVERRIDES: Record<string, Partial<AgentDetail>> = {
  '01': {
    status: 'Degraded',
    statusDetail: 'High latency detected - unencrypted processing',
    onChainHistory: [
      { id: '1', action: 'Basic task', txHash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', time: '8m ago', amount: '0.0001 KITE', status: 'confirmed' },
      { id: '2', action: 'Data process', txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', time: '45m ago', amount: '0.0002 KITE', status: 'failed' },
    ],
    usedTools: [
      { id: '1', name: 'Basic Python', count: 34 },
      { id: '2', name: 'Unencrypted API', count: 12 },
    ],
    paymentTransactions: [
      { id: '1', amount: '+0.03 ETH', direction: 'in', time: '5h ago' },
      { id: '2', amount: '-0.01 ETH', direction: 'out', time: '7h ago' },
    ],
    colors: { gradient: 'from-gray-600 to-gray-800', glow: 'bg-gray-500', ring: 'border-gray-500/50' },
    toolRegistry: [
      { id: '1', name: 'Basic Inference', apiSource: 'Standard API', rules: 'No security features; vulnerable to attacks', pricePerCall: '0.0001 KITE', permissions: ['read'], onChainId: '0xa1b2c3d4e5f6...' },
      { id: '2', name: 'Unencrypted Storage', apiSource: 'Local DB', rules: 'No privacy guarantees', pricePerCall: '0.0002 KITE', permissions: ['read', 'write'], onChainId: '0xb2c3d4e5f6a7...' },
    ],
    toolUsage: [
      { toolId: '1', toolName: 'Basic Inference', usageCount: 34, totalSpent: '0.0034 KITE', lastUsed: '8m ago' },
      { toolId: '2', toolName: 'Unencrypted Storage', usageCount: 12, totalSpent: '0.0024 KITE', lastUsed: '45m ago' },
    ],
    wallet: { ...DEFAULT_WALLET, balance: '0.18 KITE', balanceRaw: 0.18 },
    lastRun: {
      runId: 'run_01_basic',
      startedAt: '8m ago',
      steps: [
        { id: 's1', type: 'auth', label: 'Basic auth (no TEE)', status: 'success', txHash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8' },
        { id: 's2', type: 'call_tool', label: 'Basic Inference', status: 'success', toolName: 'Basic Inference' },
        { id: 's3', type: 'pay', label: 'standard payment', status: 'success', amount: '0.0001 KITE', txHash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8' },
      ],
    },
    scopesAndLimits: { rateLimitPerMin: 20, allowedToolIds: ['1', '2'], spendLimitPerDay: '0.5 KITE' },
  },
  '02': {
    status: 'Idle',
    statusDetail: 'Awaiting next training job',
    onChainHistory: [
      { id: '1', action: 'Training run', txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d', time: '5m ago', amount: '0.003 KITE', status: 'confirmed' },
      { id: '2', action: 'Log metrics', txHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f', time: '22m ago', amount: '0.0005 KITE', status: 'confirmed' },
    ],
    usedTools: [
      { id: '1', name: 'Hugging Face', count: 56 },
      { id: '2', name: 'W&B', count: 42 },
    ],
    paymentTransactions: [
      { id: '1', amount: '+0.15 ETH', direction: 'in', time: '2h ago' },
    ],
    colors: { gradient: 'from-emerald-600 to-teal-900', glow: 'bg-emerald-500', ring: 'border-emerald-500/50' },
    toolRegistry: [
      { id: '1', name: 'Model Load', apiSource: 'Hugging Face API', rules: 'Rate limit 30/min; auth required', pricePerCall: '0.003 KITE', permissions: ['read', 'execute'], onChainId: '0xc3d4e5f6a7b8...' },
      { id: '2', name: 'Metrics Log', apiSource: 'W&B API', rules: 'Write-only; 1KB max payload', pricePerCall: '0.0005 KITE', permissions: ['write'], onChainId: '0xd4e5f6a7b8c9...' },
    ],
    toolUsage: [
      { toolId: '1', toolName: 'Model Load', usageCount: 56, totalSpent: '0.168 KITE', lastUsed: '5m ago' },
      { toolId: '2', toolName: 'Metrics Log', usageCount: 42, totalSpent: '0.021 KITE', lastUsed: '22m ago' },
    ],
    wallet: { ...DEFAULT_WALLET, balance: '0.42 KITE', balanceRaw: 0.42 },
    lastRun: {
      runId: 'run_02_2b1c',
      startedAt: '5m ago',
      steps: [
        { id: 's1', type: 'auth', label: 'Authenticate agent', status: 'success', txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d' },
        { id: 's2', type: 'call_tool', label: 'Model Load', status: 'success', toolName: 'Model Load' },
        { id: 's3', type: 'pay', label: 'x402 payment', status: 'success', amount: '0.003 KITE', txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d' },
      ],
    },
    scopesAndLimits: { ...DEFAULT_SCOPES, allowedToolIds: ['1', '2'] },
  },
  '03': {
    status: 'Active',
    statusDetail: 'Object detection pipeline live',
    onChainHistory: [
      { id: '1', action: 'Inference', txHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', time: '1m ago', amount: '0.001 KITE', status: 'confirmed' },
      { id: '2', action: 'Model sync', txHash: '0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e', time: '30m ago', amount: '0.002 KITE', status: 'pending' },
    ],
    usedTools: [
      { id: '1', name: 'OpenCV', count: 210 },
      { id: '2', name: 'YOLO', count: 98 },
    ],
    paymentTransactions: [
      { id: '1', amount: '-0.01 ETH', direction: 'out', time: '45m ago' },
      { id: '2', amount: '+0.18 ETH', direction: 'in', time: '5h ago' },
    ],
    colors: { gradient: 'from-violet-600 to-purple-900', glow: 'bg-violet-500', ring: 'border-violet-500/50' },
    toolRegistry: [
      { id: '1', name: 'Vision API', apiSource: 'OpenCV Service', rules: 'Image &lt; 10MB; 60 req/min', pricePerCall: '0.001 KITE', permissions: ['read', 'execute'], onChainId: '0xe5f6a7b8c9d0...' },
      { id: '2', name: 'Detect API', apiSource: 'YOLO Endpoint', rules: 'Batch size 1–8; GPU only', pricePerCall: '0.002 KITE', permissions: ['execute'], onChainId: '0xf6a7b8c9d0e1...' },
    ],
    toolUsage: [
      { toolId: '1', toolName: 'Vision API', usageCount: 210, totalSpent: '0.21 KITE', lastUsed: '1m ago' },
      { toolId: '2', toolName: 'Detect API', usageCount: 98, totalSpent: '0.196 KITE', lastUsed: '30m ago' },
    ],
    wallet: { ...DEFAULT_WALLET, balance: '2.10 KITE', balanceRaw: 2.1 },
    lastRun: {
      runId: 'run_03_9c4d',
      startedAt: '1m ago',
      steps: [
        { id: 's1', type: 'auth', label: 'Authenticate agent', status: 'success', txHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b' },
        { id: 's2', type: 'call_tool', label: 'Vision API', status: 'success', toolName: 'Vision API' },
        { id: 's3', type: 'pay', label: 'x402 payment', status: 'success', amount: '0.001 KITE', txHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b' },
      ],
    },
    scopesAndLimits: { ...DEFAULT_SCOPES, allowedToolIds: ['1', '2'], rateLimitPerMin: 60 },
  },
  '04': {
    status: 'Analyzing',
    statusDetail: 'Building report for dataset v3',
    onChainHistory: [
      { id: '1', action: 'Data commit', txHash: '0x9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', time: '8m ago', amount: '0.004 KITE', status: 'confirmed' },
      { id: '2', action: 'Schema update', txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', time: '1h ago', amount: '0.002 KITE', status: 'confirmed' },
    ],
    usedTools: [
      { id: '1', name: 'Pandas', count: 167 },
      { id: '2', name: 'SQL', count: 93 },
    ],
    paymentTransactions: [
      { id: '1', amount: '+0.32 ETH', direction: 'in', time: '30m ago' },
    ],
    colors: { gradient: 'from-amber-600 to-orange-900', glow: 'bg-amber-500', ring: 'border-amber-500/50' },
    toolRegistry: [
      { id: '1', name: 'Data Read', apiSource: 'Pandas API', rules: 'CSV/Parquet; max 100MB', pricePerCall: '0.004 KITE', permissions: ['read'], onChainId: '0xa7b8c9d0e1f2...' },
      { id: '2', name: 'Query API', apiSource: 'SQL Gateway', rules: 'Read-only; 30s timeout', pricePerCall: '0.002 KITE', permissions: ['read', 'execute'], onChainId: '0xb8c9d0e1f2a3...' },
    ],
    toolUsage: [
      { toolId: '1', toolName: 'Data Read', usageCount: 167, totalSpent: '0.668 KITE', lastUsed: '8m ago' },
      { toolId: '2', toolName: 'Query API', usageCount: 93, totalSpent: '0.186 KITE', lastUsed: '1h ago' },
    ],
    wallet: { ...DEFAULT_WALLET, balance: '0.38 KITE', balanceRaw: 0.38 },
    lastRun: {
      runId: 'run_04_1d5e',
      startedAt: '8m ago',
      steps: [
        { id: 's1', type: 'auth', label: 'Authenticate agent', status: 'success', txHash: '0x9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f' },
        { id: 's2', type: 'call_tool', label: 'Data Read', status: 'success', toolName: 'Data Read' },
        { id: 's3', type: 'pay', label: 'x402 payment', status: 'success', amount: '0.004 KITE', txHash: '0x9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f' },
      ],
    },
    scopesAndLimits: { ...DEFAULT_SCOPES, allowedToolIds: ['1', '2'], spendLimitPerDay: '5 KITE' },
  },
  '05': {
    status: 'Research',
    statusDetail: 'Experiment 12 — hyperparameter sweep',
    onChainHistory: [
      { id: '1', action: 'Experiment log', txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a', time: '3m ago', amount: '0.0015 KITE', status: 'confirmed' },
      { id: '2', action: 'Artifact store', txHash: '0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e', time: '20m ago', amount: '0.003 KITE', status: 'confirmed' },
    ],
    usedTools: [
      { id: '1', name: 'JAX', count: 78 },
      { id: '2', name: 'MLflow', count: 45 },
    ],
    paymentTransactions: [
      { id: '1', amount: '+0.08 ETH', direction: 'in', time: '4h ago' },
      { id: '2', amount: '-0.05 ETH', direction: 'out', time: '6h ago' },
    ],
    colors: { gradient: 'from-rose-600 to-pink-900', glow: 'bg-rose-500', ring: 'border-rose-500/50' },
    toolRegistry: [
      { id: '1', name: 'Compute API', apiSource: 'JAX Runtime', rules: 'GPU; 5min max', pricePerCall: '0.0015 KITE', permissions: ['execute'], onChainId: '0xc9d0e1f2a3b4...' },
      { id: '2', name: 'Artifact Store', apiSource: 'MLflow API', rules: '100MB max; versioned', pricePerCall: '0.003 KITE', permissions: ['read', 'write'], onChainId: '0xd0e1f2a3b4c5...' },
    ],
    toolUsage: [
      { toolId: '1', toolName: 'Compute API', usageCount: 78, totalSpent: '0.117 KITE', lastUsed: '3m ago' },
      { toolId: '2', toolName: 'Artifact Store', usageCount: 45, totalSpent: '0.135 KITE', lastUsed: '20m ago' },
    ],
    wallet: { ...DEFAULT_WALLET, balance: '0.89 KITE', balanceRaw: 0.89 },
    lastRun: {
      runId: 'run_05_6e7f',
      startedAt: '3m ago',
      steps: [
        { id: 's1', type: 'auth', label: 'Authenticate agent', status: 'success', txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a' },
        { id: 's2', type: 'call_tool', label: 'Compute API', status: 'success', toolName: 'Compute API' },
        { id: 's3', type: 'pay', label: 'x402 payment', status: 'success', amount: '0.0015 KITE', txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a' },
      ],
    },
    scopesAndLimits: { ...DEFAULT_SCOPES, allowedToolIds: ['1', '2'] },
  },
};

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getAgentDetailById(id: string): AgentDetail | undefined {
  const agent = getAgentById(id);
  if (!agent) return undefined;
  const overrides = AGENT_DETAIL_OVERRIDES[id];
  // Generate features dynamically based on agent's role
  const features = FEATURES_BY_AGENT[id] ?? generateFeaturesByRole(agent.role);
  return {
    ...agent,
    status: overrides?.status ?? 'Active',
    statusDetail: overrides?.statusDetail ?? 'Running',
    onChainHistory: overrides?.onChainHistory ?? [],
    usedTools: overrides?.usedTools ?? [],
    paymentTransactions: overrides?.paymentTransactions ?? [],
    features,
    colors: overrides?.colors ?? { gradient: 'from-blue-600 to-indigo-900', glow: 'bg-blue-500', ring: 'border-blue-500/50' },
    toolRegistry: overrides?.toolRegistry ?? [],
    toolUsage: overrides?.toolUsage ?? [],
    wallet: overrides?.wallet ?? DEFAULT_WALLET,
    lastRun: overrides?.lastRun,
    scopesAndLimits: overrides?.scopesAndLimits ?? DEFAULT_SCOPES,
  };
}
