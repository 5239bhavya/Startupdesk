import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, selectedBusiness } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const API_KEY = LOVABLE_API_KEY || OPENROUTER_API_KEY;

    if (!API_KEY) {
      throw new Error("API Key configuration missing. Set LOVABLE_API_KEY or OPENROUTER_API_KEY.");
    }

    const API_URL = LOVABLE_API_KEY
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";

    console.log("Generating business plan for:", selectedBusiness.name);

    const systemPrompt = `You are an expert business advisor specializing in small-scale businesses and startups in India.
You create detailed, practical business plans for beginners with limited budgets.

RULES:
- Provide realistic, actionable advice based on Indian market conditions
- Avoid motivational or generic content
- Use simple language for beginners
- All costs and estimates should be in Indian Rupees (₹)
- Consider the specific city/region for location advice
- Provide specific, practical tips
- Focus on low-budget, high-impact strategies`;

    const userPrompt = `Create a detailed business plan for the following business idea:

BUSINESS: ${selectedBusiness.name}
DESCRIPTION: ${selectedBusiness.description}
BUDGET: ₹${parseInt(userProfile.budget).toLocaleString("en-IN")}
CITY: ${userProfile.city}
INTEREST: ${userProfile.interest}
EXPERIENCE: ${userProfile.experience}
INVESTMENT RANGE: ${selectedBusiness.investmentRange}

Generate a complete business plan in the following JSON format:
{
  "rawMaterials": [
    {
      "name": "Material/Product Name",
      "sourceType": "Where to source (local market/wholesale/online)",
      "estimatedCost": "₹X,XXX - ₹X,XXX/month",
      "tips": "Practical sourcing tip"
    }
  ],
  "workforce": [
    {
      "role": "Job Role",
      "skillLevel": "Required skill level",
      "count": 1,
      "estimatedSalary": "₹X,XXX - ₹X,XXX/month"
    }
  ],
  "location": {
    "areaType": "Type of area recommended",
    "shopSize": "Size recommendation",
    "rentEstimate": "₹X,XXX - ₹X,XXX/month",
    "setupNeeds": ["List of setup requirements"]
  },
  "pricing": {
    "costComponents": ["List of cost breakdown items with percentages"],
    "costPrice": "₹XX-XX per unit (average)",
    "marketPriceRange": "₹XX-XX per unit",
    "suggestedPrice": "₹XX-XX per unit",
    "profitMargin": "XX-XX% after all expenses"
  },
  "marketing": {
    "launchPlan": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],
    "onlineStrategies": ["Strategy 1", "Strategy 2"],
    "offlineStrategies": ["Strategy 1", "Strategy 2"],
    "lowBudgetIdeas": ["Idea 1", "Idea 2"]
  },
  "growth": {
    "month1to3": ["Action 1", "Action 2"],
    "month4to6": ["Action 1", "Action 2"],
    "expansionIdeas": ["Idea 1", "Idea 2"],
    "mistakesToAvoid": ["Mistake 1", "Mistake 2"]
  }
}

REQUIREMENTS:
- Provide at least 3 items in each array
- Make all advice specific to ${userProfile.city} and the ${userProfile.interest} sector
- Tailor complexity to ${userProfile.experience} experience level
- Keep within the budget of ₹${parseInt(userProfile.budget).toLocaleString("en-IN")}
- Return ONLY valid JSON, no additional text`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const plan = JSON.parse(jsonMatch[0]);

    // Combine the selected business idea with the generated plan
    const fullPlan = {
      idea: selectedBusiness,
      ...plan
    };

    return new Response(JSON.stringify(fullPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-business-plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
