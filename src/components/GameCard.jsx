import { useState } from "react";

export default function GameCard({
  juego,
  onCambiarEstado,
  onEliminar,
  onActualizarCard,
}) {
  const [editando, setEditando] = useState(false);

  const [platform, setPlatform] = useState(juego.platform || "PC");
  const [status, setStatus] = useState(juego.status || "backlog");
  const [rating, setRating] = useState(juego.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(juego.review || "");

  const etiquetasEstado = {
    completed: "Completado",
    playing: "Jugando",
    backlog: "Pendiente",
  };

  const abrirEdicion = () => {
    setPlatform(juego.platform || "PC");
    setStatus(juego.status || "backlog");
    setRating(juego.rating || 0);
    setReview(juego.review || "");
    setEditando(true);
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    onActualizarCard(juego.id, {
      platform,
      status,
      rating,
      review: review.trim(),
    });
    setEditando(false);
  };

  const renderEstrellas = (puntaje) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={index < puntaje ? "star-filled" : "star-empty"}
      >
        ★
      </span>
    ));
  };

  return (
    <article className={`game-card ${editando ? "is-editing" : ""}`}>
      {/* Contenedor fijo de portada */}
      <div className="game-card-image-container">
        <img
          src={juego.coverUrl}
          alt={juego.title}
          className="game-card-img"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/400x600/1e293b/94a3b8?text=Sin+Portada";
          }}
        />
        <span className={`status-badge-pill ${juego.status}`}>
          {etiquetasEstado[juego.status] || juego.status}
        </span>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="game-card-content">
        <h3 className="game-card-title">{juego.title}</h3>

        {!editando ? (
          /* ================= MODO LECTURA ================= */
          <>
            <p className="game-card-platform">{juego.platform}</p>

            <div className="game-card-stars">
              {juego.rating > 0 ? (
                renderEstrellas(juego.rating)
              ) : (
                <span className="unrated-text">☆☆☆☆☆ (Sin calificar)</span>
              )}
            </div>

            {juego.review && (
              <p className="game-card-review">"{juego.review}"</p>
            )}

            <div className="game-card-footer">
              <select
                className="status-select-quick"
                value={juego.status}
                onChange={(e) => onCambiarEstado(juego.id, e.target.value)}
                aria-label="Cambiar estado rápido"
              >
                <option value="backlog">Pendiente</option>
                <option value="playing">Jugando</option>
                <option value="completed">Completado</option>
              </select>

              <button
                type="button"
                className="btn-icon-edit-inline"
                onClick={abrirEdicion}
                title="Editar reseña, puntaje y detalles"
                aria-label="Editar videojuego"
              >
                ✎
              </button>
            </div>
          </>
        ) : (
          /* ================= MODO EDICIÓN ================= */
          <form className="card-edit-form" onSubmit={handleGuardar}>
            <div className="edit-row">
              <label>Plataforma:</label>
              <select
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

            <div className="edit-row">
              <label>Estado:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="backlog">Pendiente</option>
                <option value="playing">Jugando</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div className="edit-row">
              <label>Valoración ({rating}/5):</label>
              <div className="card-stars-edit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-btn-mini ${
                      star <= (hoverRating || rating) ? "filled" : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="edit-row">
              <label>Reseña:</label>
              <textarea
                rows="2"
                placeholder="Escribí tu reseña..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <div className="card-edit-buttons">
              <button type="submit" className="btn-save-edit">
                Guardar
              </button>
              <button
                type="button"
                className="btn-cancel-edit"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-delete-edit"
                onClick={() => onEliminar(juego.id)}
              >
                Eliminar
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}