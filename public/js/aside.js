import { cargarAmigos } from "./grupos.js";

export function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });

    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('activa');
}

document.addEventListener("DOMContentLoaded", function () {
// Asignar eventos a los botones
document.getElementById('crearSpot').addEventListener('click', () => {
    document.getElementById('aside').style.display='block';
    mostrarSeccion('seccionSpot');});
document.getElementById('amigos').addEventListener('click', () =>{ 
    document.getElementById('aside').style.display='block';
    mostrarSeccion('seccionAmigos');
});
document.getElementById('grupos').addEventListener('click', () => {
    document.getElementById('aside').style.display='block';
    mostrarSeccion('seccionGrupos'); 
    cargarAmigos(); 
});

mostrarSeccion('seccionSpot');
});

document.getElementById('flecha').addEventListener('click', () => {
    document.getElementById('aside').style.display='none';
});
