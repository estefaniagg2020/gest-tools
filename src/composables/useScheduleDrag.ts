import { ref, readonly } from "vue";
import type { AgendaItem } from "@/interfaces";

// Module-level singleton — shared across all component instances in the same page
const _item = ref<AgendaItem | null>(null);
const _moving = ref(false);
const _lastDraggedId = ref<string | null>(null);
const _ghostX = ref(0);
const _ghostY = ref(0);
const _label = ref("");
let _startX = 0;
let _startY = 0;
const THRESHOLD = 5;

export const useScheduleDrag = () => {
  const begin = (item: AgendaItem, e: PointerEvent, label = "") => {
    _item.value = item;
    _startX = e.clientX;
    _startY = e.clientY;
    _ghostX.value = e.clientX;
    _ghostY.value = e.clientY;
    _label.value = label;
    _moving.value = false;
    _lastDraggedId.value = null;
  };

  const update = (e: PointerEvent) => {
    if (!_item.value) return;
    _ghostX.value = e.clientX;
    _ghostY.value = e.clientY;
    if (_moving.value) return;
    const distance = Math.hypot(e.clientX - _startX, e.clientY - _startY);
    if (distance > THRESHOLD) {
      _moving.value = true;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  };

  const end = (): { item: AgendaItem | null; moved: boolean } => {
    const item = _item.value;
    const moved = _moving.value;
    if (item && moved) {
      _lastDraggedId.value = item.id;
      // Clear after click event has had time to fire and check
      setTimeout(() => {
        _lastDraggedId.value = null;
      }, 80);
    }
    _item.value = null;
    _moving.value = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    return { item, moved };
  };

  return {
    item: readonly(_item),
    moving: readonly(_moving),
    lastDraggedId: readonly(_lastDraggedId),
    ghostX: readonly(_ghostX),
    ghostY: readonly(_ghostY),
    label: readonly(_label),
    begin,
    update,
    end,
  };
};
