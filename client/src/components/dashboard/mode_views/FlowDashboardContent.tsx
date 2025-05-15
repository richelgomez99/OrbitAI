import React from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Card } from "@/components/ui/card";

const FlowDashboardContent: React.FC = () => {
  const { tasks } = useOrbit();
  // TODO: Implement logic for "Switcher for 'What do I feel like?'" and "AI 'flow continuity' tracker"

  return (
    <div className="animate-fade-in">
      {/* TODO: Implement Flow Mode UI: Minimal UI, dynamic adjustment, one-task-at-a-time, AI next suggestion */}
      <Card className="p-4">
        <p className="text-lg font-semibold">Flow Mode Activated</p>
        <p>One task with timer or focus overlay, Switcher for “What do I feel like?”, AI “flow continuity” tracker.</p>
        <p className="mt-2 text-sm text-neutral-400">Placeholder for Flow Mode specific content.</p>
      </Card>
    </div>
  );
};

export default FlowDashboardContent;
