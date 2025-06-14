export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const openaiRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-realtime-preview"
    }),
  });

  if (!openaiRes.ok) {
    const errorData = await openaiRes.json();
    return new Response(JSON.stringify(errorData), { status: openaiRes.status });
  }

  const sessionData = await openaiRes.json();
  return new Response(JSON.stringify(sessionData), { status: 200 });
}
