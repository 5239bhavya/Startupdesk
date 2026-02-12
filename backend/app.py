import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# ===== CONFIG =====
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

# --- QUOTA PROTECTION: Mock Mode for testing ---
MOCK_AI = os.getenv("MOCK_AI", "False").lower() == "true"
print(f"DEBUG: MOCK_AI MODE: {MOCK_AI} (from env: {os.getenv('MOCK_AI')})")

# OpenRouter Configuration
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=openrouter_api_key,
)


# We use Llama 3.1 8B for better rate limit headroom (TPD/TPM)
MODEL_NAME = "meta-llama/llama-3.1-8b-instruct"

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

# ===== STEP FLOW =====
STEP_FLOW = [
    "ASK_IDEA",
    "ASK_BUDGET",
    "ASK_LOCATION_PREFERENCE",
    "ASK_CUSTOM_LOCATION",
    "CONFIRM_LOCATION",
    "RAW_MATERIALS",
    "SUPPLIER_GUIDANCE",
    "PRODUCT_PLANNING",
    "SELLING_GUIDE",
    "PRICING",
    "MARKETING",
    "GROWTH",
    "DASHBOARD_MODE"
]

# ===== GOVT DATA FETCH (data.gov.in) =====
def fetch_food_processing_msme():
    """
    Dataset:
    UDYAM Registration (MSME Registration) - List of MSME Registered Units
    Ministry of Micro, Small and Medium Enterprises
    """
    url = "https://api.data.gov.in/resource/2c1fd4a5-67c7-4672-a2c6-a0a76c2f00da"
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "limit": 50
    }
    try:
        r = requests.get(url, params=params, timeout=6)
        r.raise_for_status()
        return r.json()
    except Exception:
        return None

