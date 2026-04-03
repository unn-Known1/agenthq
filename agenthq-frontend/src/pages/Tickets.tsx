import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  Plus,
  Ticket,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react';
import { useStore } from '../stores/appStore';
import { Ticket as TicketType } from '../lib/api';
import TicketModal from '../components/TicketModal';

const columns = [
  { id: 'backlog', title: 'Backlog', color: '#5C6578' },
  { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'review', title: 'Review', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

const priorityColors = {
  low: '#10B981',
  medium: '#3B82F6',
  high: '#F59E0B',
  critical: '#EF4444',
};

const roleColors: Record<string, string> = {
  ceo: '#A855F7',
  cto: '#8B5CF6',
  engineer: '#06B6D4',
  designer: '#EC4899',
  marketing: '#F97316',
  support: '#10B981',
  custom: '#6366F1',
};

function TicketCard({
  ticket,
  isDragging = false,
}: {
  ticket: TicketType;
  isDragging?: boolean;
}) {
  const { agents } = useStore();
  const assignee = agents.find((a) => a.id === ticket.assigneeId);

  return (
    <div
      className={`bg-[#0C0F14] border border-[#2A3142] rounded-xl p-4 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 rotate-2' : 'hover:border-indigo-500/50'
      } transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[#5C6578] font-mono">{ticket.id}</span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${priorityColors[ticket.priority]}20`,
            color: priorityColors[ticket.priority],
          }}
        >
          {ticket.priority}
        </span>
      </div>
      <h4 className="font-medium text-[#F4F5F7] mb-2 line-clamp-2">{ticket.title}</h4>
      <p className="text-sm text-[#5C6578] mb-3 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${roleColors[assignee.role]}40, ${roleColors[assignee.role]})`,
                }}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[#9BA3B5]">{assignee.name}</span>
            </>
          ) : (
            <span className="text-xs text-[#5C6578]">Unassigned</span>
          )}
        </div>
        {ticket.budgetAllocated > 0 && (
          <span className="text-xs text-[#5C6578]">
            ${ticket.budgetConsumed.toFixed(0)} / ${ticket.budgetAllocated}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableTicket({ ticket }: { ticket: TicketType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TicketCard ticket={ticket} isDragging={isDragging} />
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-[#151921] rounded-xl p-4 transition-all ${
        isOver ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0C0F14]' : ''
      }`}
    >
      {children}
    </div>
  );
}

export default function Tickets() {
  const {
    tickets,
    agents,
    fetchTickets,
    fetchAgents,
    updateTicketStatus,
    showTicketModal,
    setShowTicketModal,
  } = useStore();
  const [activeTicket, setActiveTicket] = useState<TicketType | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, [fetchTickets, fetchAgents]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filterPriority && ticket.priority !== filterPriority) return false;
    if (filterAssignee && ticket.assigneeId !== filterAssignee) return false;
    return true;
  });

  const getTicketsByStatus = (status: string) =>
    filteredTickets.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;

    if (['backlog', 'in_progress', 'review', 'done'].includes(newStatus)) {
      await updateTicketStatus(ticketId, newStatus);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F7]">Tickets</h1>
          <p className="text-[#9BA3B5] mt-1">
            {filteredTickets.length} tickets • {getTicketsByStatus('in_progress').length} in progress
          </p>
        </div>
        <button
          onClick={() => setShowTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none bg-[#151921] border border-[#2A3142] rounded-lg pl-3 pr-8 py-2 text-sm text-[#F4F5F7] focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6578] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="appearance-none bg-[#151921] border border-[#2A3142] rounded-lg pl-3 pr-8 py-2 text-sm text-[#F4F5F7] focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Agents</option>
            {agents
              .filter((a) => a.status === 'active')
              .map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6578] pointer-events-none" />
        </div>
        {(filterPriority || filterAssignee) && (
          <button
            onClick={() => {
              setFilterPriority('');
              setFilterAssignee('');
            }}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-h-full pb-4">
            {columns.map((column) => {
              const columnTickets = getTicketsByStatus(column.id);
              return (
                <DroppableColumn key={column.id} id={column.id}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-medium text-[#F4F5F7]">{column.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#1C222D] text-xs text-[#9BA3B5]">
                        {columnTickets.length}
                      </span>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="space-y-3 min-h-[200px]">
                    <AnimatePresence>
                      {columnTickets.map((ticket) => (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <DraggableTicket ticket={ticket} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {columnTickets.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-[#5C6578]">
                        <Inbox className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No tickets</p>
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTicket && <TicketCard ticket={activeTicket} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      {showTicketModal && <TicketModal onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}
