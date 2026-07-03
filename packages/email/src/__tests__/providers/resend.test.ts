import { describe, it, expect, vi, beforeEach } from "vitest";
import { createResendProvider } from "../../providers/resend";

const fetchSpy = vi.fn();

describe("createResendProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchSpy);
    fetchSpy.mockReset();
  });

  function successResponse(id = "msg-123") {
    return {
      ok: true,
      json: vi.fn().mockResolvedValue({ id }),
    };
  }

  function errorResponse(message: string, status = 400) {
    return {
      ok: false,
      status,
      json: vi.fn().mockResolvedValue({ message }),
    };
  }

  it("sends email with correct payload", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "re_abc",
      defaultFrom: "sender@example.com",
    });

    const result = await provider.send({
      to: "recipient@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer re_abc",
          "Content-Type": "application/json",
        },
      }),
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.from).toBe("sender@example.com");
    expect(body.to).toBe("recipient@example.com");
    expect(body.subject).toBe("Test");
    expect(body.html).toBe("<p>Hello</p>");
    expect(body.text).toBe("Hello");
    expect(result).toEqual({ id: "msg-123" });
  });

  it("formats EmailAddress with name", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: { email: "s@e.com", name: "Sender" },
    });

    await provider.send({
      to: { email: "r@e.com", name: "Recipient" },
      subject: "Hi",
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.from).toBe("Sender <s@e.com>");
    expect(body.to).toBe("Recipient <r@e.com>");
  });

  it("formats EmailAddress without name", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: { email: "s@e.com" },
    });

    await provider.send({
      to: { email: "r@e.com" },
      subject: "Hi",
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.from).toBe("s@e.com");
    expect(body.to).toBe("r@e.com");
  });

  it("formats array of recipients", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: "s@e.com",
    });

    await provider.send({
      to: ["a@e.com", { email: "b@e.com", name: "B" }],
      subject: "Hi",
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.to).toEqual(["a@e.com", "B <b@e.com>"]);
  });

  it("uses message.from over defaultFrom", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: "default@e.com",
    });

    await provider.send({
      to: "r@e.com",
      from: "custom@e.com",
      subject: "Hi",
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.from).toBe("custom@e.com");
  });

  it("includes reply_to when set", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: "s@e.com",
      defaultReplyTo: "reply@e.com",
    });

    await provider.send({ to: "r@e.com", subject: "Hi" });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.reply_to).toBe("reply@e.com");
  });

  it("prefers message.replyTo over defaultReplyTo", async () => {
    fetchSpy.mockResolvedValue(successResponse());
    const provider = createResendProvider({
      apiKey: "key",
      defaultFrom: "s@e.com",
      defaultReplyTo: "default@e.com",
    });

    await provider.send({ to: "r@e.com", subject: "Hi", replyTo: "msg-reply@e.com" });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.reply_to).toBe("msg-reply@e.com");
  });

  it("throws on HTTP error", async () => {
    fetchSpy.mockResolvedValue(errorResponse("Invalid API key"));
    const provider = createResendProvider({ apiKey: "bad", defaultFrom: "s@e.com" });

    await expect(provider.send({ to: "r@e.com", subject: "Hi" })).rejects.toThrow("Invalid API key");
  });

  it("falls back to generic message on HTTP error with no message", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });
    const provider = createResendProvider({ apiKey: "bad", defaultFrom: "s@e.com" });

    await expect(provider.send({ to: "r@e.com", subject: "Hi" })).rejects.toThrow("Resend email request failed.");
  });

  it("uses error name if message is missing", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ name: "validation_error" }),
    });
    const provider = createResendProvider({ apiKey: "bad", defaultFrom: "s@e.com" });

    await expect(provider.send({ to: "r@e.com", subject: "Hi" })).rejects.toThrow("validation_error");
  });

  it("throws when response.json fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error("parse")),
    });
    const provider = createResendProvider({ apiKey: "bad", defaultFrom: "s@e.com" });

    await expect(provider.send({ to: "r@e.com", subject: "Hi" })).rejects.toThrow("Resend email request failed.");
  });

  it("throws when response has no id", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    const provider = createResendProvider({ apiKey: "key", defaultFrom: "s@e.com" });

    await expect(provider.send({ to: "r@e.com", subject: "Hi" })).rejects.toThrow("Resend did not return an email id.");
  });
});
