# DailyFlow - AI-Powered Task Management Dashboard

A modern, feature-rich task management application built with Next.js, TypeScript, and Tailwind CSS. DailyFlow helps you organize your daily tasks with AI-powered breakdown capabilities, drag-and-drop functionality, and a beautiful kanban-style interface.

## ✨ Features

### 🎯 Core Functionality
- **Kanban Board Layout**: Organize tasks across Today, Tomorrow, This Week, and Dailies columns
- **Drag & Drop**: Seamlessly move tasks between columns
- **Priority Management**: Set task priorities (High, Medium, Low) with visual indicators
- **Real-time Search**: Find tasks instantly with live search functionality
- **Task Statistics**: Track completion rates and productivity metrics

### 🤖 AI Integration
- **AI Task Breakdown**: Automatically break down complex tasks into smaller, manageable subtasks
- **Smart Categorization**: AI suggests optimal task placement across time horizons
- **Powered by vLLM**: Local AI processing with Qwen models for privacy and speed

### ⚡ Advanced Features
- **Multi-Selection**: Select multiple tasks using Ctrl+Click or Shift+Click for batch operations
- **Keyboard Navigation**: Full keyboard support with Tab navigation and shortcuts
- **Daily Reset**: One-click reset for recurring daily tasks
- **Auto-focus**: New tasks automatically enter edit mode for immediate input
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Dark Mode Support**: Easy on the eyes during late-night work sessions
- **Visual Feedback**: Hover states, transitions, and micro-interactions
- **Mobile Stats Bar**: Quick productivity overview on mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite with better-sqlite3
- **AI**: vLLM with Qwen models
- **Icons**: Lucide React
- **Deployment**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for AI features)
- NVIDIA GPU (recommended for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/todolist.git
   cd todolist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DB_PATH`: Path to your SQLite database
   - `VLLM_BASE_URL`: URL for vLLM AI service
   - `HUGGING_FACE_HUB_TOKEN`: Your Hugging Face token (required for AI features)

4. **Run the application**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup (Recommended)

For the full experience with AI features:

1. **Ensure you have Docker and NVIDIA Container Toolkit installed**

2. **Set your Hugging Face token** (required for downloading AI models):
   ```bash
   export HUGGING_FACE_HUB_TOKEN=your_token_here
   ```

3. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - The DailyFlow application on port 5432
   - vLLM AI service on port 8000

4. **Access the application** at [http://localhost:5432](http://localhost:5432)

## 📖 Usage Guide

### Basic Task Management
1. **Create Tasks**: Click "New Task" or press the + button
2. **Edit Tasks**: Click on any task title to edit inline
3. **Complete Tasks**: Click the checkbox to mark as complete
4. **Delete Tasks**: Select tasks and press Delete key
5. **Move Tasks**: Drag and drop between columns

### Advanced Features
- **Multi-Selection**: Hold Ctrl while clicking to select multiple tasks
- **Range Selection**: Click a task, then Shift+Click another to select all in between
- **Keyboard Navigation**: Use Tab to move between tasks, Escape to clear selection
- **AI Breakdown**: Select tasks and click "AI Breakdown" to automatically create subtasks

### Daily Routines
- Add recurring tasks to the "Dailies" column
- Click "Reset Daily Routines" to uncheck all daily tasks
- Perfect for habits, exercise, meditation, etc.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PATH` | SQLite database file path | `./data/tasks.db` |
| `VLLM_BASE_URL` | vLLM API server URL | `http://localhost:8000` |
| `HUGGING_FACE_HUB_TOKEN` | Hugging Face access token | Required for AI |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `5432` |
| `HOSTNAME` | Server hostname | `0.0.0.0` |

### AI Model Configuration

The application uses Qwen/Qwen3-Coder-30B by default. You can customize this in `docker-compose.yml`:

```yaml
command: >
  --model YourCustomModel/Name
  --gpu-memory-utilization 0.9
  --max-model-len 8192
```

## 🐳 Docker Details

### Services
- **app**: Main Next.js application
- **vllm**: AI inference server with GPU acceleration

### Volumes
- `todolist-data`: Persistent task database storage
- `vllm-data`: AI model cache and downloads

### GPU Requirements
- NVIDIA GPU with 8GB+ VRAM recommended
- NVIDIA Container Toolkit required
- Falls back to CPU if GPU unavailable (slower performance)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── page.tsx        # Main dashboard
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── task-column.tsx
│   └── task-item.tsx
├── hooks/              # Custom React hooks
├── lib/               # Utility functions
│   ├── ai.ts          # AI integration
│   └── db.ts          # Database operations
└── types/             # TypeScript type definitions
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests (when implemented)

## 🐛 Troubleshooting

### Common Issues

**AI Features Not Working**
- Ensure `HUGGING_FACE_HUB_TOKEN` is set correctly
- Check that vLLM service is running on port 8000
- Verify GPU is available and recognized by Docker

**Database Issues**
- Check that the `data/` directory exists and is writable
- Verify `DB_PATH` environment variable is correct

**Performance Issues**
- Ensure sufficient GPU memory for AI models
- Consider reducing `VLLM_GPU_MEMORY_UTILIZATION` if encountering OOM errors

### Getting Help
- Open an issue on GitHub
- Check the [Issues](https://github.com/yourusername/todolist/issues) page
- Review existing discussions and solutions

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [vLLM](https://vllm.ai/) - LLM inference engine
- [Qwen](https://qwen.ai/) - AI language models
- [Lucide](https://lucide.dev/) - Beautiful icons

---

**Built with ❤️ for productivity enthusiasts**
