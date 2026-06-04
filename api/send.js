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

  const form = formidable({
    multiples: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Nepavyko apdoroti formos" });
    }

    const attachments = [];

    const uploadedFiles = files.photos;

    if (uploadedFiles) {
      const fileArray = Array.isArray(uploadedFiles)
        ? uploadedFiles
        : [uploadedFiles];

      fileArray.forEach((file) => {
        attachments.push({
          filename: file.originalFilename,
          content: fs.createReadStream(file.filepath),
        });
      });
    }

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
        <p><b>Markė:</b> ${fields.marke || ""}</p>
        <p><b>Metai:</b> ${fields.metai || ""}</p>
        <p><b>Variklis:</b> ${fields.variklis || ""}</p>
        <p><b>Techninė apžiūra:</b> ${fields.ta || ""}</p>
        <p><b>Komentaras:</b> ${fields.komentaras || ""}</p>
        <p><b>Pageidaujama kaina:</b> ${fields.kaina || ""}</p>
        <p><b>Miestas:</b> ${fields.miestas || ""}</p>
        <p><b>Telefono numeris:</b> ${fields.telefonas || ""}</p>
      `,
      attachments,
    });

    return res.status(200).json({ message: "Forma išsiųsta sėkmingai" });
  });
}