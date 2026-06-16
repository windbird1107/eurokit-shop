import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json()

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ success: false, message: '파라미터 누락' }, { status: 400 })
  }

  // 토스페이먼츠 결제 승인
  const secretKey = process.env.TOSS_SECRET_KEY!
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  const tossData = await tossRes.json()

  if (!tossRes.ok) {
    return NextResponse.json({ success: false, message: tossData.message ?? '결제 승인 실패' }, { status: 400 })
  }

  // DB에 주문 저장
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const cartItems = await supabase
      .from('cart_items')
      .select('*, products(price)')
      .eq('user_id', user?.id ?? '')

    await supabase.from('orders').insert({
      user_id: user?.id,
      payment_key: paymentKey,
      order_id: orderId,
      status: 'paid',
      total: amount,
      buyer_email: user?.email,
    })

    const order = await supabase.from('orders').select('id').eq('order_id', orderId).single()

    if (order.data && cartItems.data) {
      await supabase.from('order_items').insert(
        cartItems.data.map((i: any) => ({
          order_id: order.data.id,
          product_id: i.product_id,
          size: i.size,
          quantity: i.quantity,
          price: i.products?.price ?? 0,
        }))
      )
      await supabase.from('cart_items').delete().eq('user_id', user?.id ?? '')
    }
  } catch (e) {
    console.error('DB 저장 오류:', e)
  }

  return NextResponse.json({ success: true, paymentKey, orderId, amount })
}
