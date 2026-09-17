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
    hotline: string;
    discordUrl: string;
    supportEmail: string;
  };
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  services: ServiceTier[];
  faqs: {
    question: string;
    answer: string;
  }[];
  oocDisclaimer: string;
}

export const siteConfig: SiteConfig = {
  agencyName: "SAUVAGE™",
  tagline: "Premier Brand & Visual Identity Agency of Los Santos",
  headline: "Graphic design that commands respect in Los Santos.",
  subheadline:
    "Bespoke brand identities, cocktail menus, and faction visuals crafted specifically for GTA World businesses. Instant deposits & payouts powered by Fleeca Bank.",
  serverInfo: {
    server: "GTA World Roleplay (GTAW)",
    platform: "FiveM",
    operatingHours: "Monday - Sunday: 12:00 PM – 02:00 AM LS Time",
    inGameLocation: "Badger Tower Office Complex - Floor 2, Room 3",
    hotline: "19003308",
    discordUrl: "https://discord.gg/SpYfh3VmU",
    supportEmail: "contact@sauvagecreative.ls",
  },
  howItWorks: [
    {
      step: "01",
      title: "Pick a package & brief it",
      description:
        "Choose a pricing tier or set your own budget, then tell us your business concept, faction lore, and deliverables through our intake portal.",
    },
    {
      step: "02",
      title: "Pay a 50% deposit, instantly",
      description:
        "Confirm with a single click and pay your 50% deposit through the Fleeca Bank gateway. For custom briefs, we issue a quote within 12 hours.",
    },
    {
      step: "03",
      title: "Work together in your project room",
      description:
        "Your private project room opens immediately — chat with your designer, upload reference images, and track every revision until it's right.",
    },
    {
      step: "04",
      title: "Accept, pay the balance & download",
      description:
        "When you're happy, accept the order to release the remaining 50%, download your print-ready files, and leave a review.",
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
  faqs: [
    {
      question: "How does payment work with Fleeca Bank?",
      answer:
        "For in-stock packages, you pay a 50% deposit instantly at checkout through the Fleeca Bank Gateway (GTA World's in-character banking system) using your character's routing number. Our system confirms it via encrypted webhook and opens your project room. The remaining 50% is only charged when you accept the finished work. Custom briefs receive a quote first, then require a deposit to start.",
    },
    {
      question: "Is this a real deposit — am I locked in?",
      answer:
        "The 50% deposit simply reserves your slot and confirms the artwork direction; it goes against your final total. You review the actual results in your project room before paying the other half — you only pay the balance when you accept the order.",
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
        "Every design project includes 2 to 3 complimentary revision rounds depending on the tier. Ask for changes right inside your project room chat, attach reference images, and we'll fine-tune colors, fonts, layout, and iconography until it matches your exact vision.",
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
    "OOC DISCLAIMER: SAUVAGE is an in-character graphic design studio operating solely within the GTA World Roleplay (GTAW) environment. All transactions and currency values ($) represent GTA World in-game virtual money processed via the Fleeca Bank API. This project is not affiliated with, sponsored by, or endorsed by Rockstar Games, Take-Two Interactive, or any real-world financial institution.",
};
