import React, { useEffect, useState } from 'react';
import { List } from 'react-window';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
    const { items, fetchItems } = useData();
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 2;

    useEffect(() => {
        const promise = fetchItems({ q, page, limit }).then(data => {
            if (data) setTotal(data.total);
        });

        return () => {
            if (promise.cancel) promise.cancel();
        };
    }, [fetchItems, q, page]);

    const Row = ({ index, style }) => {
        const item = items[index];
        if (!item) return null;
        return (
            <div style={style}>
                <Link to={'/items/' + item.id}>{item.name}</Link>
            </div>
        );
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <input
                type="text"
                placeholder="Search items..."
                value={q}
                onChange={e => {
                    setQ(e.target.value);
                    setPage(1); // reset page on new search
                }}
            />

            {items.length === 0 ? (
                <p>No items found</p>
            ) : (
                <List
                    rowComponent={Row}
                    rowCount={items.length}
                    rowHeight={25}
                    rowProps={{items}}
                >
                    {Row}
                </List>
            )}

            <div>
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>{page} / {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Items;
