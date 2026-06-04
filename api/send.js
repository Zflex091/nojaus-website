import nodemailer from "nodemailer";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const getValue = (value) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      return res.status(500).json({
        message: "Trūksta Gmail prisijungimo duomenų.",
      });
    }

    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 8 * 1024 * 1024,
      maxTotalFileSize: 20 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    const photos = files.photos
      ? Array.isArray(files.photos)
        ? files.photos
        : [files.photos]
      : [];

    const attachments = photos.map((file, index) => ({
      filename: file.originalFilename || `nuotrauka-${index + 1}.jpg`,
      content: fs.createReadStream(file.filepath),
      contentType: file.mimetype || "image/jpeg",
    }));

    const marke = getValue(fields.marke);
    const metai = getValue(fields.metai);
    const variklis = getValue(fields.variklis);
    const ta = getValue(fields.ta);
    const komentaras = getValue(fields.komentaras);
    const kaina = getValue(fields.kaina);
    const miestas = getValue(fields.miestas);
    const telefonas = getValue(fields.telefonas);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPassword.replace(/\s/g, ""),
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"AutoSupirkimas" <${gmailUser}>`,
      to: "pirkparduokautolt@gmail.com",
      replyTo: gmailUser,
      subject: "Nauja automobilio supirkimo užklausa",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <h2>Nauja automobilio supirkimo užklausa</h2>

          <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 650px;">
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Markė</b></td>
              <td style="border:1px solid #e5e7eb;">${marke}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Metai</b></td>
              <td style="border:1px solid #e5e7eb;">${metai}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Variklis</b></td>
              <td style="border:1px solid #e5e7eb;">${variklis}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Techninė apžiūra</b></td>
              <td style="border:1px solid #e5e7eb;">${ta}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Komentaras</b></td>
              <td style="border:1px solid #e5e7eb;">${komentaras}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Pageidaujama kaina</b></td>
              <td style="border:1px solid #e5e7eb;">${kaina}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Miestas</b></td>
              <td style="border:1px solid #e5e7eb;">${miestas}</td>
            </tr>
            <tr>
              <td style="border:1px solid #e5e7eb;"><b>Telefono numeris</b></td>
              <td style="border:1px solid #e5e7eb;">${telefonas}</td>
            </tr>
          </table>

          <p style="margin-top:16px;">
            Pridėta nuotraukų: <b>${attachments.length}</b>
          </p>
        </div>
      `,
      attachments,
    });

    return res.status(200).json({
      message: "Forma išsiųsta sėkmingai",
      photos: attachments.length,
    });
  } catch (error) {
    console.error("SEND ERROR:", error);

    return res.status(500).json({
      message: "Serverio klaida",
      error: error.message,
    });
  }
}