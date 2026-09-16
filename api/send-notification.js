// Vercel Serverless Function: /api/send-notification
// Versendet automatisch eine Benachrichtigung im Clean-Service-Layout an die
// beiden festen internen Adressen (Teams-Kanal + Unterhaltsreinigung-
// Postfach), ausgelöst direkt aus der App (Kundenbericht abgeschlossen ODER
// kritische Mitarbeiterbewertung). Beim Kundenbericht wird das PDF (Base64)
// als Anhang mitgeschickt.
//
// Nötig in den Vercel-Projekteinstellungen (Settings -> Environment Variables),
// genau wie bei den anderen Apps: RESEND_API_KEY hinterlegen.

const EMPFAENGER = [
  "cd8a64f5.clean-service.ch@emea.teams.ms",
  "unterhalt@clean-service.ch",
];

// Logo als Inline-Anhang (cid) eingebettet — PNG statt WEBP, da WEBP in
// vielen E-Mail-Clients (insb. Outlook) nicht zuverlässig dargestellt wird.
const LOGO_PNG_BASE64 =
  "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7ruPyclJstls5biZmRk+97nP8fLLL7Pttm3cd999uK7LU08+he/7Verj0NAQO3fu5OWXX16gjhaLRU6cOMHq1avZsmUL3d3dPP744+zbu69ybPk6/f397Ny5kxMnTiyq1l64cIF9+/ZVgeP48eMcPHSQUrRrBIAf+Jw6dYqp6amqcZ88eZLp6enKtXt6eti6dStbt4a9mc+fP09nZycAyWSSLVu2sGnTJjZu3MipU6dIJpNYloXWmlKpxD/8wz+wd+9etm7dyj333INt2/zN3/wNL7744qtSEpttsTjD2Ry5gouvNYYIt79otuyo4fnyEnZuLqVexh6uM22SnksuaomZK/o01dlhFdR80GtNoxXHUz45v8gaW3OyNJtQogFfhalpzU6cI5kpfnnPXn7v5q28t7v7mnXaEEKQTqd54IEHALBtm+89/T38wMcyLbZt28bAwACPPfYYb3vb2/jud7/LW97yFtasWbOoNBgeHiaZTLI92mTr1ltvrZLOzzzzDNlsll/7tV8jkQi3YNm2bRuFQgErKv8rX3PXrl00NjZy7Ngx7r77bmKxWGWhEEJg2zZ33XUX9fX1oTkTBBw8dJA77ryj6joHDhygvb2dgwcPcsstt1TAUv59ZmaGkZERBgcH6enpIfADXnrpJVzXZWpqivb22eb5juNgmtV7Bcz9TmvN5s2b2bx5MwD79+/n9a9/PS0tLSilqKur49577wXgpZdeor6+ngcffLDyvDt37mR8fJyPf/zjpKM84h07dvDMM8/w5JNPsnHjRhKJxKtKEsu0ZYMS5Ao+Uoa+5xbbweDyzhhfKfxAEQSKQIUbeC2lYwsBzZaD0BohwwIH39fETHPxht5Am5MmbsapFwEbrLAvkJ7X3djXipRpIQR84uAh/r6/f9FKlFcKYNd1eemllzh8+DD79+/nrrvvwjKtimr65je/GdM0+fznP88NG2/gzjvvXDCByn/ffPPNFAoF/vqv/5rTp09X/e77PidOnODee+8lkUjg+35FSsaj7v7l646NjXHixAne/e53EwQBL7zwwqKOq0wmg+d55HI5BgYGaGlpqdII+vv76e/v5/3vfz+Tk5McPXq06j6u6zI9PU1bWxt79+4F4GzfWfL5PKlUiuHh4WUdcIt9F0QVRd///vfxfb/CLynDZKAgCJiZmeE73/kODzzwAI7jVM4/duwY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";

const FARBE_HAUPT = "#1E8C8D";
const FARBE_HELL = "#2BB6B7";
const FARBE_TEXT = "#1A1A1A";
const FARBE_GRAU = "#6B7573";

