import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm **Nexus RAG**, Implemented By Ganpat Suthar for Quering related to ICIC Bank Life Insuarance. How can I help you today?",
        },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        const newUserMessage = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput('');

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: newUserMessage.content }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.answer,
                },
            ]);
        } catch (error) {
            console.error('Error connecting to backend:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: '**Connection Error:** Unable to reach the backend server. Make sure FastAPI is running on port 8000.',
                },
            ]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 md:p-8 font-sans antialiased">
            {/* Centered Solid Card */}
            <div className="w-full max-w-[900px] h-[85vh] flex flex-col bg-white rounded-[18px] border border-slate-200 shadow-xl overflow-hidden">

                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between bg-orange-500">
                    <div className="flex flex-col">
                        <h1 className="text-[17px] font-semibold text-white tracking-tight">Nexus RAG</h1>
                        <span className="text-[13px] text-orange-100 mt-0.5 tracking-wide">ICIC Life Insuarance Query Bot</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                        <span className="text-[13px] font-medium text-orange-50">System Active</span>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] px-5 py-4 ${msg.role === 'user'
                                        ? 'bg-orange-500 text-white font-medium rounded-2xl rounded-tr-sm shadow-md'
                                        : 'bg-white border border-slate-200 text-slate-700 font-normal rounded-2xl rounded-tl-sm shadow-sm'
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-sm md:prose-base max-w-none leading-relaxed prose-p:my-1 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Section */}
                <div className="p-4 md:p-6 bg-white border-t border-slate-100">
                    <div className="relative flex items-end gap-3 rounded-xl border border-slate-300 bg-slate-50 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all duration-200">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            className="flex-1 max-h-32 min-h-[52px] w-full resize-none appearance-none bg-transparent py-4 pl-4 pr-14 text-[15px] text-slate-800 placeholder-slate-400 border-none focus:outline-none focus:ring-0 leading-tight"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 bottom-2 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:hover:bg-orange-500 flex items-center justify-center group"
                            aria-label="Send message"
                        >
                            <Send size={18} className="translate-x-[1px] group-active:scale-95 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
