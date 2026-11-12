export default function Header({ totalJuegos, totalCompletados, onAbrirDrawer }) {
  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="btn-menu-drawer" 
          onClick={onAbrirDrawer}
          aria-label="Abrir formulario para agregar juego"
        >
          
          <span>+ Agregar Juego</span>
        </button>
        <h1 className="logo">GAMEBOXD</h1>
      </div>

      <div className="header-stats">
        <span className="stat-pill">En Biblioteca: <strong>{totalJuegos}</strong></span>
        <span className="stat-pill">Completados: <strong>{totalCompletados}</strong></span>
        <span className="stat-pill online-badge">● Online</span>
      </div>
    </header>
  );
}