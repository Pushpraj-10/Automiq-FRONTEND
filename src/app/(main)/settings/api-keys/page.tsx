"use client";

import React, { useEffect, useState } from "react";
import { Copy, Plus, Trash2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchApiKeys, createApiKey, revokeApiKey } from "@/state/slices/apikeys.slice";
import { clearLastCreated } from "@/state/slices/apikeys.slice";

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
    // The reveal dialog opens automatically via lastCreated state
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
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" /> API Keys
          </h2>
          <p className="text-sm text-neutral-400">Keys securely authenticate your external apps to trigger Automiq workflows.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white text-black hover:bg-neutral-200 h-9 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Generate New Key
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Give your new key a descriptive name to help identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g. Shopify Production Webhook"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-neutral-800 bg-transparent text-white hover:bg-neutral-800">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={!newKeyName}>
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reveal Dialog — shows the one-time raw API key */}
      <Dialog open={!!lastCreated} onOpenChange={(open) => !open && handleCloseReveal()}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your API Key</DialogTitle>
            <DialogDescription className="text-amber-400 font-medium">
              Important: This is the only time you will see this API key. Please copy it and save it somewhere secure.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-md flex items-center justify-between my-4">
            <code className="text-sm text-blue-400 font-mono break-all">{lastCreated?.apiKey}</code>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(lastCreated?.apiKey || "")} className="text-neutral-400 hover:text-white ml-4 flex-shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseReveal} className="w-full bg-white text-black hover:bg-neutral-200">
              I have saved it securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
        <Table>
          <TableHeader className="bg-neutral-900/50">
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400">Name</TableHead>
              <TableHead className="text-neutral-400">Prefix</TableHead>
              <TableHead className="text-neutral-400">Created</TableHead>
              <TableHead className="text-neutral-400">Last Used</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                  No API Keys generated yet.
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id} className="border-neutral-800 hover:bg-neutral-900/50">
                  <TableCell className="font-medium text-neutral-200">
                    <div className="flex flex-col">
                      <span>{key.name}</span>
                      <span className="text-xs text-neutral-500 mt-1">
                        Status: <span className={key.isActive ? "text-green-400" : "text-red-400"}>{key.isActive ? "Active" : "Revoked"}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800">
                      {key.prefix}…
                    </code>
                  </TableCell>
                  <TableCell className="text-neutral-400">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-neutral-400">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleRevoke(key.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                      <Trash2 className="w-4 h-4 mr-2" /> Revoke
                    </Button>
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
