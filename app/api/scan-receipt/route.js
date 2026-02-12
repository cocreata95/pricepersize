import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const GEMINI_PROMPT = `You are an expert at extracting structured data from grocery/shopping receipts.

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
}`

export async function POST(request) {
  try {
    const formData = await request.formData()
    const receiptFile = formData.get('receipt')
    const userId = formData.get('userId')

    if (!receiptFile) {
      return Response.json({ success: false, error: 'No receipt image provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validTypes.includes(receiptFile.type)) {
      return Response.json({ success: false, error: 'Invalid file type. Use JPG, PNG, or WebP.' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (receiptFile.size > 10 * 1024 * 1024) {
      return Response.json({ success: false, error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    // Convert to base64
    const arrayBuffer = await receiptFile.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    // Create receipt record in Supabase
    let receiptId = null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey && userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert({ user_id: userId, extraction_status: 'processing' })
        .select('id')
        .single()

      if (!error) receiptId = receipt.id
    }

    // Call Gemini 2.5 Flash
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return Response.json({ success: false, error: 'AI service not configured' }, { status: 500 })
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: GEMINI_PROMPT },
              { inline_data: { mime_type: receiptFile.type, data: base64 } },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini API error:', errText)
      throw new Error(`AI extraction failed (${geminiResponse.status})`)
    }

    const result = await geminiResponse.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No response from AI')

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const extractedData = JSON.parse(cleanText)

    if (!extractedData.items || extractedData.items.length === 0) {
      throw new Error('No items found on receipt')
    }

    // Update receipt record
    if (receiptId && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from('receipts').update({
        store_name: extractedData.store_name,
        purchase_date: extractedData.purchase_date,
        total_amount: extractedData.total_amount,
        ai_confidence: extractedData.overall_confidence,
        extraction_status: 'completed',
      }).eq('id', receiptId)
    }

    return Response.json({ success: true, receipt_id: receiptId, data: extractedData })

  } catch (error) {
    console.error('Scan receipt error:', error)
    return Response.json(
      { success: false, error: error.message || 'Failed to scan receipt' },
      { status: 500 }
    )
  }
}
