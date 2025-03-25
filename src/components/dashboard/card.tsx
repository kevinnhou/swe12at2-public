import { AlertCircle, Clock } from "lucide-react";

import { Badge } from "~/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/card";

interface KanbanCardProps {
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

export default function KanbanCard({ ticket }: KanbanCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    }).format(date);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-medium line-clamp-2">
          {ticket.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <p className="text-xs text-gray-500 line-clamp-2">
          {ticket.description}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <Badge className={getPriorityColor(ticket.priority)} variant="neutral">
          {ticket.priority === "High" && (
            <AlertCircle className="mr-1 h-3 w-3" />
          )}
          {ticket.priority}
        </Badge>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="mr-1 h-3 w-3" />
          {formatDate(ticket.created_at)}
        </div>
      </CardFooter>
    </Card>
  );
}
