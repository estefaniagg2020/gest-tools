import type { AgendaItem } from "@/interfaces";

export interface OverlapInfo {
  left: number;  // 0..1 fraction of column width
  width: number; // 0..1 fraction of column width
}

function itemsOverlap(a: AgendaItem, b: AgendaItem): boolean {
  return new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
}

/**
 * Given a flat list of items for a single column (day or member),
 * assigns each item a lane (column index) and computes left/width fractions
 * so overlapping items share the horizontal space side-by-side.
 */
export function computeOverlapLayout(items: AgendaItem[]): Map<string, OverlapInfo> {
  const sorted = [...items].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  // Assign each item to the first available lane
  const lanes: number[] = []; // lanes[i] = end time (ms) of last item in lane i
  const itemLane = new Map<string, number>();

  for (const item of sorted) {
    const startMs = new Date(item.start).getTime();
    let lane = lanes.findIndex((endMs) => endMs <= startMs);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(0);
    }
    lanes[lane] = new Date(item.end).getTime();
    itemLane.set(item.id, lane);
  }

  // For each item, find the total number of lanes within its overlap group
  const result = new Map<string, OverlapInfo>();

  for (const item of sorted) {
    const myLane = itemLane.get(item.id)!;
    let maxLane = myLane;

    for (const other of sorted) {
      if (other.id !== item.id && itemsOverlap(item, other)) {
        maxLane = Math.max(maxLane, itemLane.get(other.id)!);
      }
    }

    const totalLanes = maxLane + 1;
    result.set(item.id, {
      left: myLane / totalLanes,
      width: 1 / totalLanes,
    });
  }

  return result;
}
