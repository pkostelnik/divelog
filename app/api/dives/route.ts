import { diveLogs } from "@/data/mock-data";

export async function GET() {
  return Response.json(diveLogs);
}
