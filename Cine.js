document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.carousel-btn-next');
    const prevButton = document.querySelector('.carousel-btn-prev');
    const indicatorsNav = document.querySelector('.carousel-indicators');

    if (!track || !nextButton || !prevButton) {
        console.error("Faltan elementos del carrusel.");
        return;
    }

    let slides = Array.from(track.children);
    const slideCount = slides.length;

    // Clona primero y último para transición infinita
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slideCount - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');

    // Añade los clones al track
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    // Recalcular slides después de añadir los clones
    slides = Array.from(track.children);
    const realSlideStartIndex = 1; // Comenzamos en el primer slide real (después del último clon)
    let currentIndex = realSlideStartIndex;
    let autoSlide;
    let isTransitioning = false;

    const applyTransform = (animate = true) => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const containerWidth = track.parentElement.clientWidth;
        const offset = (containerWidth - slideWidth) / 2;
        const translateX = -currentIndex * slideWidth + offset;
    
        if (animate) {
            isTransitioning = true;
            track.style.transition = 'transform 0.5s ease';
        } else {
            track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(${translateX}px)`;
        updateUI();
    };

    const moveToSlide = (targetIndex, animate = true) => {
        if (isTransitioning && animate) return; // Prevenir clicks durante la transición
        currentIndex = targetIndex;
        applyTransform(animate);
    };

    const updateUI = () => {
        // Actualizar clase is-selected
        slides.forEach((slide, i) => {
            slide.classList.toggle('is-selected', i === currentIndex);
        });

        // Actualizar indicadores (ajustando para los clones)
        if (indicatorsNav) {
            // Convertir el índice actual a índice real (sin contar clones)
            const realIndex = getRealIndex(currentIndex);
            
            indicatorsNav.querySelectorAll('.indicator-button').forEach((btn, i) => {
                btn.classList.toggle('active', i === realIndex);
            });
        }
    };

    // Función para convertir el índice actual (con clones) a índice real
    const getRealIndex = (index) => {
        if (index === 0) return slideCount - 1; // Último clon -> último real
        if (index === slides.length - 1) return 0; // Primer clon -> primer real
        return index - 1; // -1 porque el índice 1 es el primer slide real
    };

    // Manejador para cuando termina la animación
    const handleTransitionEnd = () => {
        isTransitioning = false;
        
        // Hacer el salto invisible cuando llegamos a un clon
        if (currentIndex === 0) {
            // Si estamos en el último clon, salta al último slide real
            currentIndex = slideCount;
            applyTransform(false);
        } else if (currentIndex === slides.length - 1) {
            // Si estamos en el primer clon, salta al primer slide real
            currentIndex = 1;
            applyTransform(false);
        }
    };
    
    const createIndicators = () => {
        if (!indicatorsNav) return;
        
        indicatorsNav.innerHTML = '';
        for (let i = 0; i < slideCount; i++) {
            const button = document.createElement('button');
            button.classList.add('indicator-button');
            if (i === 0) button.classList.add('active');
            
            button.addEventListener('click', () => {
                if (isTransitioning) return; // Prevenir clicks durante transición
                currentIndex = i + 1; // +1 porque el índice 1 es el primer slide real
                moveToSlide(currentIndex);
                resetAutoSlide();
            });
            
            indicatorsNav.appendChild(button);
        }
    };

    const startAutoSlide = () => {
        autoSlide = setInterval(() => {
            if (!document.hidden) { // Solo avanza si la página está visible
                currentIndex++;
                moveToSlide(currentIndex);
            }
        }, 4000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlide);
        startAutoSlide();
    };

    // Event listeners
    nextButton.addEventListener('click', () => {
        if (isTransitioning) return; // Prevenir clicks rápidos
        currentIndex++;
        moveToSlide(currentIndex);
        resetAutoSlide();
    });

    prevButton.addEventListener('click', () => {
        if (isTransitioning) return; // Prevenir clicks rápidos
        currentIndex--;
        moveToSlide(currentIndex);
        resetAutoSlide();
    });

    // Detener autoplay cuando la página no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(autoSlide);
        } else {
            startAutoSlide();
        }
    });

    window.addEventListener('resize', () => {
        moveToSlide(currentIndex, false);
    });

    track.addEventListener('transitionend', handleTransitionEnd);

    // Inicializar
    createIndicators();
    moveToSlide(currentIndex, false); // Posicionamiento inicial sin animación
    startAutoSlide();
});