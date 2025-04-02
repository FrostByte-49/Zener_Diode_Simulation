//main 
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', function () {
        const faqItem = this.parentElement;

        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach((item) => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle the clicked FAQ
        faqItem.classList.toggle('active');
    });
});

let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  let scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling Down → Hide Header
    header.style.top = "-100px"; // Moves header out of view
  } else {
    // Scrolling Up → Show Header
    header.style.top = "0";
  }
  lastScrollTop = scrollTop;
});


// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});


// document.body.style.overflow = "hidden"; // Disable scrolling

// setTimeout(() => {
//     document.body.style.overflow = ""; // Enable scrolling after loader ends
// }, 5000); // Adjust timing


// Disable Scrolling For WebPage
// document.addEventListener("DOMContentLoaded", () => {
//   if (window.location.href.includes("index.html") || window.location.href.includes("/index.html")) {
//       // Disable scrolling only on the Home Page
//       document.body.style.overflow = "hidden";

//       setTimeout(() => {
//           // Enable scrolling after loader ends
//           document.body.style.overflow = "";
//       }, 5000); // Adjust timing
//   }
// });


// Nav Bar
document.getElementById('menu-toggle').addEventListener('click', function() {
  document.getElementById('mobile-menu').classList.toggle('active');
});


// // Refresh Page
// // Scroll to the top of the page when it's loaded or refreshed
// window.onload = function() {
//   // Wait for the page to fully load, then scroll to the top
//   setTimeout(function() {
//     window.scrollTo(0, 0);
//   }, 0); // This ensures the scroll happens after everything has loaded
// };


// window.addEventListener('load', function () {
//   // Use requestAnimationFrame to make sure the scroll is reset after rendering
//   requestAnimationFrame(function () {
//     window.scrollTo(0, 0);
//   });
// });


// Smooth Refresh
window.addEventListener('load', function () {
  // Use requestAnimationFrame to make sure the scroll is reset after rendering
  requestAnimationFrame(function () {
    window.scrollTo(0, 0); // This will now scroll smoothly due to the CSS rule
  });
});

// Smooth Scrolling
document.documentElement.style.scrollBehavior = 'smooth';


// // Cursor Animation
// const TAIL_LENGTH = 30;
// const cursor = document.getElementById("cursor");

// let mouseX = 0;
// let mouseY = 0;

// let cursorCircles;
// let cursorHistory = Array(TAIL_LENGTH).fill({ x: 0, y: 0 });

// function onMouseMove(event) {
//   mouseX = event.clientX;
//   mouseY = event.clientY;
// }

// function onClick(event) {
//   for (let i = 0; i < TAIL_LENGTH; i++) {
//     cursorHistory[i].x += Math.random() * 100 - 50;
//     cursorHistory[i].y += Math.random() * 100 - 50;
//   }
// }

// function initCursor() {
//   for (let i = 0; i < TAIL_LENGTH; i++) {
//     let div = document.createElement("div");
//     div.classList.add("cursor-circle");
//     cursor.append(div);
//   }
//   cursorCircles = Array.from(document.querySelectorAll(".cursor-circle"));
// }

// function updateCursor() {
//   cursorHistory.shift();
//   cursorHistory.push({ x: mouseX, y: mouseY });

//   for (let i = 0; i < TAIL_LENGTH; i++) {
//     let current = cursorHistory[i];
//     let next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1];

//     let xDiff = next.x - current.x;
//     let yDiff = next.y - current.y;

//     current.x += xDiff * 0.35;
//     current.y += yDiff * 0.35;
//     cursorCircles[i].style.transform = `translate(${current.x}px, ${
//       current.y
//     }px) scale(${i / TAIL_LENGTH})`;
//   }
//   requestAnimationFrame(updateCursor);
// }

// document.addEventListener("mousemove", onMouseMove, false);
// document.addEventListener("click", onClick, false);

// initCursor();
// updateCursor();

  
// ZenerBot
window.addEventListener('dfMessengerLoaded', function (event) {
  $df_messenger = document.querySelector("df-messenger");
  $df_messenger_chat = $df_messenger.shadowRoot.querySelector("df-messenger-chat");

  var sheet = new CSSStyleSheet;
  sheet.replaceSync( `div.chat-wrapper.chat-open { width: 400px; }`);
  sheet.replaceSync( `div.chat-wrapper.chat-open { height: 450px; }`);
  $df_messenger_chat.shadowRoot.adoptedStyleSheets = [ ...$df_messenger_chat.shadowRoot.adoptedStyleSheets, sheet ];

  // $df_messenger.renderCustomText('Testing renderer.');
});


// Table Of Content 
document.querySelectorAll('.toc a').forEach(link => {
  link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      window.scrollTo({
          top: target.offsetTop - 60,
          behavior: 'smooth'
      });
  });
});

// Highlight Active Section in TOC
window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY;
  document.querySelectorAll('section').forEach(section => {
      if (scrollPos >= section.offsetTop - 70 && scrollPos < section.offsetTop + section.offsetHeight) {
          document.querySelectorAll('.toc a').forEach(a => a.classList.remove('active'));
          document.querySelector(`.toc a[href="#${section.id}"]`).classList.add('active');
      }
  });
});


// Newsletter Signup
document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const responseMessage = document.getElementById('responseMessage');

  // Replace with your EmailOctopus API key and list ID
  const API_KEY = 'eo_1924ca4198edbe7d62389265eb47786b5638c75dcbb5ffc2f7ec4d33f8db5bce';
  const LIST_ID = 'a284acd2-0d14-11f0-bf7d-91a18cc03aac';

  try {
    const response = await fetch('https://emailoctopus.com/api/1.5/lists/' + LIST_ID + '/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: API_KEY,
        email_address: email,
        fields: {
          FirstName: firstName,
          LastName: lastName
        },
        status: 'SUBSCRIBED'
      })
    });

    const data = await response.json();
    
    if (data.error) {
      responseMessage.textContent = 'Error: ' + data.error.message;
      responseMessage.style.color = 'red';
    } else {
      responseMessage.textContent = 'Success! Thank you for subscribing.';
      responseMessage.style.color = 'green';
      document.getElementById('newsletterForm').reset();
    }
  } catch (error) {
    responseMessage.textContent = 'Failed to submit. Please try again.';
    responseMessage.style.color = 'red';
  }
});