import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QE9DkRqUPj1sgqgI4eiFcV7EJSdKsO2ZKEbRwRWGaLklhzd1IrxsB4us5NDsVLsRXHjxPCTFNJOTi30gIcPtMPa00cYrjyyol';

const initStripe = async () => {
    try {
        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        if (!stripe) {
            throw new Error('Failed to initialize Stripe');
        }
        return stripe;
    } catch (error) {
        console.error('Stripe initialization error:', error);
        throw error;
    }
};

export default initStripe(); 