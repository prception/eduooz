const fs = require('fs');

let html = fs.readFileSync('courses.html', 'utf8');

const regex = /<div class=\"course-box\" data-category=\"(nursing|lab|pharma|german)\"><h3 class=\"course-box-title\">(.*?)<\/h3><div class=\"course-footer\"><span class=\"course-price\">View Details<\/span><a href=\"contact.html\" class=\"btn-liquid-purple btn-enquire\">Enquire<\/a><\/div><\/div>/g;

html = html.replace(regex, (m, cat, title) => {
    let img = '', desc = '';
    
    if (cat === 'nursing') {
        img = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80';
        desc = 'Comprehensive coaching and preparation for top nursing recruitment and licensure exams.';
    } else if (cat === 'lab') {
        img = 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=600&q=80';
        desc = 'Specialized training program for aspiring lab technicians matching the latest exam patterns.';
    } else if (cat === 'pharma') {
        img = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80';
        desc = 'Expert-led pharmacist exam preparation with detailed mock tests and curriculum coverage.';
    } else if (cat === 'german') {
        img = 'https://images.unsplash.com/photo-1527866959252-deab85ef7ea5?auto=format&fit=crop&w=600&q=80';
        desc = 'Intensive language coaching tailored for healthcare professionals seeking global opportunities.';
    }

    return `<div class="course-box" data-category="${cat}">
    <div class="course-img-wrapper">
        <img src="${img}" alt="${title}">
    </div>
    <div class="course-content-wrapper">
        <h3 class="course-box-title">${title}</h3>
        <p class="course-desc">${desc}</p>
        <div class="course-footer">
            <span class="course-price">View Details</span>
            <a href="contact.html" class="btn-liquid-purple btn-enquire">Enquire</a>
        </div>
    </div>
</div>`;
});

fs.writeFileSync('courses.html', html);
console.log('Courses successfully updated.');
