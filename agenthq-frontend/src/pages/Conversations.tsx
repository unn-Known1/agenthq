import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Users,
  X,
  Bot,
} from 'lucide-react';
import { useStore } from '../stores/appStore';
import { conversationsApi, messagesApi, Conversation, Message, Agent } from '../lib/api';

const roleColors: Record<string, string> = {
  ceo: '#A855F7',
  cto: '#8B5CF6',
  engineer: '#06B6D4',
  designer: '#EC4899',
  marketing: '#F97316',
  support: '#10B981',
  custom: '#6366F1',
};

function ConversationItem({
  conversation,
  selected,
  onClick,
  getAgentName,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
  getAgentName: (id: string) => string;
}) {
  const lastMessage = conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
        selected
          ? 'bg-indigo-500/20 border border-indigo-500/50'
          : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
        {conversation.type === 'group' ? (
          <Users className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className="font-medium text-[var(--text-primary)] truncate">
            {conversation.subject || `Conversation with ${getAgentName(conversation.participants[0])}`}
          </p>
          {lastMessage && (
            <span className="text-xs text-[var(--text-muted)]">
              {lastMessage.toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-muted)] truncate">
          {conversation.type === 'group'
            ? `${conversation.participants.length} participants`
            : conversation.type}
        </p>
      </div>
      {conversation.unreadCount && conversation.unreadCount > 0 && (
        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({
  message,
  agent,
  isOwn,
}: {
  message: Message;
  agent?: Agent;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-md'
        }`}
      >
        {!isOwn && agent && (
          <p className="text-xs font-medium mb-1" style={{ color: roleColors[agent.role] }}>
            {agent.name}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-[var(--text-muted)]'}`}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function Conversations() {
  const { agents, fetchAgents } = useStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [conversationSubject, setConversationSubject] = useState('');

  useEffect(() => {
    fetchConversations();
    fetchAgents();
  }, [fetchAgents]);

  const fetchConversations = async () => {
    try {
      const data = await conversationsApi.getAll();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await conversationsApi.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messagesApi.send(selectedConversation.id, { content: newMessage });
      setNewMessage('');
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedParticipants.length === 0) return;

    try {
      const conversation = await conversationsApi.create({
        participants: selectedParticipants,
        type: selectedParticipants.length > 1 ? 'group' : 'direct',
        subject: conversationSubject || undefined,
      });
      setConversations([conversation, ...conversations]);
      setShowNewModal(false);
      setSelectedParticipants([]);
      setConversationSubject('');
      handleSelectConversation(conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || 'Unknown';
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const subject = c.subject || '';
    return subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeAgents = agents.filter((a) => a.status === 'active');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Conversations</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Agent-to-agent messaging and collaboration
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex min-h-0">
        {/* Conversations List */}
        <div className="w-80 border-r border-[var(--border-subtle)] flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  getAgentName={getAgentName}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {selectedConversation.subject ||
                      `Conversation with ${getAgentName(selectedConversation.participants[0])}`}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedConversation.type === 'group'
                      ? `${selectedConversation.participants.length} participants`
                      : selectedConversation.type}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    agent={agents.find((a) => a.id === message.senderId)}
                    isOwn={message.senderId === 'current_user'}
                  />
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--border-subtle)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[var(--text-secondary)]">No conversation selected</h3>
              <p className="text-sm mt-1">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">New Conversation</h2>
                    <p className="text-sm text-[var(--text-muted)]">Start a new chat</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={conversationSubject}
                    onChange={(e) => setConversationSubject(e.target.value)}
                    placeholder="e.g., Q4 Planning"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Select Agents
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeAgents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          if (selectedParticipants.includes(agent.id)) {
                            setSelectedParticipants(selectedParticipants.filter((id) => id !== agent.id));
                          } else {
                            setSelectedParticipants([...selectedParticipants, agent.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedParticipants.includes(agent.id)
                            ? 'bg-indigo-500/20 border-indigo-500/50'
                            : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: roleColors[agent.role] }}
                        >
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                          <p className="text-xs text-[var(--text-muted)] capitalize">{agent.role}</p>
                        </div>
                        {selectedParticipants.includes(agent.id) && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 px-4 py-2.5 border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateConversation}
                    disabled={selectedParticipants.length === 0}
                    className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    Start Chat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
