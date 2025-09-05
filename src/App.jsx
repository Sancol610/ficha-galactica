import { useState, useEffect } from "react";
import "./App.css"; // estilos

function App() {
  const [personajes, setPersonajes] = useState([]);
  const [personajeUrl, setPersonajeUrl] = useState("");
  const [personajeData, setPersonajeData] = useState(null);
  const [homeworld, setHomeworld] = useState("");
  const [loading, setLoading] = useState(false);

  // Formulario
  const [apodo, setApodo] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [fichaFinal, setFichaFinal] = useState(null);

  // Al montar: cargar personajes
  useEffect(() => {
    fetch("https://swapi.py4e.com/api/people/?page=1")
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
      .then((data) => {
        setPersonajeData(data);
        // Cargar homeworld
        if (data.homeworld) {
          fetch(data.homeworld)
            .then((res) => res.json())
            .then((planet) => setHomeworld(planet.name || "Desconocido"))
            .catch(() => setHomeworld("Desconocido"));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar detalle:", err);
        setLoading(false);
      });
  }, [personajeUrl]);

  // Recuperar ficha guardada en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ficha");
    if (saved) {
      setFichaFinal(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personajeData) return;

    // Validación apodo
    if (apodo.trim().length < 2) {
      alert("El apodo debe tener al menos 2 caracteres");
      return;
    }

    const ficha = {
      nombre: personajeData.name,
      altura: personajeData.height,
      nacimiento: personajeData.birth_year,
      planeta: homeworld,
      apodo,
      favorito,
    };

    setFichaFinal(ficha);
    localStorage.setItem("ficha", JSON.stringify(ficha));
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
          <p>Planeta: {homeworld}</p>
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
