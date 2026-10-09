const isRazorpayConfigured = () => Boolean(
  process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') && process.env.RAZORPAY_KEY_SECRET
);

const createRazorpayOrder = async ({ amount, currency, receipt, notes }) => {
  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, currency, receipt, notes }),
    signal: AbortSignal.timeout(15000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.description || 'Razorpay could not create the payment order');
    error.status = response.status;
    throw error;
  }
  return data;
};

module.exports = { createRazorpayOrder, isRazorpayConfigured };
