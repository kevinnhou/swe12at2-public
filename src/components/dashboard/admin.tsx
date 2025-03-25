/* eslint-disable unused-imports/no-unused-vars */
"use client";

import type { ColumnDef } from "@tanstack/react-table";

import EditTicketModal from "@/components/dashboard/edit";
import WorkspaceJoinCode from "@/components/dashboard/join-code";
import TicketTable from "@/components/dashboard/table";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Badge } from "~/badge";
import { Button } from "~/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/tabs";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "~/tooltip";

interface TicketType {
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

interface User {
  email: string;
  id: number;
  is_admin: boolean;
  name: string;
}

export default function Admin() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<null | string>(null);
  const [priorityFilter, setPriorityFilter] = useState<null | string>(null);
  const [editingTicket, setEditingTicket] = useState<null | TicketType>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!user?.is_admin) {
        toast.error("You don't have permission to access the admin dashboard");
        router.push("/dashboard");
      } else {
        fetchData();
      }
    } else if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function fetchData() {
    setIsLoadingData(true);
    try {
      await Promise.all([fetchTickets(), fetchUsers()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoadingData(false);
    }
  }

  async function fetchTickets() {
    const result = await apiRequest<TicketType[]>("tickets");
    if (result.data) {
      setTickets(result.data);
    }
  }

  async function fetchUsers() {
    const result = await apiRequest<User[]>("workspace/users");
    if (result.data) {
      setUsers(result.data);
    }
  }

  async function updateTicket(ticketId: number, updates: Partial<TicketType>) {
    try {
      const result = await apiRequest<TicketType>(`tickets/${ticketId}`, {
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
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
      toast.error("Failed to update ticket");
    }
  }

  async function handleSaveTicket(updatedTicket: TicketType) {
    const { id, ...updates } = updatedTicket;
    await updateTicket(id, updates);
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        searchQuery === "" ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === null || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === null || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const statistics = useMemo(() => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === "Open").length;
    const inProgressTickets = tickets.filter(
      (t) => t.status === "In Progress"
    ).length;
    const closedTickets = tickets.filter((t) => t.status === "Closed").length;

    const highPriorityTickets = tickets.filter(
      (t) => t.priority === "High"
    ).length;
    const mediumPriorityTickets = tickets.filter(
      (t) => t.priority === "Medium"
    ).length;
    const lowPriorityTickets = tickets.filter(
      (t) => t.priority === "Low"
    ).length;

    return {
      closedTickets,
      highPriorityTickets,
      inProgressTickets,
      lowPriorityTickets,
      mediumPriorityTickets,
      openTickets,
      totalTickets,
    };
  }, [tickets]);

  const statusChartData = [
    { name: "Open", value: statistics.openTickets },
    { name: "In Progress", value: statistics.inProgressTickets },
    { name: "Closed", value: statistics.closedTickets },
  ];

  const priorityChartData = [
    { name: "High", value: statistics.highPriorityTickets },
    { name: "Medium", value: statistics.mediumPriorityTickets },
    { name: "Low", value: statistics.lowPriorityTickets },
  ];

  function getUserName(userId: number) {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  }

  function getStatusColor(status: string) {
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
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  }

  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage tickets and view statistics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <WorkspaceJoinCode />
          <Button onClick={fetchData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Tickets
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.openTickets}
                </div>
                <p
                  className={`text-xs ${
                    (statistics.openTickets / statistics.totalTickets) * 100 >
                    50
                      ? "text-green-600"
                      : (statistics.openTickets / statistics.totalTickets) *
                          100 >
                        25
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    (statistics.openTickets / statistics.totalTickets) * 100 ||
                    0
                  ).toFixed(1)}
                  % of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.inProgressTickets}
                </div>
                <p
                  className={`text-xs ${
                    (statistics.inProgressTickets / statistics.totalTickets) *
                      100 >
                    50
                      ? "text-green-600"
                      : (statistics.inProgressTickets /
                          statistics.totalTickets) *
                          100 >
                        25
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    (statistics.inProgressTickets / statistics.totalTickets) *
                      100 || 0
                  ).toFixed(1)}
                  % of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  High Priority
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.highPriorityTickets}
                </div>
                <p
                  className={`text-xs ${
                    (statistics.highPriorityTickets / statistics.totalTickets) *
                      100 >
                    30
                      ? "text-red-600"
                      : (statistics.highPriorityTickets /
                          statistics.totalTickets) *
                          100 >
                        15
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {(
                    (statistics.highPriorityTickets / statistics.totalTickets) *
                      100 || 0
                  ).toFixed(1)}
                  % of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Closed Tickets
                </CardTitle>
                <Ticket className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statistics.closedTickets}
                </div>
                <p
                  className={`text-xs ${
                    (statistics.closedTickets / statistics.totalTickets) * 100 >
                    50
                      ? "text-red-600"
                      : (statistics.closedTickets / statistics.totalTickets) *
                          100 >
                        25
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {(
                    (statistics.closedTickets / statistics.totalTickets) *
                      100 || 0
                  ).toFixed(1)}
                  % of total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  className="h-full w-full"
                  config={{
                    Closed: {
                      color: "hsl(var(--chart-3))",
                      label: "Closed",
                    },
                    "In Progress": {
                      color: "hsl(var(--chart-2))",
                      label: "In Progress",
                    },
                    Open: {
                      color: "hsl(var(--chart-1))",
                      label: "Open",
                    },
                  }}
                >
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={statusChartData}
                      dataKey="value"
                      innerRadius={60}
                      labelLine={false}
                      nameKey="name"
                      outerRadius={80}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          fill={
                            index === 0
                              ? "hsl(var(--chart-1))"
                              : index === 1
                              ? "hsl(var(--chart-2))"
                              : "hsl(var(--chart-3))"
                          }
                          key={`cell-${index}`}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                dominantBaseline="middle"
                                textAnchor="middle"
                                x={viewBox.cx}
                                y={viewBox.cy}
                              >
                                <tspan
                                  className="fill-foreground text-3xl font-bold"
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                >
                                  {statusChartData.reduce<number>(
                                    (sum: number, entry: { value: number }) =>
                                      sum + entry.value,
                                    0
                                  )}
                                </tspan>
                                <tspan
                                  className="fill-muted-foreground"
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                >
                                  Tickets
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const totalValue = statusChartData.reduce(
                            (sum, entry) => sum + entry.value,
                            0
                          );
                          return (
                            <text
                              dominantBaseline="middle"
                              textAnchor="middle"
                              x={viewBox.cx}
                              y={viewBox.cy}
                            >
                              <tspan
                                className="fill-foreground text-3xl font-bold"
                                x={viewBox.cx}
                                y={viewBox.cy}
                              >
                                {totalValue}
                              </tspan>
                              <tspan
                                className="fill-muted-foreground"
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                              >
                                Tickets
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  className="h-full w-full"
                  config={{
                    High: {
                      color: "hsl(var(--chart-1))",
                      label: "High",
                    },
                    Low: {
                      color: "hsl(var(--chart-3))",
                      label: "Low",
                    },
                    Medium: {
                      color: "hsl(var(--chart-2))",
                      label: "Medium",
                    },
                  }}
                >
                  <BarChart data={priorityChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis axisLine={false} dataKey="name" tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                      {priorityChartData.map((entry, index) => (
                        <Cell
                          fill={
                            index === 0
                              ? "var(--color-High)"
                              : index === 1
                              ? "var(--color-Medium)"
                              : "var(--color-Low)"
                          }
                          key={`cell-${index}`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                The 5 most recently created tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .slice(0, 5)
                    .map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          {ticket.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(ticket.status)}
                            variant="neutral"
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityColor(ticket.priority)}
                            variant="neutral"
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setActiveTab("tickets")}
                size="sm"
                variant="outline"
              >
                View All Tickets
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Manage and edit all tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketTable
                columns={getTicketColumns(getUserName, setEditingTicket)}
                data={filteredTickets}
                onUpdateTicket={updateTicket}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                All users in the current workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userTickets = tickets.filter(
                      (t) => t.owner_id === user.id
                    );
                    return (
                      <TableRow key={user.id}>
                        <TableCell>#{user.id}</TableCell>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_admin ? "default" : "neutral"}
                          >
                            {user.is_admin ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>{userTickets.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Total users: {users.length}
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Tickets created by each user</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                className="h-full w-full"
                config={{
                  tickets: {
                    color: "hsl(var(--chart-1))",
                    label: "Tickets Created",
                  },
                }}
              >
                <BarChart
                  data={users.map((user) => ({
                    name: user.name,
                    tickets: tickets.filter((t) => t.owner_id === user.id)
                      .length,
                  }))}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis axisLine={false} tickLine={false} type="number" />
                  <YAxis
                    axisLine={false}
                    dataKey="name"
                    tickLine={false}
                    type="category"
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="tickets"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditTicketModal
        onClose={() => setEditingTicket(null)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
      />
    </div>
  );
}

function getTicketColumns(
  getUserName: (userId: number) => string,
  setEditingTicket: (ticket: null | TicketType) => void
): ColumnDef<TicketType, unknown>[] {
  return [
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
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate">
                  {row.getValue("title")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.getValue("title")}</p>
              </TooltipContent>
            </UITooltip>
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
      accessorKey: "owner_id",
      cell: ({ row }) => getUserName(row.getValue("owner_id")),
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              variant="ghost"
            >
              Owner
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
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
}
