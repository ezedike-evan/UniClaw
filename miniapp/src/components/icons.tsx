import {
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Flame,
  GraduationCap,
  Home,
  Lightbulb,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Plus,
  Send,
  Share2,
  Sparkles,
  Sun,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";

export const ICONS = {
  home: Home,
  chat: MessageCircle,
  contribute: Plus,
  send: Send,
  moon: Moon,
  sun: Sun,
  sparkles: Sparkles,
  hostel: Building2,
  timetable: CalendarDays,
  events: Sparkles,
  exams: BookOpen,
  food: UtensilsCrossed,
  contacts: Phone,
  map: MapPin,
  faculties: GraduationCap,
  share: Share2,
  copy: Copy,
  chevronRight: ChevronRight,
  flame: Flame,
  users: Users,
  check: Check,
  close: X,
  clock: Clock,
  lightbulb: Lightbulb,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconKey;
  size?: number;
  className?: string;
}): JSX.Element {
  const C = ICONS[name];
  return <C size={size} strokeWidth={2} className={className} aria-hidden />;
}
