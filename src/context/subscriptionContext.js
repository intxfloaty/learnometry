import { createContext, useContext, useState, useEffect } from 'react';
import { checkUserResponseCount, fetchProductName } from '@/utils/firebase'


const SubscriptionContext = createContext();

export const useSubscription = () => {
    return useContext(SubscriptionContext);
};

export const SubscriptionProvider = ({ children }) => {
    const [subscriber, setSubscriber] = useState();
    const [productName, setProductName] = useState();

    useEffect(() => {
        checkUserResponseCount().then((userStatus) => {
            setSubscriber(userStatus.subscriber);
        });

        fetchProductName().then((productName) => {
            setProductName(productName);
        });
    }, []);

    const value = {
        subscriber,
        productName,
    };

    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

