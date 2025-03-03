function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });

    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('activa');
}

// Asignar eventos a los botones
document.getElementById('crearSpot').addEventListener('click', () => mostrarSeccion('seccionSpot'));
document.getElementById('amigos').addEventListener('click', () => mostrarSeccion('seccionAmigos'));
document.getElementById('grupos').addEventListener('click', () => mostrarSeccion('seccionGrupos'));

mostrarSeccion('seccionAmigos');