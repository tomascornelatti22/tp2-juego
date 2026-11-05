import { useState, useEffect } from "react";

// Catálogo precargado de respaldo para selección inmediata
const JUEGOS_POPULARES = [
  {
    title: "Elden Ring",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
    platform: "PC"
  },
  {
    title: "God of War Ragnarök",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp",
    platform: "PlayStation"
  },
  {
    title: "The Legend of Zelda: Tears of the Kingdom",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp",
    platform: "Nintendo Switch"
  },
  {
    title: "Hollow Knight",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp",
    platform: "PC"
  },
  {
    title: "Cyberpunk 2077",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.webp",
    platform: "PC"
  },
  {
    title: "Red Dead Redemption 2",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
    platform: "PlayStation"
  },
  {
    title: "Baldur's Gate 3",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp",
    platform: "PC"
  },
  {
    title: "Minecraft",
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8436.webp",
    platform: "PC"
  }
];

export default function GameSearchModal({ onSeleccionarJuego, onCerrar }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState(JUEGOS_POPULARES);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    // Si no escribió nada, muestra la lista recomendada
    if (!busqueda.trim()) {
      setResultados(JUEGOS_POPULARES);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        // API pública de CheapShark: sin key, sin registro y sin CORS
        const res = await fetch(
          "https://www.cheapshark.com/api/1.0/games?title=" + encodeURIComponent(busqueda) + "&limit=8"
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const adaptados = data.map((item) => ({
            title: item.external,
            coverUrl: item.thumb,
            platform: "PC"
          }));
          setResultados(adaptados);
        } else {
          // Filtrado local si la API externa no encuentra nada
          const locales = JUEGOS_POPULARES.filter((j) =>
            j.title.toLowerCase().includes(busqueda.toLowerCase())
          );
          setResultados(locales);
        }
      } catch (err) {
        // Fallback local en caso de error de red
        const locales = JUEGOS_POPULARES.filter((j) =>
          j.title.toLowerCase().includes(busqueda.toLowerCase())
        );
        setResultados(locales);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Seleccionar Videojuego</h3>
          <button className="btn-close" onClick={onCerrar}>✕</button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Buscar título o elegir de la lista..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoFocus
        />

        {buscando && <p className="loading-api">Buscando títulos en línea...</p>}

        <div className="search-results-grid">
          {resultados.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "1rem" }}>
              No se encontraron juegos con ese nombre.
            </p>
          ) : (
            resultados.map((juego, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => {
                  onSeleccionarJuego(juego);
                  onCerrar();
                }}
              >
                <img
                  src={juego.coverUrl}
                  alt={juego.title}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/200x260/1e293b/ffffff?text=Sin+Foto";
                  }}
                />
                <div className="result-text">
                  <strong>{juego.title}</strong>
                  <span>{juego.platform}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}