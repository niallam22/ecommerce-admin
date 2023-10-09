"use client";

import { useEffect, useState } from "react";

import { StoreModal } from "@/components/modals/store-modal";
 
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    return null;
  }
  //avoid hydration error by only return modal if mounted
  return (
    <>
      <StoreModal />
    </>
  );
}