# ===== AI AGENT PROMPT =====
SMARTBIZ_AGENT_PROMPT = """
AGENT NAME:
SmartBiz AI – Intelligent Business Startup Advisor

AGENT ROLE:
You are a friendly, professional, and empathetic business startup advisor. Your goal is to simplify the startup process for beginners and guide them through a structured journey.

Speak like a real person, not a robot or a rigid computer system.

--------------------------------------------------
ABSOLUTE CONTROL RULE (NON-NEGOTIABLE)
--------------------------------------------------

You operate inside a system-controlled workflow.

The system provides:
- CURRENT_STEP
- USER_CONTEXT (previous answers)
- OPTIONAL REAL_TIME_DATA (from verified APIs)

You MUST follow these rules strictly:

- Ask ONLY the question required for the CURRENT_STEP.
- If the user provides multiple pieces of information at once, acknowledge them and skip to the next logical question.
- Do NOT ask follow-up questions for steps that have already been answered.
- Do NOT combine multiple questions in one response.
- Your output MUST be a valid JSON object with the following keys:
  "reply": "The response to the user. For question steps, this MUST be a single simple sentence. For advisory steps, this can be detailed and include lists (plain text only, no asterisks).",
  "extracted_info": {"STEP_NAME": "value"},
  "comparison_data": [{"name": "Supplier X", "price": "Approx ₹50-60/kg", "contact": "Dist: GHAZIABAD", "quality": "High", "status": "Verified"}] (Optional: ONLY for supplier/material steps).
- DO NOT use asterisks (*) or any other markdown symbols in the reply. Use dashes (-) for simple lists if needed.
- Keep the language simple, easy to understand, and to the point.

If you violate these rules, your response is INVALID.

--------------------------------------------------
REAL-TIME DATA HANDLING (MANDATORY)
--------------------------------------------------

If REAL_TIME_DATA is provided by the system:
- You MUST use it.
- You MUST clearly state that the information is based on officially published government or verified data.
- You MUST prioritize REAL_TIME_DATA over general knowledge.

If REAL_TIME_DATA is NOT provided:
- Use verified public knowledge and official platforms.
- Clearly state assumptions or ranges.
- Do NOT claim the data is live or real-time.

You MUST NEVER:
- Scrape websites
- Fetch data on your own
- Invent prices, sellers, or statistics
- Claim real-time accuracy without system-provided data

--------------------------------------------------
ALLOWED REAL-WORLD REFERENCES (SAFE MODE)
--------------------------------------------------

You may reference:
- Government portals (MSME, Ministry portals, Export Promotion Councils)
- Official government datasets (via backend APIs)
- Well-known B2B marketplaces (reference only)
- Industry-standard supplier platforms

You may list names and explain purpose.
You must NOT claim availability or pricing accuracy unless provided by REAL_TIME_DATA.

--------------------------------------------------
STRICT STEP ORDER (DO NOT CHANGE)
--------------------------------------------------

The workflow always follows this order:

1. ASK_IDEA
2. ASK_BUDGET
3. ASK_LOCATION_PREFERENCE
4. ASK_CUSTOM_LOCATION
5. CONFIRM_LOCATION
6. RAW_MATERIALS
7. SUPPLIER_GUIDANCE
8. PRODUCT_PLANNING
9. SELLING_GUIDE
10. PRICING
11. MARKETING
12. GROWTH
13. DASHBOARD_MODE

You are NOT allowed to skip, merge, or reorder steps.

--------------------------------------------------
QUESTION DEFINITIONS (STRICT)
--------------------------------------------------

If CURRENT_STEP = ASK_IDEA  
Ask ONLY:
"Do you already have a business idea in mind?"

If CURRENT_STEP = ASK_BUDGET  
Ask ONLY:
"What is your approximate budget for starting this business?"

If CURRENT_STEP = ASK_LOCATION_PREFERENCE  
Ask ONLY:
"Do you already have a location or area in mind where you want to start this business?"

If CURRENT_STEP = ASK_CUSTOM_LOCATION  
Ask ONLY:
"Please tell me the exact city or area where you want to set up the business."

If CURRENT_STEP = CONFIRM_LOCATION  
Ask ONLY:
"Do you want to proceed with this location or make a change?"

--------------------------------------------------
ADVISORY STAGES (NON-QUESTION STEPS)
--------------------------------------------------

For RAW_MATERIALS, SUPPLIER_GUIDANCE, PRODUCT_PLANNING, SELLING_GUIDE, PRICING, MARKETING, GROWTH, and DASHBOARD_MODE:

- You MUST provide practical, actionable advice.
- If the user asks for sellers, buyers, or materials, PROVIDE a clear list of examples or platforms.
- You are allowed to use multiple sentences and clean lists (using dashes) for these stages.
- Use REAL_TIME_DATA if provided by the system.
- Otherwise, use verified public references and explain assumptions.
- Present information clearly and practically.
- Never claim live accuracy without REAL_TIME_DATA.

**CRITICAL: COMPARISON DATA EXTRACTION FROM REAL_TIME_DATA**

When REAL_TIME_DATA is provided and contains a "records" array (from UDYAM API):
1. You MUST extract enterprise information from the records
2. You MUST populate the "comparison_data" array in your JSON response
3. Each item in comparison_data should have these fields:
   - "name": Use the "EnterpriseName" field from the record
   - "location": Combine "District" and "State" fields (e.g., "GHAZIABAD, UTTAR PRADESH")
   - "type": Use the "EnterpriseType" field (e.g., "Micro", "Small", "Medium")
   - "activity": Use the "MajorActivity" field (e.g., "Manufacturing", "Services")
   - "status": Use "WhetherProdCommenced" field - if "YES" then "Active", if "NO" then "Registered"
   - "price": YOU MUST GENERATE A REALISTIC MARKET PRICE ESTIMATE for the product user is asking about (e.g., "Approx ₹40-50/kg"). Do NOT leave empty.
   - "contact": Combine "District" and "State" (e.g., "Contact: [District], [State]").

4. Include at least 5-10 enterprises from the records array if available
5. In your reply text, mention that these are officially registered enterprises and prices are market estimates.

Example comparison_data format:
[
  {
    "name": "Devani Reverence India",
    "location": "GHAZIABAD, UTTAR PRADESH",
    "type": "Micro",
    "activity": "Manufacturing",
    "status": "Active",
    "price": "Estimate: ₹100-150/unit",
    "contact": "Contact: GHAZIABAD, UP"
  },
  {
    "name": "AHMAD MOBILE SHOP",
    "location": "SANT KABEER NAGAR, UTTAR PRADESH",
    "type": "Micro",
    "activity": "Services",
    "status": "Registered",
    "price": "Estimate: ₹200-300/unit",
    "contact": "Contact: SANT KABEER NAGAR, UP"
  }
]

If REAL_TIME_DATA does not contain records, you may leave comparison_data as an empty array.


--------------------------------------------------
TONE & STYLE
--------------------------------------------------

- Natural and Human-like (not robotic)
- Encouraging and Empathetic
- Professional but approachable
- Technical yet beginner-friendly
- Clear and to the point
- No system language or step names

--------------------------------------------------
FINAL INSTRUCTION
--------------------------------------------------

You are a supportive business mentor.
Acknowledge what the user has shared with a brief, natural remark before moving to the next requirement or providing advice.
Example for advice: "That's a solid plan! For suppliers in this industry, you should look at platforms like IndiaMART or TradeIndia. Here are some common materials you'll need..."
Accuracy and clarity are just as important as being helpful and human.

# The AI agent is step-controlled by the backend and uses government-verified data passed through APIs for accurate business guidance.
# IMPORTANT: Since we use json_object format, the word 'JSON' must appear in this prompt.
"""

