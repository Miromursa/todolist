# Questlog

A modern task management web application built with Next.js, TypeScript, and Tailwind CSS. Questlog helps you organize your daily adventures and track your progress through an intuitive kanban-style interface.

## Features

- **Task Management**: Create, edit, delete, and organize tasks across different time categories
- **Kanban Board**: Visual task organization with drag-and-drop functionality
- **Time Categories**: Organize tasks into Today, Tomorrow, This Week, and Daily Routines
- **Priority Levels**: Set task priorities (High, Medium, Low) with visual indicators
- **Search & Filter**: Quickly find tasks with real-time search
- **Multi-Selection**: Select multiple tasks for bulk operations
- **Keyboard Navigation**: Full keyboard support for power users
- **Dark Mode**: Built-in theme toggle for light/dark modes
- **Progress Tracking**: Visual statistics and completion tracking
- **Daily Reset**: One-click reset for daily routines
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives with custom components
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode support

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd questlog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5432](http://localhost:5432) in your browser.

## Usage

### Task Organization

Tasks are organized into four main categories:

- **Today**: Tasks you want to complete today
- **Tomorrow**: Tasks planned for tomorrow
- **This Week**: Tasks for the current week
- **Dailies**: Recurring daily routines that can be reset

### Task Features

- **Create Tasks**: Click "New Task" or use the + button in any column
- **Edit Tasks**: Click on any task title or description to edit inline
- **Set Priority**: Use the priority dropdown to set High, Medium, or Low priority
- **Complete Tasks**: Check the checkbox to mark tasks as complete
- **Delete Tasks**: Select tasks and press Delete, or use individual delete buttons

### Keyboard Shortcuts

- **Tab**: Navigate between tasks
- **Shift + Tab**: Navigate backwards
- **Delete**: Delete selected tasks
- **Escape**: Clear selection
- **Ctrl/Cmd + Click**: Multi-select tasks
- **Shift + Click**: Range selection (within same column)

### Daily Routines

The "Dailies" column is designed for recurring tasks. Use the "Reset Daily Routines" button to uncheck all completed daily tasks at the start of a new day.

## Project Structure

```
questlog/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main dashboard
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── task-column.tsx
│   │   ├── task-item.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── db.ts          # Database utilities
│   │   └── utils.ts       # General utilities
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── tailwind.config.ts     # Tailwind configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests (placeholder)

### Database

The application uses SQLite for data persistence. The database schema is managed through the API routes in `src/app/api/`.

### Styling

The application uses Tailwind CSS with a custom design system. Theme switching is handled by `next-themes` and the theme provider component.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.