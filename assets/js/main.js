
(function() {
  "use strict";

  const networkCanvas = document.getElementById('network-background');
  if (networkCanvas) {
    const networkContext = networkCanvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, active: false };
    let networkPoints = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    const resizeNetwork = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      networkCanvas.width = Math.round(canvasWidth * pixelRatio);
      networkCanvas.height = Math.round(canvasHeight * pixelRatio);
      networkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const pointCount = Math.min(78, Math.max(24, Math.floor((canvasWidth * canvasHeight) / 22000)));
      networkPoints = Array.from({ length: pointCount }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        speedX: (Math.random() - 0.5) * 0.16,
        speedY: (Math.random() - 0.5) * 0.16,
        opacity: 0.22 + Math.random() * 0.38
      }));
    };

    const drawNetwork = () => {
      networkContext.clearRect(0, 0, canvasWidth, canvasHeight);
      const pointerOffsetX = pointer.active && !reducedMotion ? (pointer.x - canvasWidth / 2) * 0.006 : 0;
      const pointerOffsetY = pointer.active && !reducedMotion ? (pointer.y - canvasHeight / 2) * 0.006 : 0;
      const connectionDistance = canvasWidth < 768 ? 105 : 145;

      networkPoints.forEach((point, pointIndex) => {
        if (!reducedMotion) {
          point.x += point.speedX;
          point.y += point.speedY;
          if (point.x < 0 || point.x > canvasWidth) point.speedX *= -1;
          if (point.y < 0 || point.y > canvasHeight) point.speedY *= -1;
        }

        const drawX = point.x + pointerOffsetX;
        const drawY = point.y + pointerOffsetY;
        for (let nextIndex = pointIndex + 1; nextIndex < networkPoints.length; nextIndex++) {
          const nextPoint = networkPoints[nextIndex];
          const distance = Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y);
          if (distance < connectionDistance) {
            networkContext.beginPath();
            networkContext.moveTo(drawX, drawY);
            networkContext.lineTo(nextPoint.x + pointerOffsetX, nextPoint.y + pointerOffsetY);
            networkContext.strokeStyle = `rgba(91, 194, 199, ${(1 - distance / connectionDistance) * 0.16})`;
            networkContext.lineWidth = 1;
            networkContext.stroke();
          }
        }

        networkContext.beginPath();
        networkContext.arc(drawX, drawY, 1.5, 0, Math.PI * 2);
        networkContext.fillStyle = `rgba(117, 220, 218, ${point.opacity})`;
        networkContext.fill();
      });

      if (!reducedMotion) window.requestAnimationFrame(drawNetwork);
    };

    if (networkContext) {
      resizeNetwork();
      drawNetwork();
      window.addEventListener('resize', resizeNetwork);
      window.addEventListener('pointermove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      }, { passive: true });
      window.addEventListener('pointerleave', () => {
        pointer.active = false;
      });
    }
  }

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)

    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '#navbar .nav-link', function(e) {
    let section = select(this.hash)
    if (section) {
      e.preventDefault()

      let navbar = select('#navbar')
      let header = select('#header')
      let sections = select('section', true)
      let navlinks = select('#navbar .nav-link', true)

      navlinks.forEach((item) => {
        item.classList.remove('active')
      })

      this.classList.add('active')

      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }

      if (this.hash == '#header') {
        header.classList.remove('header-top')
        sections.forEach((item) => {
          item.classList.remove('section-show')
        })
        return;
      }

      if (!header.classList.contains('header-top')) {
        header.classList.add('header-top')
        setTimeout(function() {
          sections.forEach((item) => {
            item.classList.remove('section-show')
          })
          section.classList.add('section-show')

        }, 350);
      } else {
        sections.forEach((item) => {
          item.classList.remove('section-show')
        })
        section.classList.add('section-show')
      }

      scrollto(this.hash)
    }
  }, true)

  /**
   * Activate/show sections on load with hash links
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      let initial_nav = select(window.location.hash)

      if (initial_nav) {
        let header = select('#header')
        let navlinks = select('#navbar .nav-link', true)

        header.classList.add('header-top')

        navlinks.forEach((item) => {
          if (item.getAttribute('href') == window.location.hash) {
            item.classList.add('active')
          } else {
            item.classList.remove('active')
          }
        })

        setTimeout(function() {
          initial_nav.classList.add('section-show')
        }, 350);

        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },

      1200: {
        slidesPerView: 3,
        spaceBetween: 20
      }
    }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox({
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()
