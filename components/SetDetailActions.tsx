"use client";

import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";

export function SetDetailActions({ setId }: { setId: string }) {
  const toast = useToast();

  function exportPdf() {
    window.open(`/api/export?setId=${setId}`, "_blank");
  }

  async function assign() {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId }),
    });
    if (!res.ok) {
      toast("Could not assign");
      return;
    }
    const { id: assignmentId } = await res.json();
    const url = `${window.location.origin}/take/${assignmentId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Assigned, link copied to clipboard");
    } catch {
      window.prompt("Share this link with your students:", url);
      toast("Assigned");
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={exportPdf}>
        Export PDF
      </Button>
      <Button size="sm" onClick={assign}>
        Assign to class
      </Button>
    </div>
  );
}
