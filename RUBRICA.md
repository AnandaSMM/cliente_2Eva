# **Trimestre 2. Práctica 1: Desarrollo de una Aplicación Web Dinámica con JavaScript y Node.js**

## **Objetivo**
El objetivo de esta práctica es desarrollar una aplicación web dinámica utilizando **JavaScript en el cliente y Node.js en el servidor**, integrando funcionalidades avanzadas vistas durante el trimestre como **geolocalización, almacenamiento de cookies, notificaciones, llamadas AJAX con `fetch` y una base de datos**.

La temática del proyecto es de libre elección por parte del grupo tanto con diseño como con dificultad pero debe cumplir con la inclusión de los requisitos de una manera razonable.

---

## Formación de grupos

Los grupos formados deberán ser de 3 estudiantes. 
Excepcionalmente se permiten 2 estudiantes o 4 estudiantes.

---

## **Requisitos**

Cada aplicación debe incluir:

### **1. Desarrollo Frontend (HTML, CSS, JavaScript)**
- **Geolocalización**: Obtener la ubicación del usuario mediante la API de Geolocalización y utilizarla dentro de la aplicación.
  - Para mostrarla se puede utilizar un servicio de mapa como Leaflet, Google Maps, etc.
- **Cookies**: Almacenar datos relevantes del usuario (como preferencias, configuraciones o historial) y recuperarlos en futuras visitas.
  - La configuración de la cookie debe adaptarse a las necesidades de la misma, estableciendo los parámetros opcionales necesarios.
- **Notificaciones**: Implementar notificaciones en el navegador que informen o alerten al usuario.
- **AJAX con Fetch**: Realizar llamadas con Fetch para enviar y recibir información de la base de datos.

### **2. Desarrollo Backend (Node.js, Express, Base de Datos)**
- **Obligatorio el uso de Node.js y Express** para gestionar la lógica del servidor.
- La API debe contar con los **cuatro tipos de operaciones HTTP:**
  - `GET` → Consultar información desde la base de datos.
  - `POST` → Enviar y almacenar datos en la base de datos.
  - `PUT` o `PATCH` → Modificar datos almacenados en la base de datos.
  - `DELETE` → Eliminar datos almacenados en la base de datos.
- **Base de Datos:**  
  - Debe haber al menos **un CRUD** completo con una tabla que no sea la de usuarios. 
  - Se **valora más** el uso de bases de datos NoSQL (MongoDB, Firebase Firestore, IndexedDB, etc). 
    - Trabajar con objetos es un objetivo claro de este módulo por lo que es más valorable. 
  - Se permite el uso de bases de datos relacionales (MySQL, PostgreSQL, SQLite) solo en niveles más bajos de la evaluación.

---

## **Criterios de Evaluación y Rúbrica**

Cada criterio será evaluado considerando **su implementación, dificultad y creatividad**.

| Criterio | Excelente (100%) | Muy Bien (75%) | Suficiente (50%) | Insuficiente (25%) | Requiere Apoyo (0%) |
|----------|------------------|------------------|----------------|----------------|----------------|
| **Geolocalización (1 punto)** | Implementación avanzada y creativa, con integración en la lógica de la aplicación. Uso eficiente de coordenadas y mapas. | Correcta implementación e integración en la aplicación con alguna funcionalidad adicional. | Se obtiene la ubicación y se usa mínimamente en la aplicación. | Se obtiene la ubicación, pero con errores o sin utilidad clara en la aplicación. | No se implementa o no funciona. |
| **Cookies (1 punto)** | Uso eficiente, dinámico y bien integrado con otras funcionalidades de la aplicación. | Correcto almacenamiento y recuperación de cookies con integración básica en la app. | Se usan cookies, pero sin funcionalidades dinámicas o con datos básicos. | Se intentan implementar, pero presentan errores o no se recuperan correctamente. | No se implementan cookies. |
| **Notificaciones (1 punto)**  | Notificaciones interactivas, creativas y con utilidad real en la app. | Notificaciones bien implementadas, aunque sin personalización avanzada. | Se usan notificaciones básicas sin interacción adicional. | Se intentan implementar, pero no funcionan correctamente. | No se implementan notificaciones. |
| **AJAX con Fetch (3 puntos)** | Uso de `fetch` con múltiples peticiones bien programadas, estructura modular y manejo avanzado de errores. Se muestran mensajes de éxito o fallo al usuario. | Uso correcto de `fetch`, estructura clara y manejo básico de errores. Se indican respuestas al usuario. | Se hacen peticiones `fetch`, pero sin manejo estructurado de errores o respuestas al usuario. | Se intenta usar `fetch`, pero con errores en la programación o sin respuesta clara. | No se usa `fetch` o no funciona. |
| **Base de Datos y API REST (3 puntos)**  | API REST bien estructurada con los 4 métodos (`GET`, `POST`, `PUT/PATCH`, `DELETE`) y la implementación completa de errores, códigos respuesta, etc. Uso de NoSQL con diseño eficiente de datos. | API REST implementada correctamente con NoSQL, pero con funcionalidades básicas. | API REST funcional, pero se usa SQL en vez de NoSQL. | API REST incompleta (faltan métodos) o base de datos SQL con problemas de diseño o persistencia. | No se implementa API REST o base de datos. |
| **Documentación (1 punto)** | Código bien comentado y `README.md` detallado con pasos de instalación, uso y explicación del proyecto. | Código comentado en partes clave y `README.md` con instrucciones básicas. | Poca documentación en el código, `README.md` escueto o incompleto. | Apenas hay comentarios en el código y `README.md` poco útil. | No hay documentación ni `README.md`. |

---

## **Puntos Extra (Opcionales)**
El 10% de la parte opcional de la calificación del trimestre se valora con partes extras de la aplicación:

| Extra | Descripción | Puntuación |
|----------|------------|------------|
| **Desplegar la aplicación en un servidor** | Subir la aplicación a un servidor accesible en la nube. | +0.5 puntos |
| **Implementar autenticación (JWT, Firebase, Passport.js, etc.)** | Añadir un sistema de autenticación seguro. | +0.5 puntos |


---

## **Organización del Trabajo**
- **Formato de entrega:** Código en GitHub o en un archivo `.zip`.
- **Instrucciones de instalación:** Documento `README.md` con instrucciones para ejecutar la aplicación.
- **Trabajo en grupo:** Se recomienda **trabajar en equipos de 3 personas**. Si un equipo es de menos integrantes, se valorará la dificultad de la implementación.
- **Fecha entrega:**: Semana 04-07 marzo
- **Fecha defensa**: Semana 04-07 marzo

---

### **Notas Adicionales**
- Se valorará la creatividad y la complejidad de la aplicación.
- La implementación de bases de datos y API REST debe estar **bien documentada** en los comentarios del código o en el `README.md`.
- La validación de formularios se entiende que debe estar en cada movimiento con respecto a la base de datos. 
  - Tiene valor en puntuación en las partes de AJAX con Fetch y Bases de datos y API REST.
  - Se recomienda el uso de **regex** aunque no es obligatorio si la validación es suficientemente completa con toros formatos.

---

