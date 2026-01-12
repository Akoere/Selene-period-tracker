import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Bot, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { GoogleGenerativeAI } from "@google/generative-ai";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm Selene. I can help answer questions about your cycle, symptoms, or health trends. What's on your mind?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { currentTheme } = useTheme();

  // Safe Fallback for Gradient
  const gradient = currentTheme?.colors?.gradient || 'from-pink-400 to-purple-400';

  // --- GEMINI API SETUP ---
  // Initialize the API only if the key exists
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- CONTEXT LOADING ---
  const [userContext, setUserContext] = useState('');

  useEffect(() => {
    async function loadContext() {
      try {
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
        if (!user) return;

        const { getProfile, getRecentLogs } = await import('@/lib/api');
        const [profileRes, logsRes] = await Promise.all([
          getProfile(user.id),
          getRecentLogs(user.id, 30) // Last 30 days
        ]);

        const profile = profileRes.data || {};
        const logs = logsRes.data || [];

        // Calculate Basic Stats
        // (Simplified logic for context - ideally share this logic in a hook)
        // ... For now, let's just dump the raw recent data + profile into context
        // AI is good at parsing JSON-like structures.

        const today = new Date().toISOString().split('T')[0];
        const recentSymptoms = logs
          .filter(l => l.symptoms && l.symptoms.length > 0)
          .map(l => `${l.date}: ${l.symptoms.join(', ')}`)
          .join('; ');

        const contextString = `
           User Name: ${profile.full_name || 'Friend'}
           Current Date: ${today}
           Cycle Length: ${profile.cycle_length || 28} days
           Recent Symptoms: ${recentSymptoms || 'None logged recently'}
           Recent Logs (Last 5): ${JSON.stringify(logs.slice(-5).map(l => ({ date: l.date, flow: l.flow_level, symptoms: l.symptoms, mood: l.mood })))}
         `;

        setUserContext(contextString);

      } catch (err) {
        console.error("Failed to load AI context", err);
      }
    }
    loadContext();
  }, [isOpen]); // Reload when opened

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1. Add User Message immediately
    const userText = inputValue;
    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!genAI) {
        throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      // 2. Call Real Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Context prompt to make it behave like a Period Tracker Assistant
      const prompt = `
        You are Selene, a helpful and empathetic period tracking assistant. 
        Keep your answers concise, friendly, and supportive. Use emojis occasionally.
        
        HERE IS THE USER'S CONTEXT:
        ${userContext}
        
        IMPORTANT:
        - If the user asks about their next period, calculate it based on the last log date + cycle length.
        - If data is missing, ask them nicely to log their last period.
        - Do not share medical advice, but offer general wellness tips.
        - Privacy: Do not mention that you are reading a raw data log, just speak naturally like "I see you verified symptoms of X recently".

        The user asks: "${userText}"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // 3. Add AI Response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please check your internet.",
        sender: 'ai',
        isError: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 1. CLOSED STATE (Floating Button)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50 bg-linear-to-br ${gradient}`}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>
    );
  }

  // 2. OPEN STATE (Chat Window)
  return (
    <div
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border transition-colors duration-300"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)'
      }}
    >
      {/* Header */}
      <div className={`p-4 text-white flex items-center justify-between bg-linear-to-r ${gradient}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Selene</h3>
            <p className="text-[10px] opacity-80">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-wrap wrap-break-word ${message.sender === 'user'
                  ? `text-white rounded-br-none bg-linear-to-br ${gradient}`
                  : 'rounded-bl-none'
                }`}
              style={
                message.sender === 'ai'
                  ? {
                    backgroundColor: 'var(--card-bg)',
                    color: message.isError ? '#ef4444' : 'var(--foreground)', // Red text if error
                    border: '1px solid var(--card-border)'
                  }
                  : {}
              }
            >
              {message.isError && <AlertCircle className="w-4 h-4 inline mr-2 mb-0.5" />}
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-bl-none p-3 shadow-sm border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex gap-2 items-center text-xs opacity-50" style={{ color: 'var(--foreground)' }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="p-3 border-t"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-transform active:scale-95 bg-linear-to-br ${gradient}`}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}