# ===== MAIN ENDPOINT =====
@app.route("/api/smartbiz-agent", methods=["POST"])
def smartbiz_agent():
    data = request.json or {}
    user_message = data.get("message", "")
    state = data.get("state")

    if not state:
        state = {"step_index": 0, "answers": {}}

    current_step = STEP_FLOW[state["step_index"]]
    real_time_data = None

    # Fetch real-time data for advisory steps that need it
    if current_step in ["RAW_MATERIALS", "SUPPLIER_GUIDANCE", "SELLING_GUIDE"]:
        real_time_data = fetch_food_processing_msme()
        print(f"DEBUG: Fetched real_time_data for {current_step}")

    if MOCK_AI:
        # Simulated mentor response for testing UI/Flow
        print("--- RUNNING IN MOCK MODE (NO API COST) ---")
        mock_replies = {
            "ASK_IDEA": "That sounds like a great starting point! Before we dive in, what's your approximate budget for this business?",
            "ASK_BUDGET": "I see. Budgeting is crucial! Now, do you have a specific location or area in mind where you want to set things up?",
            "ASK_LOCATION_PREFERENCE": "Excellent! Location can make or break a business. Please tell me the exact city or area you're thinking of.",
            "ASK_CUSTOM_LOCATION": "Got it. Anand is a vibrant area! Should we proceed with this location or would you like to consider somewhere else?",
            "SUPPLIER_GUIDANCE": "Great! I've found some officially registered suppliers from government data that might help you. These are verified MSME enterprises that could be potential suppliers or partners for your business.",
        }
        reply_text = mock_replies.get(current_step, f"I've noted that. Let's move to the next phase: {current_step}. Ready?")
        
        # Add mock comparison data for supplier-related steps
        mock_comparison_data = []
        if current_step in ["RAW_MATERIALS", "SUPPLIER_GUIDANCE", "SELLING_GUIDE"]:
            mock_comparison_data = [
                {
                    "name": "Devani Reverence India",
                    "location": "GHAZIABAD, UTTAR PRADESH",
                    "type": "Micro",
                    "activity": "Manufacturing",
                    "status": "Active",
                    "price": "Approx ₹55/kg",
                    "contact": "Dist: GHAZIABAD"
                },
                {
                    "name": "AHMAD MOBILE SHOP",
                    "location": "SANT KABEER NAGAR, UTTAR PRADESH",
                    "type": "Micro",
                    "activity": "Services",
                    "status": "Registered",
                    "price": "Approx ₹60/kg",
                    "contact": "Dist: SANT KABEER NAGAR"
                },
                {
                    "name": "sachin Enterprise",
                    "location": "BULDHANA, MAHARASHTRA",
                    "type": "Micro",
                    "activity": "Services",
                    "status": "Registered",
                    "price": "Approx ₹58/kg",
                    "contact": "Dist: BULDHANA"
                },
                {
                    "name": "RINA Fancy Dress",
                    "location": "MALDA, WEST BENGAL",
                    "type": "Micro",
                    "activity": "Services",
                    "status": "Registered",
                    "price": "Approx ₹450 (Rental)",
                    "contact": "Dist: MALDA"
                },
                {
                    "name": "Ranak Basanalaya Retail Shop",
                    "location": "HOOGHLY, WEST BENGAL",
                    "type": "Micro",
                    "activity": "Services",
                    "status": "Active",
                    "price": "Approx ₹20-50/unit",
                    "contact": "Dist: HOOGHLY"
                }
            ]
        
        if user_message:
            state["answers"][current_step] = user_message
            state["step_index"] = min(state["step_index"] + 1, len(STEP_FLOW) - 1)
            
        return jsonify({"reply": reply_text, "state": state, "comparison_data": mock_comparison_data})

    # Default fallback
    reply_text = "I'm having a little trouble connecting to my brain right now, but don't worry! Could you try again in a moment?"
    extracted_info = {}
    comparison_data = []

    # Build prompt
    prompt = f"""
SYSTEM_PROMPT:
{SMARTBIZ_AGENT_PROMPT}

CURRENT_STEP:
{current_step}

USER_LATEST_MESSAGE:
"{user_message}"

USER_PREVIOUS_ANSWERS:
{state["answers"]}

REAL_TIME_DATA:
{real_time_data}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": prompt}],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        content = chat_completion.choices[0].message.content.strip()
        
        import json
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        
        if json_match:
            ai_data = json.loads(json_match.group(0))
            print(f"DEBUG: AI Output JSON for {current_step}: {ai_data}")
            reply_text = ai_data.get("reply", "")
            extracted_info = ai_data.get("extracted_info", {})
            comparison_data = ai_data.get("comparison_data", [])
            
            # Save message to answers if not extracted
            if user_message and current_step not in extracted_info:
                state["answers"][current_step] = user_message
                
            # Update state with all extracted keys
            for step, val in extracted_info.items():
                if step in STEP_FLOW:
                    state["answers"][step] = val
            
            # Advance step_index past already answered steps
            while state["step_index"] < len(STEP_FLOW) - 1:
                next_step_name = STEP_FLOW[state["step_index"]]
                if next_step_name in state["answers"]:
                    state["step_index"] += 1
                else:
                    break
        else:
            # Fallback if not JSON
            reply_text = content
            if user_message:
                state["answers"][current_step] = user_message
            state["step_index"] = min(state["step_index"] + 1, len(STEP_FLOW) - 1)

    except Exception as e:
        import traceback
        print(f"ERROR in smartbiz_agent: {str(e)}")
        # Check if it was a rate limit error to provide better feedback
        if "rate_limit" in str(e).lower():
            reply_text = "I've been talking a bit too much today and hit my daily limit! I need a short break. Please try again soon or switch to Mock Mode in settings."
        
    return jsonify({
        "reply": reply_text,
        "state": state,
        "comparison_data": comparison_data
    })

# ===== MARKETPLACE ENDPOINTS =====
def map_nic_to_category(nic_code_2_digit):
    """
    Maps NIC 2 Digit Code to Frontend Categories.
    Based on NIC 2008 Classification.
    """
    # Map of NIC 2-digit -> Category
    # Reference: http://mospi.nic.in/classification/national-industrial-classification
    
    code = str(nic_code_2_digit).strip()
    
    # Food & Beverages: 10, 11, 12
    if code in ["10", "11", "12"]: return "Food & Beverages"
    
    # Clothing & Textiles: 13, 14, 15
    if code in ["13", "14", "15"]: return "Clothing & Textiles"
    
    # Electronics: 26, 27
    if code in ["26", "27"]: return "Electronics"
    
    # Agriculture: 01, 02, 03
    if code in ["01", "02", "03"]: return "Agriculture"
    
    # Industrial: 
    # 16-18 (Wood, Paper)
    # 19-23 (Petroleum, Chemicals, Pharma, Rubber, Plastic)
    # 24-25 (Metals)
    # 28 (Machinery)
    # 29-30 (Transport)
    # 33 (Repair), 35-39 (Utilities/Waste Management/Remediation) - Map to Industrial
    if code in ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "28", "29", "30", "33", "35", "36", "37", "38", "39"]: return "Industrial"
    
    # Health & Beauty specific override if needed, but 20/21 cover chemicals/pharma which are often industrial.
    # Let's map 21 (Pharma) to Health & Beauty
    if code == "21": return "Health & Beauty"
    
    # Handicrafts: 31 (Furniture), 32 (Other manufacturing)
    if code in ["31", "32"]: return "Handicrafts"
    
    # Services Range (45-99)
    try:
        code_int = int(code)
        if code_int >= 45: return "Services"
        if 10 <= code_int <= 33: return "Industrial" # Fallback for unmapped manufacturing
    except:
        pass
    
    return "Other"

@app.route("/api/marketplace/gov-listings", methods=["GET"])
def get_gov_listings():
    """
    Fetches verified MSME listings from government data and formats them
    for the marketplace.
    """
    try:
        data = fetch_food_processing_msme()
        listings = []
        
        if data and "records" in data:
            for record in data["records"]:
                # Map MSME record to Marketplace Listing format
                listing_id = f"gov-{record.get('dics_code', '0')}-{record.get('nic_5_digit_code', '0')}"
                
                # Determine listing type based on activity
                activity = record.get("MajorActivity", "Services").upper()
                
                # Fix: The API key is likely 'NIC5DigitCode' or similar. 
                # We need to handle potential case variations and extraction.
                # Example value might be "10712" or "10 - Food..." or "1) 77291"
                raw_nic = str(record.get("NIC5DigitCode", record.get("nic_5_digit_code", ""))).strip()
                
                # Extract code using Regex
                import re
                # Try to find a 5-digit code first (e.g., 77291 from "1) 77291")
                match = re.search(r'\b(\d{5})\b', raw_nic)
                if match:
                    nic_code_found = match.group(1)
                    nic_2_digit = nic_code_found[:2]
                else:
                    # Fallback: look for exactly 2 digits if 5 not found (e.g., "10")
                    match_2 = re.search(r'\b(\d{2})\b', raw_nic)
                    if match_2:
                         nic_2_digit = match_2.group(1)
                    else:
                         nic_2_digit = "00"
                
                print(f"DEBUG: Enterprise={record.get('EnterpriseName')} | RawNIC={raw_nic} | 2Digit={nic_2_digit} | Act={activity}")
                
                mapped_category = map_nic_to_category(nic_2_digit)
                
                # STRICT LOGIC SPLIT based on mapped category
                # 1. Raw Materials (buy): Agriculture, Industrial (Chemicals, Metals, etc.)
                if mapped_category in ["Agriculture", "Industrial", "Chemicals"]:
                    listing_type = "buy" # Shows in "Raw Materials" tab
                    title_prefix = "Supplier: "
                    category = mapped_category
                    desc_text = f"Verified Supplier of {mapped_category} & Raw Materials. available for bulk procurement."
                
                # 2. Finished Goods (sell): Food, Textiles, Electronics, Handicrafts, Health & Beauty
                elif mapped_category in ["Food & Beverages", "Clothing & Textiles", "Electronics", "Handicrafts", "Health & Beauty"]:
                    listing_type = "sell" # Shows in "For Sale" tab
                    title_prefix = "Manufacturer: "
                    category = mapped_category
                    desc_text = f"Verified Manufacturer of {mapped_category}. Available for bulk orders."

                # 3. Export Partners (export): Services
                else: 
                     # Services/Trading -> Map to Export Partners
                    listing_type = "export"
                    title_prefix = "Export Partner: "
                    # Use mapped category if available (e.g., specific service industry), otherwise fallback to Services
                    category = mapped_category if mapped_category != "Other" else "Services"
                    desc_text = "Verified Service Provider. Potential partner for export/logistics."
                
                listings.append({
                    "id": listing_id,
                    "user_id": "gov_verified",
                    "title": f"{title_prefix}{record.get('EnterpriseName', 'Verified Enterprise')}",
                    "description": f"{desc_text} Registered under {record.get('social_category', 'General')} category. Location: {record.get('District', '')}.",
                    "category": category,
                    "listing_type": listing_type,
                    "price_range": "Contact for Quotes",
                    "quantity": "Bulk Available",
                    "location": f"{record.get('District', '')}, {record.get('State', '')}",
                    "contact_info": "Verified Government Record",
                    "status": "active",
                    "created_at": record.get("RegistrationDate", ""),
                    "is_gov_verified": True,
                    "debug_nic": f"{raw_nic}|{nic_2_digit}"
                })
                
        return jsonify(listings)
    except Exception as e:
        print(f"Error fetching gov listings: {e}")
        return jsonify([])

if __name__ == "__main__":
    app.run(debug=True)
