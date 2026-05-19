import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import {
  BookOpen, ChevronDown, ChevronRight, Package, Users,
  ShoppingCart, MessageSquare, Calendar, Paintbrush,
  Layout, Globe, Settings, Briefcase, TrendingUp,
  Search, Star, AlertCircle, CheckCircle, Info,
} from 'lucide-react';

// ── GUIDE CONTENT ──────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'getting-started',
    icon: Star,
    title: 'Getting Started',
    color: 'gold',
    articles: [
      {
        title: 'How to login',
        content: `
**Admin Panel:** http://localhost:3010
**Default login:** admin@vantix.io / Admin@2026

After logging in you will see the Dashboard with stats, recent activity and quick actions.

The sidebar on the left shows all available modules. What you see depends on your role and permissions — a sales staff member sees fewer options than an admin.
        `,
      },
      {
        title: 'Understanding the sidebar',
        content: `
The sidebar is grouped into sections:

**Main** — Core jewellery modules (products, diamonds, gemstones, pearls, mountings)

**Commerce** — Sales operations (orders, enquiries, appointments, customers, exhibitions)

**Catalogue** — Content management (categories, media, bulk import, blog)

**Theme & Home** — Website appearance (theme settings, homepage content)

**Website Builder** — Navigation and page management (menu builder, custom pages)

**System** — Admin tools (workforce, gold rates, payments, ERP sync, settings)

Each item only appears if you have permission to access it.
        `,
      },
      {
        title: 'First time setup checklist',
        content: `
Complete these steps before your first demo or go-live:

☐ **1. Store settings** → System → Settings → enter store name, WhatsApp number, logo URL

☐ **2. Theme** → Theme & Home → Theme settings → pick your theme (recommend: Tejori Cream)

☐ **3. Gold rate** → System → Gold rates → click "Fetch from web" to get today's rate

☐ **4. Add categories** → Catalogue → Categories → create your jewellery categories

☐ **5. Add products** → Main → Jewellery → add at least 5-10 products with images

☐ **6. Homepage** → Theme & Home → Home page → turn on sections, add hero image

☐ **7. Menu** → Website Builder → Menu builder → review and update navigation links

☐ **8. Test storefront** → open http://localhost:3011 and check everything looks right

☐ **9. Add staff** → System → Workforce → create staff accounts with correct roles
        `,
      },
    ],
  },
  {
    id: 'products',
    icon: Package,
    title: 'Adding Products',
    color: 'blue',
    articles: [
      {
        title: 'How to add a jewellery product',
        content: `
Go to **Main → Jewellery → + Add product**

**Required fields:**
- Product name (e.g. "Diamond Solitaire Ring")
- SKU (unique code, e.g. "TJR-001")
- Category (select from your categories)
- Metal type (Gold, Platinum, Silver, etc.)
- Purity (18K, 22K, 24K, etc.)
- Gross weight (in grams)

**Pricing — two modes:**

**Mode 1 — Fixed price (luxury/branded):**
Enter a final price directly. This is what Cartier, Graff, and most luxury boutiques do. The gold rate does NOT affect this price. Best for high jewellery, designer pieces.

**Mode 2 — Gold-linked price (gold-by-weight):**
Leave final price blank OR tick "Gold linked". System calculates: weight × gold rate + making charge %. Best for plain gold jewellery sold by weight.

**Images:** Upload main image first (it becomes the display image), then additional images.

**Status:** Set to Draft while working, Published when ready to show on website.
        `,
      },
      {
        title: 'Diamonds, Gemstones, Pearls',
        content: `
These are separate modules from Jewellery products.

**Diamonds** (Main → Diamonds):
- For certified loose diamonds and diamond jewellery
- Enter 4Cs: Carat, Cut, Color, Clarity
- Attach GIA/IGI/HRD certificate number
- Mark as Natural or Lab Grown — NEVER mix these on the same page
- RapNet integration: live diamond prices can be shown if enabled

**Gemstones** (Main → Gemstones):
- Sapphires, rubies, emeralds, etc.
- Enter: type, color, cut, carat, origin, treatment

**Pearls** (Main → Pearls):
- Freshwater, Akoya, South Sea, Tahitian
- Enter: type, size, luster, nacre, shape
        `,
      },
      {
        title: 'Bulk import products',
        content: `
Go to **Catalogue → Bulk import**

You can import products from a CSV or Excel file.

**Download the template first** — click "Download template" to get the correct column format.

**Required columns:** name, sku, metal_type, purity, gross_weight, final_price, status

**Optional columns:** description, category_id, collection_id, making_charge_pct, tags

After upload the system validates each row and shows errors before importing.

**Tip:** Import 10 products first as a test before doing a full import.
        `,
      },
    ],
  },
  {
    id: 'website',
    icon: Paintbrush,
    title: 'Website & Theme',
    color: 'purple',
    articles: [
      {
        title: 'Changing the theme and colors',
        content: `
Go to **Theme & Home → Theme settings**

**Pick a theme:** Click any theme card. 10 pre-built themes available:
- Tejori Cream — warm cream background, gold accents (recommended)
- Cartier Noir — dark luxury, white text
- Dubai Gold Souk — rich gold and dark
- Blue Nile — classic white and navy
- and 6 more

**Customize colors:** After picking a theme, use the Colors tab to adjust:
- Primary (accent) color — buttons, links, gold accents
- Background color
- Text color

**Fonts:** Headings and body font can be changed independently.

**Save & publish** → storefront updates in 1-2 seconds, no rebuild needed.
        `,
      },
      {
        title: 'Managing the homepage',
        content: `
Go to **Theme & Home → Home page content**

**Two tabs:**

**Hero tab** — Controls the main banner at the top:
- Hero type: Full Screen | Slider | Split Screen | Video | Minimal
- If Slider: pick transition (Fade/Slide/Zoom)
- Headline, subtext, button text and link
- Background image URL

**Sections tab** — All homepage sections listed:
- Toggle any section ON/OFF with the switch
- Drag ▲▼ arrows to reorder sections
- Click ✏️ to edit a section's text, image, heading
- Changes preview instantly — click Save & Publish when done

**Available sections:**
Hero, Announcement bar, Top Categories, Featured Products, Promo Strip, Brand Story, Testimonials, Collection Banners, Newsletter, Certification Logos, Editorial Banner, Learning Center, About Us, Why Choose Us, Upcoming Events
        `,
      },
      {
        title: 'Building custom pages',
        content: `
Go to **Website Builder → Custom pages**

The page builder has 3 panels:

**Left panel** — List of sections already on the page. Click + Add section to open the section picker (21 section types available, grouped by category). Click any section card to add it.

**Center panel** — Live preview of the page with a realistic storefront mockup. Switch between Desktop / Tablet / Mobile views.

**Right panel** — Slides in when you click a section. Edit that section's content: text, images, colors, links.

**Pages you can edit:** Homepage, About, Lab Diamond, Bespoke

**Save & Publish** — saves as JSON to database, storefront renders it immediately.
        `,
      },
      {
        title: 'Menu builder',
        content: `
Go to **Website Builder → Menu builder**

**Navigation style (pick one):**
- Mega Menu — full-width panel with columns and hover image (Palmiero/Tejori style)
- Standard — classic hover dropdown
- Centered Logo — logo in center, nav split on both sides
- Minimal — clean single line

**Menu tree (left panel):**
- Click any item to edit it on the right
- Click + Add sub-item to add a dropdown link
- Use ▲▼ arrows to reorder items
- Set each item type: dropdown, mega, or direct link

**Save → storefront navigation updates instantly**
        `,
      },
    ],
  },
  {
    id: 'commerce',
    icon: ShoppingCart,
    title: 'Orders & Sales',
    color: 'green',
    articles: [
      {
        title: 'How enquiries work',
        content: `
JCOS is enquiry-first, not checkout-first. This matches how luxury jewellery actually sells.

**Customer journey:**
1. Customer browses the website
2. Clicks "Request Price" or "Enquiry Now" on any product
3. WhatsApp opens with a pre-filled message (product name + SKU + page URL)
4. Your sales staff responds on WhatsApp
5. Deal closes in boutique or via WhatsApp

**In the admin (Commerce → Enquiries):**
- All enquiries are logged here
- Assign to a sales staff member
- Update status: New → Contacted → Qualified → Won / Lost
- Add notes and follow-up dates
- Link to the product they enquired about
        `,
      },
      {
        title: 'Managing appointments',
        content: `
Go to **Commerce → Appointments**

Customers book appointments from the storefront (/appointment page).

**Each appointment has:**
- Customer name, email, phone
- Preferred date and time
- Type (Consultation, Bespoke, Repair, etc.)
- Branch location
- Status: Pending → Confirmed → Completed / Cancelled

**Actions:**
- Confirm appointment → customer gets confirmation
- Reassign to a staff member
- Add internal notes
- Mark as completed after the visit

**Tip:** Sales staff only see appointments assigned to them (based on their permission policy).
        `,
      },
      {
        title: 'Custom / bespoke orders',
        content: `
Go to **Commerce → Custom orders**

When a customer wants a bespoke piece:
1. Customer fills the form on /custom page
2. Request appears here with their requirements
3. Assign to a designer/sales staff
4. Track stages: Request → Design → CAD → Approval → Production → Ready → Delivered
5. Add notes, upload CAD files, set delivery date

**WhatsApp integration:** Each custom order has a WhatsApp button to contact the customer directly.
        `,
      },
    ],
  },
  {
    id: 'workforce',
    icon: Briefcase,
    title: 'Workforce & Permissions',
    color: 'amber',
    articles: [
      {
        title: 'Adding a staff member',
        content: `
Go to **System → Workforce → Staff tab → + Add staff**

**Steps:**
1. Enter name and email address
2. Select their role (Sales Staff, Inventory Staff, etc.)
3. Assign to a branch (e.g. Dubai Mall Branch)
4. Assign to a department (e.g. Sales)
5. Optionally assign permission policies for extra/restricted access
6. Click **Create staff & get activation link**
7. Copy the activation link and send it to the staff member via WhatsApp or email
8. Staff member clicks the link, sets their password, account becomes active

**Important:** Staff NEVER receive an email invite automatically. You must copy and send the link manually. Link expires in 7 days.
        `,
      },
      {
        title: 'Understanding roles and permissions',
        content: `
**9 built-in roles:**
- Super Admin — unrestricted access to everything
- Admin — full access except system settings
- Boutique Manager — operations + team management
- Sales Staff — enquiries, appointments, customers, orders
- Inventory Staff — products, diamonds, stock management
- Marketing Staff — blog, banners, page builder
- CRM Staff — customer relationship management
- Accountant — orders, payments, reports (read only)
- Viewer — read-only access to most modules

**How to change what a role can do:**
Go to System → Gold rates → Role Permissions tab → click Edit on any role → toggle capabilities on/off → Save.

Changes apply immediately to all users with that role — no code changes needed.

**Extra permissions (policies):**
You can add permission policies on top of a role for specific staff. Example: give one Sales Staff member access to the Blog that Sales Staff normally cannot see. Assign the "marketing_view" policy to that specific person.
        `,
      },
      {
        title: 'Branches and departments',
        content: `
**Branches** = physical locations (Dubai Mall, Abu Dhabi Mall, etc.)
Each staff member is assigned to a branch. This enables branch-level access control in future — e.g. Dubai staff can only see Dubai inventory.

**Departments** = functional teams (Sales, Inventory, Marketing, CRM, Accounting, Management)
Used for organizing staff and future reporting by department.

**To add a branch:** System → Workforce → Branches tab → + Add branch
**To add a department:** System → Workforce → Departments tab → + Add department
        `,
      },
    ],
  },
  {
    id: 'gold',
    icon: TrendingUp,
    title: 'Gold Rates',
    color: 'yellow',
    articles: [
      {
        title: 'How gold rates work',
        content: `
Go to **System → Gold rates**

The system stores the current Dubai retail gold rate (AED per gram) for 24K, 22K, 21K and 18K gold.

**This rate is displayed:**
- In the storefront header ticker (top bar)
- On the gold rates page in admin
- Used to calculate prices for gold-by-weight products (if any)

**For luxury jewellery (fixed price items):** The gold rate does NOT affect the product price. Cartier, Tejori and similar boutiques set prices independently of the daily gold rate.

**For gold-by-weight items:** Price = (weight × gold rate) + making charge %. Admin marks specific products as gold-linked.
        `,
      },
      {
        title: 'Updating the gold rate',
        content: `
**Method 1 — Automatic (recommended):**
Click **Fetch from web** button. The system tries Dubai City of Gold website, then goldratetodaydubai.com, then Gulf News as backup. Shows which source worked.

The system also auto-fetches 3 times daily at 9:05AM, 1:35PM and 6:05PM UAE time — matching when DJG (Dubai Jewellery Group) publishes official rates.

**Method 2 — Manual entry:**
Type the 24K rate in the manual entry form. The other karats (22K, 21K, 18K) calculate automatically. Click Save rate.

**Rate history:** Last 15 rate changes are shown in the history table with source and timestamp.
        `,
      },
    ],
  },
  {
    id: 'storefront',
    icon: Globe,
    title: 'Storefront & SEO',
    color: 'teal',
    articles: [
      {
        title: 'How the storefront works',
        content: `
The storefront (customer-facing website) is at **http://localhost:3011** (development) or your domain in production.

**How admin changes appear on storefront:**
Admin saves setting → Database → Storefront reads on next page load → Customer sees change

Most changes appear in 1-2 seconds. No rebuild needed for:
- Theme colors and fonts
- Homepage sections (on/off, reorder, content)
- Gold rates
- Products (add/edit/publish)
- Menu navigation
- Frontend settings (cookie, popup, maintenance)

**Customer portal:** Customers can create accounts at /account/login. They can view wishlist, appointment history, and enquiry history.

**Language:** English/Arabic toggle in the header. Arabic switches to RTL layout with Arabic fonts automatically.

**Currency:** AED/USD/EUR/GBP/INR/SAR converter in the header. Prices shown in selected currency (approximate conversion).
        `,
      },
      {
        title: 'SEO settings',
        content: `
**Per-page SEO** is set automatically for most pages. To customize:

**Store-level SEO:** System → Settings → enter store name, SEO title, SEO description. These apply as defaults across the site.

**Product SEO:** When adding/editing a product, scroll down to the SEO section — enter custom title and description for that product page.

**Blog posts:** Each post has its own SEO title and description field.

**What's automatically set:**
- Page titles include store name
- Open Graph tags (for social sharing)
- Twitter card tags
- Canonical URLs
- robots: index, follow (or noindex for private pages)
        `,
      },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings & Admin',
    color: 'gray',
    articles: [
      {
        title: 'Frontend settings',
        content: `
Go to **Website Builder → Frontend settings**

**Preloader:** Loading animation when the site first opens. Toggle on/off. Pick spinner or logo style.

**Cookie consent:** EU/GDPR cookie notice. Toggle on/off. Customize the message text.

**Popup:** Promotional popup (newsletter signup, offer, etc.). Toggle on/off. Set title, message, and image.

**Maintenance mode:** Takes the storefront offline with a maintenance message. Toggle on — visitors see the maintenance page instead of the website. Toggle off to bring site back.

**Google Analytics:** Paste your GA4 measurement ID (e.g. G-XXXXXXXXXX). Tracking activates automatically.

**Custom code:** Add custom HTML/JS to the head or body of every page.
        `,
      },
      {
        title: 'Payment gateways',
        content: `
Go to **System → Payments**

**Supported gateways:**
- Tap (UAE/GCC — recommended)
- Geidea (Saudi Arabia)
- Tabby (Buy now pay later — UAE/SA)
- Tamara (Buy now pay later — KSA)
- Razorpay (India)
- Stripe (International)

For each gateway: enter your API keys, toggle active, set test/live mode.

**Note:** JCOS is enquiry-first. Payments are for future checkout flow — currently all sales go through WhatsApp enquiry. Payment gateway configuration is preparation for when checkout is added.
        `,
      },
      {
        title: 'ERP integration',
        content: `
Go to **System → ERP sync**

JCOS integrates with Vantix ERP for:
- Inventory sync (stock levels)
- Order sync (confirmed orders go to ERP)
- Customer sync
- Product pricing sync

**Setup:** Enter your Vantix ERP API endpoint and API key. Toggle sync on. Set sync interval.

**Sync log:** Shows last sync time, items synced, and any errors.
        `,
      },
    ],
  },
];

