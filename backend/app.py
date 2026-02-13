import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
from supabase_db import fetch_suppliers_from_db

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
    
    Priority:
    1. Try Supabase database (if configured)
    2. Try government API (if key available)
    3. Fall back to dummy data
    """
    
    # PRIORITY 1: Try Supabase database first
    db_data = fetch_suppliers_from_db()
    if db_data:
        print("DEBUG: Using supplier data from Supabase database")
        return db_data
    
    # PRIORITY 2: Try real government API if key is available
    if DATA_GOV_API_KEY and DATA_GOV_API_KEY != "your_api_key_here":
        url = "https://api.data.gov.in/resource/2c1fd4a5-67c7-4672-a2c6-a0a76c2f00da"
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 50
        }
        try:
            r = requests.get(url, params=params, timeout=6)
            r.raise_for_status()
            print("DEBUG: Using supplier data from government API")
            return r.json()
        except Exception as e:
            print(f"DEBUG: Government API failed: {e}")
            pass  # Fall through to dummy data
    
    # PRIORITY 3: Fall back to comprehensive dummy data
    print("DEBUG: Using hardcoded dummy supplier data")
    return {
        "records": [
            # Food & Beverages Suppliers
            {
                "EnterpriseName": "Shree Krishna Food Products",
                "District": "MUMBAI",
                "State": "MAHARASHTRA",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "10712",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2022-03-15",
                "social_category": "General",
                "contact_phone": "+91 22 2345 6789",
                "contact_email": "info@skfoodproducts.com"
            },
            {
                "EnterpriseName": "Annapurna Spices & Masala",
                "District": "DELHI",
                "State": "DELHI",
                "EnterpriseType": "Micro",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "10751",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2021-08-20",
                "social_category": "General",
                "contact_phone": "+91 11 4567 8901",
                "contact_email": "sales@annapurnaspices.in"
            },
            {
                "EnterpriseName": "Fresh Valley Organic Foods",
                "District": "BANGALORE",
                "State": "KARNATAKA",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "10320",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2023-01-10",
                "social_category": "General",
                "contact_phone": "+91 80 2234 5678",
                "contact_email": "contact@freshvalley.co.in"
            },
            {
                "EnterpriseName": "Golden Harvest Flour Mills",
                "District": "LUDHIANA",
                "State": "PUNJAB",
                "EnterpriseType": "Medium",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "10611",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2020-05-12",
                "social_category": "General",
                "contact_phone": "+91 161 234 5678",
                "contact_email": "info@goldenharvest.com"
            },
            {
                "EnterpriseName": "Dairy Fresh Products Ltd",
                "District": "PUNE",
                "State": "MAHARASHTRA",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "10501",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2021-11-25",
                "social_category": "General",
                "contact_phone": "+91 20 3456 7890",
                "contact_email": "orders@dairyfresh.in"
            },
            
            # Textile & Clothing Suppliers
            {
                "EnterpriseName": "Rajasthan Handloom Exports",
                "District": "JAIPUR",
                "State": "RAJASTHAN",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "13201",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2019-07-18",
                "social_category": "General",
                "contact_phone": "+91 141 234 5678",
                "contact_email": "export@rajhandloom.com"
            },
            {
                "EnterpriseName": "Cotton Craft Textiles",
                "District": "COIMBATORE",
                "State": "TAMIL NADU",
                "EnterpriseType": "Medium",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "13101",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2018-03-22",
                "social_category": "General",
                "contact_phone": "+91 422 345 6789",
                "contact_email": "sales@cottoncraft.co.in"
            },
            {
                "EnterpriseName": "Fashion Forward Garments",
                "District": "SURAT",
                "State": "GUJARAT",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "14101",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2022-09-05",
                "social_category": "General",
                "contact_phone": "+91 261 456 7890",
                "contact_email": "info@fashionforward.in"
            },
            
            # Electronics & Technology
            {
                "EnterpriseName": "TechVision Electronics",
                "District": "NOIDA",
                "State": "UTTAR PRADESH",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "26401",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2021-06-14",
                "social_category": "General",
                "contact_phone": "+91 120 567 8901",
                "contact_email": "contact@techvision.in"
            },
            {
                "EnterpriseName": "Smart Components India",
                "District": "CHENNAI",
                "State": "TAMIL NADU",
                "EnterpriseType": "Medium",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "26110",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2020-02-28",
                "social_category": "General",
                "contact_phone": "+91 44 2345 6789",
                "contact_email": "sales@smartcomponents.co.in"
            },
            
            # Agriculture & Raw Materials
            {
                "EnterpriseName": "Green Fields Agro Suppliers",
                "District": "NASHIK",
                "State": "MAHARASHTRA",
                "EnterpriseType": "Micro",
                "MajorActivity": "Services",
                "NIC5DigitCode": "01110",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2022-04-10",
                "social_category": "General",
                "contact_phone": "+91 253 234 5678",
                "contact_email": "info@greenfields.in"
            },
            {
                "EnterpriseName": "Organic Harvest Co-operative",
                "District": "INDORE",
                "State": "MADHYA PRADESH",
                "EnterpriseType": "Small",
                "MajorActivity": "Services",
                "NIC5DigitCode": "01130",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2021-12-05",
                "social_category": "General",
                "contact_phone": "+91 731 345 6789",
                "contact_email": "contact@organicharvest.co.in"
            },
            
            # Packaging & Industrial
            {
                "EnterpriseName": "EcoPack Solutions",
                "District": "AHMEDABAD",
                "State": "GUJARAT",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "17021",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2023-02-18",
                "social_category": "General",
                "contact_phone": "+91 79 4567 8901",
                "contact_email": "sales@ecopack.in"
            },
            {
                "EnterpriseName": "Prime Plastic Industries",
                "District": "KOLKATA",
                "State": "WEST BENGAL",
                "EnterpriseType": "Medium",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "22201",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2019-10-30",
                "social_category": "General",
                "contact_phone": "+91 33 2345 6789",
                "contact_email": "info@primeplastic.com"
            },
            
            # Export Partners
            {
                "EnterpriseName": "Global Trade Solutions",
                "District": "MUMBAI",
                "State": "MAHARASHTRA",
                "EnterpriseType": "Small",
                "MajorActivity": "Services",
                "NIC5DigitCode": "46900",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2020-08-15",
                "social_category": "General",
                "contact_phone": "+91 22 6789 0123",
                "contact_email": "export@globaltradesolutions.in"
            },
            {
                "EnterpriseName": "India Export Hub",
                "District": "DELHI",
                "State": "DELHI",
                "EnterpriseType": "Medium",
                "MajorActivity": "Services",
                "NIC5DigitCode": "52291",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2018-11-20",
                "social_category": "General",
                "contact_phone": "+91 11 5678 9012",
                "contact_email": "contact@indiaexporthub.com"
            },
            
            # Handicrafts & Artisan
            {
                "EnterpriseName": "Heritage Handicrafts",
                "District": "VARANASI",
                "State": "UTTAR PRADESH",
                "EnterpriseType": "Micro",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "32120",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2021-05-08",
                "social_category": "OBC",
                "contact_phone": "+91 542 234 5678",
                "contact_email": "sales@heritagehandicrafts.in"
            },
            {
                "EnterpriseName": "Artisan Collective India",
                "District": "JAIPUR",
                "State": "RAJASTHAN",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "31091",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2022-07-22",
                "social_category": "General",
                "contact_phone": "+91 141 345 6789",
                "contact_email": "info@artisancollective.co.in"
            },
            
            # Health & Beauty
            {
                "EnterpriseName": "Ayurvedic Wellness Products",
                "District": "KERALA",
                "State": "KERALA",
                "EnterpriseType": "Small",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "21001",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2020-12-10",
                "social_category": "General",
                "contact_phone": "+91 484 456 7890",
                "contact_email": "contact@ayurvedicwellness.in"
            },
            {
                "EnterpriseName": "Natural Beauty Cosmetics",
                "District": "HYDERABAD",
                "State": "TELANGANA",
                "EnterpriseType": "Micro",
                "MajorActivity": "Manufacturing",
                "NIC5DigitCode": "20423",
                "WhetherProdCommenced": "YES",
                "RegistrationDate": "2023-03-15",
                "social_category": "General",
                "contact_phone": "+91 40 2345 6789",
                "contact_email": "sales@naturalbeauty.co.in"
            }
        ]
    }


# ===== AI AGENT PROMPT =====
SMARTBIZ_AGENT_PROMPT = """
AGENT NAME:
SmartBiz AI – Intelligent Business Startup Advisor

