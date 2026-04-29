"use client";

import { useQuery } from "@tanstack/react-query";
import { inquiryService } from "@/services/inquiry.service";

export function useSentInquiries(enabled = true) {
  return useQuery({
    queryKey: ["me", "inquiries", "sent"] as const,
    queryFn: () => inquiryService.listSent(),
    enabled,
    staleTime: 30_000,
  });
}
