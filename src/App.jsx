import { useState, useEffect } from "react";
import { db, auth, iniciarSesionAnonima } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  where
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
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // 1. Iniciar sesión anónima y detectar el UID del usuario actual
  useEffect(() => {
    iniciarSesionAnonima().catch((error) => {
      console.error("Error en autenticación anónima:", error);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (!user) {
        setJuegos([]);
        setCargando(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Escuchar SOLO los juegos que pertenecen al UID de este usuario
  useEffect(() => {
    if (!usuario) return;

    const coleccionRef = collection(db, "juegos");
    const consultaUsuario = query(
      coleccionRef,
      where("userId", "==", usuario.uid)
    );

    const unsubscribeFirestore = onSnapshot(
      consultaUsuario,
      (snapshot) => {
        const listaJuegos = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));
        setJuegos(listaJuegos);
        setCargando(false);
      },
      (error) => {
        console.error("Error al obtener datos de Firestore:", error);
        setCargando(false);
      }
    );

    return () => unsubscribeFirestore();
  }, [usuario]);

  // Cerrar el menú lateral con Escape y bloquear scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDrawerAbierto(false);
      }
    };

    if (drawerAbierto) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [drawerAbierto]);

  // 3. Guardar cada juego nuevo vinculado al UID del usuario
  const handleAgregarJuego = async (nuevoJuego) => {
    if (!usuario) return;
    try {
      await addDoc(collection(db, "juegos"), {
        ...nuevoJuego,
        userId: usuario.uid,
        createdAt: serverTimestamp(),
      });
      setDrawerAbierto(false);
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, { status: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const handleActualizarCard = async (id, datosActualizados) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, datosActualizados);
    } catch (error) {
      console.error("Error al actualizar la tarjeta:", error);
    }
  };

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
      <Header 
        totalJuegos={totalJuegos} 
        totalCompletados={totalCompletados} 
        onAbrirDrawer={() => setDrawerAbierto(true)}
      />

      {drawerAbierto && (
        <div 
          className="drawer-overlay" 
          onClick={() => setDrawerAbierto(false)}
        />
      )}

      <aside className={`drawer-sidebar ${drawerAbierto ? "open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-title">Nuevo Registro</span>
          <button 
            className="btn-close-drawer" 
            onClick={() => setDrawerAbierto(false)}
            aria-label="Cerrar panel"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>
        <GameForm onAgregarJuego={handleAgregarJuego} />
      </aside>

      <div className="container">
        <main className="layout-full">
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
              <div className="games-grid" key={filtro}>
                {juegosFiltrados.map((juego, index) => (
                  <div 
                    key={juego.id} 
                    className="card-animate-wrapper"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <GameCard
                      juego={juego}
                      onCambiarEstado={handleCambiarEstado}
                      onEliminar={handleEliminar}
                      onActualizarCard={handleActualizarCard}
                    />
                  </div>
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