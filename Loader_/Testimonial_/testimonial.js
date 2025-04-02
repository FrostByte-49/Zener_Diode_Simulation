var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 5,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-nexts",
      prevEl: ".swiper-button-prevs",
    },
    mousewheel: true,
    keyboard: true,
    loop: true,
    breakpoints: {
  
      300: {
        slidesPerView: 1
      },
  
      501: {
        slidesPerView: 1
      },
  
      769: {
        slidesPerView: 3,
        spaceBetween: 10
      },
      1025: {
        slidesPerView: 3,
        spaceBetween: 10
      },
    }
  });