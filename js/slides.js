// ============================================================
// DADEX STORY — SLIDES DATA
// Sequential 30-slide edition: s00–s29
// ============================================================

const FOUNDING_YEAR = 1959;
const CURRENT_YEAR = new Date().getUTCFullYear();
const YEARS_OPERATING = CURRENT_YEAR - FOUNDING_YEAR;
const DECADES_OPERATING = Math.floor(YEARS_OPERATING / 10);
const DECADES_TEXT = YEARS_OPERATING % 10 === 0
    ? `${DECADES_OPERATING} ${DECADES_OPERATING === 1 ? 'decade' : 'decades'}`
    : `more than ${DECADES_OPERATING} ${DECADES_OPERATING === 1 ? 'decade' : 'decades'}`;

const iconMap = {
    users: 'fa-users', lightbulb: 'fa-lightbulb', award: 'fa-award',
    'shield-alt': 'fa-shield-halved', 'scale-balanced': 'fa-scale-balanced',
    trophy: 'fa-trophy', microchip: 'fa-microchip', clock: 'fa-clock',
    'hands-helping': 'fa-handshake-angle', certificate: 'fa-certificate',
    globe: 'fa-globe', water: 'fa-faucet-drip', flask: 'fa-vial',
    industry: 'fa-industry', recycle: 'fa-recycle', server: 'fa-server',
    fire: 'fa-fire', building: 'fa-building', 'clipboard-list': 'fa-clipboard-list',
    tools: 'fa-screwdriver-wrench', 'chalkboard-teacher': 'fa-chalkboard-user',
    warehouse: 'fa-warehouse', 'check-circle': 'fa-circle-check',
    'oil-can': 'fa-oil-well', city: 'fa-city', heart: 'fa-heart',
    'users-cog': 'fa-user-gear', store: 'fa-store', handshake: 'fa-handshake',
    phone: 'fa-phone', envelope: 'fa-envelope', 'map-marker-alt': 'fa-location-dot',
    leaf: 'fa-leaf'
};

function getIcon(icon) {
    return iconMap[icon] || 'fa-circle';
}

