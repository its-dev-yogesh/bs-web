"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryService } from "@/services/inquiry.service";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useConnectPost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      inquired,
      message,
    }: {
      id: string;
      inquired: boolean;
      message?: string;
    }) => {
      if (inquired) {
        await inquiryService.withdraw(id);
      } else {
        await inquiryService.create(id, message);
      }
    },
    onMutate: async ({
      id,
      inquired,
    }): Promise<{ prev: FeedPages | undefined }> => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prev) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prev,
          pages: prev.pages.map((page) =>
            page.map((p) =>
              p.id === id
                ? {
                    ...p,
                    inquired: !inquired,
                    inquiryCount: Math.max(
                      0,
                      p.inquiryCount + (inquired ? -1 : 1),
                    ),
                  }
                : p,
            ),
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
    },
  });
}
