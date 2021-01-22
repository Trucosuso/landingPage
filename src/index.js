var vistaTabla = false;

$(function () {
    // Obtener la posición del usuario
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(getCountryName, positionError, options);

    getOfertasYTestimonios();

    // Botón de suscribirse lleva a la posición correcta con una animación
    let botonSuscribirse = $("#botonSuscribirse");
    botonSuscribirse.on("click", () => {
        console.log($("#formulario").position().top);
        $("html").animate({ scrollTop: $("#formulario").position().top - 100 }, 1000);
    });

    // Logo sube al principio de la página
    let logo = $("#logo");
    $(logo).on("click", () => {
        $("html").animate({ scrollTop: 0 }, 1000);
    });
    // Botón scrollear hacia arriba
    let botonSubir = $(".botonSubir");
    $(botonSubir).on("click", () => {
        $("html").animate({ scrollTop: 0 }, 1000);
    });
    // Solo muestra el botón cuando se baja a más de 700px
    $(document).on("scroll", () => {
        if ($(document).scrollTop() > 700) {
            $(botonSubir).fadeIn();
        } else {
            $(botonSubir).fadeOut();
        }
    });

    // Validación de formulario
    $("#nombre").on("keyup", function () {
        console.log(this.value);
        /** @type {RegExp} */
        let expresion = /\d/;

        if (expresion.test(this.value)) {
            this.setCustomValidity("No puede haber números");
            $("#telefono").prop("disabled", true);
            $("#telefono").attr("aria-disabled", true);
        } else {
            this.setCustomValidity("");
            $("#telefono").prop("disabled", false);
            $("#telefono").attr("aria-disabled", false);
        }
    });

    $("#telefono").on("keyup", function () {
        console.log(this.value);
        /** @type {RegExp} */
        let expresion = /^[6-9]\d{8}$/;
        console.log(expresion.test(this.value));

        if (!expresion.test(this.value)) {
            this.setCustomValidity("Escriba un teléfono válido");
            $("#email").prop("disabled", true);
            $("#email").attr("aria-disabled", true);
        } else {
            this.setCustomValidity("");
            $("#email").prop("disabled", false);
            $("#email").attr("aria-disabled", false);
        }
    });

    $("#email").on("keyup", function () {
        console.log(this.value);
        /** @type {RegExp} */
        let expresion = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        console.log(expresion.test(this.value));

        if (!expresion.test(this.value)) {
            this.setCustomValidity("Introduzca un email válido");
            $("#enviarFormulario").prop("disabled", true);
            $("#enviarFormulario").attr("aria-disabled", true);
        } else {
            this.setCustomValidity("");
            $("#enviarFormulario").prop("disabled", false);
            $("#enviarFormulario").attr("aria-disabled", false);
        }
    });


});

/**
 * Muestra el municipio del usuario y el pais al que pertenece en la consola
 * @param {GeolocationPosition} position Posicion del usuario
 */
