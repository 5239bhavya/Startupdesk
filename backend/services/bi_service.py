"""
BI Intelligence Service — AI logic for product research, supplier enrichment,
raw material analysis, and food recipe breakdown.
All functions are pure helpers called by bi_routes.py Blueprint.
"""

import json
import time
import logging
from openai import OpenAI
import os

logger = logging.getLogger(__name__)

# In-process cache — keyed by "endpoint:key", value = (timestamp, data)
_CACHE: dict = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _cache_get(key: str):
    entry = _CACHE.get(key)
    if entry and (time.time() - entry[0]) < CACHE_TTL_SECONDS:
        logger.info(f"BI cache HIT for key: {key}")
        return entry[1]
    return None


def _cache_set(key: str, data):
    _CACHE[key] = (time.time(), data)


def _get_openrouter_client() -> OpenAI:
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"),
    )


MODEL = "meta-llama/llama-3.1-8b-instruct"


def _call_ai(prompt: str, context: str = "") -> dict:
    """Call AI with graceful degradation — never raises."""
    try:
        client = _get_openrouter_client()
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.4,
            max_tokens=1800,
        )
        raw = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()
        
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"AI JSON parse error: {e}")
        return None
    except Exception as e:
        logger.error(f"AI call failed: {e}")
        return None



# ─────────────────────────────────────────────────────────────────────────────
# 0. BUSINESS-SPECIFIC PRODUCT LIST
# ─────────────────────────────────────────────────────────────────────────────
def get_business_products(business_name: str) -> dict:
    """Generate a list of realistic products for a given business type."""
    cache_key = f"bizproducts:{business_name}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a business consultant. Generate a list of 8-10 specific, realistic products/services that a "{business_name}" business would sell in India.

Important rules:
- Products must be SPECIFIC to this exact business type (not generic software)
- Use real product names that customers would actually buy
- Include realistic Indian market prices
- For food businesses: include actual food items
- For retail: include actual goods
- For services: include specific service packages
- Never include generic tech products unless it's a tech business

Return ONLY valid JSON:
{{
  "products": [
    {{
      "id": "p1",
      "name": "Specific Product Name",
      "description": "One-line description of what this product/service is",
      "avg_selling_price": 250,
      "category": "product category"
    }}
  ]
}}

