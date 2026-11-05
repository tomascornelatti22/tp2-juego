export default function Header({ totalJuegos, totalCompletados }) {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-brand">
          
          <h1>GAMEBOXD</h1>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-label">En Biblioteca:</span>
            <strong className="stat-value">{totalJuegos}</strong>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Completados:</span>
            <strong className="stat-value">{totalCompletados}</strong>
          </div>
          <div className="user-badge">
            <span className="user-dot"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}