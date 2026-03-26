import { useState, useRef, useEffect } from 'react';
import { useWebSocket, ChatMessage } from '../hooks/useWebSocket';
import { MessageSquare, Users, Circle } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;

export function ChatRoom() {
  const [nickname, setNickname] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage } = useWebSocket(
    WS_URL,
    isNicknameSet ? nickname : ''
  );

  const handleSetNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsNicknameSet(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
        return 'text-red-600';
    }
  };

  const getMessageStyle = (message: ChatMessage) => {
    if (message.type === 'chat_message') {
      return message.nickname === nickname
        ? 'bg-blue-100 border-blue-300'
        : 'bg-white border-gray-300';
    }
    return 'bg-gray-50 border-gray-200 italic text-gray-600';
  };

  if (!isNicknameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Realtime Chat Room
          </h1>
          <form onSubmit={handleSetNickname}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose your nickname
            </label>
            <input
              type="text"
              data-testid="nickname-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!nickname.trim()}
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <h1 className="text-xl font-bold">Chat Room</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">{nickname}</span>
            </div>
            <div
              data-testid="connection-status"
              className={`flex items-center gap-2 ${getStatusColor()}`}
            >
              <Circle className="w-3 h-3 fill-current" />
              <span className="text-sm capitalize text-white">{status}</span>
            </div>
          </div>
        </div>

        <div
          data-testid="messages-list"
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg border ${getMessageStyle(message)}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {message.nickname}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800">{message.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              data-testid="message-input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={status !== 'connected'}
            />
            <button
              type="submit"
              data-testid="send-button"
              disabled={!messageText.trim() || status !== 'connected'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
