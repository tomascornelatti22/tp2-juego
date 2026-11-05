import { useState } from 'react'
import GameForm from "./components/GameForm";
import GameCard from "./components/GameCard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import './App.css'

export default function App() {
  
  // 1. Primero los estados
  const [juegos, setJuegos] = useState([]);
  const [filtro, setFiltro] = useState("all");

  // 2. Después los cálculos derivados de esos estados
  const totalJuegos = juegos.length;
  const totalCompletados = juegos.filter((j) => j.status === "completed").length;

  const handleAgregarJuego = (nuevoJuego) => {
    const nuevo = {
      ...nuevoJuego,
      id: Date.now().toString(),
    };
    setJuegos((prev) => [nuevo, ...prev]);
  };

  const handleCambiarEstado = (id, nuevoEstado) => {
    setJuegos((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: nuevoEstado } : j))
    );
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este videojuego?")) {
      setJuegos((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const juegosFiltrados = juegos.filter((j) =>
    filtro === "all" ? true : j.status === filtro
  );

  return (
  <div className="app-layout">
    {/* 1. Header con props dinámicas */}
    <Header totalJuegos={totalJuegos} totalCompletados={totalCompletados} />

    {/* 2. El contenido central que ya tenías */}
    <div className="container">
      <main className="layout">
        <aside className="sidebar">
          <GameForm onAgregarJuego={handleAgregarJuego} />
        </aside>

        <section className="content">
          <div className="filters">
            <button className={filtro === "all" ? "active" : ""} onClick={() => setFiltro("all")}>
              Todos ({juegos.length})
            </button>
            <button className={filtro === "playing" ? "active" : ""} onClick={() => setFiltro("playing")}>
              Jugando
            </button>
            <button className={filtro === "completed" ? "active" : ""} onClick={() => setFiltro("completed")}>
              Completados
            </button>
            <button className={filtro === "pending" ? "active" : ""} onClick={() => setFiltro("pending")}>
              Pendientes
            </button>
          </div>

          {juegosFiltrados.length === 0 ? (
            <p className="empty-text">No hay juegos en esta sección.</p>
          ) : (
            <div className="games-grid">
              {juegosFiltrados.map((juego) => (
                <GameCard
                  key={juego.id}
                  juego={juego}
                  onCambiarEstado={handleCambiarEstado}
                  onEliminar={handleEliminar}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>

    {/* 3. Footer al pie */}
    <Footer />
  </div>
);
}