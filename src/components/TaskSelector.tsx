import React from 'react';
import { TaskType, Language } from '../types';
import { PenTool, BookOpen, MessageSquare, HelpCircle } from 'lucide-react';
import { translations } from '../translations';

interface TaskSelectorProps {
  activeTask: TaskType;
  onSelectTask: (task: TaskType) => void;
  disabled?: boolean;
  lang: Language;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  activeTask,
  onSelectTask,
  disabled,
  lang,
}) => {
  const t = translations[lang];

  const tasks: {
    id: TaskType;
    title: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    {
      id: 'writing',
      title: t.taskWritingTitle,
      badge: t.taskWritingBadge,
      icon: PenTool,
      description: t.taskWritingDesc,
    },
    {
      id: 'vocab',
      title: t.taskVocabTitle,
      badge: t.taskVocabBadge,
      icon: BookOpen,
      description: t.taskVocabDesc,
    },
    {
      id: 'roleplay',
      title: t.taskRoleplayTitle,
      badge: t.taskRoleplayBadge,
      icon: MessageSquare,
      description: t.taskRoleplayDesc,
    },
    {
      id: 'quiz',
      title: t.taskQuizTitle,
      badge: t.taskQuizBadge,
      icon: HelpCircle,
      description: t.taskQuizDesc,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {tasks.map((task) => {
        const Icon = task.icon;
        const isActive = activeTask === task.id;

        return (
          <button
            key={task.id}
            id={`task-tab-${task.id}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelectTask(task.id)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              isActive
                ? 'bg-neutral-900 border-sky-500/70 shadow-[0_4px_20px_rgba(14,165,233,0.12)] ring-1 ring-sky-500/40'
                : 'bg-neutral-900/50 hover:bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'bg-neutral-800/80 text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-sky-950 text-sky-300 border-sky-800'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {task.badge}
                </span>
              </div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isActive ? 'text-white' : 'text-neutral-200'
                }`}
              >
                {task.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                {task.description}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-neutral-800/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-500">
                Preset #{tasks.findIndex((t) => t.id === task.id) + 1}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-sky-400' : 'text-neutral-500'
                }`}
              >
                {isActive ? (lang === 'vi' ? 'Đang chọn' : 'Active') : (lang === 'vi' ? 'Chọn' : 'Select')} →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
