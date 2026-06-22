Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Web

$root = 'd:\Eduooz\eduooz\courses\nursing'

function Normalize-Text {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return '' }
    return ($Value -replace '\s+', ' ').Trim()
}

function Encode-Text {
    param([string]$Value)
    return [System.Net.WebUtility]::HtmlEncode((Normalize-Text $Value))
}

function Encode-Attr {
    param([string]$Value)
    return [System.Net.WebUtility]::HtmlEncode((Normalize-Text $Value))
}

function Get-FirstMatch {
    param(
        [string]$Input,
        [string]$Pattern,
        [string]$Group = '1'
    )
    $match = [regex]::Match($Input, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $match.Success) { return $null }
    if ($Group -eq '0') { return $match.Value }
    return $match.Groups[$Group].Value
}

function Get-SectionMeta {
    param([string]$Section)

    $featuredBlockMatch = [regex]::Match($Section, '(?s)<a\s+class="testi-vid-featured".*?</a>')
    if (-not $featuredBlockMatch.Success) {
        throw "Could not parse featured testimonial block."
    }
    $featuredBlock = $featuredBlockMatch.Value

    $stackMatches = [regex]::Matches($Section, '(?s)<a\s+class="testi-vid-card".*?</a>')
    if ($stackMatches.Count -lt 2) {
        throw "Could not parse stack testimonial cards."
    }

    $featured = [ordered]@{
        Url   = Get-FirstMatch -Input $featuredBlock -Pattern 'href="([^"]+)"'
        Img   = Get-FirstMatch -Input $featuredBlock -Pattern 'src="([^"]+)"'
        Alt   = Get-FirstMatch -Input $featuredBlock -Pattern 'alt="([^"]+)"'
        Name  = Get-FirstMatch -Input $featuredBlock -Pattern '<h4 class="testi-vid-name">(.*?)</h4>'
        Rank  = Get-FirstMatch -Input $featuredBlock -Pattern '<span class="testi-vid-rank">(.*?)</span>'
        Inst  = Get-FirstMatch -Input $featuredBlock -Pattern '<span class="testi-vid-inst">(.*?)</span>'
        Year  = Get-FirstMatch -Input $featuredBlock -Pattern '<span class="testi-vid-year">(.*?)</span>'
        Quote = Get-FirstMatch -Input $featuredBlock -Pattern '<p class="testi-vid-quote">(.*?)</p>'
    }

    $stack = foreach ($match in $stackMatches) {
        $cardBlock = $match.Value
        [ordered]@{
            Url  = Get-FirstMatch -Input $cardBlock -Pattern 'href="([^"]+)"'
            Img  = Get-FirstMatch -Input $cardBlock -Pattern 'src="([^"]+)"'
            Alt  = Get-FirstMatch -Input $cardBlock -Pattern 'alt="([^"]+)"'
            Name = Get-FirstMatch -Input $cardBlock -Pattern '<h4 class="testi-vid-name">(.*?)</h4>'
            Rank = Get-FirstMatch -Input $cardBlock -Pattern '<span class="testi-vid-rank">(.*?)</span>'
            Year = Get-FirstMatch -Input $cardBlock -Pattern '<span class="testi-vid-year">(.*?)</span>'
        }
    }

    return [ordered]@{
        Featured = $featured
        Stack    = @($stack)
    }
}

function Get-FallbackMeta {
    $featured = [ordered]@{
        Url   = 'https://youtu.be/E1X1RFFt138?si=0TrAngTwP8UsTbqw'
        Img   = 'https://img.youtube.com/vi/E1X1RFFt138/maxresdefault.jpg'
        Alt   = 'Super notes for Assistant Professor in Nursing'
        Name  = 'Super notes for Assistant Professor in Nursing'
        Rank  = 'Latest Upload'
        Inst  = 'Eduooz - Nurses Learning Hub'
        Year  = '2025'
        Quote = 'Watch our latest nursing upload on our YouTube channel. More testimonial videos will be added soon.'
    }

    $stack = @(
        [ordered]@{
            Url  = 'https://youtu.be/4J_sUv_L5f0?si=eK1eW4HgoQy_c_4v'
            Img  = 'https://img.youtube.com/vi/4J_sUv_L5f0/maxresdefault.jpg'
            Alt  = 'DHS Staff Nurse Exam Preparation 2025'
            Name = 'DHS Staff Nurse Exam Preparation 2025'
            Rank = 'Exam Guide'
            Year = '2025'
        },
        [ordered]@{
            Url  = 'https://youtu.be/XjogZEgAA2M?si=CMIgkmReFJ203EEp'
            Img  = 'https://img.youtube.com/vi/XjogZEgAA2M/maxresdefault.jpg'
            Alt  = 'Mission NORCET 11 | Eduooz Academy'
            Name = 'Mission NORCET 11 | Eduooz Academy'
            Rank = 'NORCET'
            Year = '2025'
        }
    )

    return [ordered]@{
        Featured = $featured
        Stack    = $stack
    }
}

