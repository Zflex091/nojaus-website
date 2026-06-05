import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Menu,
  X,
  Car,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import logoMain from "./assets/main.png";
import "./App.css";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [formStatus, setFormStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [marke, setMarke] = useState("");
  const [metai, setMetai] = useState("");
  const [variklis, setVariklis] = useState("");
  const [technineApziura, setTechnineApziura] = useState("");
  const [komentaras, setKomentaras] = useState("");
  const [pageidaujamaKaina, setPageidaujamaKaina] = useState("");
  const [miestas, setMiestas] = useState("");
  const [telefonas, setTelefonas] = useState("");

  const compressImage = (file, maxWidth = 1600, quality = 0.72) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      if (file.size < 900 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      const image = new Image();

      reader.onload = (event) => {
        image.src = event.target.result;
      };

      reader.onerror = () => resolve(file);

      image.onload = () => {
        try {
          const scale = Math.min(maxWidth / image.width, 1);
          const width = Math.round(image.width * scale);
          const height = Math.round(image.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );

              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        } catch {
          resolve(file);
        }
      };

      image.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const freeSlots = 10 - images.length;

    if (freeSlots <= 0) {
      alert("Galima įkelti iki 10 nuotraukų.");
      e.target.value = "";
      return;
    }

    const filesToProcess = selectedFiles
      .filter((file) => {
        const name = file.name.toLowerCase();
        return (
          file.type.startsWith("image/") ||
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png") ||
          name.endsWith(".webp")
        );
      })
      .slice(0, freeSlots);

    if (filesToProcess.length === 0) {
      alert("Pasirinkite JPG, PNG arba WEBP formato nuotrauką.");
      e.target.value = "";
      return;
    }

    const processedImages = await Promise.all(
      filesToProcess.map(async (file) => {
        const finalFile = await compressImage(file);

        return {
          file: finalFile,
          preview: URL.createObjectURL(finalFile),
        };
      })
    );

    setImages((prev) => [...prev, ...processedImages].slice(0, 10));
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSending(true);
    setFormStatus("");

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

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Nepavyko išsiųsti");
      }

      setFormStatus("✅ Forma sėkmingai išsiųsta. Netrukus su jumis susisieksime.");

      setImages([]);
      setMarke("");
      setMetai("");
      setVariklis("");
      setTechnineApziura("");
      setKomentaras("");
      setPageidaujamaKaina("");
      setMiestas("");
      setTelefonas("");
    } catch {
      setFormStatus("❌ Įvyko klaida. Bandykite dar kartą arba susisiekite telefonu.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <header className="header">
        <a href="#pradzia" className="logo">
          <img src={logoMain} alt="Auto supirkimas" />
        </a>

        <nav className={menuOpen ? "nav active" : "nav"}>
          <a href="#pradzia" onClick={() => setMenuOpen(false)}>Pradžia</a>
          <a href="#superkame" onClick={() => setMenuOpen(false)}>Superkame</a>
          <a href="#sandoris" onClick={() => setMenuOpen(false)}>Sandoris</a>
          <a href="#apie" onClick={() => setMenuOpen(false)}>Apie mus</a>
          <a href="#kontaktai" onClick={() => setMenuOpen(false)}>Kontaktai</a>
        </nav>

        <a className="callBtn" href="tel:+37064038274">
          <Phone size={18} /> Skambinti
        </a>

        <button
          type="button"
          className="menuBtn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section id="pradzia" className="hero">
          <div className="heroContent">
            <motion.div
              className="heroText"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.7 }}
            >
              <span className="eyebrow">
                Automobilių supirkimas visoje Lietuvoje
              </span>

              <h1>
                Greitas auto <span>pardavimas</span>
              </h1>

              <p>
                Įvertiname jūsų automobilį, susisiekiame ir pateikiame aiškų
                pasiūlymą. Superkame tvarkingus, avarinius ir defektų turinčius
                automobilius.
              </p>

              <div className="heroStats">
                <div>
                  <strong>24h</strong>
                  <span>greitas įvertinimas</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>aiškus procesas</span>
                </div>
                <div>
                  <strong>LT</strong>
                  <span>dirbame visoje Lietuvoje</span>
                </div>
              </div>
            </motion.div>

            <motion.form
              className="formBox"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
            >
              <h2>Sužinokite savo automobilio kainą jau dabar!</h2>

              <div className="formGrid">
                <input
                  value={marke}
                  onChange={(e) => setMarke(e.target.value)}
                  placeholder="Markė *"
                  required
                />

                <input
                  value={metai}
                  onChange={(e) => setMetai(e.target.value)}
                  placeholder="Metai *"
                  required
                />
              </div>

              <input
                value={variklis}
                onChange={(e) => setVariklis(e.target.value)}
                placeholder="Variklis *"
                required
              />

              <div className="formLabel">Techninė apžiūra</div>

              <div className="radioRow">
                <label>
                  <input
                    type="radio"
                    name="ta"
                    value="Galioja"
                    checked={technineApziura === "Galioja"}
                    onChange={(e) => setTechnineApziura(e.target.value)}
                    required
                  />
                  Galioja
                </label>

                <label>
                  <input
                    type="radio"
                    name="ta"
                    value="Negalioja"
                    checked={technineApziura === "Negalioja"}
                    onChange={(e) => setTechnineApziura(e.target.value)}
                  />
                  Negalioja
                </label>
              </div>

              <label className="uploadBox">
                <input
                  type="file"
                  multiple
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleImageUpload}
                />

                <span>
                  {images.length > 0
                    ? `Pasirinkta nuotraukų: ${images.length}/10`
                    : "Automobilio nuotraukos iki 10 vnt."}
                </span>
              </label>

              {images.length > 0 && (
                <div className="previewGrid">
                  {images.map((img, index) => (
                    <div className="previewItem" key={index}>
                      <img
                        src={img.preview}
                        alt={`Automobilio nuotrauka ${index + 1}`}
                        className="previewImage"
                      />

                      <button
                        type="button"
                        className="removeImage"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={komentaras}
                onChange={(e) => setKomentaras(e.target.value)}
                placeholder="Komentaras"
              ></textarea>

              <div className="formGrid">
                <input
                  value={pageidaujamaKaina}
                  onChange={(e) => setPageidaujamaKaina(e.target.value)}
                  placeholder="Pageidaujama kaina"
                />

                <input
                  value={miestas}
                  onChange={(e) => setMiestas(e.target.value)}
                  placeholder="Miestas"
                />
              </div>

              <input
                type="tel"
                value={telefonas}
                onChange={(e) => setTelefonas(e.target.value)}
                placeholder="Telefono numeris *"
                required
              />

              <button type="submit" disabled={isSending}>
                {isSending ? "SIUNČIAMA..." : "SIŲSTI"}
              </button>

              {formStatus && <p className="formStatus">{formStatus}</p>}
            </motion.form>
          </div>
        </section>

        <section id="superkame" className="section">
          <motion.div
            className="sectionTitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span>Kokius automobilius superkame?</span>
            <h2>Superkame visus automobilius</h2>
          </motion.div>

          <div className="carsGrid">
            <motion.div
              className="carCard clean"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="cardIcon">
                <ShieldCheck />
              </div>

              <h3>Tvarkingus automobilius</h3>

              <p>
                Automobilius, kurie išsaugojo savo kokybę laikui bėgant. Net
                jei turi smulkių defektų, pateikiame konkurencingą pasiūlymą.
              </p>
            </motion.div>

            <motion.div
              className="carCard damaged"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="cardIcon">
                <Car />
              </div>

              <h3>Avarinius automobilius</h3>

              <p>
                Automobilius, kurie yra patyrę eismo įvykius arba turi didelių
                techninių ar kėbulo defektų.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="sandoris" className="section darkSection">
          <motion.div
            className="sectionTitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span>Procesas</span>
            <h2>Kaip įvyksta sandoris?</h2>
          </motion.div>

          <div className="steps">
            {[
              [
                "01",
                "Rinkos analizė",
                "Mūsų specialistai išanalizuoja rinką ir pateiktą informaciją, kad objektyviai įvertintų automobilio vertę.",
              ],
              [
                "02",
                "Susisiekimas",
                "Susisiekiame telefonu ir suderiname visas automobilio apžiūros bei pardavimo detales.",
              ],
              [
                "03",
                "Apžiūra",
                "Atvykstame apžiūrėti automobilio, įvertiname jo būklę ir pateikiame galutinį pasiūlymą.",
              ],
              [
                "04",
                "Atsiskaitymas",
                "Paruošiame dokumentus ir atsiskaitome už automobilį iš karto, be papildomų vėlavimų.",
              ],
            ].map((step, index) => (
              <motion.div
                className="step"
                key={step[0]}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <strong>{step[0]}</strong>
                <h3>{step[1]}</h3>
                <p>{step[2]}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="apie" className="section about">
          <motion.div
            className="aboutText"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="eyebrow">Apie mus</span>

            <h2>Patogus būdas parduoti automobilį be streso</h2>

            <p>
              Superkame įvairių gamintojų automobilius visoje Lietuvoje. Mūsų
              tikslas – greitas įvertinimas, aiškus pasiūlymas ir sklandus
              sandoris.
            </p>
          </motion.div>

          <div className="benefits">
            {[
              "Superkame įvairių gamintojų automobilius",
              "Dirbame visoje Lietuvoje",
              "Greitas automobilio įvertinimas",
              "Nemokama konsultacija",
              "Atsiskaitymas tą pačią dieną",
              "Sutvarkome pirkimo–pardavimo dokumentus",
            ].map((item) => (
              <div className="benefit" key={item}>
                <CheckCircle size={20} />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="kontaktai" className="section contact">
          <motion.div
            className="contactBox"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div>
              <span className="eyebrow">Kontaktai</span>

              <h2>Susisiekite dėl automobilio pardavimo</h2>

              <p>
                Užpildykite formą arba paskambinkite – aptarsime jūsų automobilį
                ir pateiksime pasiūlymą.
              </p>
            </div>

            <div className="contactInfo">
              <a href="tel:+37064038274">
                <Phone /> +370 640 38274
              </a>

              <a href="mailto:pirkparduokautolt@gmail.com">
                <Mail /> pirkparduokautolt@gmail.com
              </a>

              <span>
                <MapPin /> Visa Lietuva
              </span>

              <span>
                <Clock /> I–VII 08:00–21:00
              </span>
            </div>
          </motion.div>
        </section>
      </main>

      <a className="floatingPhone" href="tel:+37064038274">
        <Phone />
      </a>

      <footer>
        <div>AutoSupirkimas</div>
        <p>Greitas automobilių supirkimas visoje Lietuvoje.</p>
      </footer>
    </>
  );
}

export default App;