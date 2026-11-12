import { useState, useEffect, useRef } from "react";

export default function GameForm({ onAgregarJuego }) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [status, setStatus] = useState("backlog");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [coverUrl, setCoverUrl] = useState("");
  const [review, setReview] = useState("");

  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (juegoSeleccionado) return;

    const query = title.trim();
    if (query.length < 2) {
      setSugerencias([]);
      setMostrarDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(
          `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=6`
        );
        const data = await res.json();
        setSugerencias(data || []);
        setMostrarDropdown(true);
      } catch (error) {
        console.error("Error buscando en CheapShark:", error);
      } finally {
        setBuscando(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [title, juegoSeleccionado]);

  const handleInputChange = (e) => {
    setTitle(e.target.value);
    setJuegoSeleccionado(false);
  };

  const handleSeleccionarJuego = (juego) => {
    setJuegoSeleccionado(true);
    setTitle(juego.external);
    const hdCover = juego.steamAppID
      ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${juego.steamAppID}/library_600x900.jpg`
      : juego.thumb;
    setCoverUrl(hdCover || "");
    setMostrarDropdown(false);
    setSugerencias([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAgregarJuego({
      title: title.trim(),
      platform,
      status,
      rating,
      coverUrl:
        coverUrl.trim() ||
        "https://placehold.co/400x600/1e293b/94a3b8?text=Sin+Portada",
      review: review.trim(),
    });

    setTitle("");
    setPlatform("PC");
    setStatus("backlog");
    setRating(0);
    setCoverUrl("");
    setReview("");
    setSugerencias([]);
    setMostrarDropdown(false);
    setJuegoSeleccionado(false);
  };

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <div className="form-header-clean">
        <h2>Agregar Videojuego</h2>
      </div>

      <div className="form-group autocomplete-wrapper" ref={searchContainerRef}>
        <label htmlFor="game-title">Título:</label>
        <div className="search-input-container">
          <input
            id="game-title"
            type="text"
            placeholder="Escribí para buscar (ej. Elden Ring)..."
            value={title}
            onChange={handleInputChange}
            onFocus={() => {
              if (sugerencias.length > 0 && !juegoSeleccionado) {
                setMostrarDropdown(true);
              }
            }}
            autoComplete="off"
            required
          />
          <span className="search-status-icon">
            {buscando ? <span className="spinner-mini" /> : "🔍"}
          </span>
        </div>

        {mostrarDropdown && (
          <ul className="autocomplete-dropdown">
            {sugerencias.length === 0 && !buscando ? (
              <li className="autocomplete-empty">
                No se encontraron resultados. Podés agregarlo manualmente.
              </li>
            ) : (
              sugerencias.map((item) => (
                <li
                  key={item.gameID}
                  className="autocomplete-item"
                  onClick={() => handleSeleccionarJuego(item)}
                >
                  <img
                    src={item.thumb}
                    alt={item.external}
                    className="autocomplete-thumb"
                  />
                  <span className="autocomplete-name">{item.external}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="game-platform">Plataforma:</label>
        <select
          id="game-platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="PC">PC</option>
          <option value="PlayStation 5">PlayStation 5</option>
          <option value="PlayStation 4">PlayStation 4</option>
          <option value="Xbox Series X/S">Xbox Series X/S</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="game-status">Estado:</label>
        <select
          id="game-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="backlog">Pendiente</option>
          <option value="playing">Jugando</option>
          <option value="completed">Completado</option>
        </select>
      </div>

      <div className="form-group">
        <label>Puntaje ({rating} de 5):</label>
        <div className="star-rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`star-btn ${
                star <= (hoverRating || rating) ? "filled" : ""
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} estrellas`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="game-cover">URL de Portada:</label>
        <input
          id="game-cover"
          type="url"
          placeholder="Auto-completada por la API o manual..."
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="game-review">Reseña:</label>
        <textarea
          id="game-review"
          rows="3"
          placeholder="¿Qué te pareció el juego?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-submit">
        Agregar a mi Colección
      </button>
    </form>
  );
}