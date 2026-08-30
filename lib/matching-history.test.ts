import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pickBestHistoryMatch,
  roleTokenOverlap,
  scoreHistoryMatch,
} from "./matching-history";

const nodeBackend: Parameters<typeof scoreHistoryMatch>[0] = {
  id: "node",
  createdAt: "2026-08-30T12:00:00.000Z",
  sourceUrl: "https://www.linkedin.com/jobs/view/111222333",
  brief: {
    company: "Aubay Spain",
    role: "Desarrollador de back-end con enfoque en Node.js",
  },
  evaluation: { globalScore: 4 },
};

const phpFullStack: Parameters<typeof scoreHistoryMatch>[0] = {
  id: "php",
  createdAt: "2026-08-20T10:00:00.000Z",
  sourceUrl: "https://www.linkedin.com/jobs/view/999888777",
  brief: {
    company: "Aubay Spain",
    role: "Desarrollador Full Stack PHP (React/Vue)",
  },
  evaluation: { globalScore: 3.5 },
};

describe("matching-history", () => {
  it("matches by LinkedIn job id, not company alone", () => {
    const ctx = {
      applicationLink: "https://www.linkedin.com/jobs/view/111222333",
      company: "Aubay Spain",
      position: "Backend Node.js",
    };
    const best = pickBestHistoryMatch([phpFullStack, nodeBackend], ctx);
    assert.equal(best?.id, "node");
  });

  it("does not match same company with different role when URL is missing", () => {
    const ctx = {
      applicationLink: null,
      company: "Aubay Spain",
      position: "Backend Node.js internacional",
    };
    const scorePhp = scoreHistoryMatch(phpFullStack, ctx);
    const scoreNode = scoreHistoryMatch(nodeBackend, ctx);
    assert.equal(scorePhp, 0);
    assert.ok(scoreNode > 0);
  });

  it("role overlap distinguishes PHP vs Node at same company", () => {
    assert.ok(
      roleTokenOverlap(
        "Desarrollador Full Stack PHP",
        "Desarrollador Full Stack PHP (React/Vue)",
      ) >= 2,
    );
    assert.equal(
      roleTokenOverlap(
        "Backend Node.js",
        "Desarrollador Full Stack PHP (React/Vue)",
      ),
      0,
    );
  });
});
