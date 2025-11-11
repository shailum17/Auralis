import React from 'react';
import {
  BookOpen,
  Briefcase,
  Heart,
  Monitor,
  Palette,
  Dumbbell,
  Building2,
  Users,
  MessageCircle,
  User,
  Pencil,
  Zap,
  Trophy,
  BarChart3,
  Calendar,
  Home,
  ShoppingCart,
  Code,
  List,
  Ban,
  AlertTriangle,
  MapPin,
  HelpCircle,
  Lock,
  GraduationCap,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for the application
const iconMap: Record<string, LucideIcon> = {
  // Forum categories
  'book': BookOpen,
  'briefcase': Briefcase,
  'heart': Heart,
  'computer': Monitor,
  'palette': Palette,
  'fitness': Dumbbell,
  'building': Building2,
  'users': Users,
  
  // General
  'chat': MessageCircle,
  'user': User,
  'pencil': Pencil,
  'lightning': Zap,
  'trophy': Trophy,
  'chart': BarChart3,
  'calendar': Calendar,
  'home': Home,
  'shopping': ShoppingCart,
  'code': Code,
  'list': List,
  
  // Status/Actions
  'ban': Ban,
  'warning': AlertTriangle,
  'location': MapPin,
  'question': HelpCircle,
  'lock': Lock,
  'graduation': GraduationCap,
  'plant': Sprout,
  
  // Aliases for backward compatibility
  'general': MessageCircle,
  'academic': BookOpen,
  'wellness': Heart,
  'career': Briefcase,
  'events': Calendar,
  'housing': Home,
  'marketplace': ShoppingCart,
  'tech': Code,
  'social': Users,
  'all': List,
};

export const getIconSvg = (iconType: string, className: string = "w-6 h-6"): JSX.Element => {
  const IconComponent = iconMap[iconType] || iconMap['chat'];
  return <IconComponent className={className} />;
};

export const getIconComponent = (iconType: string): LucideIcon => {
  return iconMap[iconType] || iconMap['chat'];
};
