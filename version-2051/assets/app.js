(() => {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const nextButton = hero.querySelector('[data-hero-next]');
    const prevButton = hero.querySelector('[data-hero-prev]');
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        start();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        showSlide(activeIndex + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        showSlide(activeIndex - 1);
        start();
      });
    }

    start();
  }

  const filterInputs = Array.from(document.querySelectorAll('[data-card-filter]'));

  filterInputs.forEach((input) => {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    const filterCards = () => {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matched = !keyword || text.includes(keyword);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    input.addEventListener('input', filterCards);

    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q');

    if (initialKeyword) {
      input.value = initialKeyword;
      filterCards();
    }
  });

  const brokenImages = Array.from(document.querySelectorAll('img'));

  brokenImages.forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
    }, { once: true });
  });
})();
