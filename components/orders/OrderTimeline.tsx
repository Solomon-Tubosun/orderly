"use client";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_ORDER } from "@/types/order";
import { cn } from "@/lib/utils";

interface StatusHistoryEntry {
  status: string;
  note?: string | null;
  createdAt: Date | string;
}

interface OrderTimelineProps {
  statusHistory: StatusHistoryEntry[];
  currentStatus: string;
}

export function OrderTimeline({ statusHistory, currentStatus }: OrderTimelineProps) {
  const currentIndex = ORDER_STATUS_ORDER.indexOf(currentStatus as any);

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
      <div className="space-y-6">
        {ORDER_STATUS_ORDER.map((status, index) => {
          const historyEntry = statusHistory.find((h) => h.status === status);
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={status} className="relative flex gap-4">
              <div className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 flex-shrink-0 z-10",
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-xs font-medium">
                    {ORDER_STATUS_LABELS[status].charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ORDER_STATUS_LABELS[status]}</span>
                  {isCurrent && <Badge variant="secondary" className="text-xs">Current</Badge>}
                </div>
                {historyEntry && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {historyEntry.note ? `${historyEntry.note} • ` : ""}
                    {formatDateTime(historyEntry.createdAt)}
                  </p>
                )}
                {!historyEntry && index < currentIndex && (
                  <p className="text-sm text-muted-foreground mt-1">Completed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}