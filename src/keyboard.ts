import type { Controller } from "./controller.ts";
import { type KarakuriLanguage, say } from "./strings.ts";

const KEYBOARD_ID = -1;

let keyboardCounter = 0;

export type KeyboardState = { x: number; y: number; active: boolean; visible: boolean };

export type KeyboardHandle = {
  cancel(): void;
  update(): void;
  /** Puts the key at the middle of the board now being played and says where it is. */
  centre(): void;
};

/** Wires arrows, Enter, Space, Escape and Home to the canvas. The handle is what a level change uses to drop a held key. */
export function attachKeyboard(input: {
  canvas: HTMLCanvasElement;
  root: HTMLElement;
  full: boolean;
  enabled: boolean;
  step: number;
  pointers: Set<number>;
  keyboard: KeyboardState;
  controller: () => Controller;
  lang: () => KarakuriLanguage;
  refresh: () => void;
  draw: () => void;
}): KeyboardHandle {
  if (!Number.isFinite(input.step) || input.step < 1 || input.step > 100)
    throw new RangeError("karakuri: keyboardStep must be from 1 to 100");
  const keyboard = input.keyboard;
  const keyboardLive = document.createElement("p");
  keyboardLive.className = "kk-live";
  keyboardLive.setAttribute("aria-live", "polite");
  input.root.append(keyboardLive);
  const keyboardHelp = document.createElement("p");
  keyboardHelp.className = input.full ? "kk-keyboard-help" : "kk-live";
  keyboardHelp.hidden = !input.enabled;
  keyboardHelp.id = `karakuri-keyboard-${++keyboardCounter}`;
  input.root.append(keyboardHelp);
  if (input.enabled) input.canvas.setAttribute("aria-describedby", keyboardHelp.id);
  input.canvas.tabIndex = input.enabled ? 0 : -1;
  const update = (): void => {
    input.canvas.dataset.keyX = String(keyboard.x);
    input.canvas.dataset.keyY = String(keyboard.y);
    input.canvas.dataset.keyActive = String(keyboard.active);
    keyboardHelp.textContent = say(input.lang(), "keyboardHelp");
    keyboardLive.textContent = keyboard.visible
      ? say(input.lang(), keyboard.active ? "keyboardPressed" : "keyboardPosition", {
          x: Math.round(keyboard.x),
          y: Math.round(keyboard.y),
        })
      : "";
  };
  const cancel = (): void => {
    if (keyboard.active) input.controller().pointerCancel(KEYBOARD_ID);
    keyboard.active = false;
    input.pointers.delete(KEYBOARD_ID);
  };
  const centre = (): void => {
    const controller = input.controller();
    keyboard.x = controller.width / 2;
    keyboard.y = controller.height / 2;
    update();
  };
  const onKeyboard = (event: KeyboardEvent): void => {
    if (!input.enabled || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " ", "Escape", "Home"].includes(event.key))
      return;
    event.preventDefault();
    keyboard.visible = true;
    const controller = input.controller();
    if (event.key.startsWith("Arrow")) {
      const distance = event.shiftKey ? 1 : input.step;
      const across = event.key === "ArrowLeft" ? -distance : event.key === "ArrowRight" ? distance : 0;
      keyboard.x = Math.max(0, Math.min(controller.width, keyboard.x + across));
      keyboard.y = Math.max(
        0,
        Math.min(
          controller.height,
          keyboard.y + (event.key === "ArrowUp" ? -distance : event.key === "ArrowDown" ? distance : 0),
        ),
      );
      if (keyboard.active) controller.pointerMove(keyboard, KEYBOARD_ID);
    } else if (event.key === "Escape") cancel();
    else if (event.key === "Home") {
      cancel();
      keyboard.x = controller.width / 2;
      keyboard.y = controller.height / 2;
    } else if (!event.repeat) {
      if (controller.gesture === "tap") {
        controller.pointerDown(keyboard, KEYBOARD_ID);
        controller.pointerUp(keyboard, KEYBOARD_ID);
      } else if (keyboard.active) {
        controller.pointerUp(keyboard, KEYBOARD_ID);
        keyboard.active = false;
        input.pointers.delete(KEYBOARD_ID);
      } else {
        controller.pointerDown(keyboard, KEYBOARD_ID);
        keyboard.active = true;
        input.pointers.add(KEYBOARD_ID);
      }
    }
    update();
    input.refresh();
  };
  input.canvas.addEventListener("keydown", onKeyboard);
  input.canvas.addEventListener("focus", () => {
    if (input.enabled) {
      keyboard.visible = true;
      update();
      input.draw();
    }
  });
  input.canvas.addEventListener("blur", () => {
    cancel();
    keyboard.visible = false;
    update();
    input.refresh();
  });
  return { cancel, update, centre };
}
