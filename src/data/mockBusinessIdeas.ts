import { BusinessIdea, BusinessPlan } from "@/types/business";

export const mockBusinessIdeas: BusinessIdea[] = [
  {
    id: "tea-stall",
    name: "Premium Tea & Snacks Stall",
    description: "A modern chai and snacks outlet targeting office-goers and students with quick service and quality products.",
    investmentRange: "₹80,000 - ₹1,50,000",
    expectedRevenue: "₹1,20,000 - ₹2,00,000/month",
    profitMargin: "35-45%",
    riskLevel: "Low",
    breakEvenTime: "3-4 months",
    icon: "☕",
  },
  {
    id: "mobile-repair",
    name: "Mobile Phone Repair Shop",
    description: "Smartphone repair and accessories shop offering screen replacement, battery change, and software services.",
    investmentRange: "₹1,50,000 - ₹3,00,000",
    expectedRevenue: "₹1,50,000 - ₹3,00,000/month",
    profitMargin: "40-55%",
    riskLevel: "Medium",
    breakEvenTime: "4-6 months",
    icon: "📱",
  },
  {
    id: "tiffin-service",
    name: "Home Tiffin Service",
    description: "Daily meal delivery service for working professionals, students, and bachelors with home-cooked healthy food.",
    investmentRange: "₹50,000 - ₹1,00,000",
    expectedRevenue: "₹80,000 - ₹1,50,000/month",
    profitMargin: "30-40%",
    riskLevel: "Low",
    breakEvenTime: "2-3 months",
    icon: "🍱",
  },
];

export const getMockBusinessPlan = (ideaId: string): BusinessPlan => {
  const idea = mockBusinessIdeas.find((i) => i.id === ideaId) || mockBusinessIdeas[0];

  return {
    idea,
    rawMaterials: [
      {
        name: "Primary Ingredients/Products",
        sourceType: "Local Wholesale Market",
        estimatedCost: "₹15,000 - ₹25,000/month",
        tips: "Build relationships with 2-3 suppliers for better rates and consistent quality",
      },
      {
        name: "Packaging Materials",
        sourceType: "Online B2B Platforms (IndiaMART, TradeIndia)",
        estimatedCost: "₹3,000 - ₹5,000/month",
        tips: "Order in bulk quarterly to save 15-20% on costs",
      },
      {
        name: "Equipment & Tools",
        sourceType: "Local dealers + Amazon Business",
        estimatedCost: "₹20,000 - ₹40,000 (one-time)",
        tips: "Consider second-hand equipment initially, upgrade as business grows",
      },
    ],
    workforce: [
      {
        role: "Helper/Assistant",
        skillLevel: "Basic",
        count: 1,
        estimatedSalary: "₹8,000 - ₹12,000/month",
      },
      {
        role: "Delivery Person",
        skillLevel: "Basic + Own Vehicle",
        count: 1,
        estimatedSalary: "₹10,000 - ₹15,000/month",
      },
    ],
    location: {
      areaType: "Commercial area near offices/colleges or residential complex",
      shopSize: "100-200 sq ft for physical setup",
      rentEstimate: "₹8,000 - ₹15,000/month (varies by city)",
      setupNeeds: [
        "Basic furniture and counter",
        "Signboard and branding",
        "Water and electricity connection",
        "Storage shelves",
        "Hygiene equipment",
      ],
    },
    pricing: {
      costComponents: [
        "Raw materials (40-50% of revenue)",
        "Rent and utilities (10-15%)",
        "Staff salaries (15-20%)",
        "Packaging (5-8%)",
        "Marketing (5-10%)",
      ],
      costPrice: "₹40-60 per unit (average)",
      marketPriceRange: "₹80-150 per unit",
      suggestedPrice: "₹100-120 per unit",
      profitMargin: "35-45% after all expenses",
    },
    marketing: {
      launchPlan: [
        "Week 1: Set up social media (Instagram, WhatsApp Business)",
        "Week 2: Distribute flyers in target area (500-1000 pcs)",
        "Week 3: Opening offers - 20% discount for first 50 customers",
        "Week 4: Partner with nearby offices for bulk orders",
      ],
      onlineStrategies: [
        "Create Instagram page with daily posts",
        "WhatsApp broadcast for orders and updates",
        "Google My Business listing",
        "Ask satisfied customers for Google reviews",
      ],
      offlineStrategies: [
        "Flex banners at key locations",
        "Visiting cards distribution",
        "Word-of-mouth through quality service",
        "Festival and seasonal offers",
      ],
      lowBudgetIdeas: [
        "Free samples to potential bulk customers",
        "Referral discounts (₹20 off for both)",
        "Loyalty cards - 10th order free",
        "Partner with delivery apps later",
      ],
    },
    growth: {
      month1to3: [
        "Focus on quality and consistency",
        "Build regular customer base (target: 50-100 regulars)",
        "Collect feedback and improve",
        "Maintain daily expense tracking",
      ],
      month4to6: [
        "Introduce new products based on demand",
        "Hire additional staff if needed",
        "Start delivery services",
        "Partner with local businesses",
      ],
      expansionIdeas: [
        "Open second outlet in different area",
        "Start franchise model after 1 year",
        "Add online ordering system",
        "Bulk/catering services for events",
      ],
      mistakesToAvoid: [
        "Don't compromise on quality to cut costs",
        "Don't over-invest in fancy setup initially",
        "Don't ignore customer feedback",
        "Don't skip proper accounting and bills",
        "Don't hire too many staff too early",
      ],
    },
  };
};
