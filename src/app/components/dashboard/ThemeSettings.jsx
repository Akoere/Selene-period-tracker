import { Check } from 'lucide-react';
import { useTheme, themes } from '../../context/ThemeContext';

export function ThemeSettings() {
  const { currentTheme, setTheme } = useTheme();

  // Safety fallback
  const safeThemeId = currentTheme?.id || 'pink';
  const themeList = themes ? Object.values(themes) : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {themeList.map((theme) => {
        const isSelected = safeThemeId === theme.id;
        const primaryColor = theme.colors.primary;
        
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            style={{
              borderColor: isSelected ? primaryColor : '#f3f4f6', // Use real color or gray-100
              backgroundColor: isSelected ? `${primaryColor}10` : 'transparent', // 10% opacity for bg
            }}
            className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:bg-gray-50"
          >
            {/* Color Circle Preview - Uses the gradient from context directly */}
            <div 
              className={`w-10 h-10 rounded-full shadow-sm ring-2 ring-white bg-gradient-to-br ${theme.colors.gradient}`}
            />
            
            <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
              {theme.name}
            </span>

            {/* Checkmark */}
            {isSelected && (
              <div 
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}