import { describe, expect, it } from 'vitest';
import type { FeedItem } from '@/core/types/api';
import { groupFeedItems } from './feed-grouping';

function item(id: string, type: string, createdAt: string): FeedItem {
  return { id, type, message: type, createdAt };
}

describe('groupFeedItems', () => {
  it('collapses several daily goals from the same day into one entry', () => {
    const items = [
      item('1', 'DAILY_GOAL', '2026-11-02T18:00:00Z'),
      item('2', 'DAILY_GOAL', '2026-11-02T15:00:00Z'),
      item('3', 'DAILY_GOAL', '2026-11-02T12:00:00Z'),
    ];

    const entries = groupFeedItems(items, 'America/Bahia');

    expect(entries).toHaveLength(1);
    expect(entries[0].item.id).toBe('1');
    expect(entries[0].count).toBe(3);
  });

  it('keeps daily goals from different days apart', () => {
    const items = [
      item('1', 'DAILY_GOAL', '2026-11-02T18:00:00Z'),
      item('2', 'DAILY_GOAL', '2026-11-01T18:00:00Z'),
    ];

    expect(groupFeedItems(items, 'America/Bahia')).toHaveLength(2);
  });

  it('groups by the challenge timezone, not by UTC', () => {
    const items = [
      item('1', 'DAILY_GOAL', '2026-11-03T01:00:00Z'),
      item('2', 'DAILY_GOAL', '2026-11-02T23:00:00Z'),
    ];

    //---- Both instants fall on 2026-11-02 in America/Bahia (UTC-3).
    expect(groupFeedItems(items, 'America/Bahia')).toHaveLength(1);
    expect(groupFeedItems(items, 'UTC')).toHaveLength(2);
  });

  it('does not merge other event types', () => {
    const items = [
      item('1', 'MEMBER_JOINED', '2026-11-02T18:00:00Z'),
      item('2', 'MEMBER_JOINED', '2026-11-02T17:00:00Z'),
      item('3', 'DAILY_GOAL', '2026-11-02T16:00:00Z'),
    ];

    expect(groupFeedItems(items, 'America/Bahia')).toHaveLength(3);
  });

  it('interleaves merged daily goals without changing the original order', () => {
    const items = [
      item('1', 'DAILY_GOAL', '2026-11-02T18:00:00Z'),
      item('2', 'MEMBER_JOINED', '2026-11-02T17:00:00Z'),
      item('3', 'DAILY_GOAL', '2026-11-02T16:00:00Z'),
      item('4', 'DAILY_GOAL', '2026-11-01T16:00:00Z'),
    ];

    const entries = groupFeedItems(items, 'America/Bahia');

    expect(entries.map((entry) => entry.item.id)).toEqual(['1', '2', '4']);
    expect(entries[0].count).toBe(2);
  });
});
