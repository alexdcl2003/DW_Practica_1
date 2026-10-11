(() => {
	"use strict";

	const MENSAJE_EXITO = "Operación simulada con éxito";

	const resultado = (valido, mensaje = "") => ({ valido, mensaje });

	function validarObligatorio(valor) {
		return resultado(String(valor ?? "").trim().length > 0, "Este campo es obligatorio.");
	}

	function validarCorreo(valor) {
		const correo = String(valor ?? "").trim();
		const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
		return resultado(formatoCorreo.test(correo), "Ingresa un correo electrónico válido.");
	}

	function validarPassword(valor) {
		const password = String(valor ?? "");
		const esValida = password.length >= 8 && /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) && /\d/.test(password);
		return resultado(esValida, "Debe tener al menos 8 caracteres, una letra y un número.");
	}

	function validarEdad(valor) {
		const edad = String(valor ?? "").trim();
		return resultado(/^\d+$/.test(edad) && Number(edad) >= 18 && Number(edad) <= 99, "La edad debe ser un entero entre 18 y 99 años.");
	}

	function validarTelefono(valor) {
		return resultado(/^\d{10}$/.test(String(valor ?? "").trim()), "El teléfono debe tener exactamente 10 dígitos.");
	}

	function validarConfirmacionPassword(valor, password) {
		return resultado(String(valor ?? "") === String(password ?? ""), "Las contraseñas deben coincidir.");
	}

	function validarSelect(valor) {
		return resultado(String(valor ?? "").trim().length > 0, "Selecciona una opción.");
	}

	function validarCodigo(valor) {
		return resultado(/^\d{6}$/.test(String(valor ?? "").trim()), "El código debe tener 6 dígitos.");
	}

	function obtenerInput(elemento) {
		if (!elemento) return null;
		if (elemento.matches && elemento.matches("input, select, textarea")) return elemento;
		return elemento.querySelector("input, select, textarea");
	}

	function obtenerMensajeError(input) {
		const campo = input.closest(".campo");
		const idDescrito = input.getAttribute("aria-describedby");
		return (idDescrito && document.getElementById(idDescrito.split(/\s+/)[0]))
			|| (campo && campo.querySelector("small.error-msg, small.error-texto, small"));
	}

	function mostrarError(elemento, mensaje) {
		const input = obtenerInput(elemento);
		if (!input) return;

		const mensajeError = obtenerMensajeError(input);
		input.classList.add("invalido");
		input.classList.remove("valido");
		input.setAttribute("aria-invalid", "true");
		if (mensajeError) mensajeError.textContent = mensaje;
	}

	function mostrarExito(elemento, mensaje = "") {
		const input = obtenerInput(elemento);
		if (!input) return;

		const mensajeError = obtenerMensajeError(input);
		input.classList.add("valido");
		input.classList.remove("invalido");
		input.setAttribute("aria-invalid", "false");
		if (mensajeError) mensajeError.textContent = mensaje;
	}

	function validarCampo(input) {
		const form = input.form;
		const valor = input.value;
		let validacion;

		if (input.id === "correo" || input.id === "loginCorreo" || input.id === "correoRec") {
			validacion = validarCorreo(valor);
		} else if (input.id === "password" || input.id === "loginPassword" || input.id === "nuevaPassword") {
			validacion = validarPassword(valor);
		} else if (input.id === "confirmPassword") {
			validacion = validarConfirmacionPassword(valor, form.elements.password.value);
		} else if (input.id === "confirmNuevaPassword") {
			validacion = validarConfirmacionPassword(valor, form.elements.nuevaPassword.value);
		} else if (input.id === "edad") {
			validacion = validarEdad(valor);
		} else if (input.id === "telefono") {
			validacion = validarTelefono(valor);
		} else if (input.id === "pais") {
			validacion = validarSelect(valor);
		} else if (input.id === "codigoRec") {
			validacion = validarCodigo(valor);
		} else {
			validacion = validarObligatorio(valor);
		}

		if (validacion.valido) {
			mostrarExito(input);
		} else {
			mostrarError(input, validacion.mensaje);
		}

		return validacion.valido;
	}

	function obtenerCampos(form) {
		return Array.from(form.querySelectorAll("input, select, textarea"));
	}

	function validarFormulario(form) {
		const campos = obtenerCampos(form);
		const camposInvalidos = campos.filter((input) => !validarCampo(input));
		if (camposInvalidos.length) {
			camposInvalidos[0].focus();
			return false;
		}
		return true;
	}

	function mostrarMensaje(form, mensaje, tipo) {
		const contenedor = form.closest(".tarjeta")?.querySelector("#mensajeForm")
			|| document.getElementById("mensajeForm");
		if (!contenedor) return;

		contenedor.textContent = mensaje;
		contenedor.className = `mensaje ${tipo}`;
	}

	function cambiarPaso(numero) {
		[1, 2, 3].forEach((paso) => {
			const contenedor = document.getElementById(`paso${paso}`);
			if (contenedor) contenedor.classList.toggle("oculto", paso !== numero);
		});
	}

	function obtenerDatos(form) {
		return Object.fromEntries(new FormData(form).entries());
	}

	async function ejecutarOperacion(form, datos) {
		let respuesta;

		try {
			if (form.id === "formRegistro") {
				respuesta = await window.registrarUsuario(datos);
			} else if (form.id === "formLogin") {
				respuesta = await window.iniciarSesion(datos.loginCorreo, datos.loginPassword);
			} else if (form.id === "formCorreoRec") {
				respuesta = await window.enviarCodigo(datos.correoRec);
			} else if (form.id === "formCodigo") {
				respuesta = await window.verificarCodigo(datos.codigoRec);
			} else if (form.id === "formNuevaPass") {
				const recuperacion = JSON.parse(sessionStorage.getItem("recuperacion") || "null");
				respuesta = await window.cambiarPassword(recuperacion?.correo, datos.nuevaPassword);
			}
		} catch (error) {
			console.error("Error en la operación del formulario:", error);
			respuesta = { ok: false, mensaje: "No se pudo completar la operación." };
		}

		const resultadoOperacion = respuesta || { ok: false, mensaje: "Operación no disponible." };
		mostrarMensaje(form, resultadoOperacion.mensaje, resultadoOperacion.ok ? "exito" : "error");

		if (!resultadoOperacion.ok) return;
		if (form.id === "formCorreoRec") cambiarPaso(2);
		if (form.id === "formCodigo") cambiarPaso(3);
	}

	function instalarMocks() {
		const mock = () => new Promise((resolve) => {
			window.setTimeout(() => resolve({ ok: true, mensaje: MENSAJE_EXITO }), 400);
		});
		const funciones = ["registrarUsuario", "iniciarSesion", "enviarCodigo", "verificarCodigo", "cambiarPassword"];

		funciones.forEach((nombre) => {
			if (typeof window[nombre] !== "function") window[nombre] = mock;
		});
	}

	function iniciarValidacion() {
		instalarMocks();
		const formularios = document.querySelectorAll("form[id]");

		formularios.forEach((form) => {
			if (form.dataset.validacionInstalada === "true") return;
			form.dataset.validacionInstalada = "true";

			const campos = obtenerCampos(form);
			campos.forEach((input) => {
				input.addEventListener("input", () => validarCampo(input));
				input.addEventListener("blur", () => validarCampo(input));
			});

			form.addEventListener("submit", async (event) => {
				event.preventDefault();
				if (!validarFormulario(form)) {
					mostrarMensaje(form, "Revisa los campos marcados.", "error");
					return;
				}
				await ejecutarOperacion(form, obtenerDatos(form));
			});
		});
	}

	if (typeof window !== "undefined") {
		Object.assign(window, {
			validarObligatorio,
			validarCorreo,
			validarPassword,
			validarEdad,
			validarTelefono,
			validarConfirmacionPassword,
			validarSelect,
			mostrarError,
			mostrarExito
		});
	}

	if (typeof document !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", iniciarValidacion, { once: true });
		} else {
			iniciarValidacion();
		}
	}
})();
