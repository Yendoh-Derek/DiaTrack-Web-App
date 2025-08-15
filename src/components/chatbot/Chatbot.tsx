
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, AlertCircle, RefreshCw, Brain } from "lucide-react";
import { grokApi, GrokMessage } from '@/services/grokApi';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  source?: 'grok' | 'fallback';
  error?: boolean;
}

const QuickReplyOptions = [
  "What is a healthy BMI?",
  "How can I reduce my risk?",
  "What is HbA1c?",
  "Signs of diabetes",
  "Diet recommendations"
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Diabetes Sense assistant powered by Grok AI. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      source: 'fallback'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGrokAvailable, setIsGrokAvailable] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<GrokMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
    checkGrokAvailability();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkGrokAvailability = async () => {
    if (grokApi.isConfigured()) {
      setIsTestingConnection(true);
      try {
        const isAvailable = await grokApi.testConnection();
        setIsGrokAvailable(isAvailable);
        if (isAvailable) {
          toast({
            title: "Grok AI Connected",
            description: "Advanced AI assistance is now available!",
          });
        } else {
          toast({
            title: "Grok AI Unavailable",
            description: "Using fallback chatbot mode.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsGrokAvailable(false);
        toast({
          title: "Grok AI Connection Failed",
          description: "Using fallback chatbot mode.",
          variant: "destructive",
        });
      } finally {
        setIsTestingConnection(false);
      }
    } else {
      setIsGrokAvailable(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Update conversation history for Grok
    const newHistory: GrokMessage[] = [
      ...conversationHistory,
      { role: 'user', content: text }
    ];
    setConversationHistory(newHistory);
    
    try {
      // Try Grok API first if available
      if (isGrokAvailable) {
        const grokResult = await grokApi.chatCompletion(text, conversationHistory);
        
        if (grokResult.success) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: grokResult.response,
            sender: 'bot',
            timestamp: new Date(),
            source: 'grok'
          };
          
          setMessages(prev => [...prev, botMessage]);
          
          // Update conversation history with Grok's response
          setConversationHistory([...newHistory, { role: 'assistant', content: grokResult.response }]);
        } else {
          // Grok failed, use fallback
          throw new Error(grokResult.error.message);
        }
      } else {
        // Grok not available, use fallback
        throw new Error('Grok API not available');
      }
    } catch (error: any) {
      console.warn('Falling back to basic chatbot:', error);
      
      // Use fallback chatbot
      const fallbackResponse = getBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
        source: 'fallback'
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history with fallback response
      setConversationHistory([...newHistory, { role: 'assistant', content: fallbackResponse }]);
      
      // Show fallback notification
      toast({
        title: "Using Basic Mode",
        description: "Advanced AI temporarily unavailable. Using fallback responses.",
        variant: "default",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowercasedMessage = userMessage.toLowerCase();
    
    if (lowercasedMessage.includes('bmi') || lowercasedMessage.includes('body mass')) {
      return "A healthy BMI is typically between 18.5 and 24.9. BMI is calculated as weight (kg) divided by height squared (m²). For diabetes risk assessment, maintaining a healthy BMI is important as obesity is a significant risk factor.";
    } else if (lowercasedMessage.includes('reduce risk') || lowercasedMessage.includes('lower risk')) {
      return "You can reduce your diabetes risk through: regular physical activity (150+ minutes/week), maintaining a healthy weight, eating a balanced diet rich in whole grains and vegetables, limiting processed foods and sugars, regular health check-ups, and avoiding smoking.";
    } else if (lowercasedMessage.includes('hba1c')) {
      return "HbA1c is a blood test that measures your average blood sugar levels over the past 2-3 months. For people without diabetes, normal levels are below 5.7%. Prediabetes is 5.7% to 6.4%, and diabetes is 6.5% or higher. This test is crucial for diabetes management and monitoring.";
    } else if (lowercasedMessage.includes('sign') || lowercasedMessage.includes('symptom')) {
      return "Common signs of diabetes include: increased thirst and urination, fatigue, blurred vision, unexpected weight loss, slow wound healing, frequent infections, tingling or numbness in hands or feet, and increased hunger. If you experience these symptoms, consult a healthcare professional.";
    } else if (lowercasedMessage.includes('diet') || lowercasedMessage.includes('food') || lowercasedMessage.includes('eat')) {
      return "A diabetes-friendly diet includes: non-starchy vegetables (leafy greens, broccoli, peppers), lean proteins (fish, chicken, legumes), whole grains (quinoa, brown rice), healthy fats (avocado, nuts, olive oil), minimal added sugars and refined carbs. Regular meal timing is also important for managing blood sugar.";
    } else {
      return "I'm here to answer questions about diabetes risk factors, management, and prevention. Feel free to ask me anything specific about diabetes care, symptoms, or lifestyle modifications!";
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const retryGrokConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isAvailable = await grokApi.testConnection();
      setIsGrokAvailable(isAvailable);
      if (isAvailable) {
        toast({
          title: "Connection Restored",
          description: "Grok AI is now available again!",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Grok AI is still unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[calc(100vh-200px)]">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-t-lg border-b">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-diabetesSense-accent" />
          <span className="font-medium text-sm">Diabetes AI Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          {isGrokAvailable ? (
            <div className="flex items-center space-x-1 text-green-600 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Grok AI Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-orange-600 text-xs">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Basic Mode</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={retryGrokConnection}
            disabled={isTestingConnection}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isTestingConnection ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-2">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.sender === 'user' 
                  ? 'bg-diabetesSense-accent text-white rounded-tr-none' 
                  : 'bg-secondary text-foreground rounded-tl-none'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  {message.text}
                </div>
                {message.source && (
                  <div className="flex-shrink-0">
                    {message.source === 'grok' ? (
                      <Brain className="w-3 h-3 text-blue-500" title="Powered by Grok AI" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" title="Basic chatbot response" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary text-foreground rounded-2xl rounded-tl-none px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
                {isGrokAvailable && (
                  <Brain className="w-3 h-3 text-blue-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Reply Options */}
      <div className="p-2 pb-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {QuickReplyOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleQuickReply(option)}
              className="bg-secondary hover:bg-secondary/80 text-sm px-3 py-1 rounded-full text-foreground transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-2 pt-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about diabetes care..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
            className="bg-secondary border-none"
            disabled={isTyping}
          />
          <Button 
            onClick={() => handleSendMessage(input)}
            className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
            size="icon"
            disabled={isTyping || !input.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
