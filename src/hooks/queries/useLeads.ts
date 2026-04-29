"use client";

import { useQuery } from "@tanstack/react-query";
import { leadService } from "@/services/lead.service";
import { queryKeys } from "@/lib/query-keys";

export function useLeads() {
  return useQuery({
    queryKey: queryKeys.leads.list(),
    queryFn: () => leadService.list(),
  });
}
