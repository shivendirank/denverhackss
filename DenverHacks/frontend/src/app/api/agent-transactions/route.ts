import { NextResponse } from 'next/server';

/**
 * Agent-to-Agent Transaction API
 * Handles x402 payments between AI agents
 */

interface AgentTransaction {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  amount: string;
  amountKITE: number;
  purpose: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: number;
  hcsProof?: string;
}

// Simulate agent-to-agent transactions
let transactions: AgentTransaction[] = [];

export async function GET() {
  return NextResponse.json({
    transactions: transactions.slice(0, 50), // Last 50 transactions
    totalCount: transactions.length
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromAgentId, toAgentId, amount, purpose } = body;

    // Validate
    if (!fromAgentId || !toAgentId || !amount || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get agent names (would come from database in production)
    const agentNames: Record<string, string> = {
      '01': 'Neural Core',
      '02': 'Quantum Mind',
      '03': 'Cyber Vision',
      '04': 'Data Nexus',
      '05': 'Synapse AI'
    };

    const transaction: AgentTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromAgentId,
      fromAgentName: agentNames[fromAgentId] || `Agent ${fromAgentId}`,
      toAgentId,
      toAgentName: agentNames[toAgentId] || `Agent ${toAgentId}`,
      amount: `${amount} KITE`,
      amountKITE: parseFloat(amount),
      purpose,
      status: 'pending',
      timestamp: Date.now()
    };

    // Add to transactions
    transactions.unshift(transaction);

    // Simulate async processing
    setTimeout(async () => {
      transaction.status = 'processing';
      
      // Simulate x402 payment flow
      setTimeout(() => {
        transaction.status = 'confirmed';
        transaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        transaction.hcsProof = `hcs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }, 2000);
    }, 500);

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Agent transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
