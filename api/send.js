const handleSubmit = async (e) => {
  e.preventDefault();

  setIsSending(true);
  setFormStatus("");

  try {
    const formData = new FormData();

    formData.append("marke", marke);
    formData.append("metai", metai);
    formData.append("variklis", variklis);
    formData.append("ta", technineApziura);
    formData.append("komentaras", komentaras);
    formData.append("kaina", pageidaujamaKaina);
    formData.append("miestas", miestas);
    formData.append("telefonas", telefonas);

    images.forEach((img) => {
      formData.append("photos", img.file);
    });

    const response = await fetch("/api/send", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Nepavyko išsiųsti");
    }

    setFormStatus(
      "✅ Forma sėkmingai išsiųsta. Netrukus su jumis susisieksime."
    );

    setImages([]);

    setMarke("");
    setMetai("");
    setVariklis("");
    setTechnineApziura("");
    setKomentaras("");
    setPageidaujamaKaina("");
    setMiestas("");
    setTelefonas("");
  } catch (error) {
    setFormStatus(
      "❌ Įvyko klaida. Bandykite dar kartą arba susisiekite telefonu."
    );
  } finally {
    setIsSending(false);
  }
};