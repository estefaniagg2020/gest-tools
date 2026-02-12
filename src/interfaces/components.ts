import type { Therapist } from "./therapist";

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
  therapists: Therapist[];
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
}

export interface BlockEditorModalProps {
  isOpen: boolean;
  editBlock?: import("./schedule").ScheduleBlock;
  initialDate?: Date;
  initialHour?: number;
}
