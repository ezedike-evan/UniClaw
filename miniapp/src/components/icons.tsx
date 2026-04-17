import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Home,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Plus,
  Send,
  Sparkles,
  Sun,
  UtensilsCrossed,
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
