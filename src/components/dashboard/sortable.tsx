"use client";

import KanbanCard from "@/components/dashboard/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableKanbanCardProps {
  ticket: Ticket;
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

export default function SortableKanbanCard({
  ticket,
}: SortableKanbanCardProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    data: {
      ticket,
      type: "ticket",
    },
    id: ticket.id,
  });

  const style = {
    opacity: isDragging ? 0.3 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation"
    >
      <KanbanCard ticket={ticket} />
    </div>
  );
}
