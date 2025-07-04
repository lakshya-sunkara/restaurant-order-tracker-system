document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelector('.slides');
  const images = document.querySelectorAll('.slides img');
  const dotsContainer = document.querySelector('.dots');

  if (!slides || images.length === 0 || !dotsContainer) {
    console.error("Carousel elements not found in the DOM.");
    return;
  }

  let currentIndex = 0;
  const total = images.length;
  let interval;

  
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll('.dot');

  function goToSlide(index) {
    currentIndex = index;
    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
  }

 
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      goToSlide(parseInt(dot.dataset.index));
      startAutoSlide();
    });
  });

  function nextSlide() {
    currentIndex = (currentIndex + 1) % total;
    goToSlide(currentIndex);
  }

  function startAutoSlide() {
    interval = setInterval(nextSlide, 4000);
  }

  
  startAutoSlide();
});


 const video = document.querySelector('.hover-video');

  video.addEventListener('mouseenter', () => {
    video.play();
  });

  video.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0; 
  });


 function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}


window.addEventListener('click', function (e) {
  const dropdown = document.getElementById('dropdownMenu');
  const icon = document.querySelector('.menu-icon-block');
  if (!dropdown.contains(e.target) && !icon.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});
  

document.getElementById('addStaffForm').addEventListener('submit', function (e) {
  const phone = document.getElementById('phone').value;
  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    e.preventDefault();
    alert('Please enter a valid 10-digit phone number.');
  }
});

function openUpdatePopup(dishId) {
    fetch(`/owner/edit-dish/${dishId}`)
      .then(res => res.json())
      .then(data => {
        const form = document.getElementById('updateForm');
        form.action = `/owner/update-dish/${data._id}`;
        form.category.value = data.category;
        form.name.value = data.name;
        form.price.value = data.price;
        document.getElementById('updatePopup').style.display = 'flex';
      });
  }

  function closePopup() {
    document.getElementById('updatePopup').style.display = 'none';
  }


function switchTab(tab) {
    // Buttons
    document.getElementById("tab-server").classList.remove("active");
    document.getElementById("tab-chef").classList.remove("active");

    // Forms
    document.getElementById("serverForm").style.display = "none";
    document.getElementById("chefForm").style.display = "none";

    if (tab === "server") {
      document.getElementById("tab-server").classList.add("active");
      document.getElementById("serverForm").style.display = "block";
    } else {
      document.getElementById("tab-chef").classList.add("active");
      document.getElementById("chefForm").style.display = "block";
    }
  }