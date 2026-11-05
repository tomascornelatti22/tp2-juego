export default function GameCard({ juego, onCambiarEstado, onEliminar }) {

  return (
    <article className="game-card">
      <div className="cover-container">
        <img src={juego.coverUrl} alt={juego.title} className="game-cover" />
        <span className={`status-badge status-${juego.status}`}>
          {juego.status}
        </span>
      </div>

      <div className="card-info">
        <h4>{juego.title}</h4>
        <p className="platform-tag">{juego.platform}</p>
        <p className="rating">{juego.rating > 0 ? "★".repeat(juego.rating) + "☆".repeat(5 - juego.rating) : "☆☆☆☆☆ (Sin calificar)"}</p>

        {juego.review && <p className="review-snippet">"{juego.review}"</p>}

        <div className="card-actions">
          <select
            value={juego.status}
            onChange={(e) => onCambiarEstado(juego.id, e.target.value)}
          >
            <option value="backlog">Pendiente</option>
            <option value="playing">Jugando</option>
            <option value="completed">Completado</option>
            <option value="abandoned">Abandonado</option>
          </select>

          <button className="btn-delete" onClick={() => onEliminar(juego.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}