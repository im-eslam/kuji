export const MENU_API = "/menu";

export const LIMITS = {
  /** Max quantity while adding a new line from a sheet. */
  sheetQty: 20,
  /** Max quantity once a line is already in the order (editing/stepper in the order sheet). */
  lineQty: 99,
} as const;

/** How many cards a category shows before "Show all". */
export const FIRST_VISIBLE = 4;

/** Cards joining the list on "Show all" stagger in, capped so a long list never drags. */
export const STAGGER_CAP = 6;

/** How long a quick-add "done" flash lasts on an often-ordered card. */
export const QUICK_ADD_FLASH_MS = 1200;

/** How long an order line's remove transition plays before it is actually removed. */
export const REMOVE_LINE_MS = 220;
