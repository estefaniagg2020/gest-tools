import type { TeamMember } from "./team";

export interface ChartItem {
  label: string;
  value: number;
  percent: number;
}

export interface ActivityItem {
  title: string;
  time: string;
  dotClass: string;
}

export interface DashboardHeaderProps {
  currentDate: string;
  currentUserName: string;
  currentUserPhoto: string;
  currentRole: string;
  currentUserId: string | null;
  members: TeamMember[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgClass: string;
  decoratorClass: string;
  trend?: number;
}

export interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  variant: "blue" | "purple" | "orange" | "green";
}

export interface RevenueChartProps {
  data: ChartItem[];
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  tip: string;
}

export interface ModalProps {
  isOpen: boolean;
  variant?: "default" | "modern";
  title?: string;
}

export interface BlockEditorModalProps {
  isOpen: boolean;
  editBlock?: import("./schedule").ScheduleBlock;
  initialDate?: Date;
  initialHour?: number;
  members?: import("./team").TeamMember[];
}

export interface ConfigHubCardProps {
  to: string;
  title: string;
  description: string;
  icon: string;
  accent: "teal" | "violet" | "amber" | "sky" | "rose";
  actionLabel?: string;
}
