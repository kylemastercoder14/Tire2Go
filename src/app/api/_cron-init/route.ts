import "@/lib/cron"; // 👈 just importing runs the scheduler

export async function GET() {
  return Response.json({
    message: "Cron initialized and running in background.",
  });
}
