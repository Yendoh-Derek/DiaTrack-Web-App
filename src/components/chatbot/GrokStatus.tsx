import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { grokApi } from '@/services/grokApi';
import { useToast } from '@/hooks/use-toast';

export const GrokStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus('checking');
    setIsTesting(true);
    
    try {
      if (!grokApi.isConfigured()) {
        setStatus('error');
        toast({
          title: "Configuration Error",
          description: "Grok API key not found. Check your environment variables.",
          variant: "destructive",
        });
        return;
      }

      const isAvailable = await grokApi.testConnection();
      setStatus(isAvailable ? 'connected' : 'disconnected');
      
      if (isAvailable) {
        toast({
          title: "Grok AI Connected",
          description: "Advanced AI assistance is available!",
        });
      } else {
        toast({
          title: "Grok AI Unavailable",
          description: "Check your API key and network connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Grok API.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking connection...';
      case 'connected':
        return 'Grok AI Connected';
      case 'disconnected':
        return 'Grok AI Disconnected';
      case 'error':
        return 'Configuration Error';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'error':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
      {getStatusIcon()}
      <span className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={checkStatus}
        disabled={isTesting}
        className="ml-auto"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  );
};