function Build-Role {
    param(
        [hashtable]$Item,
        [switch]$Featured
    )

    if ($Featured) {
        $parts = @()
        if ($Item.Inst) { $parts += (Normalize-Text $Item.Inst) }
        if ($Item.Year) { $parts += (Normalize-Text $Item.Year) }
        if ($parts.Count -gt 0) {
            return ($parts -join ' · ')
        }
        return (Normalize-Text $Item.Rank)
    }

    $parts = @()
    if ($Item.Rank) { $parts += (Normalize-Text $Item.Rank) }
    if ($Item.Year) { $parts += (Normalize-Text $Item.Year) }
    if ($parts.Count -gt 0) {
        return ($parts -join ' · ')
    }
    return (Normalize-Text $Item.Name)
}

function Build-Excerpt {
    param(
        [hashtable]$Item,
        [switch]$Featured
    )

    if ($Featured -and $Item.Quote) {
        return (Normalize-Text $Item.Quote)
    }

    $role = Build-Role -Item $Item
    if ([string]::IsNullOrWhiteSpace($role)) {
        return (Normalize-Text $Item.Name)
    }
    return "$role"
}

function Build-NewSection {
    param(
        [hashtable]$Featured,
        [hashtable[]]$Stack
    )

    $allItems = @($Featured) + @($Stack)
    $playlistItems = New-Object System.Collections.Generic.List[hashtable]
    $playlistItems.Add($Featured)
    foreach ($item in $Stack) {
        $playlistItems.Add($item)
    }

    $playlistMarkup = foreach ($index in 0..($playlistItems.Count - 1)) {
        $item = $playlistItems[$index]
        $isActive = $index -eq 0
        $itemClass = if ($isActive) { 'testi-playlist-item active' } else { 'testi-playlist-item' }
        $role = Encode-Text (Build-Role -Item $item)
        $excerpt = Encode-Text (Build-Excerpt -Item $item -Featured:($index -eq 0))
        $badge = if ($index -eq 0) { Encode-Text (Normalize-Text $item.Rank) } else { Encode-Text (Normalize-Text $item.Rank) }
        $img = Encode-Attr $item.Img
        $alt = Encode-Attr $item.Alt
        $url = Encode-Attr $item.Url
        $name = Encode-Text $item.Name
        @"
                        <article class="$itemClass" data-index="$index" data-url="$url"
                            data-img="$img" data-avatar="$img"
                            data-name="$name" data-sub="$role" data-badge="$badge"
                            data-quote="$excerpt">
                            <figure class="testi-item-thumb">
                                <img src="$img" alt="$alt" loading="lazy">
                                <div class="testi-item-play"><i class="fa-solid fa-play"></i></div>
                            </figure>
                            <div class="testi-item-info">
                                <h3 class="testi-item-name">$name</h3>
                                <div class="testi-item-role"><i class="fa-solid fa-location-dot"></i> $role</div>
                                <div class="testi-item-excerpt">"$excerpt"</div>
                            </div>
                            <div class="testi-item-number">$('{0:D2}' -f ($index + 1))</div>
                        </article>
"@
    }

    $featuredImg = Encode-Attr $Featured.Img
    $featuredAlt = Encode-Attr $Featured.Alt
    $featuredUrl = Encode-Attr $Featured.Url
    $featuredName = Encode-Text $Featured.Name
    $featuredRole = Encode-Text (Build-Role -Item $Featured -Featured)
    $featuredBadge = Encode-Text (Normalize-Text $Featured.Rank)
    $featuredQuote = Encode-Text (Build-Excerpt -Item $Featured -Featured)

    @"
<!-- SECTION 15: VIDEO TESTIMONIALS -->
        <section class="testimonials-section">
            <div class="testimonials-mesh-bg">
                <div class="mesh-blob blob-purple" style="top:-5%; left:-8%; width:550px; height:550px; opacity:0.3;"></div>
                <div class="mesh-blob blob-cyan" style="bottom:-5%; right:-5%; width:450px; height:450px; opacity:0.2;"></div>
            </div>
            <div class="container relative-z">
                <div class="testimonials-header">
                    <div class="glass-pill" style="display:inline-flex; margin-bottom:1.5rem;">
                        <div class="glowing-dot"></div>
                        <span>Student Success Stories</span>
                    </div>
                    <h2 class="testimonials-title">Real Students. <span class="text-gradient-fluid">Real Results.</span></h2>
                    <p class="testimonials-subtitle">Watch our latest testimonial upload on YouTube. More testimonial videos will be added to the channel soon.</p>
                </div>

                <div class="testimonials-layout">
                    <article class="testi-featured" id="testiFeatured">
                        <figure class="testi-featured-thumb">
                            <img id="testiFeaturedImg" src="$featuredImg" alt="$featuredAlt" loading="lazy">
                            <div class="testi-featured-overlay">
                                <button class="testi-play-btn" id="testiPlayBtn" aria-label="Play video">
                                    <span class="testi-play-ripple"></span>
                                    <i class="fa-solid fa-play"></i>
                                </button>
                            </div>
                            <div class="testi-info-float">
                                <div class="testi-avatar-ring">
                                    <img id="testiAvatarImg" src="$featuredImg" alt="$featuredAlt" loading="lazy">
                                </div>
                                <div class="testi-info-text">
                                    <div class="testi-info-name" id="testiName">$featuredName</div>
                                    <div class="testi-info-sub" id="testiSub">$featuredRole</div>
                                </div>
                                <div class="testi-info-badge" id="testiBadge"><i class="fa-solid fa-check"></i> $featuredBadge</div>
                            </div>
                        </figure>
                        <blockquote class="testi-featured-quote" id="testiQuote">
                            <i class="fa-solid fa-quote-left testi-quote-icon"></i>
                            <p>"$featuredQuote"</p>
                        </blockquote>
                    </article>

                    <div class="testi-playlist" id="testiPlaylist">
$(($playlistMarkup -join "`r`n"))
                    </div>
                </div>
            </div>
        </section>
<!-- SECTION 16: GOOGLE REVIEWS & TRUST WALL -->
"@
}

