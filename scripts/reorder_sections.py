import re
from pathlib import Path

apn = Path(r"d:/Eduooz/eduooz/courses/nursing/kerala/apn.html").read_text(encoding='utf-8')
tr = Path(r"d:/Eduooz/eduooz/courses/nursing/kerala/treatment-organiser.html").read_text(encoding='utf-8')

# helper to find body content and blocks
def extract_blocks(html):
    # find body open tag
    m = re.search(r"<body(?:(?:\s|[^>])*?)>", html, flags=re.I)
    if not m:
        return None
    body_start = m.end()
    body_end_m = re.search(r"</body>", html, flags=re.I)
    body_end = body_end_m.start() if body_end_m else len(html)
    pre = html[:body_start]
    body = html[body_start:body_end]
    post = html[body_end:]

    # find all nav/section blocks in order
    pattern = re.compile(r"(<(?:nav|section)[\s\S]*?>[\s\S]*?<\/(?:nav|section)>)", re.I)
    blocks = []
    last = 0
    for m in pattern.finditer(body):
        start, end = m.span()
        # capture any text between last and start as 'other'
        if start > last:
            blocks.append(('other', body[last:start]))
        block_html = m.group(1)
        # extract id if present
        id_m = re.search(r'id\s*=\s*"([^"]+)"', block_html)
        bid = id_m.group(1) if id_m else None
        tag = 'nav' if block_html.strip().lower().startswith('<nav') else 'section'
        blocks.append((tag, bid, block_html))
        last = end
    if last < len(body):
        blocks.append(('other', body[last:]))
    return pre, blocks, post

apn_pre, apn_blocks, apn_post = extract_blocks(apn)
tr_pre, tr_blocks, tr_post = extract_blocks(tr)

# build order list from apn_blocks for nav/section entries
order = []
for b in apn_blocks:
    if b[0] in ('nav','section'):
        order.append((b[0], b[1]))

# map treatment blocks by (tag,id) -> block_html, and collect 'other' blocks in order
tr_map = {}
tr_ordered_others = []
for b in tr_blocks:
    if b[0] in ('nav','section'):
        tr_map[(b[0], b[1])] = b[2]
    else:
        tr_ordered_others.append(b[1])

# Reconstruct body: start with tr_pre (preserve original pre-body)
new_body_parts = []
new_body_parts.append(tr_pre)
# Add any leading 'other' content from tr_blocks before first nav/section
# (tr_pre already contains up to <body> end; the first 'other' in tr_blocks is content between body start and first section)
for part in tr_ordered_others:
    # include only the first 'other' (leading) now; remaining 'other' will be appended later
    new_body_parts.append(part)
    break

# Append blocks in apn order using treatment content when available
used = set()
for tag, bid in order:
    key = (tag, bid)
    if key in tr_map:
        new_body_parts.append(tr_map[key])
        used.add(key)
    else:
        # fallback: try matching by tag only (first unmatched)
        found = False
        for k, v in tr_map.items():
            if k[0]==tag and k not in used:
                new_body_parts.append(v)
                used.add(k)
                found = True
                break
        if not found:
            # skip if not found
            pass

# Append remaining treatment blocks in original order if not used
for b in tr_blocks:
    if b[0] in ('nav','section'):
        key = (b[0], b[1])
        if key not in used:
            new_body_parts.append(b[2])
    else:
        # append trailing other parts (skip the leading one we already added)
        # we will append all other parts now
        new_body_parts.append(b[1])

# join and build final html
new_body = ''.join(new_body_parts)
new_html = tr[:tr.find('<body')]
# attach opening <body...> tag and new_body and closing tags
m = re.search(r"<body(?:(?:\s|[^>])*?)>", tr, flags=re.I)
if m:
    new_html = tr[:m.end()] + new_body + tr[tr.find('</body>'):]
else:
    new_html = tr

# backup original
Path(r"d:/Eduooz/eduooz/courses/nursing/kerala/treatment-organiser.html.bak").write_text(tr, encoding='utf-8')
Path(r"d:/Eduooz/eduooz/courses/nursing/kerala/treatment-organiser.html").write_text(new_html, encoding='utf-8')
print('Reordered treatment-organiser.html according to apn.html template. Backup created.')
