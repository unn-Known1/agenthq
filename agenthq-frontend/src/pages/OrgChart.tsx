import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
import { Plus, Bot, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useStore } from '../stores/appStore';
import { Agent } from '../lib/api';
import AgentModal from '../components/AgentModal';
import AgentDetailPanel from '../components/AgentDetailPanel';

const roleColors: Record<string, string> = {
  ceo: '#A855F7',
  cto: '#8B5CF6',
  engineer: '#06B6D4',
  designer: '#EC4899',
  marketing: '#F97316',
  support: '#10B981',
  custom: '#6366F1',
};

const roleLabels: Record<string, string> = {
  ceo: 'CEO',
  cto: 'CTO',
  engineer: 'Engineer',
  designer: 'Designer',
  marketing: 'Marketing',
  support: 'Support',
  custom: 'Custom',
};

function AgentCard({
  agent,
  isDraggable = true,
}: {
  agent: Agent;
  isDraggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: agent.id,
    data: { agent },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${agent.id}`,
    data: { agent },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${
        isOver ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#151921]' : ''
      }`}
    >
      <div
        className={`bg-[#0C0F14] border border-[#2A3142] rounded-xl p-4 hover:border-indigo-500/50 transition-all cursor-pointer ${
          agent.status === 'terminated' ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {isDraggable && (
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing text-[#5C6578] hover:text-[#9BA3B5]"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${roleColors[agent.role]}40, ${roleColors[agent.role]})`,
            }}
          >
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#F4F5F7] truncate">{agent.name}</p>
              {agent.status === 'active' && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
              {agent.status === 'paused' && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1"
              style={{
                backgroundColor: `${roleColors[agent.role]}20`,
                color: roleColors[agent.role],
              }}
            >
              {roleLabels[agent.role]}
            </span>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#5C6578]">
              <span className="capitalize">{agent.provider}</span>
              <span>•</span>
              <span>${agent.currentSpend.toFixed(0)} / ${agent.monthlyBudget}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgNode({
  agent,
  children,
  onSelect,
}: {
  agent: Agent;
  children?: React.ReactNode;
  onSelect: (agent: Agent) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col items-center">
      <div onClick={() => onSelect(agent)}>
        <AgentCard agent={agent} />
      </div>
      {children && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 p-1 rounded-lg hover:bg-[#1C222D] text-[#5C6578]"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expanded && (
            <div className="flex items-start gap-8 mt-2">
              {children}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { agents, fetchAgents, updateAgent, showAgentModal, setShowAgentModal } =
    useStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const activeAgents = agents.filter((a) => a.status !== 'terminated');
  const ceo = activeAgents.find((a) => a.role === 'ceo');
  const getChildren = (parentId: string) => activeAgents.filter((a) => a.parentId === parentId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const agentId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on another agent
    if (overId.startsWith('drop-')) {
      const newParentId = overId.replace('drop-', '');
      if (agentId !== newParentId) {
        await updateAgent(agentId, { parentId: newParentId });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeAgent = activeId ? agents.find((a) => a.id === activeId) : null;

  const renderOrgTree = (agent: Agent, level = 0): React.ReactNode => {
    const children = getChildren(agent.id);
    if (children.length === 0) {
      return (
        <div key={agent.id}>
          <AgentCard agent={agent} />
        </div>
      );
    }

    return (
      <OrgNode key={agent.id} agent={agent} onSelect={setSelectedAgent}>
        {children.map((child) => renderOrgTree(child, level + 1))}
      </OrgNode>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7]">Organization Chart</h1>
          <p className="text-[#9BA3B5] mt-1">Manage your team hierarchy</p>
        </div>
        <button
          onClick={() => setShowAgentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Hire Agent
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        {Object.entries(roleColors).slice(0, 5).map(([role, color]) => (
          <div key={role} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[#9BA3B5] capitalize">{roleLabels[role]}</span>
          </div>
        ))}
      </div>

      {/* Org Chart */}
      <div className="bg-[#151921] border border-[#2A3142] rounded-2xl p-8 min-h-[500px] overflow-x-auto">
        {ceo ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              {renderOrgTree(ceo)}
            </motion.div>

            <DragOverlay>
              {activeAgent && (
                <div className="bg-[#0C0F14] border border-indigo-500 rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${roleColors[activeAgent.role]}40, ${roleColors[activeAgent.role]})`,
                      }}
                    >
                      {activeAgent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#F4F5F7]">{activeAgent.name}</p>
                      <p className="text-xs text-[#5C6578] capitalize">
                        {roleLabels[activeAgent.role]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center h-96">
            <Bot className="w-16 h-16 text-[#3D4759] mb-4" />
            <h3 className="text-lg font-medium text-[#9BA3B5]">No Agents Yet</h3>
            <p className="text-sm text-[#5C6578] mt-1">
              Hire your first agent to build your organization
            </p>
            <button
              onClick={() => setShowAgentModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Hire CEO
            </button>
          </div>
        )}
      </div>

      {/* Agent Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentDetailPanel
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      {showAgentModal && <AgentModal onClose={() => setShowAgentModal(false)} />}
    </div>
  );
}
