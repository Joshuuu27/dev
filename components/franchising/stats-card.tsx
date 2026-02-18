"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  onClick: () => void;
  isLoading?: boolean;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon: Icon,
  onClick,
  isLoading = false,
  description,
}) => {
  return (
    <Card
      className="cursor-pointer border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {isLoading ? "..." : count}
            </p>
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
          <div className="ml-4 p-3 bg-[#EDEEF9] rounded-xl shrink-0">
            <Icon className="w-6 h-6 text-[#6B46C1]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
