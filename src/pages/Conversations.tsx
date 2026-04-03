import { useEffect, useState } from 'react';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { useStore } from '../stores/appStore';

export default function Conversations() {
  const {
    conversations, messages, agents, fetchConversations, fetchMessages,
    sendMessage, createConversation, selectedConversation, setSelectedConversation,
  } = useStore();
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  const getParticipantName = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    return agent?.name || 'Unknown';
  };

  const handleSend = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessage(selectedConversation.id, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Conversations List */}
      <div className="w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex flex-col">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => {
            const otherParticipant = conv.participants.find((p) => p !== agents[0]?.id);
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 rounded-xl cursor-pointer mb-2 transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {getParticipantName(otherParticipant || '').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)]">{getParticipantName(otherParticipant || '')}</p>
                    <p className="text-sm text-[var(--text-muted)] truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="font-semibold text-[var(--text-primary)]">
                {getParticipantName(selectedConversation.participants.find((p) => p !== agents[0]?.id) || '')}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === agents[0]?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        isMe
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-md'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-[var(--border-color)]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
