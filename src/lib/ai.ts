interface VLLMModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface VLLMChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface VLLMChatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

class VLLMService {
  private baseUrl: string;
  private apiKey: string;
  private modelName = 'Qwen/Qwen3-Coder-30B';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.VLLM_BASE_URL || 'http://localhost:8000';
    this.apiKey = 'token-secret'; // Default API key from docker-compose
  }

  async getAvailableModels(): Promise<VLLMModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`vLLM API error: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch vLLM models:', error);
      throw new Error('Unable to connect to vLLM. Make sure vLLM is running.');
    }
  }

  async getBestModel(): Promise<string> {
    // vLLM runs a specific model, so we return the configured model name
    return this.modelName;
  }

  async generateResponse(prompt: string, model?: string): Promise<string> {
    const selectedModel = model || await this.getBestModel();
    
    const request: VLLMChatRequest = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2000,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`vLLM API error: ${response.status}`);
      }

      const data: VLLMChatResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

export const aiService = new VLLMService();

export interface BreakdownTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'today' | 'tomorrow';
}

export async function breakDownWeeklyTasks(weeklyTasks: string[]): Promise<BreakdownTask[]> {
  const tasksText = weeklyTasks.map((task, index) => `${index + 1}. ${task}`).join('\n');
  
  const prompt = `You are a task management assistant. I have these weekly plans/tasks:

${tasksText}

Please break these down into smaller, actionable tasks and distribute them across today and tomorrow. Follow these guidelines:

1. Break large tasks into smaller, specific actions (max 2-3 hours each)
2. Consider urgency and importance when assigning to today vs tomorrow
3. Assign priority levels (high, medium, low) based on importance and urgency
4. Provide clear, actionable descriptions
5. Balance the load between today and tomorrow when possible

Respond with a JSON array in this exact format:
[
  {
    "title": "Specific task title",
    "description": "Clear description of what needs to be done",
    "priority": "high|medium|low",
    "category": "today|tomorrow"
  }
]

Only respond with the JSON array, no other text.`;

  try {
    const response = await aiService.generateResponse(prompt);
    
    // Try to parse the response as JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }
    
    const tasks = JSON.parse(jsonMatch[0]) as BreakdownTask[];
    
    // Validate the response
    if (!Array.isArray(tasks)) {
      throw new Error('AI response was not an array');
    }
    
    return tasks.filter(task => 
      task.title && 
      task.description && 
      ['high', 'medium', 'low'].includes(task.priority) &&
      ['today', 'tomorrow'].includes(task.category)
    );
  } catch (error) {
    console.error('Failed to break down tasks:', error);
    throw new Error('Failed to break down tasks with AI');
  }
}
