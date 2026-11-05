import { useState } from "react";
import GameSearchModal from "./GameSearchModal";

export default function GameForm({ onAgregarJuego }) {
  const [formData, setFormData] = useState({
    title: "",
    platform: "PC",
    coverUrl: "",
    status: "pending",
    rating: 0,
    review: "",
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (puntos) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === puntos ? 0 : puntos,
    }));
  };

  const handleSeleccionApi = (juegoSeleccionado) => {
    setFormData((prev) => ({
      ...prev,
      title: juegoSeleccionado.title,
      coverUrl: juegoSeleccionado.coverUrl,
      platform: juegoSeleccionado.platform?.includes("PlayStation")
        ? "PlayStation"
        : juegoSeleccionado.platform?.includes("Xbox")
        ? "Xbox"
        : juegoSeleccionado.platform?.includes("Nintendo")
        ? "Nintendo Switch"
        : "PC",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("El título del videojuego es obligatorio.");
      return;
    }

    const imagenFinal = formData.coverUrl.trim()
      ? formData.coverUrl
      : "https://placehold.co/300x400/1e293b/ffffff?text=Sin+Portada";

    onAgregarJuego({ ...formData, coverUrl: imagenFinal });

    setFormData({
      title: "",
      platform: "PC",
      coverUrl: "",
      status: "pending",
      rating: 0,
      review: "",
    });
    setHoverRating(0);
  };

  return (
    <>
      <form className="game-form" onSubmit={handleSubmit}>
        <div className="form-header-row">
          <h3>Agregar Videojuego</h3>
          <button
            type="button"
            className="btn-search-api"
            onClick={() => setMostrarModal(true)}
          >
            Buscar
          </button>
        </div>

        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej. Elden Ring"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Plataforma:</label>
            <select name="platform" value={formData.platform} onChange={handleChange}>
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="Nintendo Switch">Nintendo Switch</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="backlog">Pendiente</option>
              <option value="playing">Jugando</option>
              <option value="completed">Completado</option>
              <option value="abandoned">Abandonado</option>
            </select>
          </div>

          {/* Selector interactivo de estrellas */}
          <div className="form-group rating-form-group">
            <label>Puntaje ({formData.rating} de 5):</label>
            <div 
              className="star-rating-input"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((estrella) => {
                const activa = estrella <= (hoverRating || formData.rating);
                return (
                  <button
                    key={estrella}
                    type="button"
                    className={`star-btn ${activa ? "star-active" : "star-inactive"}`}
                    onClick={() => handleRatingClick(estrella)}
                    onMouseEnter={() => setHoverRating(estrella)}
                    aria-label={`${estrella} estrellas`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>URL de Portada:</label>
          <input
            type="url"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            placeholder="Auto-completada por la API o manual..."
          />
        </div>

        <div className="form-group">
          <label>Reseña:</label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            placeholder="¿Qué te pareció el juego?"
            rows="3"
          />
        </div>

        <button type="submit" className="btn-submit">
          Agregar a mi Colección
        </button>
      </form>

      {mostrarModal && (
        <GameSearchModal
          onSeleccionarJuego={handleSeleccionApi}
          onCerrar={() => setMostrarModal(false)}
        />
      )}
    </>
  );
}