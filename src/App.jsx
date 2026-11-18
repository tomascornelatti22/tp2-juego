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
  const [errorMsg, setErrorMsg] = useState("");

  const mostrarError = (mensaje) => {
    setErrorMsg(mensaje);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // 1. Iniciar sesión anónima y detectar el UID del usuario actual
  useEffect(() => {
    iniciarSesionAnonima().catch((error) => {
      console.error("Error en autenticación anónima:", error);
      mostrarError("No se pudo iniciar la sesión en la nube. Verificá tu conexión.");
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
        mostrarError("Error al cargar tu biblioteca desde Firestore.");
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
    if (!usuario) {
      mostrarError("Sesión no iniciada. Recargá la página e intentá de nuevo.");
      return;
    }
    try {
      await addDoc(collection(db, "juegos"), {
        ...nuevoJuego,
        userId: usuario.uid,
        createdAt: serverTimestamp(),
      });
      setDrawerAbierto(false);
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      mostrarError("Error al guardar el juego en la base de datos.");
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, { status: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      mostrarError("No se pudo actualizar el estado del juego.");
    }
  };

  const handleActualizarCard = async (id, datosActualizados) => {
    try {
      const docRef = doc(db, "juegos", id);
      await updateDoc(docRef, datosActualizados);
    } catch (error) {
      console.error("Error al actualizar la tarjeta:", error);
      mostrarError("No se pudieron guardar los cambios de la tarjeta.");
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, "juegos", id));
    } catch (error) {
      console.error("Error al eliminar de Firebase:", error);
      mostrarError("Error al eliminar el juego de la colección.");
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

      {errorMsg && (
        <div className="error-toast" role="alert">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg("")} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

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
            {!cargando && juegos.length > 0 && (
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
            )}

            {cargando ? (
              <p className="empty-text">Cargando biblioteca desde la nube...</p>
            ) : juegos.length === 0 ? (
              <section className="welcome-hero">
                <div className="welcome-posters">
                  <div className="poster-card poster-left">
                    <img
                      src="https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7x.webp"
                      alt="The Witcher 3"
                    />
                  </div>
                  <div className="poster-card poster-center">
                    <img
                      src="https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp"
                      alt="Elden Ring"
                    />
                  </div>
                  <div className="poster-card poster-right">
                    <img
                      src="https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp"
                      alt="Red Dead Redemption 2"
                    />
                  </div>
                </div>

                <div className="welcome-content">
                  <span className="welcome-kicker">// TU BIBLIOTECA PERSONAL EN LA NUBE</span>
                  <h2 className="welcome-title">
                    Registrá lo que jugás. <br />
                    <span>Puntuá cada partida.</span>
                  </h2>
                  <p className="welcome-subtitle">
                    Armá tu historial de videojuegos, organizá tus pendientes y guardá tus reseñas
                    en un espacio privado sincronizado automáticamente con tu sesión.
                  </p>

                  <div className="welcome-actions">
                    <button
                      type="button"
                      className="btn-hero-cta"
                      onClick={() => setDrawerAbierto(true)}
                    >
                      + Cargar mi primer juego
                    </button>
                  </div>

                  <div className="welcome-features">
                    <div className="feature-chip">
                      <strong>01.</strong> Buscador conectado a CheapShark
                    </div>
                    <div className="feature-chip">
                      <strong>02.</strong> Estados: Jugando, Completado y Pendiente
                    </div>
                    <div className="feature-chip">
                      <strong>03.</strong> Biblioteca privada por usuario
                    </div>
                  </div>
                </div>
              </section>
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