// ── ARTICLE RENDERER ──────────────────────────────────────────
function renderContent(text) {
  const lines = text.trim().split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }}/>;
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2,-2).includes('**')) {
      return <p key={i} style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', marginTop:16, marginBottom:4 }}>{line.slice(2,-2)}</p>;
    }
    // Inline bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j} style={{ fontWeight:600, color:'#1a1a1a' }}>{p.slice(2,-2)}</strong>
        : p
    );
    if (line.startsWith('☐ ') || line.startsWith('- ') || line.startsWith('* ')) {
      return <div key={i} style={{ display:'flex', gap:8, padding:'3px 0' }}>
        <span style={{ color:'#b8860b', flexShrink:0, marginTop:2 }}>{line.startsWith('☐') ? '☐' : '•'}</span>
        <p style={{ fontSize:13, color:'#4a4a4a', lineHeight:1.7 }}>{rendered.slice(1)}</p>
      </div>;
    }
    return <p key={i} style={{ fontSize:13, color:'#4a4a4a', lineHeight:1.8 }}>{rendered}</p>;
  });
}

const COLOR_MAP = {
  gold:   { bg:'#fdf8f3', border:'#e5d5a0', icon:'#b8860b', badge:'#fdf3d8', badgeText:'#92600a' },
  blue:   { bg:'#eff6ff', border:'#bfdbfe', icon:'#3b82f6', badge:'#dbeafe', badgeText:'#1e40af' },
  purple: { bg:'#faf5ff', border:'#e9d5ff', icon:'#9333ea', badge:'#f3e8ff', badgeText:'#7e22ce' },
  green:  { bg:'#f0fdf4', border:'#bbf7d0', icon:'#16a34a', badge:'#dcfce7', badgeText:'#15803d' },
  amber:  { bg:'#fffbeb', border:'#fde68a', icon:'#d97706', badge:'#fef3c7', badgeText:'#92400e' },
  yellow: { bg:'#fefce8', border:'#fef08a', icon:'#ca8a04', badge:'#fef9c3', badgeText:'#854d0e' },
  teal:   { bg:'#f0fdfa', border:'#99f6e4', icon:'#0d9488', badge:'#ccfbf1', badgeText:'#0f766e' },
  gray:   { bg:'#f9fafb', border:'#e5e7eb', icon:'#6b7280', badge:'#f3f4f6', badgeText:'#374151' },
};

