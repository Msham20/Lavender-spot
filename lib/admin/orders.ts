import { createClient } from '@/lib/supabase/client';

export async function fetchAdminOrders() {
  const supabase = createClient();
  const [ordersResult, profilesResult] = await Promise.all([
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, email'),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const profilesById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));

  return (ordersResult.data || []).map((order: any) => ({
    id: order.order_number,
    databaseId: order.id,
    subtotal: Number(order.subtotal),
    shippingCharge: Number(order.delivery_charge || 0),
    total: Number(order.total_amount),
    status: order.status || 'Pending',
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    upiTransactionReference: order.payment_reference,
    paymentVerifiedAt: order.payment_verified_at,
    created_at: order.created_at,
    customer: {
      name: order.shipping_name,
      email: profilesById.get(order.user_id)?.email || '',
      phone: order.shipping_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
    },
    items: (order.order_items || []).map((item: any) => ({
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      product: { name: item.product_name, price: Number(item.unit_price) },
    })),
  }));
}