function klasseFarbe(label) {
  if (label === "Sehr gut") return "#1E8C8D";
  if (label === "Gut") return "#4C93A3";
  if (label === "Verbesserungsbedarf") return "#B98418";
  return "#C0442F";
}

function htmlEscape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function htmlGeruest(inhalt) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#F2F8F8;font-family:Verdana,Geneva,sans-serif;color:${FARBE_TEXT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F8F8;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(30,140,141,0.08);">
        <tr><td style="padding:24px 32px 0 32px;text-align:right;">
          <img src="cid:cleanservicelogo" alt="Clean Service by Scaramuzzo" height="30" style="height:30px;" />
        </td></tr>
        <tr><td style="padding:16px 32px 32px 32px;">
          ${inhalt}
        </td></tr>
        <tr><td style="background:#F7FBFB;padding:14px 32px;border-top:1px solid #E7ECEB;">
          <div style="font-size:11px;color:${FARBE_GRAU};">Diese Benachrichtigung wurde automatisch von der Qualitätskontrolle-App versendet.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function zeile(label, wert) {
  if (wert === undefined || wert === null || wert === "") return "";
  return `<tr>
    <td style="padding:4px 12px 4px 0;font-size:12px;color:${FARBE_GRAU};white-space:nowrap;vertical-align:top;">${htmlEscape(label)}</td>
    <td style="padding:4px 0;font-size:13px;color:${FARBE_TEXT};">${htmlEscape(wert)}</td>
  </tr>`;
}

function baueKundenberichtMail(d) {
  const scoreText = d.overallScore !== null && d.overallScore !== undefined ? `${Math.round(d.overallScore)}%` : "—";
  const klasseFarbeWert = klasseFarbe(d.klasseLabel);
  const betreff = `Kundenbericht — ${d.kunde} · Nr. ${d.objektNr} · ${d.datum} · ${d.kontrollart}`;

  const reklamationBlock = d.reklamationDatum
    ? `<div style="margin-top:16px;padding:10px 14px;background:#FBF1DD;border:1px solid #F1E4C6;border-radius:6px;font-size:12px;color:#946A0E;">
         <strong>Reklamation vom ${htmlEscape(d.reklamationDatum)}</strong> — dieser Bericht bezieht sich auf eine Kundenreklamation.
       </div>`
    : "";

  const html = htmlGeruest(`
    <div style="font-size:11px;font-weight:bold;letter-spacing:0.5px;color:${FARBE_HELL};text-transform:uppercase;">Kundenbericht abgeschlossen</div>
    <div style="font-size:19px;font-weight:bold;color:${FARBE_TEXT};margin-top:2px;">${htmlEscape(d.kunde)}</div>
    <div style="font-size:12px;color:${FARBE_GRAU};margin-top:1px;">${htmlEscape(d.standort || "")}</div>

    <div style="margin-top:18px;display:inline-block;background:linear-gradient(135deg, #E4F6F6, #F4FBFB);border:1px solid #D3EFEF;border-radius:10px;padding:14px 20px;">
      <span style="font-size:26px;font-weight:bold;color:${klasseFarbeWert};">${scoreText}</span>
      ${d.klasseLabel ? `<span style="font-size:12px;font-weight:bold;color:${klasseFarbeWert};margin-left:8px;">${htmlEscape(d.klasseLabel)}</span>` : ""}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;width:100%;border-top:1px solid #EEF1F0;padding-top:12px;">
      ${zeile("Objektnummer", d.objektNr)}
      ${zeile("Objektart", d.objektart)}
      ${zeile("Kontrollart", d.kontrollart)}
      ${zeile("Datum", d.datum)}
      ${zeile("Kontrolleur", d.kontrolleur)}
      ${zeile("Reinigungspersonal", (d.mitarbeiter || []).join(", "))}
      ${zeile("Abweichungen im Bericht", d.anzahlAbweichungen)}
    </table>

    ${reklamationBlock}

    <div style="margin-top:20px;font-size:12px;color:${FARBE_GRAU};">Der vollständige Kundenbericht ist dieser E-Mail als PDF angehängt.</div>
  `);

  const text = `Kundenbericht abgeschlossen — ${d.kunde}

Kunde: ${d.kunde}
Objektnummer: ${d.objektNr}
Standort: ${d.standort || "—"}
Objektart: ${d.objektart}
Kontrollart: ${d.kontrollart}
Datum: ${d.datum}
Kontrolleur: ${d.kontrolleur}
Reinigungspersonal: ${(d.mitarbeiter || []).join(", ") || "—"}
Gesamtergebnis: ${scoreText} (${d.klasseLabel || "—"})
Abweichungen im Bericht: ${d.anzahlAbweichungen}
${d.reklamationDatum ? `Reklamation vom: ${d.reklamationDatum}` : ""}

Der vollständige Kundenbericht ist dieser E-Mail als PDF angehängt.
Diese Benachrichtigung wurde automatisch von der Qualitätskontrolle-App versendet.`;

  return { betreff, html, text };
}

