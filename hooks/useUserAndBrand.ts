import { useEffect, useState } from "react";
import type { User, Brand } from "../app/admin/components/types";

export function useUserAndBrand(userId: string | undefined, brandId: string | undefined, isOpen: boolean) {
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId && brandId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/users/${userId}`).then(res => res.json()),
        fetch(`/api/brands/${brandId}`).then(res => res.json())
      ])
        .then(([userData, brandData]) => {
          if (userData.success) setUser(userData.data);
          if (brandData.success) setBrand(brandData.data);
        })
        .catch(err => console.error('Error fetching user/brand:', err))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setBrand(null);
    }
  }, [isOpen, userId, brandId]);

  return { user, brand, loading };
}

