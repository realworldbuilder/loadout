'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CardParser } from '@/components/copilot/CardComponents';

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
  "how are my sales doing?",
  "show my products",
  "create a new program",
  "generate instagram captions",
  "recent orders",
  "create a discount code",
  "help me price my coaching"
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

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
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
                  updateMessage(aiMessage.id, { content: aiMessageContent });
                }
              } catch (e) {
                // Ignore JSON parse errors for streaming
              }
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
      addMessage({ 
        type: 'ai', 
        content: 'sorry, something went wrong. try again.' 
      });
    }

    setIsLoading(false);
  };

  const handleCardAction = async (action: string, data: any) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: { action, data } }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        addMessage({ 
          type: 'ai', 
          content: result.message || 'action completed successfully!' 
        });
      } else {
        addMessage({ 
          type: 'ai', 
          content: `error: ${result.error || 'action failed'}` 
        });
      }
    } catch (error) {
      addMessage({ 
        type: 'ai', 
        content: 'action failed. try again.' 
      });
    }
    
    setIsLoading(false);
  };

  const handleAction = async (action: any, messageId: string, approve: boolean) => {
    if (!approve) return;
    await handleCardAction(action.type, action.data);
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
        content: `hey ${profile?.display_name || 'there'} 👋\n\ni'm your creator copilot! i can help you:\n• write compelling bios and product descriptions\n• track your sales and analytics\n• create social media content\n• manage your products and pricing\n• generate discount codes\n\nwhat would you like to work on?`,
        follow_up_suggestions: SUGGESTED_PROMPTS.slice(0, 4),
      });
    }
  }, [profile]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0a0a0a]">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 max-w-4xl mx-auto w-full ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-emerald-400" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/5 text-white'
                }`}>
                  {message.type === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  ) : (
                    <CardParser 
                      content={message.content} 
                      onAction={handleCardAction}
                    />
                  )}
                </div>

                {/* Legacy Action Buttons (kept for backward compatibility) */}
                {message.actions?.map((action, index) => (
                  <div key={index} className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
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
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {message.follow_up_suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 hover:text-emerald-400 transition-colors border border-white/10 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-4xl mx-auto w-full">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Bot size={16} className="text-emerald-400" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (empty state) */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 md:px-8 pb-4 max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-sm px-4 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-emerald-400 transition-colors border border-white/10 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 p-4 md:px-8 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ask me anything..."
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