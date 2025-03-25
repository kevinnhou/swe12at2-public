"use client";

import type React from "react";

import { Button } from "~/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/drawer";
import { Input } from "~/input";
import { Label } from "~/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/select";
import { Textarea } from "~/textarea";

export interface CreateTicketDrawerProps {
  createTicket: (e: React.FormEvent) => Promise<void>;
  isCreating: boolean;
  newTicket: {
    description: string;
    priority: string;
    status: string;
    title: string;
  };
  open: boolean;
  setNewTicket: React.Dispatch<
    React.SetStateAction<{
      description: string;
      priority: string;
      status: string;
      title: string;
    }>
  >;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TicketDrawer({
  createTicket,
  isCreating,
  newTicket,
  open,
  setNewTicket,
  setOpen,
}: CreateTicketDrawerProps) {
  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button onClick={() => setOpen(true)}>Create New Ticket</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Ticket</DrawerTitle>
          <DrawerDescription>
            Fill in the details to create a new ticket
          </DrawerDescription>
        </DrawerHeader>
        <form className="p-4 space-y-4" onSubmit={createTicket}>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              onChange={(e) =>
                setNewTicket({ ...newTicket, title: e.target.value })
              }
              required
              value={newTicket.title}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              onChange={(e) =>
                setNewTicket({ ...newTicket, description: e.target.value })
              }
              required
              value={newTicket.description}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) =>
                  setNewTicket({ ...newTicket, status: value })
                }
                value={newTicket.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value) =>
                  setNewTicket({ ...newTicket, priority: value })
                }
                value={newTicket.priority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create Ticket"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
