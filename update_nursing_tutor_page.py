from pathlib import Path
import re
src = Path('courses/nursing/kerala/apn.html')
tgt = Path('courses/nursing/kerala/nursing-tutor.html')
text = src.read_text(encoding='utf-8')
replacements = [
    ('Kerala PSC Assistant Professor in Nursing', 'Kerala PSC Nursing Tutor'),
    ('Assistant Professor in Nursing', 'Nursing Tutor'),
    ('Kerala PSC APN', 'Kerala PSC Nursing Tutor'),
    ('APN exam coaching', 'Nursing Tutor exam coaching'),
    ('APN-focused', 'Nursing Tutor-focused'),
    ('APN mock tests', 'Nursing Tutor mock tests'),
    ('APN previous year papers', 'Nursing Tutor previous year papers'),
    ('APN Success Story', 'Nursing Tutor Success Story'),
    ('APN 2025', 'Nursing Tutor 2025'),
    ('APN 2024', 'Nursing Tutor 2024'),
    ('APN 2023', 'Nursing Tutor 2023'),
    ('APN 2022', 'Nursing Tutor 2022'),
    ('APN 2021', 'Nursing Tutor 2021'),
    ('APN-Syllabus.pdf', 'Nursing-Tutor-Syllabus.pdf'),
    (' apn-', ' nursing-tutor-'),
    ('apn-', 'nursing-tutor-'),
]
for old, new in replacements:
    text = text.replace(old, new)
text = text.replace('APN', 'Nursing Tutor')
text = text.replace('Nursing Tutor Tutor', 'Nursing Tutor')
text = text.replace('Nursing Tutor in Nursing Tutor', 'Nursing Tutor')
text = text.replace('Kerala PSC Nursing Tutor Nursing Tutor', 'Kerala PSC Nursing Tutor')
text = text.replace('examSlug: "kerala-psc-apn"', 'examSlug: "kerala-psc-nursing-tutor"')
text = text.replace('fullName: "Kerala Public Service Commission Assistant Professor in Nursing Exam"', 'fullName: "Kerala Public Service Commission Nursing Tutor Exam"')
text = text.replace('href="/courses/Syllubus/APN-Syllabus.pdf"', 'href="/courses/Syllubus/Nursing-Tutor-Syllabus.pdf"')
text = text.replace('Kerala PSC Nursing Tutor exam coaching with expert faculty, Nursing Tutor-focused mock tests, previous year papers, and targeted mentorship. Prepare for nursing faculty roles in Kerala government nursing colleges.', 'Kerala PSC Nursing Tutor exam coaching with expert faculty, Nursing Tutor-focused mock tests, previous year papers, and targeted mentorship. Prepare for nursing tutor roles in Kerala government nursing colleges.')
text = text.replace('Nursing Tutor exam coaching with expert faculty, Nursing Tutor-focused mock tests, previous year papers, and targeted mentorship. Prepare for nursing faculty roles in Kerala government colleges.', 'Nursing Tutor exam coaching with expert faculty, Nursing Tutor-focused mock tests, previous year papers, and targeted mentorship. Prepare for nursing tutor roles in Kerala government nursing colleges.')
text = text.replace('Kerala PSC Nursing Tutor Exam Coaching | Eduooz International Academy', 'Kerala PSC Nursing Tutor Exam Coaching | Eduooz International Academy')
# Ensure no DSSSB or Delhi remain from source copy
text = re.sub(r'DSSSB|Delhi|Delhi Subordinate Services Selection Board|GNCTD|dsssb', '', text, flags=re.IGNORECASE)
# Replace empty duplicates if any from removal
text = text.replace('  ', ' ')
# Write output
print('Writing', tgt)
tgt.write_text(text, encoding='utf-8')
print('Done', tgt.exists(), 'size', tgt.stat().st_size)
print('Terms remaining:')
for term in ['DSSSB','Delhi','Kerala PSC APN','APN']:
    count = sum(1 for line in text.splitlines() if term in line)
    print(term, count)
