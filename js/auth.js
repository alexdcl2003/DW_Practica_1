(function () {
  "use strict";

  const STORAGE_USUARIOS = "usuarios";
  const STORAGE_SESION = "sesion";
  const STORAGE_RECUPERACION = "recuperacion";
  const MODO_SIMULADO = true;

  function normalizarCorreo(correo) {
    return String(correo || "").trim().toLowerCase();
  }

  function leerUsuarios() {
    try {
      const datos = localStorage.getItem(STORAGE_USUARIOS);
      return datos ? JSON.parse(datos) : [];
    } catch (error) {
      console.warn("No se pudo leer usuarios de localStorage:", error);
      return [];
    }
  }

  function guardarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(usuarios));
  }

  function obtenerUsuarioPorCorreo(correo) {
    const correoNormalizado = normalizarCorreo(correo);
    const usuarios = leerUsuarios();
    return usuarios.find((usuario) => normalizarCorreo(usuario.correo) === correoNormalizado) || null;
  }

  function mostrarMensajeGlobal(mensaje, tipo) {
    if (typeof document === "undefined") return;
    const contenedor = document.getElementById("mensajeForm");
    if (!contenedor) return;

    contenedor.textContent = mensaje;
    contenedor.className = "mensaje";

    if (tipo === "exito") {
      contenedor.classList.add("exito");
    } else if (tipo === "error") {
      contenedor.classList.add("error");
    }
  }

  function generarCodigo() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function redirigirSiNoHaySesion() {
    const correoSesion = localStorage.getItem(STORAGE_SESION);
    if (!correoSesion) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function registrarUsuario(datos) {
    if (!datos || !datos.correo || !datos.password) {
      return { ok: false, mensaje: "Faltan datos obligatorios para registrar." };
    }

    const usuarios = leerUsuarios();
    const correo = normalizarCorreo(datos.correo);

    if (usuarios.some((usuario) => normalizarCorreo(usuario.correo) === correo)) {
      return { ok: false, mensaje: "Este correo ya está registrado." };
    }

    const nuevoUsuario = {
      nombre: String(datos.nombre || "").trim(),
      correo,
      edad: Number(datos.edad) || 0,
      telefono: String(datos.telefono || "").trim(),
      pais: String(datos.pais || "").trim(),
      password: String(datos.password || "")
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    return {
      ok: true,
      mensaje: "Usuario registrado correctamente."
    };
  }

  function iniciarSesion(correo, pass) {
    const usuario = obtenerUsuarioPorCorreo(correo);

    if (!usuario) {
      return { ok: false, mensaje: "El correo no está registrado." };
    }

    if (String(usuario.password) !== String(pass)) {
      return { ok: false, mensaje: "La contraseña es incorrecta." };
    }

    localStorage.setItem(STORAGE_SESION, usuario.correo);

    if (window.location.pathname.endsWith("bienvenida.html") === false) {
      window.location.href = "bienvenida.html";
    }

    return {
      ok: true,
      mensaje: "Sesión iniciada correctamente."
    };
  }

  function cerrarSesion() {
    localStorage.removeItem(STORAGE_SESION);
    sessionStorage.removeItem(STORAGE_RECUPERACION);
    window.location.href = "login.html";
    return { ok: true, mensaje: "Sesión cerrada." };
  }

  function protegerPagina() {
    if (typeof document === "undefined") return false;

    const correoSesion = localStorage.getItem(STORAGE_SESION);
    const nombreUsuario = document.getElementById("nombreUsuario");

    if (!correoSesion) {
      window.location.href = "login.html";
      return false;
    }

    const usuario = obtenerUsuarioPorCorreo(correoSesion);
    if (nombreUsuario && usuario) {
      nombreUsuario.textContent = usuario.nombre || "Usuario";
    }

    const botonCerrar = document.getElementById("btnCerrarSesion");
    if (botonCerrar) {
      botonCerrar.addEventListener("click", cerrarSesion);
    }

    return true;
  }

  async function enviarCodigo(correo) {
    const usuario = obtenerUsuarioPorCorreo(correo);

    if (!usuario) {
      return { ok: false, mensaje: "El correo no está registrado." };
    }

    const codigo = generarCodigo();
    const expira = Date.now() + 10 * 60 * 1000;

    const recuperacion = {
      correo: usuario.correo,
      codigo,
      expira
    };

    sessionStorage.setItem(STORAGE_RECUPERACION, JSON.stringify(recuperacion));

    if (MODO_SIMULADO) {
      mostrarMensajeGlobal(`Modo simulado: tu código es ${codigo}`, "exito");
      return {
        ok: true,
        mensaje: "Código enviado correctamente (modo simulado).",
        codigo
      };
    }

    const emailjsDisponible = typeof window !== "undefined" && window.emailjs;

    if (emailjsDisponible) {
      try {
        await window.emailjs.send(
          "service_id",
          "template_id",
          {
            to_email: usuario.correo,
            to_name: usuario.nombre || "Usuario",
            codigo: codigo
          }
        );

        return {
          ok: true,
          mensaje: "Código enviado a tu correo electrónico."
        };
      } catch (error) {
        console.error("Error al enviar el correo con EmailJS:", error);
        return {
          ok: false,
          mensaje: "No se pudo enviar el correo. Revisa tu configuración de EmailJS."
        };
      }
    }

    mostrarMensajeGlobal(`Código generado (sin EmailJS): ${codigo}`, "exito");
    return {
      ok: true,
      mensaje: "Código generado correctamente.",
      codigo
    };
  }

  function verificarCodigo(codigoIngresado) {
    const datos = sessionStorage.getItem(STORAGE_RECUPERACION);

    if (!datos) {
      return { ok: false, mensaje: "No hay una recuperación activa." };
    }

    const recuperacion = JSON.parse(datos);
    const codigo = String(codigoIngresado || "").trim();

    if (Date.now() > recuperacion.expira) {
      return { ok: false, mensaje: "El código ha expirado. Solicita uno nuevo." };
    }

    if (codigo !== String(recuperacion.codigo)) {
      return { ok: false, mensaje: "El código ingresado es incorrecto." };
    }

    return { ok: true, mensaje: "Código verificado correctamente." };
  }

  function cambiarPassword(correo, nuevaPassword) {
    const usuarios = leerUsuarios();
    const correoNormalizado = normalizarCorreo(correo);
    const indice = usuarios.findIndex((usuario) => normalizarCorreo(usuario.correo) === correoNormalizado);

    if (indice === -1) {
      return { ok: false, mensaje: "No existe un usuario con ese correo." };
    }

    if (!nuevaPassword || String(nuevaPassword).length < 8) {
      return { ok: false, mensaje: "La nueva contraseña debe tener al menos 8 caracteres." };
    }

    usuarios[indice].password = String(nuevaPassword);
    guardarUsuarios(usuarios);

    if (localStorage.getItem(STORAGE_SESION) === correoNormalizado) {
      localStorage.setItem(STORAGE_SESION, correoNormalizado);
    }

    sessionStorage.removeItem(STORAGE_RECUPERACION);

    return {
      ok: true,
      mensaje: "Contraseña actualizada correctamente."
    };
  }

  if (typeof window !== "undefined") {
    window.registrarUsuario = registrarUsuario;
    window.iniciarSesion = iniciarSesion;
    window.cerrarSesion = cerrarSesion;
    window.protegerPagina = protegerPagina;
    window.enviarCodigo = enviarCodigo;
    window.verificarCodigo = verificarCodigo;
    window.cambiarPassword = cambiarPassword;
    window.MODO_SIMULADO = MODO_SIMULADO;

    document.addEventListener("DOMContentLoaded", function () {
      const pathname = window.location.pathname.split("/").pop() || "";
      if (pathname === "bienvenida.html") {
        protegerPagina();
      }
    });
  }
})();
