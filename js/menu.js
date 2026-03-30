let listaTests = [];

fetch("data/tests.json")

.then(res => res.json())

.then(tests => {

listaTests = tests;

mostrarTests(listaTests);

});

/* MOSTRAR TESTS */

function mostrarTests(tests){

const menu = document.getElementById("menu-tests");

menu.innerHTML = "";

tests.forEach(test => {

const link = document.createElement("a");

link.href = `tests/test.html?archivo=${test.archivo}`;

link.textContent = test.titulo;

link.classList.add("test-link");

menu.appendChild(link);

});

}

/* BUSCADOR */

const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");

buscador.addEventListener("input", function(){

const texto = this.value.toLowerCase();

if(texto.length === 0){

sugerencias.innerHTML = "";
mostrarTests(listaTests);
return;

}

const resultados = listaTests.filter(test =>
test.titulo.toLowerCase().includes(texto)
);

/* MOSTRAR SUGERENCIAS */

sugerencias.innerHTML = "";

resultados.slice(0,5).forEach(test => {

const div = document.createElement("div");

div.classList.add("sugerencia");

div.textContent = test.titulo;

div.addEventListener("click", () => {

window.location.href = `tests/test.html?archivo=${test.archivo}`;

});

sugerencias.appendChild(div);

});

/* FILTRAR MENU */

mostrarTests(resultados);

});