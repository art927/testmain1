"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { createOrGetModule } from "../actions/modules";
import { Module } from "../AdminModules";

type Props = {
  open: boolean;
  onClose: () => void;
  teams: { id: string; name: string }[];
  onSelected: (module: Module) => void;
};

const FREQUENCIES = ["Quarterly", "Bi-Annual", "Annual"];
const SENIORITY = ["Intern", "Junior", "Mid", "Senior", "Lead"];

export default function FormSelectorModal({
  open,
  onClose,
  teams,
  onSelected,
}: Props) {
  const [frequency, setFrequency] = useState("");
  const [team, setTeam] = useState("");
  const [seniority, setSeniority] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!frequency || !team || !seniority) return;

    setLoading(true);
    const module = await createOrGetModule({
      frequency,
      team,
      seniority,
    });
    setLoading(false);

    onSelected(module);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create Performance Form</DialogTitle>
          <DialogDescription>
            Select frequency, department (team), and seniority to create
            a performance evaluation form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label>Department (Team)</Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seniority */}
          <div className="space-y-2">
            <Label>Seniority</Label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {SENIORITY.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={loading}>
              {loading ? "Loading..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
