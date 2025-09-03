import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [personajes, setPersonajes] = useState([]);
  const [personajeUrl, setPersonajeUrl] = useState("");
  const [personajeData, setPersonajeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formulario
  const [apodo, setApodo] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [fichaFinal, setFichaFinal] = useState(null);

  // Cargar lista de personajes al montar
  useEffect(() => {
    fetch("https://swapi.dev/api/people/?page=1")
      .then((res) => res.json())
      .then((data) => {
        setPersonajes(data.results);
      })
      .catch((err) => console.error("Error al cargar personajes:", err));
  }, []);

  // Cuando cambia el personaje seleccionado
  useEffect(() => {
    if (!personajeUrl) return;
    setLoading(true);
    fetch(personajeUrl)
      .then((res) => res.json())
      .then(async (data) => {
        // Fetch extra para el planeta
        try {
          const homeworldRes = await fetch(data.homeworld);
          const homeworldData = await homeworldRes.json();
          data.homeworldName = homeworldData.name;
        } catch (e) {
          console.error("Error cargando planeta:", e);
          data.homeworldName = "Desconocido";
        }
        setPersonajeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar detalle:", err);
        setLoading(false);
      });
  }, [personajeUrl]);

  // Recuperar ficha guardada del localStorage al iniciar
  useEffect(() => {
    const savedFicha = localStorage.getItem("ficha");
    if (savedFicha) {
      setFichaFinal(JSON.parse(savedFicha));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personajeData) return;

    const nuevaFicha = {
      nombre: personajeData.name,
      altura: personajeData.height,
      nacimiento: personajeData.birth_year,
      planeta: personajeData.homeworldName,
      apodo,
      favorito,
    };

    setFichaFinal(nuevaFicha);
    localStorage.setItem("ficha", JSON.stringify(nuevaFicha));
  };

  return (
    <div className="container">
      <h1>🌌 Ficha Galáctica</h1>

      {/* Select */}
      <label>
        Selecciona un personaje:
        <select
          onChange={(e) => setPersonajeUrl(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            -- Elegí un personaje --
          </option>
          {personajes.map((p) => (
            <option key={p.name} value={p.url}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {/* Vista previa */}
      {loading && <p>Cargando datos...</p>}
      {personajeData && !loading && (
        <div className="preview">
          <h2>{personajeData.name}</h2>
          <p>Altura: {personajeData.height} cm</p>
          <p>Año de nacimiento: {personajeData.birth_year}</p>
          <p>Planeta: {personajeData.homeworldName}</p>
        </div>
      )}

      {/* Formulario */}
      {personajeData && (
        <form onSubmit={handleSubmit}>
          <label>
            Apodo en tu ficha:
            <input
              type="text"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              required
              minLength={2} // ✅ Validación extra
            />
          </label>

          <label>
            ¿Es tu favorito?
            <input
              type="checkbox"
              checked={favorito}
              onChange={(e) => setFavorito(e.target.checked)}
            />
          </label>

          <button type="submit">Guardar ficha</button>
        </form>
      )}

      {/* Resumen final */}
      {fichaFinal && (
        <div className="resumen">
          <h2>⭐ Resumen de tu ficha</h2>
          <p>Nombre: {fichaFinal.nombre}</p>
          <p>Altura: {fichaFinal.altura} cm</p>
          <p>Nacimiento: {fichaFinal.nacimiento}</p>
          <p>Planeta: {fichaFinal.planeta}</p>
          <p>Apodo: {fichaFinal.apodo}</p>
          <p>Favorito: {fichaFinal.favorito ? "Sí" : "No"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