$files = Get-ChildItem -Path $root -Recurse -Filter *.html
$updated = 0
foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName
    if ($content -notmatch '<!-- SECTION 15:') { continue }

    $sectionPattern = '(?s)(<!-- SECTION 15:.*?-->.*?<!-- SECTION 16:.*?-->)'
    $sectionMatch = [regex]::Match($content, $sectionPattern)
    if (-not $sectionMatch.Success) {
        Write-Warning "Skipping $($file.FullName): section 15 block not found."
        continue
    }

    $sectionBlock = $sectionMatch.Value
    if ($sectionBlock -match 'testimonials-section' -and $sectionBlock -match 'data-url="[^"]+"') {
        continue
    }

    $sectionBodyMatch = [regex]::Match($sectionBlock, '(?s)<!-- SECTION 15:.*?-->(?<section>.*?)(?=<!-- SECTION 16:)')
    $meta = if ($sectionBodyMatch.Success -and $sectionBodyMatch.Groups['section'].Value -match 'testi-vid-featured') {
        try {
            Get-SectionMeta -Section $sectionBodyMatch.Groups['section'].Value
        }
        catch {
            Get-FallbackMeta
        }
    }
    else {
        Get-FallbackMeta
    }
    $newSection = Build-NewSection -Featured $meta.Featured -Stack $meta.Stack

    $replacement = $content.Substring(0, $sectionMatch.Index) + $newSection + $content.Substring($sectionMatch.Index + $sectionMatch.Length)
    Set-Content -Path $file.FullName -Value $replacement -Encoding UTF8
    $updated++
}

Write-Host "Updated $updated nursing landing pages."