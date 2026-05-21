"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type TenantAuditLogEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
  username: string;
};

type TenantAuditLogTabProps = {
  entries: TenantAuditLogEntry[];
};

export function TenantAuditLogTab({ entries }: TenantAuditLogTabProps) {
  const [actionFilter, setActionFilter] = useState("all");
  const actionOptions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.action))).sort(),
    [entries],
  );
  const filteredEntries =
    actionFilter === "all"
      ? entries
      : entries.filter((entry) => entry.action === actionFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Select
          value={actionFilter}
          onValueChange={(value) => setActionFilter(value ?? "all")}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionOptions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Metadata</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">
                  {dateTimeFormatter.format(new Date(entry.createdAt))}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.action}</Badge>
                </TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell>
                  {entry.targetType}
                  {entry.targetId ? (
                    <span className="ml-1 text-muted-foreground">
                      {entry.targetId.slice(0, 8)}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-sm truncate text-muted-foreground">
                  {previewMetadata(entry.metadata)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada audit log untuk filter ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function previewMetadata(metadata: unknown) {
  if (!metadata) {
    return "-";
  }

  return JSON.stringify(metadata);
}
