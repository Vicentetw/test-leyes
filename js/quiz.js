let preguntasJSON = [];
let preguntasSeleccionadas = [];
let respondidas = 0;
let detenerAnimacion = false;

/* ---------------- DETECTAR JSON DESDE URL ---------------- */

const params = new URLSearchParams(window.location.search);
const archivo = params.get("archivo");

if (!archivo) {
alert("No se especificó el test");
throw new Error("archivo no definido");
}

/* ---------------- CARGAR PREGUNTAS ---------------- */

fetch("../data/" + archivo)
.then(res => res.json())
.then(data => {

if (!Array.isArray(data)) {
console.error("El JSON no es un array de preguntas");
return;
}

preguntasJSON = data;

console.log("Preguntas cargadas:", preguntasJSON.length);

})
.catch(error => {
console.error("Error cargando JSON:", error);
});

/* ---------------- MEZCLAR ARRAY ---------------- */

function mezclarArray(array){

for(let i=array.length-1;i>0;i--){

const j=Math.floor(Math.random()*(i+1));

[array[i],array[j]]=[array[j],array[i]];

}

return array;

}

/* ---------------- MEZCLAR OPCIONES ---------------- */

function mezclarOpciones(pregunta){

const copia = {...pregunta};

const opciones = copia.opciones.map((texto,index)=>({
texto,
correcta:index===copia.correcta
}));

mezclarArray(opciones);

copia.opciones = opciones.map(o=>o.texto);
copia.correcta = opciones.findIndex(o=>o.correcta);

return copia;

}

/* ---------------- CARGAR PREGUNTAS ---------------- */

function cargarPreguntas(){

const contenedor = document.getElementById("quiz-container");

contenedor.innerHTML = "";

respondidas = 0;

document.getElementById("progress-bar").style.width = "0%";

preguntasSeleccionadas.forEach((p, index) => {

    const pregunta = mezclarOpciones(p);
    preguntasSeleccionadas[index] = pregunta;

    const div = document.createElement("div");
    div.classList.add("pregunta");

    // 📌 PREGUNTA (segura)
    const titulo = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${index + 1}. ${pregunta.pregunta}`;
    titulo.appendChild(strong);
    div.appendChild(titulo);

    // 📌 OPCIONES
    pregunta.opciones.forEach((op, i) => {

        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + index;
        input.value = i;

        // Evento
        input.addEventListener("change", () =>
            verificarRespuesta(index, i, pregunta.correcta, div)
        );

        // 👇 TEXTO SEGURO (CLAVE)
        const texto = document.createTextNode(" " + op);

        label.appendChild(input);
        label.appendChild(texto);

        div.appendChild(label);
    });

    // 📌 FEEDBACK
    const feedback = document.createElement("span");
    feedback.classList.add("feedback");
    div.appendChild(feedback);

    contenedor.appendChild(div);
});

actualizarContador();
}

/* ---------------- VERIFICAR RESPUESTA ---------------- */

function verificarRespuesta(index,seleccion,correcta,div){

const radios=div.querySelectorAll("input");
radios.forEach(r=>r.disabled=true);

const labels=div.querySelectorAll("label");
labels[correcta].classList.add("correcta");

let texto="";

if(seleccion===correcta){

texto="✅ Correcto";

}else{

labels[seleccion].classList.add("incorrecta");

texto="❌ Incorrecto. Respuesta correcta: "
+ preguntasSeleccionadas[index].opciones[correcta];

}

/* MOSTRAR EXPLICACION SI EXISTE */

if(preguntasSeleccionadas[index].explicacion){
texto += "\n💡 " + preguntasSeleccionadas[index].explicacion;
}

div.querySelector(".feedback").textContent = texto;

respondidas++;

actualizarProgreso();
actualizarContador();

}

/* ---------------- PROGRESO ---------------- */

function actualizarProgreso(){

const total=preguntasSeleccionadas.length;

if(total===0) return;

const porcentaje=(respondidas/total)*100;

document.getElementById("progress-bar").style.width=porcentaje+"%";

}

/* ---------------- CONTADOR ---------------- */

function actualizarContador(){

const total=preguntasSeleccionadas.length;

document.getElementById("contador").innerText=
`Respondidas: ${respondidas} / ${total}`;

}

/* ---------------- RESULTADO FINAL ---------------- */

document.getElementById("resultadoBtn").addEventListener("click",()=>{

let puntaje=0;

const radios=document.querySelectorAll("input[type=radio]:checked");

radios.forEach(radio=>{

const q=parseInt(radio.name.replace("q",""));

if(parseInt(radio.value)===preguntasSeleccionadas[q].correcta){
puntaje++;
}

});

const total=preguntasSeleccionadas.length;

if(total===0){

document.getElementById("resultado").innerText="Primero inicia el cuestionario";
return;

}

const porcentaje=Math.round((puntaje/total)*100);

const resultado=document.getElementById("resultado");

resultado.innerText=`Resultado: ${puntaje} / ${total} correctas (${porcentaje}%)`;

if(porcentaje>=80) resultado.style.color="green";
else if(porcentaje>=50) resultado.style.color="orange";
else resultado.style.color="red";

/* CELEBRACION */

mostrarCelebracion(porcentaje);

});

/* ---------------- INICIAR QUIZ ---------------- */

document.getElementById("iniciarQuiz").addEventListener("click",()=>{

if(preguntasJSON.length===0){

alert("Las preguntas aún no cargaron");
return;

}

const seleccion=document.getElementById("cantidadPreguntas").value;

mezclarArray(preguntasJSON);

if(seleccion==="todas"){

preguntasSeleccionadas=[...preguntasJSON];

}else{

preguntasSeleccionadas=preguntasJSON.slice(0,parseInt(seleccion));

}

cargarPreguntas();

});

/* ---------------- CELEBRACION ---------------- */

function mostrarCelebracion(porcentaje){

detenerAnimacion = false;

if(porcentaje>=90){
fireworks(12);
}
else if(porcentaje>=70){
confetti(150);
}

setTimeout(()=>{
detenerAnimacion = true;   // detiene confetti
mostrarTextoAnimado(porcentaje);
},500);

}

/* ---------------- CONFETTI ---------------- */

function confetti(cantidad){

const canvas=document.getElementById("celebrationCanvas");
if(!canvas) return;

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let piezas=[];

for(let i=0;i<cantidad;i++){

piezas.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
r:Math.random()*6+2,
vy:Math.random()*3+1
});

}

let frames=0;

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

piezas.forEach(p=>{

ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`;
ctx.fill();

p.y+=p.vy;

if(p.y>canvas.height) p.y=0;

});

frames++;

if(frames<180 && !detenerAnimacion){
requestAnimationFrame(draw);
}

}

