import { withHandler } from "@/lib/api/ApiHandler";
import { ApiResponse } from "@/lib/api/ApiResponse";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
if (!ALLOWED_ORIGIN) throw new Error("ALLOWED_ORIGIN is not set");

export const POST = withHandler(async (request) => {
  const body = await request.json();

  console.log(" Received POST request:");
  console.log("Body:", body);

  return ApiResponse(body, "Information received successfully");
});
