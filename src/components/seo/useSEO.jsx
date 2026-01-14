import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSEO(slug) {
  const { data: seoData } = useQuery({
    queryKey: ['seo', slug],
    queryFn: async () => {
      const contents = await base44.entities.Content.filter({ slug });
      return contents[0] || null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return seoData;
}