"use client";

import { useState } from "react";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { generateInviteLink } from "@/lib/actions/invite";

export function InviteLinkButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await generateInviteLink();
    setLoading(false);

    if ("url" in result) {
      try {
        await navigator.clipboard.writeText(result.url);
        toast.success("Link copiado! Expira em 30 minutos.");
      } catch {
        toast.info(`Link gerado: ${result.url}`);
      }
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleClick}
    >
      <LinkIcon />
      {loading ? "Gerando..." : "Gerar link de convite"}
    </Button>
  );
}
