export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-left">
          <p className="footer-brand"><strong>GAMEBOXD</strong> — Registro personal de videojuegos</p>
          <p className="footer-subtext">Trabajo Práctico N° 2 • React + Vite + Firebase</p>
        </div>

        <div className="footer-right">
          <span className="footer-tag">Powered by CheapShark API</span>
          <span className="footer-copy">© {currentYear} • Todos los derechos reservados</span>
          <span className="footer-copy">Tomás Cornelatti - Luca Laselva</span>
        </div>
      </div>
    </footer>
  );
}