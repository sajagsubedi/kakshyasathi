import { withHandler } from "@/lib/api/ApiHandler";
import { ApiResponse } from "@/lib/api/ApiResponse";

export const POST = withHandler(async (request) => {
  const body = await request.json();

  console.log(" Received POST request:");
  console.log("Body:", body);

  return ApiResponse(body, "Information received successfully");
});
