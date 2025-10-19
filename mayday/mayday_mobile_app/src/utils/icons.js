/**
 * Icon utility for mapping Ionicon names to Lucide icons (SVG-based)
 * This replaces @expo/vector-icons which has font loading issues in Expo 52
 */

import {
  RefreshCw,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  PhoneMissed,
  CheckCircle,
  XCircle,
  BarChart3,
  Timer,
  User,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Menu,
  Home,
  History,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Hash,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Grid,
  List,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react-native';

/**
 * Icon component mapper
 * Maps common Ionicon names to Lucide components
 */
export const iconMap = {
  // Navigation & Actions
  'refresh': RefreshCw,
  'refresh-outline': RefreshCw,
  'menu': Menu,
  'menu-outline': Menu,
  'home': Home,
  'home-outline': Home,
  'search': Search,
  'search-outline': Search,
  'add': Plus,
  'add-outline': Plus,
  'close': X,
  'close-outline': X,
  'chevron-forward': ChevronRight,
  'chevron-back': ChevronLeft,
  'chevron-down': ChevronDown,
  'arrow-forward': ArrowRight,
  'arrow-back': ArrowLeft,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  
  // Calls
  'call': Phone,
  'call-outline': Phone,
  'arrow-down-circle': PhoneIncoming,
  'arrow-up-circle': PhoneOutgoing,
  'close-circle': XCircle,
  'close-circle-outline': XCircle,
  'checkmark-circle': CheckCircle,
  'checkmark-circle-outline': CheckCircle,
  
  // Media
  'mic': Mic,
  'mic-outline': Mic,
  'mic-off': MicOff,
  'mic-off-outline': MicOff,
  'pause': Pause,
  'pause-outline': Pause,
  'play': Play,
  'play-outline': Play,
  'volume-high': Volume2,
  'volume-high-outline': Volume2,
  'volume-low': Volume1,
  'volume-low-outline': Volume1,
  'volume-mute': VolumeX,
  'volume-mute-outline': VolumeX,
  'keypad': Hash,
  'keypad-outline': Hash,
  
  // Stats & Charts
  'stats-chart': BarChart3,
  'stats-chart-outline': BarChart3,
  'bar-chart': BarChart3,
  'bar-chart-outline': BarChart3,
  'timer': Timer,
  'timer-outline': Timer,
  'time': Clock,
  'time-outline': Clock,
  'calendar': Calendar,
  'calendar-outline': Calendar,
  
  // People
  'person': User,
  'person-outline': User,
  'people': Users,
  'people-outline': Users,
  
  // Status
  'alert-circle': AlertCircle,
  'alert-circle-outline': AlertCircle,
  
  // Other
  'settings': Settings,
  'settings-outline': Settings,
  'log-out': LogOut,
  'log-out-outline': LogOut,
  'create': Edit,
  'create-outline': Edit,
  'trash': Trash2,
  'trash-outline': Trash2,
  'ellipsis-vertical': MoreVertical,
  'ellipsis-vertical-outline': MoreVertical,
  'grid': Grid,
  'grid-outline': Grid,
  'list': List,
  'list-outline': List,
  'eye': Eye,
  'eye-outline': Eye,
  'eye-off': EyeOff,
  'eye-off-outline': EyeOff,
  'checkmark': Check,
};

/**
 * Get icon component by name
 * @param {string} name - Ionicon name
 * @returns {Component} - Lucide icon component
 */
export function getIcon(name) {
  const IconComponent = iconMap[name] || AlertCircle;
  return IconComponent;
}

/**
 * Icon wrapper component that mimics Ionicons API
 */
export function Icon({ name, size = 24, color = '#000', style, ...props }) {
  const IconComponent = getIcon(name);
  return <IconComponent size={size} color={color} style={style} {...props} />;
}

export default Icon;
