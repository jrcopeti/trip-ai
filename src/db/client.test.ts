import { describe, expect, it, vi } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { createPrismaClient } from "@/db/client";

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: vi.fn(function () {
    return { provider: "postgres", adapterName: "@prisma/adapter-pg" };
  }),
}));

describe("createPrismaClient", () => {
  it("connects through the pg adapter at the given url, giving up after 5s", () => {
    const client = createPrismaClient("postgresql://postgres:postgres@localhost:5432/trip_ai_e2e");

    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: "postgresql://postgres:postgres@localhost:5432/trip_ai_e2e",
      connectionTimeoutMillis: 5_000,
    });
    expect(client.trip).toBeDefined();
  });
});
