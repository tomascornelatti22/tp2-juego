import { useState, useEffect } from "react";
import { db, iniciarSesionAnonima } from "./firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

import GameForm from "./components/GameForm";
import GameCard from "./components/GameCard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  const [juegos, setJuegos] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [cargando, setCargando] = useState(true);

  // Iniciar sesión anónima y escuchar la colección en tiempo real
  useEffect(() => {
    iniciarSesionAnonima();

    const coleccionRef = collection(db, "juegos");

    const unsubscribe = onSnapshot(coleccionRef, (snapshot) => {
      const listaJuegos = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));
      setJuegos(listaJuegos);
      setCargando(false);
    }, (error) => {
      console.error("Error al obtener datos de Firestore:", error);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Guardar en la nube
  const handleAgregarJuego = async (nuevoJuego) => {
    try {
      await addDoc(collection(db, "juegos"), {
        ...nuevoJuego,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  };

  // Cambiar estado en la nube
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, { status: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // Editar reseña / rating en la nube
  const handleActualizarCard = async (id, datosActualizados) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, datosActualizados);
    } catch (error) {
      console.error("Error al actualizar la tarjeta:", error);
    }
  };

  // Borrar de la nube
  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, "juegos", id));
    } catch (error) {
      console.error("Error al eliminar de Firebase:", error);
    }
  };

  const juegosFiltrados = juegos.filter((j) => {
    if (filtro === "all") return true;
    return j.status === filtro;
  });

  const totalJuegos = juegos.length;
  const totalCompletados = juegos.filter((j) => j.status === "completed").length;

  return (
    <div className="app-layout">
      <Header totalJuegos={totalJuegos} totalCompletados={totalCompletados} />

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
              <button className={filtro === "backlog" ? "active" : ""} onClick={() => setFiltro("backlog")}>
                Pendientes
              </button>
            </div>

            {cargando ? (
              <p className="empty-text">Cargando biblioteca desde la nube...</p>
            ) : juegosFiltrados.length === 0 ? (
              <p className="empty-text">No hay juegos en esta sección.</p>
            ) : (
              <div className="games-grid">
                {juegosFiltrados.map((juego) => (
                  <GameCard
                    key={juego.id}
                    juego={juego}
                    onCambiarEstado={handleCambiarEstado}
                    onEliminar={handleEliminar}
                    onActualizarCard={handleActualizarCard}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
