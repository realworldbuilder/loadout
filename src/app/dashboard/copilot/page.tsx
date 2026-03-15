'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, CheckCircle, XCircle } from 'lucide-react';
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

interface ActionConfirmation {
  action: any;
  messageId: string;
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
  const [pendingAction, setPendingAction] = useState<ActionConfirmation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

    // Add user message
    addMessage({
      type: 'user',
      content: content.trim(),
    });

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        let aiMessageContent = '';
        
        const aiMessage = addMessage({
          type: 'ai',
          content: '',
        });

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
                    msg.id === aiMessage.id 
                      ? { ...msg, content: aiMessageContent }
                      : msg
                  ));
                }
              } catch (e) {
                // Ignore parse errors in streaming
              }
            }
          }
        }
      } else {
        // Fallback to JSON response
        const data = await response.json();
        addMessage({
          type: 'ai',
          content: data.message || 'Sorry, I encountered an error.',
          actions: data.suggested_actions,
          follow_up_suggestions: data.follow_up_suggestions,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        type: 'ai',
        content: 'sorry, i encountered an error. please try again.',
      });
    }

    setIsLoading(false);
  };

  const handleAction = async (action: any, messageId: string, approve: boolean) => {
    if (!approve) {
      setPendingAction(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action_data: action }),
      });

      const result = await response.json();

      if (result.success) {
        addMessage({
          type: 'ai',
          content: result.message,
        });
      } else {
        addMessage({
          type: 'ai',
          content: `error: ${result.error || 'action failed'}`,
        });
      }
    } catch (error) {
      console.error('Action error:', error);
      addMessage({
        type: 'ai',
        content: 'sorry, the action failed. please try again.',
      });
    }

    setPendingAction(null);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        type: 'ai',
        content: `hey ${profile?.display_name || 'there'}! 👋\n\ni'm your creator copilot. i can help you:\n\n• write compelling bio and product descriptions\n• analyze your sales and suggest improvements  \n• create social media content ideas\n• optimize your pricing strategy\n\nwhat would you like to work on today?`,
        follow_up_suggestions: SUGGESTED_PROMPTS.slice(0, 3),
      });
    }
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Bot className="h-8 w-8 mr-3 text-emerald-500" />
          creator copilot
        </h1>
        <p className="text-gray-400">your ai assistant for growing your fitness business</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-emerald-400" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`
                  rounded-lg px-4 py-3 
                  ${message.type === 'user' 
                    ? 'bg-emerald-500 text-white ml-auto' 
                    : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'
                  }
                `}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>

                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-white/10">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{action.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(action, message.id, true)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            approve
                          </button>
                          <button
                            onClick={() => handleAction(action, message.id, false)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                          >
                            <XCircle size={14} />
                            cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.follow_up_suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Bot size={16} className="text-emerald-400" />
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (when no messages) */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">try asking me:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.slice(0, 6).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-sm px-3 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-white/10 p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ask me anything about your fitness business..."
                disabled={isLoading}
                rows={1}
                className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="h-12 w-12 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}