draw();

}

/* ---------------- FIREWORKS ---------------- */

function fireworks(cantidad){

const canvas=document.getElementById("celebrationCanvas");
if(!canvas) return;

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let particles=[];

for(let i=0;i<cantidad;i++){

const x=Math.random()*canvas.width;
const y=Math.random()*canvas.height/2;

for(let j=0;j<25;j++){

particles.push({
x,
y,
vx:(Math.random()-0.5)*7,
vy:(Math.random()-0.5)*7,
life:80
});

}

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{

ctx.beginPath();
ctx.arc(p.x,p.y,2,0,Math.PI*2);
ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`;
ctx.fill();

p.x+=p.vx;
p.y+=p.vy;
p.life--;

});

particles=particles.filter(p=>p.life>0);

if(particles.length>0){
requestAnimationFrame(draw);
}

}

draw();

}
/* ---------------- TEXTO ANIMADO PORCENTAJE ---------------- */

function mostrarTextoAnimado(porcentaje){

const canvas = document.getElementById("celebrationCanvas");
if(!canvas) return;

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.clearRect(0,0,canvas.width,canvas.height);

let scale = 0.2;
let alpha = 0;

let animationId;
let animacionActiva = true;

/* MENSAJE SEGUN RESULTADO */

let mensaje = "RESULTADO";

if(porcentaje >= 95) mensaje = "🏆 PERFECTO";
else if(porcentaje >= 90) mensaje = "🔥 EXCELENTE";
else if(porcentaje >= 80) mensaje = "🎉 MUY BIEN";
else if(porcentaje >= 70) mensaje = "👍 APROBADO";
else mensaje = "💪 SIGUE PRACTICANDO";

/* COLOR SEGUN RESULTADO */

let color = "#00c853";

if(porcentaje >= 90) color = "#00ff88";
else if(porcentaje >= 80) color = "#00e676";
else if(porcentaje >= 70) color = "#69f0ae";
else color = "#ff5252";

/* CLICK PARA CERRAR */

canvas.addEventListener("click", cerrarAnimacion);

function cerrarAnimacion(){

animacionActiva = false;

cancelAnimationFrame(animationId);

ctx.clearRect(0,0,canvas.width,canvas.height);

canvas.removeEventListener("click", cerrarAnimacion);

}

/* ANIMACION */

function animar(){

ctx.clearRect(0,0,canvas.width,canvas.height);

/* FONDO OSCURO */

ctx.fillStyle = "rgba(0,0,0,0.55)";
ctx.fillRect(0,0,canvas.width,canvas.height);

/* EFECTO CRECIMIENTO */

scale += (1.2 - scale) * 0.12;
alpha += (1 - alpha) * 0.08;

ctx.save();

ctx.globalAlpha = alpha;

ctx.translate(canvas.width/2, canvas.height/2);
ctx.scale(scale, scale);

/* SOMBRA */

ctx.shadowColor = "rgba(0,0,0,0.7)";
ctx.shadowBlur = 40;
ctx.shadowOffsetY = 15;

/* PORCENTAJE */

ctx.font = "900 130px Segoe UI, Arial";
ctx.textAlign = "center";

ctx.lineWidth = 8;
ctx.strokeStyle = "black";
ctx.fillStyle = color;

ctx.strokeText(`${porcentaje}%`,0,0);
ctx.fillText(`${porcentaje}%`,0,0);

/* MENSAJE */

ctx.shadowBlur = 0;

ctx.font = "800 40px Segoe UI";

ctx.lineWidth = 6;
ctx.strokeStyle = "black";
ctx.fillStyle = color;

ctx.strokeText(mensaje,0,90);
ctx.fillText(mensaje,0,90);

/* TEXTO INFERIOR */

ctx.font = "500 22px Segoe UI";
ctx.fillStyle = "white";

ctx.fillText("Click para continuar",0,140);

ctx.restore();

if(animacionActiva){
animationId = requestAnimationFrame(animar);
}

}

animar();

/* AUTOCIERRE */

setTimeout(()=>{

if(animacionActiva){
cerrarAnimacion();
}

},5000);

}


// --- Actualizar título del h1 según el test ---
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


fetch("../data/tests.json") // ojo: ruta relativa desde test.html
    .then(res => res.json())
    .then(tests => {
        const testActual = tests.find(t => t.archivo === archivo);
        if(testActual){
            document.querySelector("h1").textContent = testActual.titulo;
            document.title = testActual.titulo; //  cambia el título de la pestaña
        }
    });

    const btnVolver = document.getElementById("volverMenu");
  btnVolver.addEventListener("click", () => {
    window.location.href = "../index.html";
  });