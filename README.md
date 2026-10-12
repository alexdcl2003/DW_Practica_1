# DW_Practico_1 · Formulario web con registro, inicio de sesión y recuperación de contraseña

Práctica 1 de **Desarrollo Web** (Software, modalidad presencial) · Facultad de Ciencias e Ingeniería · Universidad Estatal de Milagro (UNEMI).

## Descripción

Aplicación web **front-end** que permite crear una cuenta, iniciar sesión y recuperar la contraseña mediante un código de 6 dígitos. Todos los formularios se validan del lado del cliente, muestran mensajes de error o éxito y **no se envían mientras existan datos inválidos**.

No hay servidor ni base de datos: los usuarios se guardan en el navegador (`localStorage`), por lo que es una **simulación con fines académicos**.

**Objetivo de la práctica:** desarrollar un formulario web con HTML5, CSS y JavaScript, aplicando estilos, eventos y validaciones del lado del cliente para garantizar el ingreso correcto de los datos.

## Tecnologías utilizadas

- **HTML5**: estructura semántica (`main`, `section`, `header`, `footer`), `form`, `label`, `input`, `select`, `button` y atributos como `required`, `placeholder`, `min`, `max`, `minlength`, `pattern`.
- **CSS3**: variables CSS, Flexbox, CSS Grid, transiciones, estados `:hover` y `:focus`, y diseño responsivo con media queries.
- **JavaScript (ES6+, sin librerías)**: manipulación del DOM, eventos `input`, `blur` y `submit`, validaciones y lógica de autenticación.
- **Web Storage**: `localStorage` (usuarios y sesión) y `sessionStorage` (código de recuperación).
- **Google Fonts**: tipografía *Plus Jakarta Sans*.
- **Git y GitHub**: control de versiones y trabajo colaborativo.

## Funcionalidades implementadas

### Registro (`index.html`)
- Formulario con 7 campos: nombre, correo, edad, teléfono, país (lista desplegable), contraseña y confirmación.
- Rechaza correos que ya estén registrados.
- Al registrarse, guarda el usuario en el navegador.

### Inicio de sesión (`login.html`)
- Verifica correo y contraseña, e informa si el correo no existe o la contraseña es incorrecta.
- Si los datos son correctos, abre la página de bienvenida (`bienvenida.html`).
- La página de bienvenida está protegida: sin sesión activa redirige al login. Incluye botón para cerrar sesión.

### Recuperación de contraseña (`recuperar.html`)
Proceso en tres pasos dentro de la misma página:
1. Se ingresa el correo registrado.
2. Se genera un código de 6 dígitos (válido por 10 minutos) y se ingresa para verificarlo.
3. Se define una nueva contraseña con su confirmación.

En **modo simulado** (`MODO_SIMULADO = true` en `js/auth.js`) el código se muestra en pantalla en lugar de enviarse por correo. Para enviarlo por correo real hay que configurar EmailJS en `js/auth.js` y cambiar esa constante a `false`.

### Validaciones del lado del cliente
| Campo | Regla |
|---|---|
| Campos obligatorios | No pueden estar vacíos |
| Nombre | Obligatorio |
| Correo | Formato válido (`usuario@dominio.ext`) |
| Edad | Número entero entre 18 y 99 |
| Teléfono | Exactamente 10 dígitos numéricos |
| País | Debe seleccionarse una opción |
| Contraseña | Mínimo 8 caracteres, con al menos una letra y un número |
| Confirmación | Debe coincidir con la contraseña |
| Código de recuperación | 6 dígitos |

- Validación en tiempo real (eventos `input` y `blur`) y al enviar (`submit`).
- Mensajes de error bajo cada campo y mensaje general de error o éxito.
- Campos marcados en rojo (inválido) o verde (válido).
- El envío se bloquea mientras existan datos inválidos.

### Diseño responsivo
- Diseño pensado primero para celular, con ajustes para tabletas (≥ 600 px) y escritorio (≥ 1024 px).
- En escritorio, el registro se organiza en dos columnas con CSS Grid.

## Estructura del proyecto

```
DW_Practico_1/
├── index.html          # Registro
├── login.html          # Inicio de sesión
├── recuperar.html      # Recuperación de contraseña
├── bienvenida.html     # Página tras iniciar sesión
├── css/
│   ├── variables.css   # Colores, tipografía, sombras y radios
│   └── style.css       # Estilos y diseño responsivo
├── js/
│   ├── script.js       # Validaciones y eventos de los formularios
│   └── auth.js         # Registro, login, sesión y recuperación
└── README.md
```

## Cómo ejecutarlo

1. Clonar el repositorio:
   ```bash
   git clone <URL-DEL-REPOSITORIO>
   ```
2. Abrir `index.html` en el navegador (doble clic, o con la extensión *Live Server* de VS Code).
3. Probar el flujo: registrarse → iniciar sesión → cerrar sesión → recuperar contraseña.

No requiere instalar dependencias.

## Limitaciones

- Es una simulación front-end: los datos viven en el navegador y se pierden si se borra el almacenamiento del sitio.
- Las contraseñas se guardan **sin cifrar** en `localStorage`, por lo que no es apto para producción.
- El código de recuperación se genera y valida en el navegador.

## Integrantes

| Integrante | Responsabilidad |
|---|---|
| [Nombre del integrante 1] | HTML del registro (`index.html`) |
| [Nombre del integrante 2] | HTML de login, recuperación y bienvenida |
| [Nombre del integrante 3] | Estilos (`css/`) |
| [Nombre del integrante 4] | Validaciones (`js/script.js`) |
| [Nombre del integrante 5] | Autenticación (`js/auth.js`) |

## Datos académicos

- **Asignatura:** Desarrollo Web
- **Docente de la asignatura:** Guevara Reyes Rodrigo Josue
- **Docente de la práctica:** Almache Sanisaca Mariana Madeleine
- **Institución:** Universidad Estatal de Milagro (UNEMI)