function baueMitarbeiterKritischMail(d) {
  const betreff = `Kritische Mitarbeiterbewertung — ${d.mitarbeiterName} · ${d.datum}`;
  const html = htmlGeruest(`
    <div style="font-size:11px;font-weight:bold;letter-spacing:0.5px;color:#C0442F;text-transform:uppercase;">Kritische Mitarbeiterbewertung</div>
    <div style="font-size:19px;font-weight:bold;color:${FARBE_TEXT};margin-top:2px;">${htmlEscape(d.mitarbeiterName)}</div>

    <div style="margin-top:18px;display:inline-block;background:#FBE9E5;border:1px solid #F0B8AC;border-radius:10px;padding:14px 20px;">
      <span style="font-size:26px;font-weight:bold;color:#C0442F;">${Math.round(d.score)}%</span>
      <span style="font-size:12px;font-weight:bold;color:#C0442F;margin-left:8px;">Kritisch</span>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;width:100%;border-top:1px solid #EEF1F0;padding-top:12px;">
      ${zeile("Kunde/Objekt", d.kunde)}
      ${zeile("Objektnummer", d.objektNr)}
      ${zeile("Datum", d.datum)}
      ${zeile("Kontrolleur", d.kontrolleur)}
    </table>

    <div style="margin-top:20px;font-size:13px;color:${FARBE_TEXT};">Eine Rücksprache mit der Personalabteilung wird empfohlen.</div>
  `);

  const text = `Kritische Mitarbeiterbewertung — ${d.mitarbeiterName}

Bewertung: ${Math.round(d.score)}%
Kunde/Objekt: ${d.kunde}
Objektnummer: ${d.objektNr}
Datum: ${d.datum}
Kontrolleur: ${d.kontrolleur}

Eine Rücksprache mit der Personalabteilung wird empfohlen.
Diese Benachrichtigung wurde automatisch von der Qualitätskontrolle-App versendet.`;

  return { betreff, html, text };
}

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" }, // PDFs mit mehreren Fotos können mehrere MB gross werden
  },
};

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

  const { typ, daten, pdfBase64, pdfFilename } = req.body || {};
  if (!typ || !daten) {
    res.status(400).json({ error: "typ und daten sind erforderlich" });
    return;
  }

  let mail;
  if (typ === "kundenbericht") {
    mail = baueKundenberichtMail(daten);
  } else if (typ === "mitarbeiter_kritisch") {
    mail = baueMitarbeiterKritischMail(daten);
  } else {
    res.status(400).json({ error: "Unbekannter typ: " + typ });
    return;
  }

  const attachments = [
    {
      filename: "logo.png",
      content: LOGO_PNG_BASE64,
      content_id: "cleanservicelogo",
    },
  ];
  if (pdfBase64) {
    attachments.push({
      filename: pdfFilename || "Kundenbericht.pdf",
      content: pdfBase64,
    });
  }

  const payload = {
    from: "Qualitätskontrolle Clean Service <benachrichtigung@clean-service.ch>",
    to: EMPFAENGER,
    subject: mail.betreff,
    html: mail.html,
    text: mail.text,
    attachments,
  };

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
