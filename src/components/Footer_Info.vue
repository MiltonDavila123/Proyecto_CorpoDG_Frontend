<template>

        <footer>
            <div class="footer-flex">
                <div class="logos-contacto">
                    <div class="info-extra">
                        <h3>Información</h3>
                        <p>Teléfono: <a href="https://wa.me/593984235152" target="_blank" rel="noopener">098 423 5152</a></p>
                        <p>Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=corpodg@outlook.com" target="_blank" rel="noopener">corpodg@outlook.com</a></p>
                    </div>
                    <div class="logo-superior">
                        <img src="/src/assets/images/IATA-Logo.png" alt="Logo Superior" class="footer-logo-superior" width="200" height="100"/>
                    </div>
                    <div class="logos">
                        <img src="/src/assets/images/Logo_letras_negras.png" alt="Logo 1" class="footer-logo" width="100" height="100"/>
                        <img src="/src/assets/images/River_Travel.png" alt="Logo 2" class="footer-logo"/>
                    </div>
                </div>
                <div class="mapa-right">
                    <div class="mapa-info">
                        <h3>Dirección Matriz:</h3>
                        <p>Av. de los Shyris y Rousseau</p>
                        <p>Rousseau N-34, Quito 170513</p>
                    </div>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.8020713515048!2d-78.48103712519048!3d-0.16352133542922936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59be56f3543e3%3A0xf2691e2581d4515!2sCorporaci%C3%B3n%20D%C3%A1vila%20%26%20Granda%20CORPODG%20C%C3%ADa.%20Ltda.!5e0!3m2!1ses!2ec!4v1769092182293!5m2!1ses!2ec"
                        width="470"
                        height="300"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
            <div class="copyright">
                <p>© 2026 CORPODG. Todos los derechos reservados</p>
            </div>
        </footer>


</template>


<script>

</script>

<style scoped>
:root {
    --footer-font-family: 'Segoe UI', Arial, sans-serif;
    --footer-title-font: 'Montserrat', Arial, sans-serif;
    --footer-text-font: 'Segoe UI', Arial, sans-serif;
}

footer {
    background: #f5f5f5;
    padding: 0.2rem 0 0.5rem 0;
    font-family: var(--footer-font-family);
}


.footer-flex {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 0.1rem;
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 2rem;
}

.logo-superior {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5rem;
    margin-top: 2rem;
}
.footer-logo-superior {
    height: 130px;
    width: auto;
    object-fit: contain;
}

.mapa-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    margin-left: 4rem;
}

.logos-contacto {
    min-width: 400px;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-top: 0rem;
}
.logos {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 1rem;
    margin-top: 0.5rem;
}
.footer-logo {
    height: 85px;
    width: auto;
    object-fit: contain;
}
.info-extra {
    text-align: center;
    font-family: var(--footer-text-font);
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.5rem;
}
.info-extra a {
    color: #0077b6;
    text-decoration: none;
    margin: 0 0.2rem;
}

.info-extra h3{
    margin-bottom: 0.7rem;
}
.info-extra a:hover {
    text-decoration: underline;
}

.mapa-right iframe {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-top: 1rem;
}

.mapa-info {
    margin-top: 0;
    text-align: center;
}
.mapa-info h3 {
    font-family: var(--footer-title-font);
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}
.mapa-info p {
    font-family: var(--footer-text-font);
    font-size: 1rem;
    margin: 0.2rem 0;
}
.logos-columna {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 220px;
 }
.logo-superior {
    min-height: 70px;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.copyright {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.95rem;
    color: #888;
}
</style>