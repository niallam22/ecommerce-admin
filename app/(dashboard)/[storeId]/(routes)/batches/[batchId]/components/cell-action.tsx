"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { ProductColumn } from "./columns";
import { Checkbox } from "@/components/ui/checkbox";

interface CellActionProps {
  data: ProductColumn;
  onRowSelect: (row: ProductColumn) => void;
  // onChange:
}

export const CellAction: React.FC<CellActionProps> = ({
  data, onRowSelect,
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  // const onConfirm = async () => {
  //   try {
  //     setLoading(true);
  //     await axios.delete(`/api/${params.storeId}/products/${data.id}`);
  //     toast.success('Product deleted.');
  //     router.refresh();
  //   } catch (error) {
  //     toast.error('Something went wrong');
  //   } finally {
  //     setLoading(false);
  //     setOpen(false);
  //   }
  // };

  // const onCopy = (id: string) => {
  //   navigator.clipboard.writeText(id);
  //   toast.success('Product ID copied to clipboard.');
  // }

  const onChange = (id: string, name: string) => {
    // Call the onRowSelect callback to update the selected row
    onRowSelect(data);
  };

  return (
    <Checkbox
    // checked={value}
    // @ts-ignore
    onCheckedChange={onChange}
  />
  
  );
};
