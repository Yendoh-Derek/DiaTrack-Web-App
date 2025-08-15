import OpenAI from 'openai';

// Grok API configuration
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GROK_API_URL = import.meta.env.VITE_GROK_API_URL || 'https://api.x.ai/v1/chat/completions';

// Initialize Grok client
const grokClient = new OpenAI({
  apiKey: GROK_API_KEY,
  baseURL: GROK_API_URL,
  dangerouslyAllowBrowser: true, // Required for browser usage
});

// Types for Grok API
export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GrokError {
  message: string;
  type: 'api_error' | 'network_error' | 'rate_limit' | 'invalid_request' | 'unknown';
}

// System prompt for diabetes-focused medical assistance
const DIABETES_SYSTEM_PROMPT = `You are a medical AI assistant specializing in diabetes care, prevention, and management. 

IMPORTANT GUIDELINES:
- Always provide accurate, evidence-based medical information
- Emphasize that you are an AI assistant and not a replacement for professional medical advice
- Recommend consulting healthcare professionals for medical decisions
- Be supportive and educational while maintaining medical accuracy
- Focus on diabetes-related topics: risk factors, symptoms, management, diet, exercise, monitoring
- If asked about non-medical topics, politely redirect to diabetes-related questions
- Use clear, simple language that patients can understand
- Include practical tips and actionable advice when appropriate

Your responses should be helpful, informative, and always encourage proper medical consultation for serious health concerns.`;

export const grokApi = {
  /**
   * Check if Grok API is properly configured
   */
  isConfigured(): boolean {
    return !!(GROK_API_KEY && GROK_API_URL);
  },

  /**
   * Get a chat completion from Grok API
   */
  async chatCompletion(
    userMessage: string, 
    conversationHistory: GrokMessage[] = []
  ): Promise<{ success: true; response: string } | { success: false; error: GrokError }> {
    
    // Check if API is configured
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Grok API is not configured. Please check your environment variables.',
          type: 'invalid_request'
        }
      };
    }

    try {
      // Prepare messages array
      const messages: GrokMessage[] = [
        { role: 'system', content: DIABETES_SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // Make API call to Grok
      const response = await grokClient.chat.completions.create({
        model: 'grok-beta',
        messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const responseContent = response.choices[0]?.message?.content;
      
      if (!responseContent) {
        return {
          success: false,
          error: {
            message: 'No response content received from Grok API',
            type: 'api_error'
          }
        };
      }

      return {
        success: true,
        response: responseContent
      };

    } catch (error: any) {
      console.error('Grok API Error:', error);
      
      // Handle different types of errors
      if (error.status === 429) {
        return {
          success: false,
          error: {
            message: 'Rate limit exceeded. Please try again in a moment.',
            type: 'rate_limit'
          }
        };
      } else if (error.status === 401) {
        return {
          success: false,
          error: {
            message: 'Invalid API key. Please check your Grok API configuration.',
            type: 'invalid_request'
          }
        };
      } else if (error.status === 400) {
        return {
          success: false,
          error: {
            message: 'Invalid request to Grok API. Please try rephrasing your question.',
            type: 'invalid_request'
          }
        };
      } else if (error.message?.includes('fetch')) {
        return {
          success: false,
          error: {
            message: 'Network error. Please check your internet connection.',
            type: 'network_error'
          }
        };
      } else {
        return {
          success: false,
          error: {
            message: 'An unexpected error occurred with the Grok API.',
            type: 'unknown'
          }
        };
      }
    }
  },

  /**
   * Test the Grok API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.chatCompletion('Hello, this is a test message.');
      return result.success;
    } catch {
      return false;
    }
  }
};
