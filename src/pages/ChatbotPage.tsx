
import AppLayout from '@/components/layout/AppLayout';
import Chatbot from '@/components/chatbot/Chatbot';

const ChatbotPage = () => {
  return (
    <AppLayout>
      <header className="mb-6">
        <h1 className="font-semibold" style={{ fontSize: 'var(--text-display)' }}>Clinical Chat</h1>
        <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          Ask questions about diabetes risk factors and lifestyle guidance
        </p>
      </header>

      <div className="clinical-card" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>
        <Chatbot />
      </div>
    </AppLayout>
  );
};

export default ChatbotPage;