function getCountryName(position) {
    $.ajax(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&location_type=APPROXIMATE&result_type=locality&key=AIzaSyAXSTttpYgiUnvw3p48dzYIuU_6HfhAmWA`)
        .done((response) => {
            console.log(response.results[0].formatted_address);
        })
        .fail((error) => {
            console.warn(error);
        });
}

/**
 * Maneja el error en la geolocalización
 * @param {GeolocationPositionError} error Error en geolocalización
 */
function positionError(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
}

/**
 * Obtiene un json con ofertas y testimonios, los maqueta y deja un setInterval para que se recarguen los testimonios
 */
function getOfertasYTestimonios() {
    $.ajax("ofertasYTestimonios.json")
        .done((resultado) => {
            maquetarOfertas(resultado.ofertas);
            let sectionTestimonios = $("#testimonios");
            $(sectionTestimonios).append("<header>");
            $(sectionTestimonios).find("header").append("<h1>Testimonios</h1>").append("<button id=\"cambiarVista\" class=\"boton noImportante\">Cambiar vista</button>");

            // Evento para cambiar vista
            $(sectionTestimonios).find("button").on("click", function () {
                cambiarVista();
            });

            maquetarTestimonios(resultado.testimonios);

            setInterval(cargarOtrosTestimonios, 10000);
        })
        .fail((error) => {
            console.warn(`No se han podido obtener las ofertas ni los testimonios.\nError ${error.status}: ${error.statusText}.\nReintentando`);
            setTimeout(getOfertasYTestimonios, 5000);
        });
}

/**
 * Cambia entre vista tabla y vista testimonios
 */
function cambiarVista() {
    vistaTabla = !vistaTabla;
    if (vistaTabla) {
        $("#testimonios").children("div").fadeOut(1000).promise()
            .done(() => {
                $("#testimonios").children("table").fadeIn(1000);
            });
    } else {
        $("#testimonios").children("table").fadeOut(1000).promise()
            .done(() => {
                $("#testimonios").children("div").fadeIn(1000);
            });
    }
}

/**
 * Elimina los testimonios actuales y carga nuevos. La tabla no tiene fadeOut al cargar nuevos.
 */
function cargarOtrosTestimonios() {
    let sectionTestimonios = $("#testimonios");
    $.ajax("ofertasYTestimonios.json")
        .done((resultado) => {
            $(sectionTestimonios).children("div").fadeOut(1000).promise()
                .done(() => {
                    sectionTestimonios.children("div").remove();
                    sectionTestimonios.children("table").remove();
                    maquetarTestimonios(resultado.testimonios);
                    // Si no está activada la vista tabla hacer fadeIn a los divs. Si no a la tabla
                    if (!vistaTabla) {
                        sectionTestimonios.children("div").removeClass("hidden").hide().fadeIn(1000);
                    } else {
                        sectionTestimonios.children("table").removeClass("hidden").hide().fadeIn(1000);
                    }
                });
        })
        .fail((error) => {
            console.warn(`No se han podido obtener los testimonios.\nError ${error.status}: ${error.statusText}.`);
        });
}

/**
 * Recibe un array de ofertas y los maqueta dentro del elemento con id ofertas
 * @param {Array<Object>} ofertas Ofertas a maquetar
 */
function maquetarOfertas(ofertas) {
    let sectionOfertas = $("#ofertas");
    $(sectionOfertas).append("<h1>Ofertas</h1>");
    $.each(ofertas, (index, oferta) => {
        $(sectionOfertas).append(new Oferta(oferta.titulo, oferta.texto, oferta.link, oferta.imagen));
    });

    // Hacer fadeIn de las ofertas cuando se muestren en pantalla por primera vez
    $(window).on("scroll", function () {
        $(sectionOfertas).children(".hidden").each((index, element) => {
            if ($(window).scrollTop() + $(window).height() >= $(element).position().top) {
                $(element).removeClass("hidden").hide().fadeIn(1000);
            }
        });
    });
}

/**
 * Recibe un array de testimonios y maqueta tres de ellos de forma aleatoria dentro del elemento con id testimonios. También crea una tabla oculta para cambiar la vista. Si está activada la vista tabla muestra la tabla y no los divs
 * @param {Array<Object>} testimonios Ofertas a maquetar
 */
function maquetarTestimonios(testimonios) {
    let sectionTestimonios = $("#testimonios");
    let arrayAleatorios = [];
    while (arrayAleatorios.length < 3) {
        let aleatorio = Math.floor(Math.random() * testimonios.length);
        if ($.inArray(aleatorio, arrayAleatorios) == -1) {
            arrayAleatorios.push(aleatorio);
        }
    }

    // Tabla
    let tabla = $("<table>");

    $.each(arrayAleatorios, (index, numero) => {
        // Añadir el div con el testimonio
        $(sectionTestimonios).append(new Testimonio(testimonios[numero].nombre, testimonios[numero].texto, testimonios[numero].fecha, testimonios[numero].imagen, testimonios[numero].puntuacion));
        // Añadir la fila con el testimonio
        $(tabla).append(new FilaTestimonio(testimonios[numero].nombre, testimonios[numero].texto, testimonios[numero].fecha, testimonios[numero].imagen, testimonios[numero].puntuacion));
    });

    // Si está activada la vista tabla sólo maquetar esta. Si no sólo maquetar los divs
    if (vistaTabla) {
        $.each($(sectionTestimonios).children("div"), (index, elemento) => {
            console.log(elemento);
            $(elemento).css("display", "none");
        });
    } else {
        $(tabla).css("display", "none");
    }

    sectionTestimonios.append(tabla);

    // Hacer fadeIn de las ofertas cuando se muestren en pantalla por primera vez
    $(window).on("scroll", function () {
        $(sectionTestimonios).children(".hidden").each((index, element) => {
            if ($(window).scrollTop() + $(window).height() >= $(element).position().top) {
                if (!vistaTabla) {
                    $(element).removeClass("hidden").hide().fadeIn(1000);
                }
            }
        });
    });
}

/**
 * Elemento HTML que representa una oferta ofrecida por la tienda
 */
class Oferta extends HTMLDivElement {
    /**
     * Crea una oferta
     * @param {String} titulo Título de la oferta
     * @param {String} texto Texto de la oferta
     * @param {String} enlace Enlace a la oferta
     * @param {String} imagen URL a la imagen de la oferta
     */
    constructor(titulo, texto, enlace, imagen) {
        super();
        $(this).addClass("tarjeta oferta hidden");
        $(this)
            .append(`<h2>${titulo}</h2>`)
            .append(`<a href="${enlace}"><svg viewBox="0 0 24 24" fill="black" role="img" class="icono"><title>Comprar</title><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg></a>`)
            .append(`<p>${texto}</p>`)
            .append(`<img src="${imagen}" alt="">`);
    }
}

/**
 * Elemento HTML que representa testimonios sobre la tienda dejados por los clientes
 */
class Testimonio extends HTMLDivElement {
    /**
     * Crea un testimonio
     * @param {String} nombre Nombre del cliente
     * @param {String} texto Testimonio del cliente
     * @param {String} fecha Fecha del testimonio
     * @param {String} imagen URL a la imagen del cliente
     * @param {Number} puntuacion Puntuación otorgada por el cliente. Máximo 10
     */
    constructor(nombre, texto, fecha, imagen, puntuacion) {
        super();
        $(this).addClass("tarjeta testimonio hidden");
        $(this)
            .append(`<h2>${nombre}</h2>`)
            .append(`<p>${texto}</p>`)
            .append(`<img src="${imagen}" alt="${nombre}">`)
            .append("<p class=\"puntuacion\">");

        // Añadir las estrellas correspondientes. Máximo 5.
        let i = 1;
        for (i; i <= puntuacion / 2; i++) {
            $(".puntuacion", this).append("<img src=\"resources/estrella.svg\" alt=\"\" class=\"estrella\">");
        }
        if (i - puntuacion / 2 == 0.5) {
            $(".puntuacion", this).append("<img src=\"resources/mediaEstrella.svg\" alt=\"\" class=\"media estrella\">");
        }

        $(this).append(`<p>${fecha}</p>`);
    }
}

/**
 * Fila de tabla HTML que representa testimonios sobre la tienda dejados por los clientes
 */
class FilaTestimonio extends HTMLTableRowElement {
    /**
     * Crea un testimonio
     * @param {String} nombre Nombre del cliente
     * @param {String} texto Testimonio del cliente
     * @param {String} fecha Fecha del testimonio
     * @param {String} imagen URL a la imagen del cliente
     * @param {Number} puntuacion Puntuación otorgada por el cliente. Máximo 10
     */
    constructor(nombre, texto, fecha, imagen, puntuacion) {
        super();
        $(this)
            .append(`<td>${nombre}</td>`)
            .append(`<td>${texto}</td>`)
            .append(`<td><img src="${imagen}" alt="${nombre}"></td>`)
            .append("<td class=\"puntuacion\">");

        // Añadir las estrellas correspondientes. Máximo 5.
        let i = 1;
        for (i; i <= puntuacion / 2; i++) {
            $(".puntuacion", this).append("<img src=\"resources/estrella.svg\" alt=\"\" class=\"estrella\">");
        }
        if (i - puntuacion / 2 == 0.5) {
            $(".puntuacion", this).append("<img src=\"resources/mediaEstrella.svg\" alt=\"\" class=\"media estrella\">");
        }

        $(this).append(`<td>${fecha}</td>`);
    }
}


/* Definir custom elements */
customElements.define("oferta-pizzeria", Oferta, { extends: "div" });
customElements.define("testimonio-pizzeria", Testimonio, { extends: "div" });
customElements.define("fila-testimonio", FilaTestimonio, { extends: "tr" });