import type { FeedItem } from '@/core/types/api';
import { localDateInZone } from '@/core/lib/date';

export interface FeedEntry {
  key: string;
  item: FeedItem;
  count: number;
}

/**
 * Daily-goal audits are emitted once per eligible commit. Collapse them into a single
 * entry per activity day so a busy day does not flood the feed.
 */
export function groupFeedItems(items: FeedItem[], timezone?: string): FeedEntry[] {
  const entries: FeedEntry[] = [];
  const dailyGoalIndex = new Map<string, number>();

  items.forEach((item) => {
    if (item.type !== 'DAILY_GOAL') {
      entries.push({ key: item.id, item, count: 1 });
      return;
    }
    //---- Without a challenge timezone the server date is the best available grouping key.
    const day = timezone ? localDateInZone(item.createdAt, timezone) : item.createdAt.slice(0, 10);
    const existing = dailyGoalIndex.get(day);
    if (existing !== undefined) {
      entries[existing].count += 1;
      return;
    }
    dailyGoalIndex.set(day, entries.length);
    entries.push({ key: `daily-goal:${day}`, item, count: 1 });
  });

  return entries;
}