AGENT ROLE:
You are a friendly, professional, and empathetic business startup advisor with deep expertise in Indian business ecosystems. Your goal is to simplify the startup process for beginners and provide expert guidance through intelligent conversation.

You are NOT a rigid chatbot. You are a knowledgeable mentor who:
- Understands context and conversation flow
- Answers questions directly and thoroughly
- Adapts to the user's knowledge level
- Provides actionable, practical advice
- Uses real-world examples and analogies

--------------------------------------------------
OPERATING MODES
--------------------------------------------------

You operate in TWO modes based on user intent:

**MODE 1: GUIDED FLOW** (Default for structured onboarding)
- Follow the CURRENT_STEP provided by the system
- Ask one question at a time for data collection steps
- Guide user through the complete business planning process
- Collect: idea, budget, location, materials, suppliers, pricing, marketing, growth

**MODE 2: ADVISOR MODE** (For questions and exploration)
- Activated when user asks specific questions (How, What, Where, Why, Can you)
- Provide detailed, expert answers with examples
- Reference government schemes, portals, and verified data
- Still maintain context of their business plan
- Gently guide back to the flow after answering

**INTENT DETECTION:**
Detect user intent from their message:
- **Question Intent**: "How do I...", "What is...", "Where can I...", "Why should...", "Can you explain..."
  → Switch to ADVISOR MODE, answer thoroughly, then suggest next step
