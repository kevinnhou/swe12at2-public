"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

import KanbanCard from "@/components/dashboard/card";
import KanbanColumn from "@/components/dashboard/column";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

interface KanbanBoardProps {
  tickets: Ticket[];
  updateTicketStatus: (ticketId: number, newStatus: string) => Promise<void>;
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

const VALID_STATUSES = ["Open", "In Progress", "Closed"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export default function KanbanBoard({
  tickets,
  updateTicketStatus,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<null | number>(null);
  const [columns] = useState<ValidStatus[]>(["Open", "In Progress", "Closed"]);
  const [ticketsState, setTicketsState] = useState<Ticket[]>(tickets);

  useEffect(() => {
    setTicketsState(tickets);
  }, [tickets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getActiveTicket = () => {
    return ticketsState.find((ticket) => ticket.id === activeId) || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(Number(active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTicketId = Number(active.id);
    const overId = String(over.id);

    if (VALID_STATUSES.includes(overId as ValidStatus)) {
      const activeTicket = ticketsState.find((t) => t.id === activeTicketId);
      if (!activeTicket) {
        setActiveId(null);
        return;
      }

      if (activeTicket.status !== overId) {
        const newStatus = overId as ValidStatus;
        setTicketsState((currentTickets) =>
          currentTickets.map((t) =>
            t.id === activeTicketId ? { ...t, status: newStatus } : t
          )
        );
        await updateTicketStatus(activeTicketId, newStatus);
      }
    } else {
      const overTicketId = Number(over.id);
      const activeTicket = ticketsState.find((t) => t.id === activeTicketId);
      const overTicket = ticketsState.find((t) => t.id === overTicketId);

      if (!activeTicket || !overTicket) {
        setActiveId(null);
        return;
      }

      if (activeTicket.status === overTicket.status) {
        const activeIndex = ticketsState.findIndex(
          (t) => t.id === activeTicketId
        );
        const overIndex = ticketsState.findIndex((t) => t.id === overTicketId);

        if (activeIndex !== -1 && overIndex !== -1) {
          setTicketsState(arrayMove(ticketsState, activeIndex, overIndex));
        }
      } else {
        setTicketsState((currentTickets) =>
          currentTickets.map((t) =>
            t.id === activeTicketId ? { ...t, status: overTicket.status } : t
          )
        );
        await updateTicketStatus(activeTicketId, overTicket.status);
      }
    }

    setActiveId(null);
  };

  const getColumnTickets = (status: ValidStatus) => {
    return ticketsState.filter((ticket) => ticket.status === status);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex justify-between h-full overflow-x-auto pb-4">
        {columns.map((status) => (
          <KanbanColumn
            id={status}
            key={status}
            tickets={getColumnTickets(status)}
            title={status}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? <KanbanCard ticket={getActiveTicket()!} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
