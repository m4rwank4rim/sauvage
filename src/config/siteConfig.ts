export interface ServiceTier {
  id: string;
  name: string;
  category: string;
  price: number; // In-game GTA World dollars ($)
  popular?: boolean;
  tagline: string;
  deliveryTime: string;
  features: string[];
}

export interface SiteConfig {
  agencyName: string;
  tagline: string;
  headline: string;
  subheadline: string;
  serverInfo: {
    server: string;
    platform: string;
    operatingHours: string;
    inGameLocation: string;
    discordUrl: string;
    supportEmail: string;
  };
  stats: {
    label: string;
    value: string;
    description: string;
  }[];
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  services: ServiceTier[];
  testimonials: {
    id: string;
    characterName: string;
    businessName: string;
    avatarText: string;
    quote: string;
    rating: number;
    projectDelivered: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  oocDisclaimer: string;
}

export const siteConfig: SiteConfig = {
  agencyName: "Sauvage Creative",
  tagline: "Premier Brand & Visual Identity Agency of Los Santos",
  headline: "Graphic design that commands respect in Los Santos.",
  subheadline:
    "Bespoke brand identities, cocktail menus, and faction visuals crafted specifically for GTA World businesses. Instant deposits & payouts powered by Fleeca Bank.",
  serverInfo: {
    server: "GTA World Roleplay (GTAW)",
    platform: "RAGE:MP",
    operatingHours: "Monday - Sunday: 12:00 PM – 02:00 AM LS Time",
    inGameLocation: "Del Perro Plaza Suite 402, Los Santos, San Andreas",
    discordUrl: "https://discord.gg/gtaworld",
    supportEmail: "contact@sauvagecreative.ls",
  },
  stats: [
    {
      value: "160+",
      label: "Designs Delivered",
      description: "Logos, menus, & brand kits handed off across San Andreas.",
    },
    {
      value: "45+",
      label: "Businesses Branded",
      description: "From Vinewood clubs to Sandy Shores workshops and trucking fleets.",
    },
    {
      value: "24-48h",
      label: "Average Turnaround",
      description: "Swift, responsive delivery so your business grand opening isn't delayed.",
    },
    {
      value: "100%",
      label: "Fleeca Integrated",
      description: "Instant in-character banking verification via Fleeca Gateway API.",
    },
  ],
  howItWorks: [
    {
      step: "01",
      title: "Submit a request",
      description:
        "Tell us about your business concept, faction lore, target aesthetic, and deliverable specs through our intake portal.",
    },
    {
      step: "02",
      title: "Receive your quote",
      description:
        "Our art directors review your brief and issue an itemized estimate in in-game dollars ($) within 12 hours.",
    },
    {
      step: "03",
      title: "Pay securely via Fleeca",
      description:
        "Authorize the deposit through the official Fleeca Bank online gateway using your in-character routing and account.",
    },
    {
      step: "04",
      title: "Receive high-res files",
      description:
        "Download your print-ready PNG, vector SVG, vehicle texture `.ytd` guides, and BBCode forum markup directly.",
    },
  ],
  services: [
    {
      id: "logo-identity",
      name: "Logo & Visual Emblem",
      category: "Logos",
      price: 15000,
      tagline: "Distinctive mark tailored for forum threads, websites, and signage.",
      deliveryTime: "24-48 Hours",
      features: [
        "Primary logo + transparent PNGs",
        "Monochrome & inverted dark-mode badges",
        "Forum signature & avatar crop formatting",
        "Vector SVG master source file",
        "2 complimentary revision cycles",
      ],
    },
    {
      id: "complete-brand-kit",
      name: "Complete Business Brand Kit",
      category: "Brand Kit",
      price: 35000,
      popular: true,
      tagline: "The comprehensive package for grand openings and serious enterprises.",
      deliveryTime: "2-4 Days",
      features: [
        "Primary & secondary logo variations",
        "Custom letterhead & invoice template",
        "In-character business cards (Print-ready)",
        "Social media & Facebrowser banner package",
        "Official GTAW forum thread layout code (BBCode / HTML)",
        "3 revision rounds included",
      ],
    },
    {
      id: "print-menus-cards",
      name: "Menus, Cards & Collateral",
      category: "Print",
      price: 20000,
      tagline: "Sleek dining menus, bar drink lists, and promotional flyers.",
      deliveryTime: "24-48 Hours",
      features: [
        "Custom themed food / cocktail menu design",
        "High-definition printable in-game textures",
        "VIP loyalty card or entry pass designs",
        "Promotional event flyer (Facebrowser / Forum ready)",
        "Ready-to-use image URLs hosted indefinitely",
      ],
    },
  ],
  testimonials: [
    {
      id: "t1",
      characterName: "Dominic Vance",
      businessName: "CEO, Vance Security Group",
      avatarText: "DV",
      quote:
        "Vortex overhauled our armored transit fleet liveries and our corporate thread. Within 48 hours of paying the Fleeca deposit, the assets were ready. Professionalism unmatched in Los Santos.",
      rating: 5,
      projectDelivered: "Fleet Liveries & Corporate Kit",
    },
    {
      id: "t2",
      characterName: "Camilla Solano",
      businessName: "Proprietor, El Sol Lounge & Bar",
      avatarText: "CS",
      quote:
        "Our cocktail menu and grand opening flyers drew over 60 guests on opening night. Paying through Fleeca was instant and completely seamless. Wouldn't trust anyone else with my branding.",
      rating: 5,
      projectDelivered: "Cocktail Menu & Event Promo",
    },
    {
      id: "t3",
      characterName: "Marcus Thorne",
      businessName: "Managing Partner, Thorne & Associates Legal",
      avatarText: "MT",
      quote:
        "The typography and polish on our business cards and forum legal portal give us instant credibility with high-net-worth clients and corporate plaintiffs. Worth every in-game dollar.",
      rating: 5,
      projectDelivered: "Legal Brand Identity & Forum UI",
    },
    {
      id: "t4",
      characterName: "Elena 'Roxie' Petrova",
      businessName: "Lead Tuner, Redline Customs Sandy Shores",
      avatarText: "EP",
      quote:
        "Got our garage neon signage, t-shirt graphics, and mechanic shop invoice books designed. Speedy communication on Discord and zero hassle with Fleeca banking payments.",
      rating: 5,
      projectDelivered: "Garage Identity & Shop Merch",
    },
  ],
  faqs: [
    {
      question: "How does payment work with Fleeca Bank?",
      answer:
        "Once our creative directors review your design request and submit a quote, your project page updates with an itemized total. Clicking 'Pay with Fleeca' redirects you to the official Fleeca Bank Gateway (GTA World's in-character banking system). You authorize the payment using your character's routing number, and our system confirms it instantly via encrypted webhook.",
    },
    {
      question: "Are these real US Dollars or GTA World in-game currency?",
      answer:
        "All prices listed on this site ($) are strictly GTA World in-character currency. We operate strictly as an in-character service business within the GTA World roleplay server. No real-world currency is ever requested, charged, or accepted.",
    },
    {
      question: "What is your typical turnaround time?",
      answer:
        "Most standard logos and menus are delivered within 24 to 48 hours from deposit confirmation. Comprehensive brand packages and multi-vehicle fleet liveries typically take 2 to 4 days. If you have an urgent grand opening, rush delivery (<24h) is available.",
    },
    {
      question: "What happens if I need revisions?",
      answer:
        "Every design project includes 2 to 3 complimentary revision rounds depending on the tier. We collaborate directly with you via Discord or forum PM to fine-tune colors, fonts, layout, and iconography until it matches your exact vision.",
    },
    {
      question: "What file formats will I receive?",
      answer:
        "You will receive high-resolution PNGs with transparent backgrounds, lossless SVGs/vector graphics for scale, optimized JPGs for web/Facebrowser, and BBCode formatted snippets for the GTA World forums.",
    },
    {
      question: "Can I order custom assets not listed in the pricing tiers?",
      answer:
        "Absolutely! We frequently produce custom billboard advertisements, faction heraldry, nightclub VIP wristbands, and in-game prop textures. Submit a project request under 'Other / Custom' with your brief.",
    },
  ],
  oocDisclaimer:
    "OOC DISCLAIMER: Sauvage Creative is an in-character graphic design studio operating solely within the GTA World Roleplay (GTAW) environment. All transactions and currency values ($) represent GTA World in-game virtual money processed via the Fleeca Bank API. This project is not affiliated with, sponsored by, or endorsed by Rockstar Games, Take-Two Interactive, or any real-world financial institution.",
};
