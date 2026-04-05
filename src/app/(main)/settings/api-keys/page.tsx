"use client";

import React, { useEffect, useState } from "react";
import { Copy, Plus, Trash2, KeyRound, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { clearLastCreated, createApiKey, fetchApiKeys, revokeApiKey } from "@/state/slices/apikeys.slice";

export default function ApiKeysPage() {
  const dispatch = useAppDispatch();
  const keys = useAppSelector((s) => s.apiKeys.items);
  const lastCreated = useAppSelector((s) => s.apiKeys.lastCreated);
  const keysStatus = useAppSelector((s) => s.apiKeys.status);

  const [newKeyName, setNewKeyName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchApiKeys());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newKeyName) return;
    await dispatch(createApiKey(newKeyName)).unwrap();
    setNewKeyName("");
  };

  const handleCloseReveal = () => {
    dispatch(clearLastCreated());
    setIsCreateOpen(false);
  };

  const handleRevoke = (id: string) => {
    dispatch(revokeApiKey(id));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (keysStatus === "loading" && keys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-1px] text-white mb-2 leading-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-yellow-400" /> API Keys
          </h1>
          <p className="text-[#a0a0a0] font-medium text-[15px]">
            Keys securely authenticate external apps and automation clients that trigger Automiq workflows.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-full bg-[#FACC15] px-5 text-xs font-extrabold text-black shadow-[0_5px_15px_rgba(250,204,21,0.25)] transition-all hover:-translate-y-px hover:bg-yellow-500">
            <Plus className="w-4 h-4 mr-2" /> Generate New Key
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Generate API Key</DialogTitle>
              <DialogDescription className="text-[#a0a0a0] font-medium">
                Give your new key a descriptive name so it is easier to identify later.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ddd]">Key Name</label>
                <Input
                  placeholder="e.g. Shopify Production Webhook"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500 focus-visible:border-white/25 focus-visible:ring-0"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-11 rounded-lg border-white/15 bg-transparent px-5 text-neutral-200 font-semibold tracking-[0.1px] transition-all duration-200 hover:bg-white/8 hover:border-white/25 hover:text-white active:translate-y-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="h-11 rounded-xl bg-[#FACC15] px-5 text-black font-extrabold tracking-[0.1px] shadow-[0_12px_28px_rgba(250,204,21,0.22)] transition-all duration-200 hover:bg-[#ffe066] hover:shadow-[0_16px_32px_rgba(250,204,21,0.3)] disabled:bg-[#FACC15]/80 disabled:text-black/70 disabled:opacity-100 active:translate-y-0"
                disabled={!newKeyName}
              >
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!lastCreated} onOpenChange={(open) => !open && handleCloseReveal()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Save Your API Key</DialogTitle>
            <DialogDescription className="text-yellow-300 font-medium">
              Important: This is the only time you will see this API key. Copy and store it somewhere secure.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center justify-between">
              <code className="text-sm text-yellow-300 font-mono break-all">{lastCreated?.apiKey}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(lastCreated?.apiKey || "")} className="text-neutral-400 hover:text-white ml-4 shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={handleCloseReveal}
              className="h-11 w-full rounded-xl bg-[#FACC15] px-5 text-black font-extrabold tracking-[0.1px] shadow-[0_12px_28px_rgba(250,204,21,0.22)] transition-all duration-200 hover:bg-[#ffe066] hover:shadow-[0_16px_32px_rgba(250,204,21,0.3)] active:translate-y-0"
            >
              I have saved it securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#0e0e0e]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-[#151515]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Name</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Status</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Prefix</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Created</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Last Used</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="h-28 text-center text-neutral-500 font-medium">
                  No API keys generated yet.
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-white">{key.name}</TableCell>
                  <TableCell>
                    {key.isActive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Revoked</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-white/5 text-neutral-300 px-2 py-1 rounded border border-white/10 font-mono">
                      {key.prefix}...
                    </code>
                  </TableCell>
                  <TableCell className="text-[#a0a0a0] text-[13px] font-medium">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-[#a0a0a0] text-[13px] font-medium">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md p-0 text-neutral-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 min-w-64">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="font-bold text-[#888]">Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="py-2 font-medium"
                            onClick={() => handleCopy(key.prefix)} // This is just a placeholder, maybe copy something else?
                            disabled={!key.isActive}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copy Prefix
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                          onClick={() => handleRevoke(key.id)}
                          disabled={!key.isActive}
                          className="mb-1 py-2 font-semibold text-red-400 focus:bg-red-500/10 focus-visible:bg-red-500/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}