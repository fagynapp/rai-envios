/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  Plus,
  History,
  Settings,
  Menu,
  X,
  Download,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { chatWithGemini, generateImage } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: activeTab === 'chat' ? 'text' : 'text', // Input is always text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (activeTab === 'chat') {
        const history = messages
          .filter(m => m.type === 'text')
          .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }));
        
        const response = await chatWithGemini(input, history);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: response.text || "I'm sorry, I couldn't process that.",
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const imageUrl = await generateImage(input);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: imageUrl,
          timestamp: new Date(),
          type: 'image',
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Error: " + (error instanceof Error ? error.message : "Something went wrong"),
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-white border-r border-zinc-200 flex flex-col z-50 lg:relative absolute h-full shadow-xl lg:shadow-none"
          >
            <div className="p-6 flex items-center justify-between border-b border-zinc-100">
              <div className="flex items-center gap-2 font-semibold text-xl tracking-tight">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span>Nexus</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <button 
                onClick={clearChat}
                className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all font-medium shadow-sm"
              >
                <Plus size={18} />
                <span>New Session</span>
              </button>

              <nav className="space-y-1">
                <p className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Capabilities</p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors",
                    activeTab === 'chat' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  <MessageSquare size={18} />
                  <span>AI Assistant</span>
                </button>
                <button 
                  onClick={() => setActiveTab('image')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors",
                    activeTab === 'image' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  <ImageIcon size={18} />
                  <span>Image Studio</span>
                </button>
              </nav>

              <div className="space-y-1">
                <p className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">History</p>
                <div className="px-4 py-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                  <History className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">Recent logs will appear here</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-colors">
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-zinc-100 rounded-full">
                <Menu size={20} />
              </button>
            )}
            <h2 className="font-medium text-zinc-600">
              {activeTab === 'chat' ? 'AI Assistant' : 'Image Studio'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center">
                <User size={14} className="text-emerald-600" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-zinc-200" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900">How can I help you today?</h1>
                <p className="text-zinc-500 text-lg">
                  {activeTab === 'chat' 
                    ? "Ask me anything, from coding problems to creative writing." 
                    : "Describe an image you'd like to create, and I'll generate it for you."}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                <button 
                  onClick={() => setInput(activeTab === 'chat' ? "Explain quantum computing like I'm five" : "A futuristic city with flying cars and neon lights")}
                  className="p-4 text-left border border-zinc-200 rounded-2xl hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {activeTab === 'chat' ? "Explain quantum computing..." : "Futuristic city..."}
                  </p>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-500">Try this prompt</p>
                </button>
                <button 
                  onClick={() => setInput(activeTab === 'chat' ? "Write a short story about a time-traveling toaster" : "A serene mountain landscape at sunset, oil painting style")}
                  className="p-4 text-left border border-zinc-200 rounded-2xl hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {activeTab === 'chat' ? "Write a short story..." : "Serene mountain landscape..."}
                  </p>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-500">Try this prompt</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-zinc-900" : "bg-white border border-zinc-200"
                  )}>
                    {msg.role === 'user' ? (
                      <User size={20} className="text-white" />
                    ) : (
                      <Bot size={20} className="text-zinc-900" />
                    )}
                  </div>
                  <div className={cn(
                    "flex flex-col max-w-[85%] space-y-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-4 rounded-3xl shadow-sm",
                      msg.role === 'user' 
                        ? "bg-zinc-900 text-white rounded-tr-none" 
                        : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none"
                    )}>
                      {msg.type === 'image' ? (
                        <div className="space-y-3">
                          <img 
                            src={msg.content} 
                            alt="Generated" 
                            className="rounded-2xl w-full max-w-md object-cover shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex gap-2">
                            <a 
                              href={msg.content} 
                              download="generated-image.png"
                              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Download size={14} />
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-zinc prose-headings:font-bold prose-p:leading-relaxed">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={20} className="text-zinc-300" />
                  </div>
                  <div className="bg-white border border-zinc-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span className="text-sm text-zinc-400 font-medium">Nexus is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-zinc-900/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-end gap-3 bg-white border border-zinc-200 p-2 rounded-[2rem] shadow-xl focus-within:border-zinc-900 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={activeTab === 'chat' ? "Message Nexus..." : "Describe the image you want to create..."}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 max-h-40 min-h-[52px] text-zinc-800 placeholder:text-zinc-400"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-full transition-all shadow-lg",
                  input.trim() && !isLoading 
                    ? "bg-zinc-900 text-white hover:scale-105 active:scale-95" 
                    : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
              Powered by Gemini 3 Flash & 2.5 Flash Image
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
