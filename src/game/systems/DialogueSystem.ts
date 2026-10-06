import type { Conversation } from "../types";

export class DialogueSystem {
  private readonly panel = required<HTMLElement>("#dialogue-panel");
  private readonly speaker = required<HTMLElement>("#dialogue-speaker");
  private readonly text = required<HTMLElement>("#dialogue-text");
  private readonly choices = required<HTMLElement>("#dialogue-choices");
  private readonly continueButton = required<HTMLButtonElement>("#dialogue-continue");
  private active: Conversation | null = null;
  private lineIndex = 0;
  private onActiveChange: (active: boolean) => void = () => {};

  constructor() {
    this.continueButton.addEventListener("click", () => this.advance());
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !this.panel.hidden && this.choices.childElementCount === 0) {
        this.advance();
      }
    });
  }

  setActiveChangeHandler(handler: (active: boolean) => void): void {
    this.onActiveChange = handler;
  }

  get isActive(): boolean {
    return this.active !== null;
  }

  start(conversation: Conversation): void {
    this.active = conversation;
    this.lineIndex = 0;
    this.panel.hidden = false;
    this.onActiveChange(true);
    this.renderLine();
  }

  close(): void {
    if (!this.active) return;
    const completed = this.active;
    this.active = null;
    this.panel.hidden = true;
    this.onActiveChange(false);
    completed.onComplete?.();
  }

  advance(): void {
    if (!this.active || this.choices.childElementCount > 0) return;
    if (this.lineIndex + 1 >= this.active.lines.length) {
      this.close();
      return;
    }
    this.lineIndex += 1;
    this.renderLine();
  }

  private renderLine(): void {
    const line = this.active?.lines[this.lineIndex];
    if (!line) {
      this.close();
      return;
    }
    this.speaker.textContent = line.speaker;
    this.text.textContent = line.text;
    this.choices.replaceChildren();
    this.continueButton.hidden = Boolean(line.choices?.length);
    for (const choice of line.choices ?? []) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dialogue-choice";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        if (choice.setFlag) this.onChoiceFlag?.(choice.setFlag.key, choice.setFlag.value);
        this.onChoice?.(this.active?.id ?? "", choice.id);
        if (choice.next === undefined) this.close();
        else {
          this.lineIndex = choice.next;
          this.renderLine();
        }
      });
      this.choices.append(button);
    }
  }

  private onChoice?: (conversationId: string, choiceId: string) => void;
  private onChoiceFlag?: (key: string, value: boolean | number | string) => void;

  setChoiceHandlers(
    onChoice: (conversationId: string, choiceId: string) => void,
    onFlag: (key: string, value: boolean | number | string) => void,
  ): void {
    this.onChoice = onChoice;
    this.onChoiceFlag = onFlag;
  }
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required dialogue element is missing: ${selector}`);
  return element;
}
