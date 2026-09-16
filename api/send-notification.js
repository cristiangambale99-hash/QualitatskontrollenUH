// Vercel Serverless Function: /api/send-notification
// Versendet automatisch eine Benachrichtigung an die beiden festen internen
// Adressen (Teams-Kanal + Unterhaltsreinigung-Postfach), ausgelöst direkt aus
// der App (Kundenbericht abgeschlossen ODER kritische Mitarbeiterbewertung).
//
// Nötig in den Vercel-Projekteinstellungen (Settings -> Environment Variables),
// genau wie bei den anderen Apps: RESEND_API_KEY hinterlegen.

const EMPFAENGER = [
  "cd8a64f5.clean-service.ch@emea.teams.ms",
  "unterhalt@clean-service.ch",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Nur POST erlaubt" });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    res.status(500).json({
      error:
        "RESEND_API_KEY ist nicht gesetzt. Bitte in den Vercel-Projekteinstellungen unter Environment Variables hinterlegen.",
    });
    return;
  }

  const { typ, betreff, text } = req.body || {};
  if (!betreff || !text) {
    res.status(400).json({ error: "betreff und text sind erforderlich" });
    return;
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Qualitätskontrolle Clean Service <benachrichtigung@clean-service.ch>",
        to: EMPFAENGER,
        subject: betreff,
        text,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      res.status(resendResponse.status).json({ error: "Resend-Fehler", detail: resendResult });
      return;
    }

    res.status(200).json({ success: true, typ, resend: resendResult });
  } catch (err) {
    res.status(500).json({ error: "Unerwarteter Fehler", detail: String(err) });
  }
}