- **Answer Intent**: Direct response to your question (budget amount, location name, yes/no)
  → Stay in GUIDED FLOW, acknowledge and move forward
- **Multiple Info**: User provides several pieces of information at once
  → Extract all info, acknowledge everything, skip to next unanswered step

--------------------------------------------------
CONTEXT AWARENESS (CRITICAL)
--------------------------------------------------

You MUST be aware of:
1. **Conversation History**: USER_PREVIOUS_ANSWERS shows what you already know
2. **Current Progress**: CURRENT_STEP shows where you are in the journey
3. **User's Business**: Remember their idea, budget, location throughout
4. **What's Been Asked**: Never ask for information you already have
5. **User's Expertise**: Adapt complexity based on their questions

**SMART SKIP LOGIC:**
- If user says "I want to start a bakery in Mumbai with 5 lakhs budget"
  → Extract: idea=bakery, location=Mumbai, budget=5 lakhs
  → Acknowledge ALL three pieces
  → Skip to the next unanswered step (don't re-ask what you know)

--------------------------------------------------
RESPONSE QUALITY GUIDELINES
--------------------------------------------------

**For QUESTIONS (Advisor Mode):**
- Provide comprehensive, detailed answers (3-5 sentences minimum)
- Include specific examples: "For example, if you're starting a bakery in Mumbai..."
- Reference real resources: "Check the MSME Udyam portal at udyamregistration.gov.in"
- Use analogies for complex concepts: "Think of working capital like the fuel in your car..."
- Cite government schemes when relevant: "Under the PMEGP scheme, you can get..."
- End with: "Does this help? Let me know if you want to dive deeper, or we can continue with [next step]."

**For DATA COLLECTION (Guided Mode):**
- Keep questions simple and single-focused
- Acknowledge their previous answer warmly: "Great choice on Mumbai!"
- Ask the next question clearly
- Don't combine multiple questions

**For ADVISORY STEPS (Materials, Suppliers, Pricing, Marketing, Growth):**
- Provide detailed, actionable guidance
- Use bullet points with dashes (not asterisks)
- Include specific numbers and estimates when possible
- Reference REAL_TIME_DATA if provided
- Give 3-5 concrete action items

--------------------------------------------------
REAL-TIME DATA HANDLING (MANDATORY)
--------------------------------------------------

If REAL_TIME_DATA is provided by the system:
- You MUST use it and clearly state it's from official government records
- Extract enterprise information and populate comparison_data array
- Generate realistic market price estimates for each supplier
- Mention: "These are officially registered MSME enterprises from government data"

If REAL_TIME_DATA is NOT provided:
- Use verified public knowledge
- Reference official platforms (IndiaMART, TradeIndia, MSME portals)
- Clearly state these are general market references
- Provide price ranges: "Typically ranges from ₹X to ₹Y based on quality"

**COMPARISON DATA FORMAT** (when REAL_TIME_DATA has records):
Extract from records and create:
```json
{
  "comparison_data": [
    {
      "name": "Enterprise Name from record",
      "location": "District, State",
      "type": "Micro/Small/Medium",
      "activity": "Manufacturing/Services",
      "status": "Active/Registered",
      "price": "Estimate: ₹X-Y per unit/kg" (YOU MUST GENERATE THIS),
      "contact": "District, State"
    }
  ]
}
```

--------------------------------------------------
JSON OUTPUT FORMAT (STRICT)
--------------------------------------------------

Your response MUST be valid JSON:
```json
{
  "reply": "Your natural, conversational response here. For questions, be detailed. For data collection, be concise.",
  "extracted_info": {
    "ASK_IDEA": "bakery business",
    "ASK_BUDGET": "5 lakhs",
    "ASK_LOCATION": "Mumbai"
  },
  "comparison_data": [] // Only populate for supplier/material steps with REAL_TIME_DATA
}
```

**Rules:**
- NO asterisks (*) in reply text - use dashes (-) for lists
- Extract ALL information user provides into extracted_info
- Use exact STEP_FLOW names as keys in extracted_info
- comparison_data only for RAW_MATERIALS, SUPPLIER_GUIDANCE, SELLING_GUIDE steps

--------------------------------------------------
STEP FLOW (Reference Only)
--------------------------------------------------

1. ASK_IDEA → "Do you have a business idea in mind?"
2. ASK_BUDGET → "What's your approximate budget?"
3. ASK_LOCATION_PREFERENCE → "Do you have a location in mind?"
4. ASK_CUSTOM_LOCATION → "Which city/area?"
5. CONFIRM_LOCATION → "Proceed with this location?"
6. RAW_MATERIALS → Detailed guidance on materials needed
7. SUPPLIER_GUIDANCE → Supplier recommendations with data
8. PRODUCT_PLANNING → Product development advice
9. SELLING_GUIDE → Sales channels and strategies
10. PRICING → Pricing strategy and calculations
11. MARKETING → Marketing plan and tactics
12. GROWTH → Scaling and expansion guidance
13. DASHBOARD_MODE → Ongoing Q&A and optimization

--------------------------------------------------
TONE & PERSONALITY
--------------------------------------------------

- **Warm & Encouraging**: "That's a fantastic idea!"
- **Expert but Accessible**: Explain jargon, use simple language
- **Practical & Action-Oriented**: Always give next steps
- **Culturally Aware**: Understand Indian business context
- **Patient & Supportive**: Beginners need extra care
- **Honest & Realistic**: Don't overpromise, set proper expectations

--------------------------------------------------
EXAMPLES OF GOOD RESPONSES
--------------------------------------------------

**User asks: "How do I register my business?"**
Good Response: "Great question! In India, you have several options depending on your business type. For most small businesses, I recommend starting with Udyam Registration (MSME) - it's free and gives you access to government benefits. Here's the process: 1) Visit udyamregistration.gov.in, 2) Register with your Aadhaar, 3) Fill in basic business details, 4) Get instant registration. For a bakery, this is perfect. You can also consider Sole Proprietorship (simplest) or Private Limited (if you want to raise funds later). Which route interests you more, or should we continue planning your bakery first?"

**User says: "I want to start a cloud kitchen in Bangalore with 3 lakh budget"**
Good Response: "Excellent! Cloud kitchens are booming in Bangalore - smart choice. I've noted: Business idea: Cloud Kitchen, Location: Bangalore, Budget: ₹3 lakhs. That's a solid starting budget for a cloud kitchen. Now, before we dive into the details, have you thought about what cuisine or food category you want to focus on? This will help us plan your kitchen setup and suppliers better."

--------------------------------------------------
FINAL INSTRUCTION
--------------------------------------------------

Be intelligent, contextual, and helpful. Answer questions thoroughly. Guide gently. Use data wisely. Make the user feel supported and confident in their business journey.

Remember: You're not just collecting data - you're building their confidence and knowledge as an entrepreneur.

# The word JSON must appear in this prompt for json_object format to work.
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

# ===== RECOMMENDATIONS ENDPOINT (Workaround for Supabase Edge Function) =====
@app.route("/api/recommendations", methods=["POST"])
def generate_recommendations():
    """
    Generate business recommendations based on user profile.
    This is a temporary workaround while Supabase Edge Functions are being deployed.
    """
    try:
        data = request.json or {}
        user_profile = data.get("userProfile", {})
        
        if not user_profile:
            return jsonify({"error": "User profile is required"}), 400
        
        budget = user_profile.get("budget", "")
        city = user_profile.get("city", "")
        interest = user_profile.get("interest", "")
        experience = user_profile.get("experience", "Beginner")
        
        system_prompt = """You are an expert business advisor specializing in small-scale businesses and startups in India. 
You provide practical, realistic advice for beginners with limited budgets.

RULES:
- Always give structured output with clear data
- Use practical, realistic advice based on Indian market conditions
- Avoid motivational or generic content
- Focus on small-scale, low-budget businesses
- Provide estimates and ranges, not exact numbers
- Use simple language for beginners
- Consider the user's budget, location, and interest area"""

        user_prompt = f"""Based on the following user profile, recommend exactly 3 realistic business ideas that match their budget and interests.

USER PROFILE:
- Budget: ₹{budget}
- City/Region: {city}
- Interest Area: {interest}
- Experience Level: {experience}

For each business idea, provide the following in valid JSON format:
{{
  "ideas": [
    {{
      "id": "unique-id-lowercase",
      "name": "Business Name",
      "description": "Brief 1-2 sentence description",
      "investmentRange": "₹X,XX,XXX - ₹X,XX,XXX",
      "expectedRevenue": "₹X,XX,XXX - ₹X,XX,XXX/month",
      "profitMargin": "XX-XX%",
      "riskLevel": "Low" | "Medium" | "High",
      "breakEvenTime": "X-X months",
      "icon": "emoji representing the business"
    }}
  ]
}}

IMPORTANT:
- All ideas must be within the user's budget range
- Tailor recommendations to their interest area ({interest})
- Consider market conditions in {city}
- Adjust complexity based on experience level ({experience})
- Return ONLY valid JSON, no additional text"""

        # Call OpenRouter AI
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        
        content = chat_completion.choices[0].message.content.strip()
        print(f"DEBUG: AI response for recommendations: {content}")
        
        # Parse the JSON from the response
        import json
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if not json_match:
            return jsonify({"error": "Failed to parse AI response as JSON"}), 500
        
        ideas = json.loads(json_match.group(0))
        return jsonify(ideas)
        
    except Exception as e:
        print(f"ERROR in generate_recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
