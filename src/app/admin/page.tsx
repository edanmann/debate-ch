import type { Metadata } from "next";
import { getAllBots } from "@/lib/bots";
import { FLAGS } from "@/lib/flags";
import { getMotions } from "@/lib/motions";
import { FORMATS } from "@/lib/formats";
import { Badge, Card, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Admin Preview" };

/**
 * Read-only admin preview. The full admin system (role-gated editing,
 * versioning, moderation queues) requires the hosted backend — see
 * docs/IMPLEMENTATION_PLAN.md Phase 5. Nothing here pretends to save.
 */
export default function AdminPage() {
  const bots = getAllBots();
  const motions = getMotions();
  const counts = {
    active: bots.filter((b) => b.status === "active").length,
    planned: bots.filter((b) => b.status === "planned").length,
    excluded: bots.filter((b) => b.status === "excluded").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
        <Badge tone="warning">Read-only preview — editing requires the hosted backend</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Bot roster ({bots.length})</SectionTitle>
          <p className="mt-1 text-xs text-fg-muted">
            {counts.active} active · {counts.planned} planned · {counts.excluded} excluded
            (excluded concepts are never rendered publicly)
          </p>
          <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-3 py-2">Bot</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="numeric px-3 py-2">Rating</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bots.map((b) => (
                  <tr key={b.slug} className="border-t border-border-subtle">
                    <td className="px-3 py-2 font-medium">{b.name}</td>
                    <td className="px-3 py-2 text-fg-muted">{b.category}</td>
                    <td className="numeric px-3 py-2">{b.overallRating ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Badge
                        tone={
                          b.status === "active"
                            ? "brand"
                            : b.status === "planned"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Feature flags</SectionTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(FLAGS).map(([name, on]) => (
              <li key={name} className="flex items-center justify-between">
                <span className="text-fg-muted">{name}</span>
                <Badge tone={on ? "brand" : "neutral"}>{on ? "on" : "off"}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-fg-faint">
            Override with NEXT_PUBLIC_FLAG_* environment variables.
          </p>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Motion library ({motions.length} approved)</SectionTitle>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-3 py-2">Motion</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="numeric px-3 py-2">Diff.</th>
                  <th className="px-3 py-2">Flags</th>
                </tr>
              </thead>
              <tbody>
                {motions.map((m) => (
                  <tr key={m.id} className="border-t border-border-subtle">
                    <td className="max-w-md px-3 py-2">{m.text}</td>
                    <td className="px-3 py-2 text-fg-muted">{m.category}</td>
                    <td className="numeric px-3 py-2">{m.difficulty}</td>
                    <td className="px-3 py-2 text-xs text-fg-muted">
                      {m.sensitive && <Badge tone="warning">sensitive</Badge>}{" "}
                      {m.requiresCurrentResearch && <Badge tone="info">research</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Formats</SectionTitle>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            {FORMATS.map((f) => (
              <li key={f.id} className="flex justify-between">
                <span>{f.name}</span>
                <span className="numeric">{f.phases.length} phases · {f.approxTotalLabel}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-fg-faint">
            Timings live in seed configuration (src/lib/formats.ts), not UI code
            — see REQUIREMENTS_AUDIT.md for the source-document discrepancies.
          </p>
        </Card>
      </div>
    </div>
  );
}
