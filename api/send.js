import nodemailer from "nodemailer";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const form = new IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const getValue = (value) => {
      if (Array.isArray(value)) return value[0] || "";
      return value || "";
    };

    const uploadedPhotos = files.photos
      ? Array.isArray(files.photos)
        ? files.photos
        : [files.photos]
      : [];

    const attachments = uploadedPhotos.map((file, index) => ({
      filename: file.originalFilename || `nuotrauka-${index + 1}.jpg`,
      content: fs.createReadStream(file.filepath),
    }));

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      return res.status(500).json({
        message: "Trūksta Gmail prisijungimo duomenų Vercel Environment Variables",
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPassword.replace(/\s/g, ""),
      },
    });

    await transporter.sendMail({
      from: `"AutoSupirkimas" <${gmailUser}>`,
      to: "pirkparduokautolt@gmail.com",
      subject: "Nauja automobilio supirkimo užklausa",
      html: `
        <h2>Nauja automobilio supirkimo užklausa</h2>
        <p><b>Markė:</b> ${getValue(fields.marke)}</p>
        <p><b>Metai:</b> ${getValue(fields.metai)}</p>
        <p><b>Variklis:</b> ${getValue(fields.variklis)}</p>
        <p><b>Techninė apžiūra:</b> ${getValue(fields.ta)}</p>
        <p><b>Komentaras:</b> ${getValue(fields.komentaras)}</p>
        <p><b>Pageidaujama kaina:</b> ${getValue(fields.kaina)}</p>
        <p><b>Miestas:</b> ${getValue(fields.miestas)}</p>
        <p><b>Telefono numeris:</b> ${getValue(fields.telefonas)}</p>
      `,
      attachments,
    });

    return res.status(200).json({ message: "Forma išsiųsta sėkmingai" });
  } catch (error) {
    console.error("SEND ERROR:", error);
    return res.status(500).json({
      message: "Serverio klaida",
      error: error.message,
    });
  }
}