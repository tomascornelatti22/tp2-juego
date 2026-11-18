# GAMEBOXD

## Hecho por Tomás Cornelatti y Luca Laselva

Aplicación web de catálogo y bitácora personal de videojuegos desarrollada con **React + Vite**, **Firebase (Auth Anónima + Cloud Firestore)** y **CheapShark API**.

🔗 **Demo en producción:** (<https://gameboxd-ruby.vercel.app/>)

---

## Características principales

- **Búsqueda inteligente con autocompletado:** Integración en tiempo real con CheapShark API y carga automática de carátulas verticales en alta definición.
- **Gestión completa (CRUD):** Registro de videojuegos con plataforma, estado (*Jugando*, *Completados*, *Pendientes*), calificación de 1 a 5 estrellas y reseña personal.
- **Edición rápida inline:** Cambio inmediato de estado desde cada tarjeta y modo de edición directa sin recargar la página.
- **Privacidad por sesión:** Aislamiento automático de bibliotecas por usuario mediante Firebase Anonymous Authentication.
- **Interfaz responsiva:** Panel lateral deslizable (*drawer*) para carga de juegos y pantalla de bienvenida adaptativa cuando la colección está vacía.

---

## Tecnologías utilizadas

- **Frontend:** React 19, Vite, CSS3 (variables custom, Grid y Flexbox)
- **Backend:** Firebase Authentication (Anónima) y Cloud Firestore
- **API Externa:** CheapShark Public API
- **Despliegue:** Vercel

---

## Requisitos previos

- Node.js [v18 o superior]
- Un proyecto en Firebase con **Authentication (proveedor Anónimo)** y **Cloud Firestore** habilitados.

---

## Instalación y ejecución local

1. **Clonar el repositorio:**

       git clone https://github.com/tomascornelatti22/tp2-juego.git
       cd tp2-juego

2. **Instalar las dependencias:**

       npm install

3. **Configurar las variables de entorno:**
   Duplicar el archivo `.env.example`, renombrarlo a `.env` y completar con las credenciales de tu aplicación web en Firebase:

       cp .env.example .env

4. **Configurar las reglas de seguridad en Firestore:**
   Copiar el contenido del archivo `firestore.rules` en la pestaña *Reglas* de Cloud Firestore dentro de la consola de Firebase.

5. **Iniciar el servidor de desarrollo:**

       npm run dev

---

## Estructura del proyecto

    tp2-juego/
    ├── public/                 # Favicon SVG e íconos estáticos
    ├── src/
    │   ├── components/         # Header, GameForm, GameCard y Footer
    │   ├── App.jsx             # Lógica principal, sesión anónima y suscripción a Firestore
    │   ├── App.css             # Sistema de diseño y estilos responsivos
    │   ├── firebase.js         # Inicialización de Firebase Auth y Firestore
    │   └── main.jsx            # Punto de entrada de React
    ├── .env.example            # Plantilla de variables de entorno
    ├── firestore.rules         # Reglas de seguridad de Cloud Firestore
    └── package.json            # Dependencias y scripts
