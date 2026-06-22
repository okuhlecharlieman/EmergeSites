/**
* Template Name: Emerge Sites - Dark Futuristic Portfolio
* Updated: 2024
* Author: Emerge Sites
* License: Custom
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /**
   * Check for reduced motion preference
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Initialize Three.js Hero
   */
  const initThreeHero = () => {
    const container = select('#hero-canvas-container');
    if (!container) return;

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, showing fallback');
      container.innerHTML = '<div class="hero-fallback" style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,var(--color-bg-deep),var(--color-bg-dark));display:flex;align-items:center;justify-content:center;"><div style="text-align:center;padding:2rem;"><div style="width:200px;height:200px;border:2px solid var(--color-neon-cyan);border-radius:50%;margin:0 auto 2rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 60px var(--color-neon-cyan-dim);"><i class="bx bx-code-alt" style="font-size:60px;color:var(--color-neon-cyan);"></i></div><h2 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;background:linear-gradient(135deg,var(--color-neon-cyan),var(--color-neon-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Emerge Sites</h2></div></div>';
      return;
    }

    // Three.js Setup
    let scene, camera, renderer, geometry, material, mesh, particles;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050508, 1);
    container.appendChild(renderer.domElement);

    // Create wireframe geometric shape (Dodecahedron)
    geometry = new THREE.DodecahedronGeometry(180, 0);
    material = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      wireframeLinewidth: 1
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Create inner glowing core
    const coreGeometry = new THREE.IcosahedronGeometry(60, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xbc8bff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Create particle field
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 500 + Math.random() * 1000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);
      
      sizeArray[i / 3] = Math.random() * 2 + 0.5;
      
      // Cyan to purple gradient
      const colorMix = Math.random();
      if (colorMix < 0.5) {
        colorArray[i] = 0;
        colorArray[i + 1] = 0.95 + Math.random() * 0.05;
        colorArray[i + 2] = 1;
      } else {
        colorArray[i] = 0.7 + Math.random() * 0.3;
        colorArray[i + 1] = 0.5 + Math.random() * 0.2;
        colorArray[i + 2] = 1;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    particlesGeometry.setAttribute('aColor', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create ring structure
    const ringGeometry = new THREE.RingGeometry(250, 280, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    const ring2 = ring.clone();
    ring2.rotation.x = Math.PI / 2;
    ring2.scale.setScalar(1.2);
    ring2.material = ringMaterial.clone();
    ring2.material.opacity = 0.1;
    scene.add(ring2);

    // Mouse move handler
    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.3;
      mouseY = (event.clientY - windowHalfY) * 0.3;
    };

    document.addEventListener('mousemove', onDocumentMouseMove, { passive: true });

    // Touch support
    const onDocumentTouchMove = (event) => {
      if (event.touches.length === 1) {
        mouseX = (event.touches[0].clientX - windowHalfX) * 0.3;
        mouseY = (event.touches[0].clientY - windowHalfY) * 0.3;
      }
    };

    document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });

    // Window resize
    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize, { passive: true });

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      
      // Smooth camera follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate main shape
      mesh.rotation.x += 0.0005;
      mesh.rotation.y += 0.0008;
      mesh.rotation.z += 0.0003;

      // Rotate core opposite direction
      core.rotation.x -= 0.0008;
      core.rotation.y -= 0.0005;
      core.rotation.z += 0.0006;

      // Pulse core scale
      const pulseScale = 1 + Math.sin(elapsed * 2) * 0.1;
      core.scale.setScalar(pulseScale);

      // Rotate particle field slowly
      particles.rotation.y += 0.0001;
      particles.rotation.x += 0.00005;

      // Rotate rings
      ring.rotation.z += 0.0003;
      ring2.rotation.z -= 0.0002;

      // Pulse ring opacity
      ring.material.opacity = 0.15 + Math.sin(elapsed) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('touchmove', onDocumentTouchMove);
      window.removeEventListener('resize', onWindowResize);
      
      // Dispose Three.js resources
      geometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    });
  };

  /**
   * Initialize Parallax Scroll Animations
   */
  const initParallax = () => {
    if (prefersReducedMotion()) return;

    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Parallax for elements with data-parallax attribute
      document.querySelectorAll('[data-parallax]').forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.1;
        
        gsap.to(element, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });

      // Section reveal animations
      gsap.utils.toArray('section:not(#hero)').forEach(section => {
        const elements = section.querySelectorAll('.section-title, .icon-box, .content-item, .portfolio-item, .about-image, .content, .info, .php-email-form');
        
        elements.forEach((el, index) => {
          gsap.fromTo(el,
            { 
              y: 60,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: index * 0.05,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      });

      // Portfolio item stagger animation
      gsap.utils.toArray('.portfolio-item').forEach((item, index) => {
        gsap.fromTo(item,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Navbar background on scroll
      ScrollTrigger.create({
        start: 'top -80',
        end: 'bottom bottom',
        onToggle: self => {
          const header = select('#header');
          if (header) {
            header.classList.toggle('header-scrolled', self.isActive);
          }
        }
      });

      // Back to top button
      ScrollTrigger.create({
        start: 'top -100',
        end: 'bottom bottom',
        onToggle: self => {
          const backtotop = select('.back-to-top');
          if (backtotop) {
            backtotop.classList.toggle('active', self.isActive);
          }
        }
      });

      // Refresh on load
      ScrollTrigger.refresh();
    } else {
      // Fallback: simple intersection observer for reveal animations
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('.section-title, .icon-box, .content-item, .portfolio-item, .about-image, .content, .info, .php-email-form').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });

      // Add revealed class styles dynamically
      const style = document.createElement('style');
      style.textContent = `
        .revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  /**
   * Initialize Portfolio Grid Layout (Isotope)
   */
  const initGridLayout = () => {
    const portfolioContainer = select('.portfolio-grid');
    if (!portfolioContainer) return;

    // Initialize Isotope
    let portfolioIsotope = new Isotope(portfolioContainer, {
      itemSelector: '.portfolio-item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: '.portfolio-item',
        gutter: 24
      },
      transitionDuration: '0.4s',
      stagger: 30
    });

    // Filter handling
    const portfolioFilters = select('#portfolio-flters li', true);

    on('click', '#portfolio-flters li', function(e) {
      e.preventDefault();
      portfolioFilters.forEach(function(el) {
        el.classList.remove('filter-active');
      });
      this.classList.add('filter-active');

      const filterValue = this.getAttribute('data-filter');
      portfolioIsotope.arrange({
        filter: filterValue
      });
    }, true);

    // Refresh layout on window resize
    window.addEventListener('resize', () => {
      portfolioIsotope.layout();
    });

    // Initial layout after images load
    imagesLoaded(portfolioContainer).on('progress', () => {
      portfolioIsotope.layout();
    });
  };

  /**
   * Navbar links active state on scroll
   */
  const initNavbarActive = () => {
    let navbarlinks = select('#navbar .scrollto', true);
    const navbarlinksActive = () => {
      let position = window.scrollY + 200;
      navbarlinks.forEach(navbarlink => {
        if (!navbarlink.hash) return;
        let section = select(navbarlink.hash);
        if (!section) return;
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      });
    };
    window.addEventListener('load', navbarlinksActive);
    onscroll(document, navbarlinksActive);
  };

  /**
   * Scroll to element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header');
    let offset = header.offsetHeight;

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16;
    }

    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    });
  };

  /**
   * Header fixed top on scroll (fallback if GSAP not loaded)
   */
  const initHeaderFixed = () => {
    let selectHeader = select('#header');
    if (selectHeader) {
      let headerOffset = selectHeader.offsetTop;
      let nextElement = selectHeader.nextElementSibling;
      const headerFixed = () => {
        if ((headerOffset - window.scrollY) <= 0) {
          selectHeader.classList.add('fixed-top');
          nextElement.classList.add('scrolled-offset');
        } else {
          selectHeader.classList.remove('fixed-top');
          nextElement.classList.remove('scrolled-offset');
        }
      };
      window.addEventListener('load', headerFixed);
      onscroll(document, headerFixed);
    }
  };

  /**
   * Back to top button (fallback if GSAP not loaded)
   */
  const initBackToTop = () => {
    let backtotop = select('.back-to-top');
    if (backtotop) {
      const toggleBacktotop = () => {
        if (window.scrollY > 100) {
          backtotop.classList.add('active');
        } else {
          backtotop.classList.remove('active');
        }
      };
      window.addEventListener('load', toggleBacktotop);
      onscroll(document, toggleBacktotop);
    }
  };

  /**
   * Mobile nav toggle
   */
  const initMobileNav = () => {
    on('click', '.mobile-nav-toggle', function(e) {
      select('#navbar').classList.toggle('navbar-mobile');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    });

    on('click', '.navbar .dropdown > a', function(e) {
      if (select('#navbar').classList.contains('navbar-mobile')) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle('dropdown-active');
      }
    }, true);
  };

  /**
   * Scroll with offset on links with class .scrollto
   */
  const initSmoothScroll = () => {
    on('click', '.scrollto', function(e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select('#navbar');
        if (navbar.classList.contains('navbar-mobile')) {
          navbar.classList.remove('navbar-mobile');
          let navbarToggle = select('.mobile-nav-toggle');
          navbarToggle.classList.toggle('bi-list');
          navbarToggle.classList.toggle('bi-x');
        }
        scrollto(this.hash);
      }
    }, true);
  };

  /**
   * Scroll with offset on page load with hash links in the url
   */
  const initHashScroll = () => {
    window.addEventListener('load', () => {
      if (window.location.hash) {
        if (select(window.location.hash)) {
          scrollto(window.location.hash);
        }
      }
    });
  };

  /**
   * Initialize Portfolio Lightbox
   */
  const initPortfolioLightbox = () => {
    const portfolioLightbox = GLightbox({
      selector: '.portfolio-lightbox',
      touchNavigation: true,
      loop: true,
      zoomable: true,
      draggable: true,
      openEffect: 'zoom',
      closeEffect: 'zoom',
      slideEffect: 'slide',
      cssEfects: {
        fade: {
          in: 'fadeIn',
          out: 'fadeOut'
        }
      }
    });
  };

  /**
   * Initialize Clients Slider
   */
  const initClientsSlider = () => {
    new Swiper('.clients-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      spaceBetween: 40,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        320: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        480: {
          slidesPerView: 3,
          spaceBetween: 30
        },
        640: {
          slidesPerView: 4,
          spaceBetween: 40
        },
        992: {
          slidesPerView: 6,
          spaceBetween: 60
        }
      }
    });
  };

  /**
   * Initialize Portfolio Details Slider
   */
  const initPortfolioDetailsSlider = () => {
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
  };

  /**
   * Initialize AOS (Animate On Scroll) fallback
   */
  const initAOS = () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        mirror: false,
        disable: prefersReducedMotion()
      });
    }
  };

  /**
   * Main Initialization
   */
  const init = () => {
    // Core functionality
    initNavbarActive();
    initMobileNav();
    initSmoothScroll();
    initHashScroll();
    initPortfolioLightbox();
    initClientsSlider();
    initPortfolioDetailsSlider();
    initAOS();

    // New 3D & Animation features
    initThreeHero();
    initParallax();
    initGridLayout();

    // Fallbacks (only if GSAP not available)
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      initHeaderFixed();
      initBackToTop();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally for debugging
  window.EmergeSites = {
    initThreeHero,
    initParallax,
    initGridLayout
  };

})();