
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

// Update the LogEntry interface to make user_id optional
interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  user_id?: string; // Made optional to match usage
  details: Json;
  created_at: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLogs();
      setLogs(response.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell>{log.user_id || "N/A"}</TableCell>
                      <TableCell>
                        {log.details ? JSON.stringify(log.details).substring(0, 50) + "..." : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
