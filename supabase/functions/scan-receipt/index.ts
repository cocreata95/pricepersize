// supabase/functions/scan-receipt/index.ts
// Supabase Edge Function: Receipt scanning with Gemini 2.5 Flash
//
// Secrets required (set via `supabase secrets set`):
//   GEMINI_API_KEY=your-gemini-api-key
//
// Invoke via:
//   POST https://onertzstedqlbecfbbmd.supabase.co/functions/v1/scan-receipt
//   Headers: Authorization: Bearer <supabase-anon-key>
//   Body: FormData with 'receipt' (image file)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ReceiptItem {
  item_name: string;
  brand: string | null;
  size: number | null;
  unit: string | null;
  price: number;
  price_per_unit: number | null;
  confidence: number;
}

interface ReceiptData {
  store_name: string | null;
  purchase_date: string | null;
  total_amount: number | null;
  overall_confidence: number;
  items: ReceiptItem[];
}

// Gemini 2.5 Flash receipt extraction
async function extractReceiptWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<ReceiptData> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `You are an expert at extracting structured data from grocery/shopping receipts.

TASK: Extract ALL line items from this receipt image with complete details.

INSTRUCTIONS:
1. Extract item_name (full product name as printed)
2. Extract brand (if visible, else null)
3. Extract size (numeric value only, e.g., 5) — null if not shown
4. Extract unit (kg, g, L, ml, pieces, pack, count) — null if not shown
5. Extract price (total price for this line item, as a number)
6. Calculate price_per_unit = price / size (when both are available, else null)
7. Assign confidence score (0.0 to 1.0) for each item based on text clarity

STORE INFO:
- store_name: Extract store/shop name from header (null if not visible)
- purchase_date: Extract date in YYYY-MM-DD format (null if not visible)
- total_amount: Extract total/grand total amount (null if not visible)
- overall_confidence: Your confidence in the overall extraction (0.0 to 1.0)

SPECIAL HANDLING:
- Hindi/English/regional language mixed text: Translate item names to English
- Blurry or faded text: Use context to infer, set confidence < 0.7
- Missing brand: Set to null (don't guess)
- Abbreviations: Expand when obvious (e.g., "BAS RICE" → "Basmati Rice")
- Duplicate line items: List each separately
- Discount/offer lines: Skip these, only extract product items
- Tax lines (GST, CGST, SGST): Skip these

RETURN ONLY VALID JSON (no markdown, no code blocks):
{
  "store_name": "string or null",
  "purchase_date": "YYYY-MM-DD or null",
  "total_amount": 0.00,
  "overall_confidence": 0.95,
  "items": [
    {
      "item_name": "Fortune Basmati Rice",
      "brand": "Fortune",
      "size": 5,
      "unit": "kg",
      "price": 850.00,
      "price_per_unit": 170.00,
      "confidence": 0.98
    }
  ]
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status} — ${errorText}`);
  }

  const result = await response.json();

  // Extract text from Gemini response
  const text =
    result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  // Parse JSON (strip any markdown fencing if present)
  const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const receiptData: ReceiptData = JSON.parse(cleanText);

  // Validate
  if (!receiptData.items || receiptData.items.length === 0) {
    throw new Error("No items extracted from receipt");
  }

  return receiptData;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const receiptFile = formData.get("receipt") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!receiptFile) {
      return new Response(
        JSON.stringify({ success: false, error: "No receipt image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(receiptFile.type)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid file type: ${receiptFile.type}. Use JPG, PNG, WebP, or HEIC.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (10MB max)
    if (receiptFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: "File too large. Max 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert image to base64
    const arrayBuffer = await receiptFile.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create receipt record (processing)
    let receiptId: string | null = null;
    if (userId) {
      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          user_id: userId,
          extraction_status: "processing",
        })
        .select("id")
        .single();

      if (receiptError) {
        console.error("Receipt insert error:", receiptError);
      } else {
        receiptId = receipt.id;
      }
    }

    // Call Gemini 2.5 Flash
    const extractedData = await extractReceiptWithGemini(
      base64,
      receiptFile.type
    );

    // Update receipt record with results
    if (receiptId && userId) {
      await supabase
        .from("receipts")
        .update({
          store_name: extractedData.store_name,
          purchase_date: extractedData.purchase_date,
          total_amount: extractedData.total_amount,
          ai_confidence: extractedData.overall_confidence,
          extraction_status: "completed",
        })
        .eq("id", receiptId);
    }

    // Return extracted data for user to review
    return new Response(
      JSON.stringify({
        success: true,
        receipt_id: receiptId,
        data: extractedData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Scan receipt error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to scan receipt",
        details: "Please try again or enter items manually.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
