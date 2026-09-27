import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Receipt,
  Film,
  Heart,
  GraduationCap,
  Plane,
  ShoppingCart,
  Home,
  Repeat,
  TrendingUp,
  Wallet,
  Briefcase,
  Coffee,
  MoreHorizontal,
  Shield,
  Laptop,
  Tag,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  FileText,
  Camera,
  Trash2,
  Copy,
  Edit2,
  Check,
  ChevronRight,
  ChevronDown,
  Lock,
  Download,
  Upload,
  AlertTriangle,
  Menu,
  RotateCcw,
  ChevronLeft,
  Maximize2,
  X,
  CheckCircle2,
  ShieldAlert,
  Bell,
  Zap,
  Sparkles,
} from 'lucide-react-native';

export type IconName =
  | 'Utensils'
  | 'ShoppingBag'
  | 'Car'
  | 'Receipt'
  | 'Film'
  | 'Heart'
  | 'GraduationCap'
  | 'Plane'
  | 'ShoppingCart'
  | 'Home'
  | 'Repeat'
  | 'TrendingUp'
  | 'Wallet'
  | 'Briefcase'
  | 'Coffee'
  | 'MoreHorizontal'
  | 'Shield'
  | 'Laptop'
  | 'Tag'
  | 'DollarSign'
  | 'ArrowUpRight'
  | 'ArrowDownLeft'
  | 'ArrowRightLeft'
  | 'Search'
  | 'SlidersHorizontal'
  | 'Plus'
  | 'Eye'
  | 'EyeOff'
  | 'Calendar'
  | 'Clock'
  | 'FileText'
  | 'Camera'
  | 'Trash2'
  | 'Copy'
  | 'Edit2'
  | 'Check'
  | 'ChevronRight'
  | 'ChevronDown'
  | 'Lock'
  | 'Download'
  | 'Upload'
  | 'AlertTriangle'
  | 'Menu'
  | 'RotateCcw'
  | 'ChevronLeft'
  | 'Maximize2'
  | 'X'
  | 'CheckCircle2'
  | 'ShieldAlert'
  | 'Bell'
  | 'Zap'
  | 'Sparkles';

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 20,
  color = '#172018',
  strokeWidth = 1.8,
}) => {
  const iconProps = { size, color, strokeWidth };

  switch (name) {
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Receipt':
      return <Receipt {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'Heart':
      return <Heart {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Plane':
      return <Plane {...iconProps} />;
    case 'ShoppingCart':
      return <ShoppingCart {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'Repeat':
      return <Repeat {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Wallet':
      return <Wallet {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'Coffee':
      return <Coffee {...iconProps} />;
    case 'Shield':
      return <Shield {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'DollarSign':
      return <DollarSign {...iconProps} />;
    case 'ArrowUpRight':
      return <ArrowUpRight {...iconProps} />;
    case 'ArrowDownLeft':
      return <ArrowDownLeft {...iconProps} />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft {...iconProps} />;
    case 'Search':
      return <Search {...iconProps} />;
    case 'SlidersHorizontal':
      return <SlidersHorizontal {...iconProps} />;
    case 'Plus':
      return <Plus {...iconProps} />;
    case 'Eye':
      return <Eye {...iconProps} />;
    case 'EyeOff':
      return <EyeOff {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'Clock':
      return <Clock {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'Camera':
      return <Camera {...iconProps} />;
    case 'Trash2':
      return <Trash2 {...iconProps} />;
    case 'Copy':
      return <Copy {...iconProps} />;
    case 'Edit2':
      return <Edit2 {...iconProps} />;
    case 'Check':
      return <Check {...iconProps} />;
    case 'ChevronRight':
      return <ChevronRight {...iconProps} />;
    case 'ChevronDown':
      return <ChevronDown {...iconProps} />;
    case 'Lock':
      return <Lock {...iconProps} />;
    case 'Download':
      return <Download {...iconProps} />;
    case 'Upload':
      return <Upload {...iconProps} />;
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />;
    case 'Menu':
      return <Menu {...iconProps} />;
    case 'RotateCcw':
      return <RotateCcw {...iconProps} />;
    case 'ChevronLeft':
      return <ChevronLeft {...iconProps} />;
    case 'Maximize2':
      return <Maximize2 {...iconProps} />;
    case 'X':
      return <X {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'ShieldAlert':
      return <ShieldAlert {...iconProps} />;
    case 'Bell':
      return <Bell {...iconProps} />;
    case 'MoreHorizontal':
      return <MoreHorizontal {...iconProps} />;
    case 'Tag':
    default:
      return <Tag {...iconProps} />;
  }
};
