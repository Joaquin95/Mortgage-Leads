import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function StripeCheckout({ priceId, userEmail }) {
    const handleCheckout = async () => {
        const stripe = await stripePromise;
        const res = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId, email: userEmail }),
        });

        const session = await res.json();
        await stripe.redirectToCheckout({
            sessionId: session.id,
        });
};

return (
    <button onClick={handleCheckout} className="bg-blue-600 p-2 text-white rounded">
        Subscribe Now
    </button>
);
}