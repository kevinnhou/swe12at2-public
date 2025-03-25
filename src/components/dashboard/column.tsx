"use client";

import SortableKanbanCard from "@/components/dashboard/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Badge } from "~/badge";

interface KanbanColumnProps {
  id: "Closed" | "In Progress" | "Open";
  tickets: Ticket[];
  title: string;
}

interface Ticket {
  created_at: string;
  description: string;
  id: number;
  owner_id: number;
  priority: string;
  status: string;
  title: string;
}

export default function KanbanColumn({
  id,
  tickets,
  title,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const getColumnColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "bg-green-50 border-green-200";
      case "In Progress":
        return "bg-amber-50 border-amber-200";
      case "Open":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "In Progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Open":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div
      className={`flex-1 min-w-[300px] max-w-[350px] flex h-[600px] flex-col rounded-lg border ${getColumnColor(
        title
      )} ${isOver ? "bg-opacity-70" : ""} overflow-hidden transition-colors`}
      ref={setNodeRef}
    >
      <div className="p-3 border-b border-inherit flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <Badge className={getBadgeColor(title)} variant="neutral">
          {tickets.length}
        </Badge>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {tickets.map((ticket) => (
              <SortableKanbanCard key={ticket.id} ticket={ticket} />
            ))}
            {tickets.length === 0 && (
              <div className="text-center py-8 text-gray-500 italic">
                No tickets in this column
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
