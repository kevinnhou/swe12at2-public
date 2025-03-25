"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "~/badge";
import { Button } from "~/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/dropdown-menu";
import { Input } from "~/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/tooltip";

interface DataTableProps<TData extends TableData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onUpdateTicket: (ticketId: number, updates: Partial<TData>) => Promise<void>;
}

interface TableData {
  [key: string]: unknown;
  id: number;
}

const statusOrder = ["Open", "In Progress", "Closed"];
const priorityOrder = ["High", "Medium", "Low"];

export default function TicketTable<TData extends TableData, TValue>({
  columns,
  data,
  onUpdateTicket,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [tableData, setTableData] = useState<TData[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  });

  const handleStatusChange = useCallback(
    async (ticketId: number, newStatus: string) => {
      await onUpdateTicket(ticketId, {
        status: newStatus,
      } as unknown as Partial<TData>);

      setTableData((prevData) =>
        prevData.map((item) =>
          item.id === ticketId ? { ...item, status: newStatus } : item
        )
      );
    },
    [onUpdateTicket]
  );

  const handlePriorityChange = useCallback(
    async (ticketId: number, newPriority: string) => {
      await onUpdateTicket(ticketId, {
        priority: newPriority,
      } as unknown as Partial<TData>);

      setTableData((prevData) =>
        prevData.map((item) =>
          item.id === ticketId ? { ...item, priority: newPriority } : item
        )
      );
    },
    [onUpdateTicket]
  );

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          className="max-w-sm"
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          placeholder="Filter tickets..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="ml-auto hidden h-8 lg:flex"
              size="sm"
              variant="outline"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize"
                    key={column.id}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "status" ? (
                        <Select
                          onValueChange={(value) =>
                            handleStatusChange(row.original.id, value)
                          }
                          value={String(row.original.status)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <Badge
                                className={getStatusColor(
                                  String(row.original.status)
                                )}
                                variant="neutral"
                              >
                                {String(row.original.status)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOrder.map((status) => (
                              <SelectItem key={status} value={status}>
                                <Badge
                                  className={getStatusColor(status)}
                                  variant="neutral"
                                >
                                  {status}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : cell.column.id === "priority" ? (
                        <Select
                          onValueChange={(value) =>
                            handlePriorityChange(row.original.id, value)
                          }
                          value={String(row.original.priority)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <Badge
                                className={getPriorityColor(
                                  String(row.original.priority)
                                )}
                                variant="neutral"
                              >
                                {String(row.original.priority)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOrder.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                <Badge
                                  className={getPriorityColor(priority)}
                                  variant="neutral"
                                >
                                  {priority}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} ticket(s)
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
