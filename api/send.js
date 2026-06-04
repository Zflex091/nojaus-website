import nodemailer from "nodemailer";
import formidable from "formidable";
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
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    const photos = files.photos || [];
    const fileArray = Array.isArray(photos) ? photos : [photos];

    const attachments = fileArray
      .filter(Boolean)
      .map((file) => ({
        filename: file.originalFilename || "nuotrauka.jpg",
        content: fs.createReadStream(file.filepath),
      }));

    const getValue = (value) => Array.isArray(value) ? value[0] : value || "";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "lukaviciusp@gmail.com",
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