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
    const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");

    if (!gmailUser || !gmailPassword) {
      return res.status(500).json({
        message: "Trūksta Gmail Environment Variables",
      });
    }

    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
      maxTotalFileSize: 20 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    const photosRaw = files.photos || [];
    const photos = Array.isArray(photosRaw) ? photosRaw : [photosRaw];

    const attachments = photos
      .filter((file) => file && file.filepath)
      .slice(0, 10)
      .map((file, index) => ({
        filename: file.originalFilename || `nuotrauka-${index + 1}.jpg`,
        content: fs.createReadStream(file.filepath),
        contentType: file.mimetype || "image/jpeg",
      }));

    const data = {
      marke: getValue(fields.marke),
      metai: getValue(fields.metai),
      variklis: getValue(fields.variklis),
      ta: getValue(fields.ta),
      komentaras: getValue(fields.komentaras),
      kaina: getValue(fields.kaina),
      miestas: getValue(fields.miestas),
      telefonas: getValue(fields.telefonas),
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    await transporter.sendMail({
      from: `"AutoSupirkimas" <${gmailUser}>`,
      to: "pirkparduokautolt@gmail.com",
      replyTo: gmailUser,
      subject: "Nauja automobilio supirkimo užklausa",
      text: `
Nauja automobilio supirkimo užklausa

Markė: ${data.marke}
Metai: ${data.metai}
Variklis: ${data.variklis}
Techninė apžiūra: ${data.ta}
Komentaras: ${data.komentaras}
Pageidaujama kaina: ${data.kaina}
Miestas: ${data.miestas}
Telefono numeris: ${data.telefonas}

Pridėta nuotraukų: ${attachments.length}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <h2>Nauja automobilio supirkimo užklausa</h2>
          <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 650px;">
            <tr><td><b>Markė</b></td><td>${data.marke}</td></tr>
            <tr><td><b>Metai</b></td><td>${data.metai}</td></tr>
            <tr><td><b>Variklis</b></td><td>${data.variklis}</td></tr>
            <tr><td><b>Techninė apžiūra</b></td><td>${data.ta}</td></tr>
            <tr><td><b>Komentaras</b></td><td>${data.komentaras}</td></tr>
            <tr><td><b>Pageidaujama kaina</b></td><td>${data.kaina}</td></tr>
            <tr><td><b>Miestas</b></td><td>${data.miestas}</td></tr>
            <tr><td><b>Telefono numeris</b></td><td>${data.telefonas}</td></tr>
          </table>
          <p><b>Pridėta nuotraukų:</b> ${attachments.length}</p>
        </div>
      `,
      attachments,
    });

    return res.status(200).json({
      success: true,
      message: "Forma išsiųsta sėkmingai",
      photos: attachments.length,
    });
  } catch (error) {
    console.error("SEND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Serverio klaida",
      error: error.message,
    });
  }
}