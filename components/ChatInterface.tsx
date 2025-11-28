import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RouteData } from '../types';
import { Send, Bot, User } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentRoute: RouteData;
}

const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isLoading, currentRoute }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-2xl shadow-negative z-10 w-full max-w-2xl mx-auto border-t border-stone-200">
      <div className="p-3 border-b border-stone-100 flex items-center gap-2 bg-stone-50 rounded-t-2xl">
        <Bot className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-semibold text-stone-700">Guide Chat • {currentRoute.name}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64 sm:max-h-80">
        {messages.length === 0 && (
          <div className="text-center text-stone-400 text-sm py-8">
            <p>Ask me anything about this route!</p>
            <p className="text-xs mt-1">"Is it kid friendly?", "Is there parking?"</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-stone-100 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-75" />
               <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-150" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-100 flex gap-2 bg-white">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white p-2 rounded-full transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
