
export const PRICING_PLANS = {
    starter: {
        name: 'Starter',
        price: 999,
        cardsLimit: 50,
        features: [
            '50 ID cards/month',
            'Basic templates',
            'Email support'
        ]
    },
    pro: {
        name: 'Pro',
        price: 2999,
        cardsLimit: 200,
        features: [
            '200 ID cards/month',
            'Custom templates',
            'Priority support',
            'Bulk upload'
        ]
    },
    business: {
        name: 'Business',
        price: 4999,
        cardsLimit: 500,
        features: [
            '500 ID cards/month',
            'Unlimited templates',
            'Dedicated support',
            'API access',
            'White label'
        ]
    }
};

export function canGenerateCard(company: any): boolean {
    if (!company || !company.subscription) return false;
    return company.subscription.status === 'active' &&
        company.subscription.cardsUsed < company.subscription.cardsLimit &&
        (!company.subscription.endDate || company.subscription.endDate.toDate() > new Date());
}

export function getCostPerCard(plan: string): number {
    const planData = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
    if (!planData) return 0;
    return planData.price / planData.cardsLimit;
}
