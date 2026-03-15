'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: string;
    description: string;
    data: any;
  }>;
  follow_up_suggestions?: string[];
}

const SUGGESTED_PROMPTS = [
  "write my bio",
  "describe my latest program", 
  "how are my sales doing?",
  "create instagram captions for my program",
  "what should I price my coaching at?",
  "give me content ideas for this week"
];

export default function CopilotPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    addMessage({ type: 'user', content: content.trim() });
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        let aiMessageContent = '';
        const aiMessage = addMessage({ type: 'ai', content: '' });

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  aiMessageContent += parsed.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessage.id ? { ...msg, content: aiMessageContent } : msg
                  ));
                }
              } catch (e) {}
            }
          }
        }
      } else {
        const data = await response.json();
        addMessage({
          type: 'ai',
          content: data.message || 'sorry, something went wrong.',
          actions: data.suggested_actions,
          follow_up_suggestions: data.follow_up_suggestions,
        });
      }
    } catch (error) {
      addMessage({ type: 'ai', content: 'sorry, something went wrong. try again.' });
    }

    setIsLoading(false);
  };

  const handleAction = async (action: any, messageId: string, approve: boolean) => {
    if (!approve) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_data: action }),
      });
      const result = await response.json();
      addMessage({ type: 'ai', content: result.success ? result.message : `error: ${result.error || 'action failed'}` });
    } catch (error) {
      addMessage({ type: 'ai', content: 'action failed. try again.' });
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        type: 'ai',
        content: `hey ${profile?.display_name || 'there'} 👋\n\ni can help you write your bio, product descriptions, social captions, pricing strategy, and more.\n\nwhat do you need?`,
        follow_up_suggestions: SUGGESTED_PROMPTS.slice(0, 3),
      });
    }
  }, [profile]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 max-w-3xl mx-auto w-full ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-emerald-400" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/5 text-white'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </div>

                {/* Action Buttons */}
                {message.actions?.map((action, index) => (
                  <div key={index} className="mt-2 bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">{action.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(action, message.id, true)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={12} /> apply
                      </button>
                      <button
                        onClick={() => handleAction(action, message.id, false)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/20 transition-colors"
                      >
                        <XCircle size={12} /> skip
                      </button>
                    </div>
                  </div>
                ))}

                {/* Follow-up Suggestions */}
                {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.follow_up_suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl mx-auto w-full">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Bot size={14} className="text-emerald-400" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (empty state) */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 md:px-8 pb-4 max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-sm px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 p-4 md:px-8">
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="message..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="h-12 w-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
