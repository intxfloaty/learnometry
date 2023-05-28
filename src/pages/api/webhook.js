import crypto from 'crypto'

export async function POST(request, response) {

    const rawBody = await request.text()

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(request.headers.get('X-Signature') || '', 'utf8');

    if (!crypto.timingSafeEqual(digest, signature)) {
        throw new Error('Invalid signature.');
    }

    const data = JSON.parse(rawBody)

    return new Response('OK')
}