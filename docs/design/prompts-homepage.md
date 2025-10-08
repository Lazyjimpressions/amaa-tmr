see below suggestions.use as inspiration and incorporate into our design structure

You are designing the homepage for the AM&AA Market Survey platform at tmr.amaaonline.com.
Use React + TypeScript + Tailwind + Framer Motion.
Do not include placeholder lorem text — use the copy below exactly.
All sections should be responsive and production-ready.

========================================================
🏠 PAGE NAME: HomePage.tsx
========================================================

## GLOBAL STYLE
- Use Tailwind with AM&AA color tokens:
  - Primary Navy: #0B3C5D
  - Accent Gold: #F29F05
  - Neutral Gray: #F5F5F5
  - Text Gray: #4B5563
- Font: Inter, with semibold headings and normal body
- Section max width: 1200px, centered, with 6rem vertical padding
- Use clean grid layouts (2-col desktop, stacked mobile)
- Use Framer Motion for subtle scroll fade/slide transitions
- Apply soft shadows, rounded-2xl cards, and ample white space
- Optimize for performance — avoid heavy parallax or video

========================================================
SECTION 1 — HERO
========================================================
Background: gradient from #0B3C5D → #062C47, white text

Left column:
  <h1 class="text-5xl font-semibold leading-tight mb-4">
    Your Window Into the Middle Market
  </h1>
  <p class="text-lg text-gray-100 mb-8">
    Explore exclusive insights, deal data, and valuation trends from the AM&AA Market Survey —
    the definitive benchmark for middle-market M&A.
  </p>
  <div class="flex gap-4">
    <Button variant="primary">Access Insights</Button>
    <Button variant="secondary">Take the Survey</Button>
  </div>

Right column:
  Animated data card using Framer Motion:
  - "500+ Advisors"
  - "10+ Years of Data"
  - "$50M Avg. Deal Size"
  Cards fade-in sequentially with 0.3s delay

========================================================
SECTION 2 — SCROLLYTELLING INSIGHTS (REACT ISLAND)
========================================================
Mount as a standalone <InsightsScroller /> component for future Supabase integration.

Layout: Sticky left column headline + scrolling right-side cards

Left (sticky):
  <h2 class="text-3xl font-semibold text-[#0B3C5D] mb-6">
    Key Market Insights
  </h2>
  <p class="text-gray-600">
    Highlights from the most recent AM&AA Market Survey.
  </p>

Right (scroll cards):
  Each card is a Framer Motion element with fade/slide animation.
  Use light background (#F5F5F5) and subtle shadow.

Cards (5 total):
  1. Valuations Remain Resilient — "Median EBITDA multiple rose to 7.2×"
  2. Private Equity Dominance — "62% of sub-$100M deals involve PE buyers"
  3. Confidence Index High — "Deal confidence climbs to 8.1"
  4. Sector Spotlight — "Top sectors: Business Services, Healthcare, Industrials"
  5. Looking Ahead — "75% of advisors expect activity growth"

========================================================
SECTION 3 — CREDIBILITY BAND
========================================================
White background, centered text and logos.

<h3 class="text-2xl font-semibold text-[#0B3C5D] mb-2">
  Trusted by the Middle-Market Community
</h3>
<p class="text-gray-600 mb-8">
  For over a decade, the AM&AA Market Survey has captured the voice of hundreds of M&A professionals across North America.
</p>

Horizontal badge row:
  - "500+ Members Contributing"
  - "10+ Years of Historical Data"
  - "Produced by the Alliance of M&A Advisors"

Logo strip (grayscale, hover to colorize)
Optional testimonial carousel below (fade auto-rotate every 6s)

========================================================
SECTION 4 — CTA / MEMBERSHIP BLOCK
========================================================
Background: #0B3C5D, gold accent underline, white text, centered content.

<h3 class="text-3xl font-semibold mb-4 text-white">
  Unlock Full Access to the AM&AA Market Report
</h3>
<p class="text-gray-200 mb-8">
  Members receive exclusive access to the complete Market Survey,
  in-depth analytics dashboard, and private dealmaking community.
</p>

<Button variant="gold" size="lg">Join AM&AA</Button>
<Button variant="outline" size="lg" class="mt-4">Learn About Membership</Button>

========================================================
SECTION 5 — FOOTER
========================================================
Dark navy background, 3-column grid on desktop.

Column 1:
  <h4>About AM&AA</h4>
  <p>Connecting and empowering middle-market M&A professionals worldwide.</p>
  <a href="https://amaaonline.com" class="text-[#F29F05]">Learn More →</a>

Column 2:
  Quick Links:
  - Market Survey
  - Insights Dashboard
  - Reports
  - Membership
  - Contact Us

Column 3:
  Connect:
  - LinkedIn, X (Twitter), Email icons (hover gold)
  <p>© 2025 Alliance of M&A Advisors</p>

========================================================
RESPONSIVE / MOTION NOTES
========================================================
- Mobile: Stack hero columns and center text/buttons
- Scrollytelling collapses into vertical carousel
- Footer columns stack with border dividers
- Framer Motion for each section’s fade/slide on viewport
- Keep transitions subtle and professional (ease-in-out 250ms)

========================================================
FUTURE EXTENSIONS (Leave commented placeholders)
========================================================
{/* TODO: Integrate Supabase edge function for live survey stats */}
{/* TODO: Replace static insight cards with dynamic data feed */}
{/* TODO: Add user auth logic via Supabase magic link */}

========================================================
OUTPUT REQUIREMENTS
========================================================
- Generate a full functional React page component: HomePage.tsx
- Include all Tailwind utility classes inline
- Export as default function HomePage()
- Use shadcn/ui Button component if available, else define simple variant buttons
