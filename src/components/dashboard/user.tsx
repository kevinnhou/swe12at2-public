"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type React from "react";

import TicketDrawer from "@/components/dashboard/drawer";
import EditTicketModal from "@/components/dashboard/edit";
import KanbanBoard from "@/components/dashboard/kanban";
import TicketTable from "@/components/dashboard/table";
import { apiRequest } from "@/lib/api";
import { ArrowUpDown, Kanban, MoreHorizontal, Table2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "~/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/tooltip";

interface Ticket {
  created_at: string;
  description: string;
  id: number;
  owner_id: number;
  priority: string;
  status: string;
  title: string;
}

const statusOrder = ["Open", "In Progress", "Closed"];
const priorityOrder = ["Low", "Medium", "High"];

export default function User() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTicket, setEditingTicket] = useState<null | Ticket>(null);
  const [newTicket, setNewTicket] = useState({
    description: "",
    priority: "Medium",
    status: "Open",
    title: "",
  });
  const [activeView, setActiveView] = useState<"kanban" | "table">("table");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const result = await apiRequest<Ticket[]>("tickets");
      if (result.data) {
        setTickets(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to fetch tickets");
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    try {
      const result = await apiRequest<Ticket>("tickets/create", {
        body: newTicket,
        method: "POST",
      });
      if (result.data) {
        setTickets([result.data, ...tickets]);
        setNewTicket({
          description: "",
          priority: "Medium",
          status: "Open",
          title: "",
        });
        toast.success("Ticket created successfully");
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast.error("Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  }

  const updateTicket = useCallback(
    async (ticketId: number, updates: Partial<Ticket>) => {
      try {
        const result = await apiRequest<Ticket>(`tickets/${ticketId}`, {
          body: updates,
          method: "PUT",
        });

        if (result.data) {
          setTickets(
            tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, ...result.data } : ticket
            )
          );
          toast.success(`Ticket updated successfully`);
        } else {
          toast.error("Failed to update ticket");
          console.error("Failed to update ticket", result);
        }
      } catch (error) {
        console.error("Failed to update ticket:", error);
        toast.error("Failed to update ticket");
        fetchTickets();
      }
    },
    [tickets, fetchTickets]
  );

  const getTicketColumns = (): ColumnDef<Ticket, unknown>[] => [
    {
      accessorKey: "id",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("id")}</div>
      ),
      header: "ID",
    },
    {
      accessorKey: "title",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate">
                  {row.getValue("title")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.getValue("title")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              variant="ghost"
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              variant="ghost"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const statusA = rowA.getValue(columnId) as string;
        const statusB = rowB.getValue(columnId) as string;

        return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              variant="ghost"
            >
              Priority
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const priorityA = rowA.getValue(columnId) as string;
        const priorityB = rowB.getValue(columnId) as string;

        return (
          priorityOrder.indexOf(priorityA) - priorityOrder.indexOf(priorityB)
        );
      },
    },
    {
      accessorKey: "created_at",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString(),
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              variant="ghost"
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId) as string).getTime();
        const dateB = new Date(rowB.getValue(columnId) as string).getTime();

        return dateA - dateB;
      },
    },
    {
      cell: ({ row }) => {
        const ticket = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0" variant="ghost">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingTicket(ticket)}>
                  Edit ticket
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(ticket.id.toString())
                  }
                >
                  Copy ticket ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      id: "actions",
    },
  ];

  async function handleSaveTicket(updatedTicket: Ticket) {
    const { id, ...updates } = updatedTicket;
    await updateTicket(id, updates);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <TicketDrawer
          createTicket={createTicket}
          isCreating={isCreating}
          newTicket={newTicket}
          open={drawerOpen}
          setNewTicket={setNewTicket}
          setOpen={setDrawerOpen}
        />

        <div className="flex items-center gap-2">
          <Tabs
            onValueChange={(v) => setActiveView(v as "kanban" | "table")}
            value={activeView}
          >
            <TabsList>
              <TabsTrigger value="table">
                <Table2 className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Kanban className="h-4 w-4 mr-2" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeView === "table" ? (
        <TicketTable
          columns={getTicketColumns()}
          data={tickets}
          onUpdateTicket={updateTicket}
        />
      ) : (
        <div className="p-4 h-full flex flex-col">
          <KanbanBoard
            tickets={tickets}
            updateTicketStatus={(ticketId: number, newStatus: string) =>
              updateTicket(ticketId, { status: newStatus })
            }
          />
        </div>
      )}

      <EditTicketModal
        onClose={() => setEditingTicket(null)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
      />
    </div>
  );
}
