import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [items, setItems] = useState([]);

    const fetchItems = useCallback(({ q = '', page = '', limit = '' } = {}) => {
        let isMounted = true;

        const fetchPromise = fetch(
            `http://localhost:3001/api/items?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
        )
            .then(res => res.json())
            .then(json => {
                if (isMounted) setItems(json.items);
                return json;
            })
            .catch(err => { if (isMounted) console.error(err); });

        fetchPromise.cancel = () => { isMounted = false };
        return fetchPromise;
    }, []);

    return (
        <DataContext.Provider value={{ items, fetchItems }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