Business: {business_name}
"""
    result = _call_ai(prompt, "You are a business consultant specializing in Indian SME markets.")

    if not result or "products" not in result:
        # Sensible fallback based on business name keywords
        result = _generate_fallback_products(business_name)

    _cache_set(cache_key, result)
    return result


def _generate_fallback_products(business_name: str) -> dict:
    """Generate basic fallback products based on business name keywords."""
    bn = business_name.lower()
    products = []

    if any(k in bn for k in ["tea", "chai", "coffee", "cafe"]):
        items = [("Masala Chai", 15), ("Cutting Chai", 10), ("Special Tea", 25), ("Cold Coffee", 60), ("Lemon Tea", 20)]
    elif any(k in bn for k in ["bakery", "bread", "cake", "sweet", "mithai"]):
        items = [("Fresh Bread Loaf", 35), ("Pav (6 pcs)", 20), ("Birthday Cake", 450), ("Kaju Katli (250g)", 180), ("Gulab Jamun (12 pcs)", 80)]
    elif any(k in bn for k in ["restaurant", "dhaba", "food", "tiffin", "meal"]):
        items = [("Thali (Full)", 120), ("Roti + Sabzi", 60), ("Dal Rice", 80), ("Paneer Dish", 150), ("Biryani Bowl", 130)]
    elif any(k in bn for k in ["cloth", "garment", "fashion", "textile", "saree"]):
        items = [("Cotton T-Shirt", 250), ("Formal Shirt", 450), ("Saree", 800), ("Kurta", 350), ("Jeans", 600)]
    elif any(k in bn for k in ["vegetable", "fruit", "sabzi", "kirana", "grocery"]):
        items = [("Mixed Vegetables (1kg)", 40), ("Tomatoes (1kg)", 35), ("Onions (1kg)", 30), ("Potatoes (1kg)", 25), ("Fresh Fruits Basket", 150)]
    elif any(k in bn for k in ["mobile", "phone", "electronic", "repair"]):
        items = [("Screen Replacement", 800), ("Battery Replacement", 400), ("Phone Cover", 150), ("Charging Cable", 200), ("Earphones", 350)]
    elif any(k in bn for k in ["beauty", "salon", "parlour", "hair"]):
        items = [("Haircut (Men)", 100), ("Haircut (Women)", 250), ("Facial", 400), ("Hair Colour", 600), ("Manicure", 300)]
    elif any(k in bn for k in ["auto", "bike", "vehicle", "service"]):
        items = [("Oil Change", 300), ("Tyre Puncture", 50), ("Engine Wash", 200), ("Brake Service", 500), ("Full Service", 1500)]
    else:
        items = [
            (f"{business_name} Basic Package", 500),
            (f"{business_name} Premium Package", 1200),
            (f"{business_name} Standard Service", 800),
            (f"Custom Order", 1500),
            (f"Monthly Plan", 2000),
        ]

    products = [
        {"id": f"p{i+1}", "name": name, "description": f"Quality {name.lower()} from your {business_name}", "avg_selling_price": price, "category": "general"}
        for i, (name, price) in enumerate(items)
    ]
    return {"products": products, "_fallback": True}


# ─────────────────────────────────────────────────────────────────────────────
# 1. PRODUCT RESEARCH
# ─────────────────────────────────────────────────────────────────────────────
def research_product_intelligence(business_type: str, product_name: str = "") -> dict:
    cache_key = f"product:{business_type}:{product_name}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a market research analyst. Analyze the business/product below and return a JSON object.

Business Type: {business_type}
Product (if specified): {product_name or "general products in this category"}

Return ONLY valid JSON:
{{
  "demand_level": "High|Medium|Low",
  "demand_trend": "Rising|Stable|Declining",
  "profit_margin_estimate": "e.g. 25-40%",
  "investment_range": "e.g. ₹50,000 - ₹2,00,000",
  "risk_score": 6,
  "top_markets": ["India", "Southeast Asia"],
  "market_size": "e.g. ₹5,000 Cr+ annually in India",
  "competition_level": "High|Medium|Low",
  "best_season": "e.g. Year-round or October-March",
  "top_products": [
    {{
      "name": "Product Name",
      "country_of_origin": "India",
      "global_demand": "High",
      "price_range": "₹100-₹500",
      "margin_estimate": "30-45%",
      "investment_range": "₹20,000-₹80,000"
    }}
  ]
}}
"""
    result = _call_ai(prompt, "You are a professional market research analyst.")
    
    if not result:
        result = {
            "demand_level": "Medium",
            "demand_trend": "Stable",
            "profit_margin_estimate": "20-35%",
            "investment_range": "₹50,000 - ₹2,00,000",
            "risk_score": 5,
            "top_markets": ["India"],
            "market_size": "Data unavailable",
            "competition_level": "Medium",
            "best_season": "Year-round",
            "top_products": [],
            "_fallback": True,
        }

    _cache_set(cache_key, result)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 2. ENRICHED SUPPLIERS
# ─────────────────────────────────────────────────────────────────────────────
def get_enriched_suppliers(business_type: str, product_name: str, city: str = "India") -> dict:
    cache_key = f"suppliers:{business_type}:{product_name}:{city}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a supply chain consultant. Find realistic verified suppliers for:

Business Type: {business_type}
Product: {product_name}
Location preference: {city or "India"}

Return ONLY valid JSON:
{{
  "suppliers": [
    {{
      "name": "Supplier Company Name",
      "country": "India",
      "city": "Mumbai",
      "email": "contact@example.com",
      "phone": "+91 22 1234 5678",
      "moq": "100 units",
      "approx_cost": "₹500-₹1,200 per unit",
      "rating": 4.3,
      "export_capable": true,
      "website": "www.example.com",
      "specialization": "What they specialize in",
      "delivery_time": "3-5 days",
      "payment_terms": "30% advance, 70% on delivery",
      "pros": ["Wide variety", "GST billing"],
      "cons": ["Min order required"],
      "verified": true
    }}
  ],
  "alternative_countries": ["China", "Bangladesh"],
  "sourcing_tips": "Brief tip on best sourcing strategy"
}}

