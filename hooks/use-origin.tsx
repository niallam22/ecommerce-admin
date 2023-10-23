import { useEffect, useState } from "react";
//access orgin if window exists and component has been mounted ie server and client side are synced to avoid hydration error
export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return ''
  }

  return origin;
};
