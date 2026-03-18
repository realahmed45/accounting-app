export const BUSINESS_CATEGORIES = {
  Automotive: ["Car dealers", "Service centers", "Auto parts shops"],
  "Beauty, Spa and Salon": [
    "Beauty salons",
    "Spas",
    "Skincare brands",
    "Makeup artists",
  ],
  "Clothing and Apparel": [
    "Fashion boutiques",
    "Clothing stores",
    "Accessory shops",
  ],
  Education: [
    "Schools",
    "Tutoring services",
    "Online course providers",
    "Training institutes",
  ],
  Entertainment: ["Artists", "Creators", "Event planners", "Party services"],
  "Event Planning and Service": [
    "Wedding planners",
    "Corporate event planners",
    "Birthday planners",
  ],
  "Finance and Banking": ["Banks", "Financial advisors", "Accounting services"],
  "Food and Grocery": [
    "Restaurants",
    "Cafes",
    "Grocery stores",
    "Bakeries",
    "Cloud kitchens",
  ],
  "Hotel and Lodging": [
    "Hotels",
    "Resorts",
    "Vacation rentals",
    "Travel agencies",
  ],
  "Medical and Health": [
    "Clinics",
    "Hospitals",
    "Doctors",
    "Diagnostic labs",
    "Pharmacies",
  ],
  "Non-profit": ["Charitable organizations", "NGOs"],
  "Public Service": ["Government services", "Public utilities"],
  "Professional Services": [
    "Consulting",
    "Legal",
    "Marketing",
    "Real estate",
    "Interior design",
  ],
  "Shopping and Retail": [
    "E-commerce stores",
    "Handmade crafts",
    "Electronics",
    "Specialized retail",
  ],
  "Travel and Transportation": [
    "Taxi services",
    "Tour operators",
    "Cargo/logistics services",
  ],
  Other: [],
};

export const getCategoryList = () => Object.keys(BUSINESS_CATEGORIES);

export const getSubcategories = (category) =>
  BUSINESS_CATEGORIES[category] || [];
