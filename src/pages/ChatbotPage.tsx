
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainNav from '@/components/navigation/MainNav';
import Chatbot from '@/components/chatbot/Chatbot';

const ChatbotPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Health Assistant</h1>
          <p className="text-gray-400">Ask questions about diabetes and health</p>
        </header>
        
        <Card className="card-gradient border border-white/10 h-[calc(100vh-200px)]">
          <CardHeader>
            <CardTitle>Chat with Our AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-6">
            <div className="h-full">
              <Chatbot />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