Include 5-7 diverse suppliers (mix of local, pan-India, and international where relevant).
"""
    result = _call_ai(prompt, "You are a professional supply chain consultant for Indian SMEs.")

    if not result:
        result = {
            "suppliers": [
                {
                    "name": "IndiaMART Verified Network",
                    "country": "India",
                    "city": "Pan India",
                    "email": "buyer@indiamart.com",
                    "phone": "+91 96 9696 9696",
                    "moq": "₹5,000 minimum",
                    "approx_cost": "Market rate",
                    "rating": 4.2,
                    "export_capable": False,
                    "website": "www.indiamart.com",
                    "specialization": "B2B marketplace for all categories",
                    "delivery_time": "2-7 days",
                    "payment_terms": "Varies by seller",
                    "pros": ["Verified sellers", "Wide variety"],
                    "cons": ["Quality varies"],
                    "verified": True,
                }
            ],
            "alternative_countries": ["China", "Bangladesh"],
            "sourcing_tips": "Start with IndiaMART for local suppliers, then explore direct manufacturer connections.",
            "_fallback": True,
        }

    _cache_set(cache_key, result)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 3. PRODUCT-SPECIFIC RAW MATERIALS
# ─────────────────────────────────────────────────────────────────────────────
def get_product_materials(business_type: str, product_name: str) -> dict:
    cache_key = f"materials:{business_type}:{product_name}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a manufacturing consultant. List the raw materials needed for:

Business Type: {business_type}
Product: {product_name}

Return ONLY valid JSON:
{{
  "materials": [
    {{
      "name": "Material Name",
      "quantity_per_100_units": "2 kg per 100 units",
      "cost_estimate": "₹200-₹400 per kg",
      "supplier_source": "Local wholesale market / Online",
      "storage_requirement": "Cool, dry place, 15-25°C",
      "shelf_life": "6 months",
      "quality_tip": "One-line tip on quality checking"
    }}
  ],
  "total_material_cost_per_100_units": "₹2,000-₹5,000",
  "critical_material": "Name of the most critical/expensive material"
}}
"""
    result = _call_ai(prompt, "You are a manufacturing and procurement consultant.")

    if not result:
        result = {
            "materials": [],
            "total_material_cost_per_100_units": "Contact local suppliers for pricing",
            "critical_material": "N/A",
            "_fallback": True,
        }

    _cache_set(cache_key, result)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 4. PROCESS / PRODUCTION BREAKDOWN (ALL BUSINESS TYPES)
# ─────────────────────────────────────────────────────────────────────────────
def get_recipe_breakdown(business_type: str, product_name: str) -> dict:
    cache_key = f"recipe:{business_type}:{product_name}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a business operations consultant. Provide a detailed production/process breakdown for:

Business Type: {business_type}
Product / Service: {product_name}

This could be a food business, retail shop, manufacturing unit, service business, tech product, etc.
Adapt the breakdown accordingly:
- For food: recipe, ingredients, cooking steps
- For manufacturing: raw material processing, assembly steps
- For retail: procurement, quality check, display, sales steps
- For service: service delivery workflow, tools needed, time estimates

Return ONLY valid JSON:
{{
  "is_food_product": true,
  "recipe_name": "Product/Process name",
  "batch_size": "e.g. 100 units / 1 service session / 10 kg batch",
  "prep_time": "e.g. 30 minutes",
  "cook_time": "e.g. 45 minutes (or 'N/A' for non-food)",
  "total_time": "e.g. 75 minutes",
  "yield_ratio": "e.g. 1 kg input = 0.85 kg output (or conversion rate for non-food)",
  "ingredients": [
    {{
      "name": "Input material / resource",
      "quantity": "Amount per batch/session",
      "cost": "₹XX",
      "source": "Where to get it"
    }}
  ],
  "steps": [
    {{
      "step_number": 1,
      "title": "Step title",
      "description": "Clear actionable instruction",
      "duration": "Time estimate",
      "tip": "Pro tip for this step"
    }}
  ],
  "cost_per_unit": "₹XX (cost to produce/deliver)",
  "selling_price_per_unit": "₹XX-₹YY",
  "profit_per_unit": "₹XX-₹YY",
  "profit_margin": "XX-YY%",
  "quality_checklist": ["Quality check item 1", "Quality check item 2"],
  "packaging_tip": "Tip on packaging, presentation, or delivery"
}}

Always set is_food_product to true so the UI renders the process tab for all business types.
"""
    result = _call_ai(prompt, "You are a professional business operations and production consultant.")

    if not result:
        result = {
            "is_food_product": True,
            "recipe_name": product_name,
            "steps": [],
            "ingredients": [],
            "_fallback": True,
        }

    # Always force is_food_product=True so UI shows the tab for all businesses
    result["is_food_product"] = True

    _cache_set(cache_key, result)
    return result
