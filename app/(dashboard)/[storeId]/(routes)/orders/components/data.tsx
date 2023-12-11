import {
    CheckCircledIcon,
    CircleIcon,
    CrossCircledIcon,
    QuestionMarkCircledIcon,
    StopwatchIcon,
  } from "@radix-ui/react-icons"
  
  export const statuses = [
    {
      value: "ordered",
      label: "Ordered",
      icon: CircleIcon,
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: CheckCircledIcon,
    },
    {
      value: "full return in progress",
      label: "Full return in progress",
      icon: QuestionMarkCircledIcon,
    },
    {
      value: "partial return in progress",
      label: "Partial return in progress",
      icon: QuestionMarkCircledIcon,
    },
    {
      value: "full return complete",
      label: "Full return complete",
      icon: CrossCircledIcon,
    },
    {
      value: "partial return complete",
      label: "Partial return complete",
      icon: CrossCircledIcon,
    },
    {
      value: "pending payment",
      label: "Pending payment",
      icon: StopwatchIcon,
    },
  ]
  