"use client";

import { apiRequest } from "@/lib/api";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/dialog";

interface WorkspaceData {
  created_at: string;
  description: string;
  id: number;
  join_code: string;
  name: string;
}

export default function JoinCodeModal() {
  const [joinCode, setJoinCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchWorkspaceData();
    }
  }, [open]);

  async function fetchWorkspaceData() {
    setIsLoading(true);
    try {
      const result = await apiRequest<WorkspaceData>("workspace");
      if (result.data && result.data.join_code) {
        setJoinCode(result.data.join_code);
      }
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
      toast.error("Failed to fetch workspace join code");
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied to clipboard");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Invite Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workspace Invitation Code</DialogTitle>
          <DialogDescription>
            Share this code with team members you want to invite to your
            workspace
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="h-10 w-48 animate-pulse rounded-md bg-muted"></div>
          ) : (
            <div
              className="bg-muted hover:bg-muted/80 cursor-pointer transition-colors px-6 py-4 rounded-md font-mono text-xl tracking-wider text-center select-all"
              onClick={copyToClipboard}
              title="Click to copy"
            >
              {joinCode}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Click the code to copy to clipboard
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
