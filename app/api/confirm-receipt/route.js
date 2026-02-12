import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { receipt_id, user_id, store_name, purchase_date, total_amount, items } = body

    if (!user_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id or items' },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Insert pantry items
    const pantryItems = items.map(item => ({
      user_id,
      receipt_id: receipt_id || null,
      item_name: item.item_name,
      brand: item.brand || null,
      size: item.size || null,
      unit: item.unit || null,
      last_price: item.price || null,
      last_store: store_name || null,
      status: 'have',
      purchase_date: purchase_date || new Date().toISOString().split('T')[0],
      confidence: item.confidence || null,
    }))

    const { data: insertedPantry, error: pantryError } = await supabase
      .from('pantry_items')
      .insert(pantryItems)
      .select('id, item_name')

    if (pantryError) {
      console.error('Pantry insert error:', pantryError)
      return NextResponse.json(
        { success: false, error: `Failed to save pantry items: ${pantryError.message}` },
        { status: 500 }
      )
    }

    // Insert price history records
    const priceHistoryItems = items
      .filter(item => item.price != null)
      .map(item => ({
        user_id,
        receipt_id: receipt_id || null,
        item_name: item.item_name,
        brand: item.brand || null,
        size: item.size || null,
        unit: item.unit || null,
        price: item.price,
        price_per_unit: item.price_per_unit || null,
        store_name: store_name || null,
        purchase_date: purchase_date || new Date().toISOString().split('T')[0],
      }))

    if (priceHistoryItems.length > 0) {
      const { error: priceError } = await supabase
        .from('price_history')
        .insert(priceHistoryItems)

      if (priceError) {
        console.error('Price history insert error:', priceError)
        // Non-fatal — pantry items are already saved
      }
    }

    // Update receipt status to confirmed
    if (receipt_id) {
      await supabase
        .from('receipts')
        .update({ extraction_status: 'completed' })
        .eq('id', receipt_id)
    }

    return NextResponse.json({
      success: true,
      saved_count: insertedPantry?.length || items.length,
      message: `${insertedPantry?.length || items.length} items saved to pantry`,
    })
  } catch (error) {
    console.error('Confirm receipt error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save items' },
      { status: 500 }
    )
  }
}
