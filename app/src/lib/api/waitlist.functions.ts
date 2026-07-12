import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email().max(254) }))
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "unavailable" as const };
    const email = data.email.trim().toLowerCase();
    try {
      await DB.prepare("INSERT INTO waitlist (email) VALUES (?1)").bind(email).run();
      return { ok: true as const, already: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE")) return { ok: true as const, already: true };
      throw err;
    }
  });