const slidesData = [
    {
        id: 's00', label: '', bgImage: '', template: 'centre', variant: 'glass', timing: 9,
        notes: 'Opening identity.',
        content: [
            { type: 'image', src: 'assets/images/dadex_logo.png', cssClass: 'logo-image', animation: 'zoom', delay: 0.75, speed: 'very-slow' },
            {
            type: 'subheading',
            text: 'A Legacy of Excellence... Since 1959.',
            animation: 'word-fade',   
            delay: 3,                  
            wordStagger: 0.3,         // optional – time between each word (default 0.06)
            speed: 'very-slow'    // optional – transition duration per word
        }
        ]
    },
    {
    id: 's01',
    label: '',
    bgImage: '',
    template: 'centre',
    variant: 'glass',
    timing: 7,
    notes: 'The enduring promise.',
    content: [
        {
            type: 'subheading',
            text: 'Some commitments outlive the people who make them.',
            animation: 'word-fade',   
            delay: 1,                  
            wordStagger: 0.12,         // optional – time between each word (default 0.06)
            speed: 'very-very-slow'    // optional – transition duration per word
        }
    ]
},
    {
        id: 's02', label: '', bgImage: '', template: 'centre', variant: 'glass', timing: 9,
        notes: 'The beginning in 1959.',
        content: [
            { type: 'mainheading', text: `${FOUNDING_YEAR}`, animation: 'zoom', delay: 0.75, speed: 'very-slow' },
            { type: 'subheading', text: 'A vision was born. A commitment was forged.', animation: 'wipe-left', delay: 2.8, speed: 'very-slow' },
            { type: 'paragraph', text: 'A dedication to building trust through quality.', animation: 'fade', delay: 4.6, speed: 'very-slow' }
        ]
    },
    {
        id: 's03', label: '', bgImage: '', template: 'centre', variant: 'glass', timing: 9,
        notes: 'Continuity from origin to today.',
        content: [
            { type: 'mainheading', text: 'Today', animation: 'zoom', delay: 0.5, speed: 'very-very-slow' },
            { type: 'subheading', text: 'This commitment continues to shape what we build today.', animation: 'fade-up', delay: 2.3, speed: 'very-slow' },
            { type: 'paragraph', text: `${DECADES_TEXT.charAt(0).toUpperCase() + DECADES_TEXT.slice(1)} later, the principle remains unchanged.`, animation: 'fade', delay: 4.6, speed: 'very-slow' }
        ]
    },
    {
        id: 's04', label: '', bgImage: 'assets/images/beginning.jfif', template: 'centre', variant: 'divider', timing: 9,
        notes: 'Origin divider.',
        content: [
            { type: 'mainheading', text: `${FOUNDING_YEAR}`, animation: 'zoom', delay: 0.5, speed: 'very-very-slow' },
            { type: 'subheading', text: 'Where it all began.', animation: 'fade-up', delay: 2, speed: 'very-slow' },
            { type: 'paragraph', text: 'A vision took root in Hyderabad.', animation: 'fade', delay: 4, speed: 'very-slow' }
        ]
    },
    {
        id: 's05', label: 'Our Founder', bgImage: '', template: 'two-col', variant: 'glass', timing: 13,
        notes: 'Founder and guiding principles.',
        content: {
            left: [
                { type: 'heading', text: 'The Sanctity of a Commitment.', animation: 'fade-up', delay: 0.5 },
                { type: 'quote', text: '“The conduct towards others must be based on kindness, service, fairness, charity, justice, honesty and the sanctity of promise, pledge or agreement.”', animation: 'fade', delay: 2.8 },
                { type: 'caption', text: '— Kassim Dada, Founder Chairman (1919–2001)', animation: 'fade-up', delay: 5.2, speed: 'slow' }
            ],
            right: [
                { type: 'image', src: 'assets/images/f_chairman.jpg', alt: 'Founder Chairman', animation: 'fade', delay: 1.2, speed: 'slow' }
            ]
        }
    },
    {
        id: 's06', label: '', bgImage: '', template: 'centre', variant: 'divider', timing: 7,
        notes: 'Principles to purpose transition.',
        content: [
            { type: 'heading', text: 'Our Foundation. Our Commitment.', animation: 'letter', delay: 0.5, speed: 'slow' },
            { type: 'subheading', text: 'From principles to purpose.', animation: 'fade-up', delay: 2.6, speed: 'very-slow' }
        ]
    },
    {
        id: 's07', label: 'Our Vision', bgImage: '', template: 'centre', variant: 'glass', timing: 12,
        notes: 'What Dadex aspires to be.',
        content: [
            { type: 'heading', text: 'To Be the Most Valued Company.', animation: 'fade-up', delay: 0.7, speed: 'very-slow'},
            { type: 'quote', text: '“...to be the most valued company for all stakeholders, renowned for customer focus, innovation, quality, reliability & ethical practices.”', animation: 'fade-up', delay: 3, speed: 'slow' },
            { type: 'caption', text: 'Guided by the principles of our Founder.', animation: 'fade-up', delay: 9, speed: 'slow'},

        ]
    },
    {
        id: 's08', label: 'Our Mission', bgImage: '', template: 'bullets', variant: 'glass', timing: 19,
        notes: 'Mission translated into action.',
        content: [
            { type: 'heading', text: 'Unparalleled Service – Best Value.', animation: 'fade-up', delay: 0.7, speed: 'very-slow' },
            { type: 'subheading', text: 'A commitment translated into action.', animation: 'fade', delay: 2, speed: 'very-slow' },
            { type: 'bullet-list', animation: 'stagger', delay: 3, stagger: 0.5, items: [
                'We shall provide unparalleled service and best value to our customers through dedicated, responsive and cost effective supply chain.',
                'We are committed to provide quality products by strict adherence to international standards and best practices through technical collaboration with leading global companies in markets we serve.',
                'We are committed to follow business ethics, comply with HSE standards and enhance our contribution to society.',
                'We shall strive to maximize our shareholders value through sustained profitable growth.',
                'We shall enhance existing employee productivity, hire, retain and develop best talent and provide them a competitive environment to excel and grow.',
                'We will aggressively focus on increasing our market penetration by exploring new channels',
                'We shall continue to set new trends through innovative marketing and manufacturing.'
            ] }
        ]
    },
    {
        id: 's09', label: 'Our Values', bgImage: '', template: 'cards', variant: 'glass', timing: 15,
        notes: 'Five principles, one culture.',
        content: [
            { type: 'heading', text: 'The Building Blocks of Trust.', animation: 'scale-fade', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Five principles · One culture', animation: 'fade-up', delay: 3, speed: 'very-slow' },
            { type: 'card-grid', cols: 5, animation: 'stagger', delay: 5, stagger: 0.72, cards: [
                { icon: 'users', title: 'Customer Focus', desc: 'Superior customer support. Magnified focus.' },
                { icon: 'lightbulb', title: 'Innovation', desc: 'Boundless thinking. Timeless innovation.' },
                { icon: 'award', title: 'Quality', desc: 'Quality assured is quality delivered.' },
                { icon: 'shield-alt', title: 'Reliability', desc: 'Reliability and trust — a secure balance.' },
                { icon: 'scale-balanced', title: 'Ethical Practices', desc: 'Solid links to strong principles.' }
            ] }
        ]
    },
    {
        id: 's10', label: 'The Dadex Advantage', bgImage: '', template: 'cards', variant: 'glass', timing: 18,
        notes: 'External proof of the Dadex advantage.',
        content: [
            { type: 'heading', text: 'Commitment Proven Through Performance.', animation: 'fade-up', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Portfolio · Technology · Support · Reach', animation: 'fade', delay: 1.8, speed: 'very-slow' },
            { type: 'card-grid', cols: 4, animation: 'stagger', delay: 3, stagger: 0.6, cards: [
                { icon: 'trophy', title: 'Market Leadership', desc: `${YEARS_OPERATING}+ years of trust` },
                { icon: 'microchip', title: 'European Technology', desc: 'Wavin, Effast, Magnaplast' },
                { icon: 'clock', title: 'Legacy', desc: 'Built for the long term' },
                { icon: 'hands-helping', title: 'Technical Support', desc: 'Engineering assistance' },
                { icon: 'certificate', title: 'Certified Quality', desc: 'ISO, PSQCA & API-certified' },
                { icon: 'globe', title: 'Nationwide Network', desc: 'Sales offices and dealer network' },
                { icon: 'water', title: 'Complete Portfolio', desc: 'Water supply, sewerage & drainage, gas, roofing' },
                { icon: 'flask', title: 'Innovation', desc: 'Antimicrobial, PPR-CT, low-noise systems' }
            ] }
        ]
    },
    {
        id: 's11', label: '', bgImage: 'assets/images/timeline.jfif', template: 'centre', variant: 'divider', timing: 9,
        notes: 'History divider.',
        content: [
            { type: 'heading', text: 'The Journey Through the Decades', animation: 'zoom', delay: 0.5, speed: 'slow' },
            { type: 'subheading', text: 'From a vision to an industry leader.', animation: 'fade-up', delay: 2.5, speed: 'very-slow' },
            { type: 'paragraph', text: 'A journey built on reliability, innovation and trust.', animation: 'fade', delay: 4.5, speed: 'very-slow' }
        ]
    },
    {
        id: 's12', label: 'Our Glorious History', bgImage: '', template: 'timeline', variant: 'glass', timing: 40, speed: 'very-slow',
        notes: '1959–1975: formative years.',
        content: { era: '1959 – 1975', title: 'The Formative Years', intro: 'Building the foundations.', events: [
            { year: '1959', title: 'The Beginning', desc: 'First plant in Hyderabad' },
            { year: '1959', title: 'First Product', desc: 'Launched FC Corrugated Sheets' },
            { year: '1959', title: 'Portfolio Expansion', desc: 'FC Decorative Sheets' },
            { year: '1962', title: 'International Collaborations', desc: 'Eternit Group of Belgium' },
            { year: '1964', title: 'Portfolio Expansion', desc: 'FC Building Pipes' },
            { year: '1965', title: 'Plant Opening', desc: 'Chittagong Plant, East Pakistan' },
            { year: '1966', title: 'Plant Opening', desc: 'Karachi Plant, Pakistan' },
            { year: '1966', title: 'Portfolio Expansion', desc: 'FC Pressure & Sewer Pipes' },
            { year: '1967', title: 'ACIL Logo Creation', desc: 'New identity' }
        ] }
    },
    {
        id: 's13', label: 'Our Glorious History', bgImage: '', template: 'timeline', variant: 'glass', timing: 13,
        notes: '1976–1989: resilience and renewal.',
        content: { era: '1976 – 1989', title: 'Resilience & Renewal', intro: 'A period of resilience, progress and leadership transition.', events: [
            { year: '1984', title: 'International Expansion', desc: 'ACIL Cottage International exhibition' },
            { year: '1987', title: 'Standards', desc: 'Pakistan Standard license for FC Sheets' },
            { year: '1989', title: 'Leadership Transition', desc: 'Mr. Sikander Dada appointed CEO & MD' }
        ] }
    },
    {
        id: 's14', label: 'Our Glorious History', bgImage: '', template: 'timeline', variant: 'glass', timing: 50,
        notes: '1990–2005: building leadership.',
        content: { era: '1990 – 2005', title: 'Building Leadership', intro: 'Expanding horizons through technology and innovation.', events: [
            { year: '1990', title: 'The Shift', desc: 'New name Dadex Eternit Ltd.' },
            { year: '1991', title: 'International Collaborations', desc: 'Wavin, Netherlands — thermoplastic piping systems introduced in Pakistan' },
            { year: '1991', title: 'Portfolio Expansion', desc: 'UPVC Pressure Piping' },
            { year: '1993', title: 'Portfolio Expansion', desc: 'PE pipes for Water & Gas applications' },
            { year: '1997', title: 'Portfolio Expansion', desc: 'Nikasi, SWV piping system' },
            { year: '1998', title: 'ISO Certification', desc: 'Quality systems' },
            { year: '1999', title: 'Portfolio Expansion', desc: 'Polydex, PPR hot/cold water piping system' },
            { year: '2002', title: 'Portfolio Expansion', desc: 'PE Cable Duct & UPVC Electrical Conduits' },
            { year: '2003', title: 'New Identity', desc: 'New Dadex Logo. Values, Vision & Mission Statements' },
            { year: '2005', title: 'International Recognition', desc: 'API certified Dadex to use its official monogram on PE gas pipes' },
            { year: '2005', title: 'Recognition', desc: 'Dadex certified as an Investor in People (IIP) company.' },
            { year: '2005', title: 'Portfolio Expansion', desc: 'Aluminum Composite Panels (ACP)' }
        ] }
    },
    {
        id: 's15', label: 'Our Glorious History', bgImage: '', template: 'timeline', variant: 'glass', timing: 50,
        notes: '2006–2025: forging the future.',
        content: { era: '2006 – 2025', title: 'Forging the Future', intro: 'Defining excellence through innovation, engineering and global standards.', events: [
            { year: '2006', title: 'Portfolio Expansion', desc: 'UPVC Sewerage Piping System. UPVC Tubewell, Casing & Screen Pipes' },
            { year: '2006', title: 'Technological Advancement', desc: 'Dadex embraces SAP Solutions' },
            { year: '2007', title: 'Plant Opening', desc: 'Lahore Plant, Pakistan' },
            { year: '2008', title: 'Specialty Piping Systems', desc: 'Solutions for Chilled Water, Fuel Transfer, Chemical Drainage' },
            { year: '2015', title: 'Portfolio Expansion', desc: 'Thermoline, PPR hot/cold water piping system' },
            { year: '2017', title: 'Antimicrobial Pipes', desc: "Pakistan's first antimicrobial piping system" },
            { year: '2018', title: 'International Collaborations', desc: 'Marley Plumbing and Drainage, UK. Effast, Italy' },
            { year: '2021', title: 'Portfolio Expansion', desc: 'Polydex PP-RCT, an advanced 4th-generation piping system' },
            { year: '2022', title: 'International Collaboration', desc: 'Magnaplast, Poland' },
            { year: '2023', title: 'Portfolio Expansion', desc: 'Polyduct, Low-noise SWV piping system' },
            { year: '2024', title: 'Portfolio Expansion', desc: 'Non-Return Valves' },
            { year: '2025', title: 'Portfolio Expansion', desc: 'Catch Basins, Underground drainage' }
        ] }
    },
    {
        id: 's16', label: '', bgImage: 'assets/images/manufacturing.png', template: 'centre', variant: 'divider', timing: 7,
        notes: 'Capability divider.',
        content: [
            { type: 'heading', text: 'Delivering on Our Commitment.', animation: 'letter', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Manufacturing · Quality · Innovation', animation: 'fade-up', delay: 2.5, speed: 'very-slow' },
            { type: 'paragraph', text: 'Where precision meets purpose.', animation: 'fade', delay: 4.5, speed: 'very-slow' }
        ]
    },
    {
        id: 's17', label: 'Capability', bgImage: '', template: 'cards', variant: 'glass', timing: 12,
        notes: 'The capability behind the commitment.',
        content: [
            { type: 'heading', text: 'The Capability Behind the Commitment.', animation: 'fade-up', delay: 1, speed: 'very-slow' },
           // { type: 'subheading', text: 'Manufacturing · Testing · Control · Delivery', animation: 'fade', delay: 2 },
            { type: 'card-grid', cols: 4, animation: 'stagger', delay: 3, stagger: 0.9, cards: [
                { icon: 'microchip', title: 'Automation', desc: 'Modern extrusion lines for precision manufacturing.' },
                { icon: 'flask', title: 'Testing Lab', desc: 'ISO-certified quality control laboratory.' },
                { icon: 'check-circle', title: 'Quality Control', desc: 'From raw material to finished product testing.' },
                { icon: 'warehouse', title: 'Warehousing', desc: 'Supporting nationwide distribution.' }
            ] }
        ]
    },
    {
        id: 's18', label: 'Product Range', bgImage: '', template: 'cards', variant: 'glass', timing: 16,
        notes: 'Solutions for the systems that matter.',
        content: [
            { type: 'heading', text: 'Solutions for the Systems That Matter.', animation: 'zoom', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Water Supply · Sewerage & Drainage · Gas · Infrastructure · Roofing', animation: 'fade-up', delay: 2, speed: 'very-slow' },
            { type: 'card-grid', cols: 3, animation: 'stagger', delay: 3.2, stagger: 0.7, cards: [
                { icon: 'water', title: 'Water Supply', desc: 'Aquadex, T-Flex, Polydex, Thermoline.' },
                { icon: 'industry', title: 'Soil, Waste & Vent', desc: 'Nikasi and Polyduct low-noise systems.' },
                { icon: 'recycle', title: 'Underground Sewerage', desc: 'Flow Line, Inspection Chambers, Catch Basins.' },
                { icon: 'server', title: 'Cable Ducting', desc: 'PE Cable Duct, Electroduct, Conduits.' },
                { icon: 'fire', title: 'Gas Supply', desc: 'T-Flex PE 80 and PE 100 — API-certified.' },
                { icon: 'building', title: 'Fiber Cement', desc: 'Chrysotile Cement roofing — six decades of expertise.' }
            ] }
        ]
    },
    {
        id: 's19', label: 'Services', bgImage: '', template: 'cards', variant: 'glass', timing: 12,
        notes: 'Support before, during and after the sale.',
        content: [
            { type: 'heading', text: 'Beyond the Product. A Partnership Built on Commitment.', animation: 'fade-up', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Support before, during and after the sale.', animation: 'fade', delay: 2, speed: 'very-slow' },
            { type: 'card-grid', cols: 4, animation: 'stagger', delay: 3.2, stagger: 0.9, cards: [
                { icon: 'clipboard-list', title: 'Design & Proposals', desc: 'Design proposals, BOQ, estimates and product selection.' },
                { icon: 'tools', title: 'Tools Availability', desc: 'Tools for jointing, laying and installation.' },
                { icon: 'chalkboard-teacher', title: 'Demonstrations & Training', desc: 'In-house, field and plumber training.' },
                { icon: 'hands-helping', title: 'On-Site Support', desc: 'Laying and testing support.' }
            ] }
        ]
    },
    {
        id: 's20', label: 'Certifications', bgImage: '', template: 'cards', variant: 'glass', timing: 13,
        notes: 'Standards that earn trust.',
        content: [
            { type: 'heading', text: 'Standards That Earn Trust.', animation: 'fade-up', delay: 0.5 },
            { type: 'subheading', text: 'Quality is measured · Standards are met · Confidence is built.', animation: 'fade', delay: 2, speed: 'very-slow' },
            { type: 'card-grid', cols: 5, animation: 'stagger', delay: 3.2, stagger: 0.9, cards: [
                { icon: 'certificate', title: 'ISO 9001', desc: 'Quality Management System.' },
                { icon: 'certificate', title: 'ISO 14001', desc: 'Environmental Management.' },
                { icon: 'certificate', title: 'ISO 45001', desc: 'Occupational Health & Safety.' },
                { icon: 'award', title: 'PSQCA', desc: 'Pakistan Standards certified.' },
                { icon: 'award', title: 'API Monogram', desc: 'Distinction for PE gas pipes.' }
            ] }
        ]
    },
    {
        id: 's21', label: '', bgImage: 'assets/images/delivery.jfif', template: 'centre', variant: 'divider', timing: 7,
        notes: 'Reach divider.',
        content: [
            { type: 'heading', text: 'A Network Built to Deliver.', animation: 'letter', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Nationwide reach · Local understanding', animation: 'fade-up', delay: 2.5, speed: 'very-slow' },
            { type: 'paragraph', text: 'A network built to serve.', animation: 'fade', delay: 4.5 }
        ]
    },
    {
        id: 's22', label: 'Geographic Presence', bgImage: '', template: 'two-col', variant: 'glass', timing: 13,
        notes: 'Manufacturing and sales presence across Pakistan.',
        content: {
            left: [
                { type: 'image', src: 'assets/images/map_pak.png', alt: 'Pakistan map', cssClass: 'geo-map', animation: 'fade', delay: 0.5, speed: 'slow' }
            ],
            right: [
                { type: 'heading', text: 'Close to Where It Matters.', animation: 'fade-up', delay: 0.5, speed: 'very-slow' },
                { type: 'subheading', text: 'From manufacturing to the market.', animation: 'fade', delay: 2, speed: 'very-slow' },
                { type: 'card-grid', cols: 2, animation: 'stagger', delay: 3, stagger: 0.9, cards: [
                    { icon: 'building', title: 'Head Office', desc: 'Karachi' },
                    { icon: 'industry', title: 'Manufacturing', desc: 'Hyderabad · Sundar (Lahore)' },
                    { icon: 'store', title: 'Sales Offices', desc: 'Karachi · Hyderabad · Lahore · Multan · Faisalabad · Islamabad · Peshawar' },
                    { icon: 'handshake', title: 'Supply Network', desc: 'Nationwide distributor/dealer network' }
                ] }
            ]
        }
    },
    {
        id: 's23', label: 'Trusted By', bgImage: '', template: 'cards', variant: 'glass', timing: 21,
        notes: 'Trusted across industries.',
        content: [
            { type: 'heading', text: 'Trusted Across Industries.', animation: 'fade-up', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Government · Corporate · Energy · Development · NGOs · International', animation: 'fade', delay: 2, speed: 'very-slow' },
            { type: 'card-grid', cols: 3, animation: 'stagger', delay: 3.2, stagger: 0.9, cards: [
                { icon: 'building', title: 'Government & Semi-Government', desc: 'KWSB • WASA • PHED • RDA • SSGC • SNGPL • CAA • Armed Forces • DHA • NRL' },
                { icon: 'oil-can', title: 'Oil, Gas & Energy', desc: 'PARCO • BP • Clough • Fauji Fertilizer • NRL' },
                { icon: 'industry', title: 'Corporate & Textile', desc: 'Liberty Mills • Nishaat Group • Abbott • WorldCall • Hanif Industries' },
                { icon: 'city', title: 'Builders & Developers', desc: 'Bahria Town • DHA • Eden Garden • Park Avenue • Techno City' },
                { icon: 'heart', title: 'NGOs & Healthcare', desc: 'AKDN • UNICEF • INTERSOS • DACAAR' },
                { icon: 'globe', title: 'International Export', desc: 'Canada • UK • UAE • Afghanistan' }
            ] }
        ]
    },
    {
        id: 's24', label: 'Health, Safety & Environment', bgImage: '', template: 'cards', variant: 'glass', timing: 15,
        notes: 'Building responsibly.',
        content: [
            { type: 'heading', text: 'Building Responsibly.', animation: 'zoom', delay: 0.5 },
            { type: 'subheading', text: 'People · Resources · Environment', animation: 'fade-up', delay: 2, speed: 'very-slow' },
            { type: 'card-grid', cols: 4, animation: 'stagger', delay: 3.2, stagger: 0.9, cards: [
                { icon: 'shield-alt', title: 'Sustainable Operations', desc: 'Facilities maintained in compliance with environmental standards.' },
                { icon: 'users-cog', title: 'Capacity Building', desc: 'Training employees and installers to prevent harmful practices.' },
                { icon: 'recycle', title: 'Resource Efficiency', desc: 'Waste recycling, dust control, monitoring for improvement.' },
                { icon: 'heart', title: 'Water-Wise Campaign', desc: 'Promoting water conservation since 2004.' }
            ] }
        ]
    },
    {
    id: 's25',
    label: '',
    bgImage: 'assets/images/production.png',
    template: 'centre',
    variant: 'divider',
    timing: 11,
    notes: 'Impact divider: transition from company proof to the closing story.',
    content: [
        {
            type: 'mainheading',
            text: `${YEARS_OPERATING} Years.`,
            animation: 'zoom',
            delay: 1,
            speed: 'very-slow'
        },
        {
            type: 'subheading',
            text: 'A legacy of trust and impact.',
            animation: 'fade-up',
            delay: 4, speed: 'very-very-slow'
        }
    ]
},
    {
    id: 's26',
    label: '',
    bgImage: '',
    template: 'centre',
    variant: 'glass',
    timing: 8,
    notes: 'The origin of the enduring Dadex commitment.',
    content: [
        {
            type: 'heading',
            text: 'Built on a Commitment.',
            animation: 'fade',
            delay: 0.5,
            speed: 'slow'
        },
        {
            type: 'subheading',
            text: 'In 1959, Dadex set out to build quality that would endure.',
            animation: 'fade-up',
            delay: 2.5, speed: 'very-slow'
        }
    ]
},
{
    id: 's27',
    label: '',
    bgImage: '',
    template: 'centre',
    variant: 'glass',
    timing: 9,
    notes: 'The promise lives on through today’s work.',
    content: [
        {
            type: 'heading',
            text: 'Today',
            animation: 'zoom',
            delay: 0.75,
            speed: 'slow'
        },
        {
            type: 'subheading',
            text: 'That promise lives on through the systems we build and the communities we serve.',
            animation: 'fade-up',
            delay: 2.8,
            speed: 'slow'
        }
    ]
},
{
    id: 's28',
    label: '',
    bgImage: '',
    template: 'centre',
    variant: 'glass',
    timing: 11,
    notes: 'The final future-facing narrative statement.',
    content: [
        {
            type: 'subheading',
            text: 'And our story is still being written.',
            animation: 'typewriter',
            delay: 2,
            charSpeed: 80
        }
    ]
},
    {
        id: 's29', label: '', bgImage: '', template: 'centre', variant: 'glass', timing: 16,
        notes: 'Brand and contact close.',
        content: [
            { type: 'image', src: 'assets/images/dadex_logo.png', cssClass: 'logo-image', animation: 'fade', delay: 0.5, speed: 'very-slow' },
            { type: 'subheading', text: 'Built on Trust. Driven by Innovation.', animation: 'fade-up', delay: 3, speed: 'very-slow' },
            { type: 'contact-info', animation: 'stagger', delay: 6, stagger: 0.8, items: [
                { icon: 'phone', text: '+92-21-111-000-789' },
                { icon: 'envelope', text: 'marketing@dadex.com' },
                { icon: 'globe', text: 'www.dadex.com' }
            ] }
        ]
    }
];
