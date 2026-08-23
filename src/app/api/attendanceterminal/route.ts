import { withHandler } from "@/lib/api/ApiHandler";
import { ApiResponse } from "@/lib/api/ApiResponse";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

if (!ALLOWED_ORIGIN) {
  throw new Error("ALLOWED_ORIGIN is not set");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle browser CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export const POST = withHandler(async (request) => {
  const body = await request.json();

  console.log("Received POST request:");
  console.log("Body:", body);

  const response = ApiResponse(
    body,
    "Information received successfully"
  );

  // Add CORS headers to the actual POST response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});