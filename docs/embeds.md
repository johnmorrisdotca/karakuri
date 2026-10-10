# Puzzle-game embeds

The shared builder covers every observed attribute and native mounted option, with host-only reasons for structured controllers, dynamic room callbacks and lifecycle functions. It copies all host formats using the package's current major version. Setup is kept in the URL; gameplay reads no storage.

## Attributes and compatibility

Game and level select a native game/level. Ui=full/board remains supported; explicit controls takes priority. Clock remains real/manual. Keyboard defaults on; keyboard-step sets arrow distance in game units (default 10). All false/off/no/0 spellings disable booleans. Size is small/medium/large (320/480/640px), with optional pixel width, auto/light/dark theme and spoken label. Every attribute reflects to a property, using keyboardStep for the hyphenated name. Width and role/label restore previous host values when removed. Themes and native styles work in shadow roots.

Mount, restart and setLevel remain available. Options accepts every native mount field, including a matching host controller, room callback and status/change callbacks. Language/theme/size and callback changes keep the current controller. Layout/clock/keyboard changes remount presentation around the same controller where game/level are unchanged, after cancelling unfinished pointer gestures. Changing the game or level starts its native controller. DefineBoard(tagName?, registry?) is server-safe and idempotent; custom names use subclasses.

## Keyboard play

Focus the canvas with Tab. Arrows move a visible cursor; Shift moves one unit for precision. Enter or Space taps in tap games, and starts/ends a drag in drag games. Escape cancels an unfinished gesture; Home centres the cursor. Coordinates and pressing state are announced politely. The canvas description links to these instructions; the same native pointerDown/pointerMove/pointerUp/pointerCancel methods perform each action. The original touch/mouse routes, physics, clocks and reduced-motion styling remain. Keyboard=false retains an image canvas for a host supplying its own controls.

## Events and frames

Karakuri-status preserves the original StatusEvent payload; karakuri-change carries the same shape for changed level information. Events now bubble and compose with JSON-safe copies. Karakuri-load gives game/level/status; karakuri-error gives a plain message and a visible status. Host callbacks retain their original signatures. Frame receivers should verify the sender origin and frame before accepting { type, detail } messages.

The route validates game ids, per-game level bounds, ui/clock/looks, bounded widths/keyboard steps, booleans and labels and ignores malformed fields. It has noindex, a device colour-scheme, transparent margins and no document scrolling. It loads only local package files; copied imports use jsDelivr. Heights include keyboard instructions and taller native play areas. No hosted service, storage or new timer is added.
