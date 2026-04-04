"use client";

import React, { useEffect, useState } from "react";
import { Copy, Code, CheckCircle, Database, Zap, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchEvents } from "@/state/slices/events.slice";
import type { EventRecord } from "@/types";

export default function EventsPage() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((s) => s.events.items);
  const eventsStatus = useAppSelector((s) => s.events.status);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEvents(100));
  }, [dispatch]);

  // Auto-select first event when loaded
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (eventsStatus === "loading" && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] space-x-6">
      {/* Table Side */}
      <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Event Log</h1>
          <p className="text-neutral-400">Audit trail of all incoming webhooks and triggers.</p>
        </div>

        <div className="border border-neutral-800 rounded-xl bg-neutral-950 shadow-2xl flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="bg-neutral-900/50 sticky top-0">
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400">Time</TableHead>
                <TableHead className="text-neutral-400">Event</TableHead>
                <TableHead className="text-neutral-400">Source</TableHead>
                <TableHead className="text-neutral-400 text-right">Matches</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow className="border-neutral-800">
                  <TableCell colSpan={4} className="h-24 text-center text-neutral-500">No events received yet.</TableCell>
                </TableRow>
              ) : (
                events.map((evt) => (
                  <TableRow
                    key={evt.id}
                    className={`border-neutral-800 cursor-pointer ${selectedEventId === evt.id ? "bg-neutral-800/80 hover:bg-neutral-800" : "hover:bg-neutral-900/50"}`}
                    onClick={() => setSelectedEventId(evt.id)}
                  >
                    <TableCell className="text-neutral-400 text-sm whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-white bg-neutral-900 px-2 py-1 rounded inline-block border border-neutral-800">
                        {evt.eventType}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 capitalize">{evt.source || "unknown"}</TableCell>
                    <TableCell className="text-right">
                      {evt.workflowMatches > 0 ? (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{evt.workflowMatches} Workflows</Badge>
                      ) : (
                        <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">0 Matches</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedEvent && (
        <aside className="w-[450px] border border-neutral-800 bg-neutral-950 rounded-xl overflow-hidden shadow-2xl flex flex-col shrink-0 mb-auto mt-[4.5rem]">
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Event Payload
                {selectedEvent.workflowMatches > 0 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </h3>
              <p className="text-xs text-neutral-400">ID: {selectedEvent.id.slice(0, 16)}…</p>
            </div>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto overflow-hidden">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                <span>Payload Data (JSON)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(selectedEvent.payloadJson, null, 2))}
                  className="h-6 p-0 px-2 text-blue-400"
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="bg-black border border-neutral-800 p-4 rounded-md text-xs text-emerald-400 font-mono shadow-inner overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedEvent.payloadJson, null, 2)}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Tracing</div>
              <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-md border border-neutral-800">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <Database className="w-4 h-4 text-neutral-500" />
                  Matched Workflows
                </div>
                <div className="font-mono text-white text-sm">{selectedEvent.workflowMatches} found</div>
              </div>
              {selectedEvent.status === "dispatched" && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-3 rounded flex items-start gap-2">
                  <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>This event successfully dispatched execution jobs to the matching workflows.</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
