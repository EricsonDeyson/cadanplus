import {
  BarChart3,
  FileBarChart,
  Home,
  LayoutGrid,
  LineChart,
  PieChart,
  Shield,
  ShoppingCart,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/** Mapa slug → ícone dos módulos cadastrados no Supabase (coluna modules.icon). */
const MODULE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  shield: Shield,
  chart: BarChart3,
  'chart-line': LineChart,
  'chart-pie': PieChart,
  report: FileBarChart,
  sales: ShoppingCart,
  logistics: Truck,
  finance: Wallet,
};

export function moduleIcon(name: string | null): LucideIcon {
  return (name && MODULE_ICONS[name]) || LayoutGrid;
}
