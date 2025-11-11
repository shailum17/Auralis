import React from 'react';
import { getIconSvg } from '@/lib/icon-utils';

interface CategoryIconProps {
  category: string;
  className?: string;
  withGradient?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  className = "w-6 h-6",
  withGradient = false 
}) => {
  // Map category IDs to icon names
  const categoryToIcon: Record<string, string> = {
    'academic-help': 'book',
    'career-guidance': 'briefcase',
    'mental-wellness': 'heart',
    'tech-innovation': 'computer',
    'creative-arts': 'palette',
    'sports-fitness': 'fitness',
    'campus-life': 'building',
    'study-groups': 'users',
    'general': 'chat',
    'academic': 'book',
    'wellness': 'heart',
    'career': 'briefcase',
    'events': 'calendar',
    'housing': 'home',
    'marketplace': 'shopping',
    'tech': 'code',
    'social': 'users',
    'all': 'list',
  };

  const iconName = categoryToIcon[category] || 'chat';
  
  if (withGradient) {
    return (
      <div className="relative inline-block">
        <div 
          className="absolute inset-0 rounded-full blur-[40px] opacity-60 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
          }}
        />
        <div className="relative z-10">
          {getIconSvg(iconName, className)}
        </div>
      </div>
    );
  }
  
  return getIconSvg(iconName, className);
};

export default CategoryIcon;
