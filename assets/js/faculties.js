(function () {
  "use strict";

  /* =========================================
     LENIS SMOOTH SCROLL
     ========================================= */
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  function rafLoop(time) { lenis.raf(time); requestAnimationFrame(rafLoop); }
  requestAnimationFrame(rafLoop);

  /* =========================================
     SCROLL-TO-TOP
     ========================================= */
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
    });
    scrollTopBtn.addEventListener("click", () => lenis.scrollTo(0, { duration: 1.2 }));
  }

  /* =========================================
     FACULTY DATA
     ========================================= */
  const FACULTY = [
    {
      name: "Shine Stephen",
      accent: "cyan",
      img: "assets/images/Mentors/SHINE.png",
      imgAlt: "Shine Stephen – Nursing Faculty",
      icon: "fa-solid fa-trophy",
      qual: [
        "Asst. Professor – Govt. Nursing College (on leave)",
        "Former Faculty, College of Nursing AIIMS",
        "MSc (N) – PGIMER | MHA | PGDHSR | UGC NET",
        "PhD Scholar (INC-WHO)",
      ],
      achievements: [
        "9th Rank – KPSC Assistant Professor Exam (2024)",
        "19th Rank – Nursing Tutor KPSC (2023)",
        "1st Rank – MSc (N) Entrance PGIMER",
        "1st Rank – INC PhD Entrance Exam",
        "ESIC Kerala Staff Nurse Rank Holder",
        "AIIMS New Delhi Staff Nurse Rank Holder",
        "DME KPSC Staff Nurse Rank Holder",
        "DHS KPSC Staff Nurse Rank Holder",
      ],
    },
    {
      name: "Nayana Shaji",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/nayana-shaji.jpg",
      imgAlt: "Nayana Shaji – Pharmacology Faculty",
      icon: "fa-solid fa-pills",
      qual: ["M.Pharm Pharmacology"],
      achievements: [
        "Distinction Holder",
        "Kerala & Central Exams Rank Holder",
        "GPAT Rank Holder",
      ],
    },
    {
      name: "Vidhu R Vijayan",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/vidhu-r-vijayan.jpg",
      imgAlt: "Vidhu R Vijayan – Orthopedic Nursing Faculty",
      icon: "fa-solid fa-stethoscope",
      qual: ["MSc. Nursing (Orthopedic)"],
      achievements: ["NCLEX RN Passed"],
    },
    {
      name: "Honey Mol P.V",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/honey-mol-pv.jpg",
      imgAlt: "Honey Mol P.V – Molecular Biology Faculty",
      icon: "fa-solid fa-flask",
      qual: ["MSc Molecular Biology"],
      achievements: ["Distinction Holder", "Kerala PSC Rank Holder"],
    },
    {
      name: "Sreelakshmi E.M",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/sreelakshmi-em.jpg",
      imgAlt: "Sreelakshmi E.M – Microbiology Faculty",
      icon: "fa-solid fa-microscope",
      qual: ["MSc Microbiology"],
      achievements: ["2nd Rank Holder", "Kerala PSC Rank Holder"],
    },
    {
      name: "Arathy Surendran",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/arathy-surendran.jpg",
      imgAlt: "Arathy Surendran – Pediatric Nursing Faculty",
      icon: "fa-solid fa-child",
      qual: ["MSc Nursing (Pediatrics) – KUHS"],
      achievements: ["Kerala PSC Rank Holder"],
    },
    {
      name: "Sai Kiran T C",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/sai-kiran-tc.jpg",
      imgAlt: "Sai Kiran T C – Senior Pharmacy Faculty",
      icon: "fa-solid fa-flask-vial",
      qual: ["Senior Pharmacy Faculty", "M.Pharm – Pharmaceutical Chemistry"],
      achievements: [
        "GPAT Kerala Rank Holder",
        "ATPI KSB Poster Presentation 2025",
        "Pharmaceutical Research Conclave Winner 2025",
      ],
    },
    {
      name: "Dr. Manjima G.S",
      accent: "cyan",
      img: "assets/images/Mentors/MANJIMA.jpeg",
      imgAlt: "Dr. Manjima G.S – Doctor of Pharmacy",
      icon: "fa-solid fa-graduation-cap",
      qual: ["Doctor of Pharmacy", "MSc Pharmacology (UK) – Commendation"],
      achievements: ["Awarded International Scholarship for MSc. Pharmacology"],
    },
    {
      name: "Jesna Prasad",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/jesna-prasad.jpg",
      imgAlt: "Jesna Prasad – BSc Nursing & German Language",
      icon: "fa-solid fa-language",
      qual: ["BSc Nursing"],
      achievements: ["German A1-A2, B1-B2 – Passed"],
    },
    {
      name: "Jeethu Paul",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/jeethu-paul.jpg",
      imgAlt: "Jeethu Paul – Pediatric Nursing Faculty",
      icon: "fa-solid fa-heart-pulse",
      qual: ["MSc Nursing (Pediatric)"],
      achievements: ["Kerala PSC Rank Holder"],
    },
    {
      name: "Reshma R",
      accent: "cyan",
      img: "assets/images/Mentors/RESHMA R.png",
      imgAlt: "Reshma R – Paediatric Nursing Faculty",
      icon: "fa-solid fa-baby",
      qual: ["MSc Nursing (Paediatrics)"],
      achievements: [
        "Cleared AIIMS Raipur Nursing Officer Exam",
        "RRB Nursing Officer",
        "DHS/DME Nursing Officer",
      ],
    },
    {
      name: "Revathy B C",
      accent: "cyan",
      img: "assets/images/Mentors/optimized/revathy-bc.jpg",
      imgAlt: "Revathy B C – Oncology Nursing Faculty",
      icon: "fa-solid fa-ribbon",
      qual: ["BSc Nursing", "Speciality in Oncology Nursing"],
      achievements: [],
    },
    {
      name: "Ashna Ashok",
      accent: "cyan",
      img: "assets/images/Mentors/ASHNA ASHOK.png",
      imgAlt: "Ashna Ashok – OBG Nursing Faculty",
      icon: "fa-solid fa-baby-carriage",
      qual: ["BSc Nursing", "MSc Nursing (OBG)"],
      achievements: [],
    },
  ];

  /* =========================================
     BUILD & RENDER GRID
     ========================================= */
  const grid = document.getElementById("fac-grid");
  if (!grid) return;

  FACULTY.forEach(function (fac, index) {
    const num = String(index + 1).padStart(2, "0");

    const qualHTML = fac.qual
      .map(function (q) { return "<span>" + q + "</span>"; })
      .join(" &nbsp;&bull;&nbsp; ");

    const achievHTML = fac.achievements
      .map(function (a) { return "<li>" + a + "</li>"; })
      .join("");

    const card = document.createElement("article");
    card.className = "fpc-card fac-reveal";
    card.setAttribute("data-accent", fac.accent);
    card.style.transitionDelay = (index * 60) + "ms";

    card.innerHTML =
      /* Full-bleed photo */
      '<div class="fpc-img">' +
        '<img src="' + fac.img + '" alt="' + fac.imgAlt + '" loading="lazy"' +
          ' onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.fpc-avatar-fallback\').style.display=\'flex\'">' +
        '<i class="fpc-avatar-fallback ' + fac.icon + '" style="display:none;"></i>' +
        '<div class="fpc-num">' + num + '</div>' +
      '</div>' +
      /* Glass overlay — name always visible, details revealed on hover */
      '<div class="fpc-glass">' +
        '<h3 class="fpc-name">' + fac.name + '</h3>' +
        '<div class="fpc-details">' +
          '<div class="fpc-details-inner">' +
            '<div class="fpc-block">' +
              '<div class="fpc-block-label"><i class="fa-solid fa-graduation-cap"></i> Qualification</div>' +
              '<div class="fpc-qual">' + qualHTML + '</div>' +
            '</div>' +
            '<div class="fpc-block">' +
              '<div class="fpc-block-label"><i class="fa-solid fa-trophy"></i> Achievements</div>' +
              '<ul class="fpc-achiev">' + achievHTML + '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  });

  /* =========================================
     SCROLL REVEAL
     ========================================= */
  const revealEls = document.querySelectorAll(".fac-reveal");
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("fac-revealed");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });

  revealEls.forEach(function (el) { observer.observe(el); });
})();
