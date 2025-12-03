import { useState, useCallback } from "react";
import { Collection } from "@/models"

export function useCollectionsApi() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCollections = useCallback( async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/collections");
            const data = await res.json();

            setCollections(data || []);
            setError(null);
        } catch (err) {
            console.error("There was an error getting the collections", err);
            setError("Unable to load collections");
        } finally {
            setLoading(false);
        };
    }, []);

    const createCollection = useCallback( async (payload: Partial<Collection>) => {
        const res = await fetch("/api/collections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create a new collection");

        setCollections((prev) => [...prev, data]);
        return data.collection;
    }, []);

    return {
        collections,
        loading,
        error,
        fetchCollections,
        createCollection,
    }
};
