
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

const QuickReplyOptions = [
  "What is a healthy BMI?",
  "How can I reduce my risk?",
  "What is HbA1c?",
  "Signs of diabetes",
  "Diet recommendations"
];

const getBotResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();
  if (msg.includes('bmi')) {
    return "A healthy BMI is typically between 18.5 and 24.9. BMI is calculated as weight (kg) divided by height squared (m²). Obesity is a significant diabetes risk factor.";
  }
  if (msg.includes('reduce risk') || msg.includes('lower risk')) {
    return "Reduce diabetes risk through: 150+ minutes of weekly activity, maintaining a healthy weight, balanced diet, limiting processed foods, regular check-ups, and avoiding smoking.";
  }
  if (msg.includes('hba1c')) {
    return "HbA1c measures average blood sugar over 2–3 months. Normal: below 5.7%. Prediabetes: 5.7–6.4%. Diabetes: 6.5% or higher.";
  }
  if (msg.includes('sign') || msg.includes('symptom')) {
    return "Common diabetes signs: increased thirst/urination, fatigue, blurred vision, unexplained weight loss, slow healing, frequent infections. Consult a healthcare professional if concerned.";
  }
  if (msg.includes('diet') || msg.includes('food')) {
    return "A diabetes-friendly diet includes non-starchy vegetables, lean proteins, whole grains, healthy fats, and minimal added sugars. Regular meal timing helps manage blood sugar.";
  }
  return "I'm a demo health assistant for DiaTrack. Ask about diabetes risk factors, HbA1c, BMI, diet, or lifestyle modifications.";
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: DEMO_MODE
        ? "Hello! I'm the DiaTrack demo health assistant. Ask me about diabetes risk, HbA1c, BMI, or lifestyle tips."
        : "Hello! How can I help you with diabetes-related questions?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 400));

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: getBotResponse(text),
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-3 border-b rounded-t-[var(--radius-lg)]"
        style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border-default)' }}
      >
        <span className="font-medium" style={{ fontSize: 'var(--text-body-sm)' }}>
          DiaTrack Health Assistant
        </span>
        <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-risk-mod-text)' }}>
          Demo Mode — Educational only
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] rounded-[var(--radius-lg)] px-4 py-2"
              style={{
                fontSize: 'var(--text-body-md)',
                background: message.sender === 'user' ? 'var(--color-brand-600)' : 'var(--color-bg-subtle)',
                color: message.sender === 'user' ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                borderTopRightRadius: message.sender === 'user' ? 0 : undefined,
                borderTopLeftRadius: message.sender === 'bot' ? 0 : undefined,
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-[var(--radius-lg)] px-4 py-2 skeleton h-8 w-24"
              role="status"
              aria-label="Assistant is typing"
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="flex flex-wrap gap-2 mb-3">
          {QuickReplyOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSendMessage(option)}
              className="px-3 py-1 rounded-full transition-colors hover:bg-[var(--color-bg-subtle)]"
              style={{
                fontSize: 'var(--text-body-sm)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about diabetes care..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            disabled={isTyping}
            aria-label="Chat message"
          />
          <Button
            onClick={() => handleSendMessage(input)}
            size="icon"
            disabled={isTyping || !input.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
