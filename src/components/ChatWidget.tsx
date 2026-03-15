'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  creatorHandle: string;
  creatorName: string;
}

export default function ChatWidget({ creatorHandle, creatorName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hey! I'm here to help you find the perfect products from ${creatorName}. What are you looking for today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/${creatorHandle}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage && !lastMessage.isUser) {
                      lastMessage.content += parsed.content;
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 h-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Chat with {creatorName}</h3>
                <p className="text-xs text-zinc-400">Ask about products and training</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex',
                  message.isUser ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[80%] px-3 py-2 rounded-lg text-sm',
                    message.isUser
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-100'
                  )}
                >
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline">$1</a>')
                    }}
                  />
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about products, training, or goals..."
                className="flex-1 bg-zinc-800 text-white placeholder-zinc-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white p-2 rounded-lg transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Powered by Loadout badge */}
            <div className="mt-2 text-center">
              <a
                href="https://loadout.fit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                ⚡ Powered by Loadout
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}