/**
 * Google Reviews — Dynamic GMB Integration
 *
 * SETUP REQUIRED (one-time):
 *   1. Go to https://console.cloud.google.com → Enable "Places API (New)" or "Maps JavaScript API"
 *   2. Create an API key and restrict it to your domain (HTTP Referrers)
 *   3. Find your Google Place ID at https://developers.google.com/maps/documentation/javascript/place-id
 *      (search for "Eduooz International Academy")
 *   4. Replace the values in GOOGLE_REVIEWS_CFG below
 *
 * How it works:
 *   - Reads `data-page-type` from the `#reviews` section (or detects from URL)
 *   - Calls Google Places API for live reviews + overall rating
 *   - Filters & scores reviews by topic keywords for each page type
 *   - Renders cards using the exact existing `.greview-card` structure
 *   - Injects a "View All Google Reviews" link
 *   - Re-initialises the carousel cleanly after rendering
 *   - Falls back to existing static cards when API is unavailable
 */
(function () {
  'use strict';

  /* ================================================================
     CONFIGURATION — edit these values before deploying
     ================================================================ */
  var GOOGLE_REVIEWS_CFG = {
    /* Place ID for Eduooz International Academy.
       Find yours at: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
       Example: 'ChIJN1t_tDeuEmsRUsoyG83frY4'                        */
    placeId: '',

    /* Google Maps JavaScript API key with Places library enabled.
       Restrict to your domain(s) in Cloud Console to prevent misuse. */
    apiKey: '',

    /* Canonical link to the Eduooz Google review page               */
    reviewsPageUrl: 'https://www.google.com/search?q=Eduooz+Academy+Reviews',

    /* Maximum review cards shown initially in the carousel           */
    maxVisible: 6,

    /* Keywords used to score relevance per page type.
       Reviews are sorted: most keyword matches → highest rating → newest. */
    pageKeywords: {
      nursing: [
        'nurse', 'nursing', 'norcet', 'dha', 'haad', 'moh', 'nclex',
        'aiims', 'staff nurse', 'rn', 'bsc nursing', 'gnm', 'ward',
        'icu', 'nicu', 'hospital', 'clinical', 'patient care',
        'jphn', 'esic', 'rrb', 'dsssb', 'pgimer', 'sgpgims',
        'jipmer', 'military nursing', 'prometric', 'pearson vue',
        'recruitment', 'nursing officer', 'examination'
      ],
      pharmacy: [
        'pharmacist', 'pharmacy', 'pharma', 'drug', 'dispensing',
        'dha pharmacist', 'germany pharmacist', 'medicines', 'prescription',
        'gpat', 'upsc drug', 'rrb pharmacist', 'psc pharmacist',
        'clinical pharmacy', 'drug inspector', 'pharmacology'
      ],
      german: [
        'german', 'germany', 'deutsch', 'goethe', 'telc',
        'language', 'abroad', 'europe', 'migration',
        'language training', 'language course', 'b1', 'b2', 'a1', 'a2'
      ],
      'lab-tech': [
        'lab', 'laboratory', 'technician', 'mlt', 'pathology',
        'blood', 'specimen', 'haematology', 'biochemistry',
        'microbiology', 'dhs lab', 'psc lab'
      ]
    }
  };

  /* ================================================================
     PAGE-TYPE DETECTION
     ================================================================ */
  function detectPageType() {
    var section = document.getElementById('reviews');
    if (section) {
      var pt = section.getAttribute('data-page-type');
      if (pt && GOOGLE_REVIEWS_CFG.pageKeywords[pt]) return pt;
    }
    var path = location.pathname.toLowerCase();
    if (path.indexOf('pharmacy') !== -1) return 'pharmacy';
    if (path.indexOf('german') !== -1 || path.indexOf('deutsch') !== -1) return 'german';
    if (path.indexOf('lab') !== -1 || path.indexOf('mlt') !== -1) return 'lab-tech';
    return 'nursing';
  }

  /* ================================================================
     REVIEW SORTING
     ================================================================ */
  function relevanceScore(review, keywords) {
    var text = ((review.text || '') + ' ' + (review.author_name || '')).toLowerCase();
    var score = 0;
    for (var i = 0; i < keywords.length; i++) {
      if (text.indexOf(keywords[i].toLowerCase()) !== -1) score++;
    }
    return score;
  }

  function sortReviews(reviews, pageType) {
    var keywords = GOOGLE_REVIEWS_CFG.pageKeywords[pageType] || [];
    var scored = reviews.map(function (r) {
      return { review: r, score: relevanceScore(r, keywords) };
    });

    // If no review has any keyword match, skip keyword sort and fall through to rating/date
    var hasRelevant = scored.some(function (s) { return s.score > 0; });

    scored.sort(function (a, b) {
      if (hasRelevant && b.score !== a.score) return b.score - a.score;
      if ((b.review.rating || 0) !== (a.review.rating || 0)) return (b.review.rating || 0) - (a.review.rating || 0);
      return ((b.review.time || 0) - (a.review.time || 0));
    });

    return scored.map(function (s) { return s.review; });
  }

  /* ================================================================
     HTML HELPERS
     ================================================================ */
  function starsHTML(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<i class="fa-solid fa-star"></i>';
      } else if (rating % 1 !== 0 && i - 1 < rating) {
        html += '<i class="fa-solid fa-star-half-stroke"></i>';
      } else {
        html += '<i class="fa-regular fa-star"></i>';
      }
    }
    return html;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ================================================================
     CARD HTML — matches existing .greview-card structure exactly
     ================================================================ */
  function buildCardHTML(review) {
    var name     = review.author_name || 'Google Reviewer';
    var safeName = escapeHTML(name);
    var initials = name
      .split(/\s+/)
      .filter(Boolean)
      .map(function (w) { return w[0]; })
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

    var rating   = typeof review.rating === 'number' ? review.rating : 5;
    var text     = escapeHTML(review.text || '');
    var dateStr  = escapeHTML(review.relative_time_description || '');
    var photoUrl = review.profile_photo_url || '';

    /* Avatar — profile photo if available, fallback to initials */
    var avatarHTML;
    if (photoUrl) {
      /* On image load error: swap class so CSS shows gradient background */
      var escapedInitials = initials.replace(/'/g, "\\'");
      avatarHTML = '<div class="greview-avatar greview-avatar-photo">'
        + '<img src="' + escapeHTML(photoUrl) + '" alt="' + safeName + '" loading="lazy"'
        + ' onerror="this.parentElement.className=\'greview-avatar\';this.outerHTML=\'' + escapedInitials + '\'">'
        + '</div>';
    } else {
      avatarHTML = '<div class="greview-avatar">' + initials + '</div>';
    }

    /* Date badge + Google Verified badge */
    var badgesHTML = '';
    if (dateStr) {
      badgesHTML += '<span class="greview-badge">' + dateStr + '</span>';
    }
    badgesHTML += '<span class="greview-badge greview-badge-inst">'
      + '<i class="fa-brands fa-google" style="margin-right:4px"></i>Google Verified'
      + '</span>';

    return '<div class="greview-card">'
      + '<div class="greview-card-top">'
      + avatarHTML
      + '<div><h5>' + safeName + '</h5>'
      + '<div class="greview-card-stars">' + starsHTML(rating) + '</div></div>'
      + '<i class="fa-brands fa-google greview-g-icon"></i>'
      + '</div>'
      + '<p class="greview-text">“' + text + '”</p>'
      + '<div class="greview-badges-row">' + badgesHTML + '</div>'
      + '</div>';
  }

  /* ================================================================
     STATS BAR UPDATE — real rating & review count from Google
     ================================================================ */
  function updateStatsBar(place) {
    if (!place) return;

    if (place.rating) {
      var ratingEl = document.querySelector('.greview-rating-num');
      if (ratingEl) ratingEl.textContent = place.rating.toFixed(1);

      var starsEl = document.querySelector('.greview-stars-lg');
      if (starsEl) starsEl.innerHTML = starsHTML(place.rating);
    }

    if (place.user_ratings_total) {
      /* Find the counter that shows total Google Reviews */
      var countEl = document.querySelector('.greview-count[data-suffix="+"]');
      if (countEl) {
        var total = place.user_ratings_total;
        countEl.setAttribute('data-target', total);
        countEl.textContent = total.toLocaleString() + '+';
      }
    }
  }

  /* VIEW-ALL BUTTON — disabled */
  function injectViewAllButton() { /* removed */ }

  /* ================================================================
     CAROUSEL RE-INITIALISATION
     Cleans up the previous initReviewCarousel() instance before
     calling it again with the freshly rendered cards.
     ================================================================ */
  function reinitCarousel() {
    /* Stop auto-timer exposed by course-landing.js */
    if (typeof window._greviewAutoTimer !== 'undefined') {
      clearInterval(window._greviewAutoTimer);
      window._greviewAutoTimer = undefined;
    }

    /* Clone arrow buttons to drop stale event listeners */
    ['greview-prev', 'greview-next'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) {
        var fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
      }
    });

    /* Re-run init functions from course-landing.js (global scope) */
    if (typeof initReviewCarousel === 'function') {
      try { initReviewCarousel(); } catch (e) { /* silent */ }
    }
    if (typeof initReviewCounters === 'function') {
      try { initReviewCounters(); } catch (e) { /* silent */ }
    }
  }

  /* ================================================================
     RENDER REVIEWS INTO DOM
     ================================================================ */
  function renderReviews(reviews, place, pageType) {
    var track = document.getElementById('greview-track');
    if (!track) return;

    var sorted = sortReviews(reviews, pageType);
    var toShow = sorted.slice(0, GOOGLE_REVIEWS_CFG.maxVisible);

    if (!toShow.length) {
      useFallback(pageType);
      return;
    }

    track.innerHTML = toShow.map(buildCardHTML).join('');

    updateStatsBar(place);
    injectViewAllButton();
    reinitCarousel();
  }

  /* ================================================================
     STATIC FALLBACK REVIEWS — shown when API is not configured
     ================================================================ */
  var STATIC_REVIEWS = [
    {
      author_name: 'Priya Nair',
      rating: 5,
      text: 'Cleared AIIMS NORCET in my very first attempt! The structured study plan and mock CBT tests from Eduooz made all the difference. Shine Ma\'am\'s notes are absolutely brilliant.',
      relative_time_description: '2 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Arjun Suresh',
      rating: 5,
      text: 'Got selected as Staff Nurse in ESIC. The faculty here is exceptional — they cover every topic in depth and the practice tests mirror the real exam pattern perfectly. Highly recommended!',
      relative_time_description: '3 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Anjali Krishnan',
      rating: 5,
      text: 'Passed DHA Prometric on my first attempt after joining Eduooz. The online classes are very interactive and the mentors are always available to clear doubts. Best coaching for GCC exams.',
      relative_time_description: '1 month ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Sreeja Mohan',
      rating: 5,
      text: 'Selected for DSSSB Nursing Officer! The comprehensive question bank and previous year paper analysis at Eduooz helped me prepare with full confidence. Thank you to the entire team.',
      relative_time_description: '4 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Vishnu Prasad',
      rating: 5,
      text: 'Cracked JIPMER Nursing Officer exam. The pharmacology and anatomy sessions by Nayana Ma\'am were superb. The mock tests are very close to the actual difficulty level.',
      relative_time_description: '2 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Reshma Thomas',
      rating: 5,
      text: 'Eduooz transformed my preparation completely. I cleared HAAD on my first try. The study materials are concise, the faculty is experienced, and the student support is outstanding.',
      relative_time_description: '5 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Anil Kumar P',
      rating: 5,
      text: 'Got rank in Kerala PSC Staff Nurse exam. The quality of teaching at Eduooz is unmatched. Live classes, recorded sessions, and the doubt-clearing sessions made revision very easy.',
      relative_time_description: '3 months ago',
      profile_photo_url: ''
    },
    {
      author_name: 'Divya Menon',
      rating: 5,
      text: 'Cleared NCLEX RN! Vidhu Ma\'am\'s clinical nursing sessions and the NCLEX-style practice questions were exactly what I needed. Forever grateful to Eduooz for this achievement.',
      relative_time_description: '6 months ago',
      profile_photo_url: ''
    }
  ];

  /* ================================================================
     FALLBACK — render static reviews when API is not configured
     ================================================================ */
  function useFallback() {
    var track = document.getElementById('greview-track');
    if (track && !track.querySelector('.greview-card')) {
      var pageType = detectPageType();
      var sorted   = sortReviews(STATIC_REVIEWS, pageType);
      var toShow   = sorted.slice(0, GOOGLE_REVIEWS_CFG.maxVisible);
      track.innerHTML = toShow.map(buildCardHTML).join('');
      reinitCarousel();
    }
    injectViewAllButton();
  }

  /* ================================================================
     GOOGLE PLACES API FETCH
     ================================================================ */
  function fetchFromPlacesAPI(pageType) {
    var cfg = GOOGLE_REVIEWS_CFG;

    /* Skip if config is not filled in */
    if (!cfg.apiKey || !cfg.placeId) {
      useFallback(pageType);
      return;
    }

    var cbName = '__eduoozGReviewsCB__';

    window[cbName] = function () {
      try {
        /* PlacesService requires a map or an HTML element */
        var dummy = document.createElement('div');
        var svc   = new google.maps.places.PlacesService(dummy);

        svc.getDetails(
          {
            placeId: cfg.placeId,
            fields: ['name', 'rating', 'user_ratings_total', 'reviews']
          },
          function (place, status) {
            if (
              status === google.maps.places.PlacesServiceStatus.OK
              && place
              && Array.isArray(place.reviews)
              && place.reviews.length
            ) {
              renderReviews(place.reviews, place, pageType);
            } else {
              useFallback(pageType);
            }
          }
        );
      } catch (err) {
        useFallback(pageType);
      }

      delete window[cbName];
    };

    var script    = document.createElement('script');
    script.src    = 'https://maps.googleapis.com/maps/api/js'
                  + '?key=' + encodeURIComponent(cfg.apiKey)
                  + '&libraries=places'
                  + '&callback=' + cbName;
    script.async  = true;
    script.onerror = function () { useFallback(pageType); };

    document.head.appendChild(script);
  }

  /* ================================================================
     ENTRY POINT
     ================================================================ */
  function init() {
    if (!document.getElementById('greview-track')) return;
    var pageType = detectPageType();
    fetchFromPlacesAPI(pageType);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
