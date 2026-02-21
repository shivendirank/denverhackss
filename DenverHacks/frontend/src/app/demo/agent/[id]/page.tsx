import { notFound } from 'next/navigation';
import { getAgentDetailById } from '@/lib/agents';
import { AgentPageWrapper } from '@/components/ui/agent-page-wrapper';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const { id } = await params;
  const agent = getAgentDetailById(id);
  if (!agent) notFound();
  return <AgentPageWrapper agent={agent} />;
}

// Generate static params for all agent IDs
export async function generateStaticParams() {
  return [
    { id: '01' },
    { id: '02' },
    { id: '03' },
    { id: '04' },
    { id: '05' },
  ];
}
