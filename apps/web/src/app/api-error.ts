/** Machine-readable error body for agents: `{ error: { code, message, hint } }`. */
export function jsonError(status: number, code: string, message: string, hint: string): Response {
  return Response.json({ error: { code, message, hint } }, { status });
}
