interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

class OllamaService {
  private baseUrl: string;
  private preferredModels = ['qwen3', 'gemma3'];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      throw new Error('Unable to connect to Ollama. Make sure Ollama is running.');
    }
  }

  async getBestModel(): Promise<string> {
    const models = await this.getAvailableModels();
    
    // Find the best model based on our preferences
    for (const preferred of this.preferredModels) {
      const found = models.find(model => 
        model.name.toLowerCase().includes(preferred.toLowerCase())
      );
      if (found) {
        return found.name;
      }
    }
    
    // If no preferred model found, return the first available one
    if (models.length > 0) {
      return models[0].name;
    }
    
    throw new Error('No models available. Please pull a model in Ollama first.');
  }

  async generateResponse(prompt: string, model?: string): Promise<string> {
    const selectedModel = model || await this.getBestModel();
    
    const request: OllamaGenerateRequest = {
      model: selectedModel,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

export const aiService = new OllamaService();

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
