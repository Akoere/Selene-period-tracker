import { useTheme } from '../../context/ThemeContext';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { currentTheme, setCurrentTheme, themes } = useTheme();

  return (
    <div className="flex gap-2 p-4 bg-secondary rounded-2xl overflow-x-auto">
      {Object.entries(themes).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => setCurrentTheme(key)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all
            flex items-center gap-2 border-2
            ${currentTheme === key 
              ? 'border-primary bg-background text-primary shadow-sm' 
              : 'border-transparent text-foreground opacity-70 hover:opacity-100'}
          `}
        >
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ background: theme.colors['--primary'] }} 
          />
          {theme.name}
        </button>
      ))}
    </div>
  );
}