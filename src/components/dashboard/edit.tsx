"use client";

import type React from "react";

import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "~/badge";
import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/dialog";
import { Input } from "~/input";
import { Label } from "~/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/select";
import { Separator } from "~/separator";
import { Textarea } from "~/textarea";

interface EditTicketModalProps {
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
  ticket: null | Ticket;
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

export default function EditTicketModal({
  onClose,
  onSave,
  ticket,
}: EditTicketModalProps) {
  const [editedTicket, setEditedTicket] = useState<null | Ticket>(ticket);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEditedTicket(ticket);
  }, [ticket]);

  if (!editedTicket) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setEditedTicket((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTicket) {
      setIsSubmitting(true);
      try {
        await onSave(editedTicket);
        onClose();
      } catch (error) {
        console.error("Error saving ticket:", error);
      } finally {
        setIsSubmitting(false);
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog onOpenChange={onClose} open={!!ticket}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            Edit Ticket #{editedTicket.id}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Badge
            className={getStatusColor(editedTicket.status)}
            variant="neutral"
          >
            {editedTicket.status}
          </Badge>
          <Badge
            className={getPriorityColor(editedTicket.priority)}
            variant="neutral"
          >
            {editedTicket.priority === "High" && (
              <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {editedTicket.priority}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground ml-auto">
            <Clock className="mr-1 h-3 w-3" />
            Created: {formatDate(editedTicket.created_at)}
          </div>
        </div>

        <Separator />

        <form className="space-y-6 py-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                onChange={handleChange}
                placeholder="Ticket title"
                required
                value={editedTicket.title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                className="min-h-[120px]"
                id="description"
                name="description"
                onChange={handleChange}
                placeholder="Describe the ticket..."
                value={editedTicket.description}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={handleSelectChange("status")}
                  value={editedTicket.status}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  onValueChange={handleSelectChange("priority")}
                  value={editedTicket.priority}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