export default function UserGuidePage() {
  const { collapsed } = useOutletContext()||{};
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeArticle, setActiveArticle] = useState(0);
  const [search, setSearch] = useState('');

  const section = SECTIONS.find(s => s.id === activeSection);
  const colors  = COLOR_MAP[section?.color || 'gold'];

  // Search across all articles
  const searchResults = search.length > 2 ? SECTIONS.flatMap(s =>
    s.articles.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    ).map(a => ({ ...a, sectionTitle: s.title, sectionId: s.id, sectionColor: s.color }))
  ) : [];

  return (
    <>
      <Topbar title="User Guide" subtitle="How to use JCOS — complete documentation"/>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* LEFT — navigation */}
        <div style={{ width:240, flexShrink:0, borderRight:'1px solid var(--color-border-tertiary)', background:'var(--color-background-secondary)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Search */}
          <div style={{ padding:'12px 12px 8px' }}>
            <div style={{ position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-tertiary)' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guide…"
                style={{ width:'100%', padding:'8px 10px 8px 30px', fontSize:12, border:'1px solid var(--color-border-secondary)', borderRadius:8, background:'var(--color-background-primary)', color:'var(--color-text-primary)', outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>

          {/* Search results */}
          {search.length > 2 && (
            <div style={{ flex:1, overflowY:'auto', padding:'4px 8px' }}>
              {searchResults.length === 0
                ? <p style={{ fontSize:12, color:'var(--color-text-tertiary)', padding:'8px 4px' }}>No results found</p>
                : searchResults.map((r,i) => {
                    const c = COLOR_MAP[r.sectionColor];
                    return (
                      <button key={i} onClick={()=>{ setActiveSection(r.sectionId); setActiveArticle(SECTIONS.find(s=>s.id===r.sectionId)?.articles.findIndex(a=>a.title===r.title)||0); setSearch(''); }}
                        style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', marginBottom:4 }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--color-background-tertiary)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <p style={{ fontSize:12, fontWeight:600, color:'var(--color-text-primary)' }}>{r.title}</p>
                        <p style={{ fontSize:10, color:'var(--color-text-tertiary)', marginTop:2 }}>{r.sectionTitle}</p>
                      </button>
                    );
                  })
              }
            </div>
          )}

          {/* Section nav */}
          {!search && (
            <div style={{ flex:1, overflowY:'auto', padding:'4px 8px 16px' }}>
              {SECTIONS.map(s => {
                const isActive = activeSection === s.id;
                const c = COLOR_MAP[s.color];
                return (
                  <button key={s.id} onClick={()=>{ setActiveSection(s.id); setActiveArticle(0); }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, border:'none', cursor:'pointer', marginBottom:2, background: isActive ? c.badge : 'transparent', transition:'all .12s', textAlign:'left' }}
                    onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='var(--color-background-tertiary)'; }}
                    onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}>
                    <div style={{ width:28, height:28, borderRadius:8, background: isActive ? c.bg : 'var(--color-background-tertiary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <s.icon size={14} style={{ color: isActive ? c.icon : 'var(--color-text-tertiary)' }}/>
                    </div>
                    <span style={{ fontSize:12, fontWeight: isActive ? 600 : 400, color: isActive ? c.badgeText : 'var(--color-text-secondary)' }}>{s.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Version */}
          <div style={{ padding:'10px 14px', borderTop:'1px solid var(--color-border-tertiary)' }}>
            <p style={{ fontSize:10, color:'var(--color-text-tertiary)' }}>JCOS v0.9 · KenTech Global</p>
          </div>
        </div>

        {/* RIGHT — article content */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* Article list */}
          <div style={{ width:220, flexShrink:0, borderRight:'1px solid var(--color-border-tertiary)', overflowY:'auto', padding:'12px 8px' }}>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-text-tertiary)', padding:'4px 10px 8px' }}>
              {section?.title}
            </p>
            {section?.articles.map((a,i) => (
              <button key={i} onClick={()=>setActiveArticle(i)}
                style={{ width:'100%', textAlign:'left', padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', marginBottom:2, background: activeArticle===i ? colors.badge : 'transparent', borderLeft: activeArticle===i ? `2px solid ${colors.icon}` : '2px solid transparent', transition:'all .12s', fontSize:12, fontWeight: activeArticle===i ? 600 : 400, color: activeArticle===i ? colors.badgeText : 'var(--color-text-secondary)' }}
                onMouseEnter={e=>{ if(activeArticle!==i) e.currentTarget.style.background='var(--color-background-tertiary)'; }}
                onMouseLeave={e=>{ if(activeArticle!==i) e.currentTarget.style.background='transparent'; }}>
                {a.title}
              </button>
            ))}
          </div>

          {/* Article body */}
          <div style={{ flex:1, overflowY:'auto', padding:'32px 40px', maxWidth:760 }}>
            {section && section.articles[activeArticle] && (
              <>
                {/* Breadcrumb */}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
                  <span style={{ fontSize:11, color:'var(--color-text-tertiary)' }}>{section.title}</span>
                  <ChevronRight size={12} style={{ color:'var(--color-text-tertiary)' }}/>
                  <span style={{ fontSize:11, color:colors.icon, fontWeight:600 }}>{section.articles[activeArticle].title}</span>
                </div>

                {/* Title */}
                <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:32, fontWeight:300, color:'var(--color-text-primary)', marginBottom:8, lineHeight:1.2 }}>
                  {section.articles[activeArticle].title}
                </h1>
                <div style={{ width:40, height:2, background:colors.icon, borderRadius:2, marginBottom:28 }}/>

                {/* Content */}
                <div style={{ lineHeight:1.8 }}>
                  {renderContent(section.articles[activeArticle].content)}
                </div>

                {/* Navigation */}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:48, paddingTop:24, borderTop:'1px solid var(--color-border-tertiary)' }}>
                  <button
                    disabled={activeArticle === 0}
                    onClick={()=>setActiveArticle(i=>i-1)}
                    style={{ fontSize:12, color:activeArticle===0?'var(--color-text-tertiary)':colors.icon, background:'transparent', border:'none', cursor:activeArticle===0?'not-allowed':'pointer', fontWeight:500 }}>
                    ← Previous
                  </button>
                  <button
                    disabled={activeArticle === section.articles.length - 1}
                    onClick={()=>setActiveArticle(i=>i+1)}
                    style={{ fontSize:12, color:activeArticle===section.articles.length-1?'var(--color-text-tertiary)':colors.icon, background:'transparent', border:'none', cursor:activeArticle===section.articles.length-1?'not-allowed':'pointer', fontWeight:500 }}>
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
