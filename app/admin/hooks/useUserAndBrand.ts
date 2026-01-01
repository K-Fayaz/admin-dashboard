import { useEffect, useState } from "react";
import type { User, Brand } from "../components/types";

export function useUserAndBrand(userId: string | undefined, brandId: string | undefined, isOpen: boolean) {
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId && brandId) {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        setLoading(false);
        return;
      }

      Promise.all([
        fetch(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/brands/${brandId}`, { headers: { Authorization: `Bearer ${token}` } })
      ])
        .then(async ([userRes, brandRes]) => {
          if (userRes.status === 401 || userRes.status === 403 || brandRes.status === 401 || brandRes.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
            return;
          }

          const userData = await userRes.json();
          const brandData = await brandRes.json();

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

