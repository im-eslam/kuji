import { useLayoutEffect, useState } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { ApiError, postJson } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { navigate, usePath } from "@/shared/router";
import { ROUTES } from "@/shared/routes";
import { ChoiceCard } from "./components/ChoiceCard";
import { ReviewForm, type ReviewFormValues } from "./components/ReviewForm";
import { ThankYou } from "./components/ThankYou";
import { GOOGLE_REVIEW_URL, LIMITS, REVIEW_API } from "./config";
import { strings } from "./strings";
import { useSheetDrag } from "./hooks/useSheetDrag";

const EMPTY_FORM: ReviewFormValues = {
  message: "",
  name: "",
  contact: "",
  website: "",
};

const styles = {
  overlay:
    "fixed inset-0 z-50 flex items-end justify-center bg-scrim data-entering:animate-scrim-in data-exiting:animate-scrim-out",
  panel:
    "flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-sheet bg-mist pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet data-entering:animate-slide-up data-exiting:animate-slide-down",
  settle: "transition-transform duration-500 ease-[var(--ease-smooth)]",
  handleZone:
    "flex h-12 w-full shrink-0 cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing",
  handleBar: "h-1.5 w-10 rounded-full bg-navy/15",
  dialog: "flex min-h-0 flex-col outline-none",
  header: "flex shrink-0 items-start justify-between gap-4 px-6 pb-3",
  title: "text-title font-bold text-balance",
  closeButton:
    "group -mt-2 inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full p-1",
  closeVisual:
    "pointer-events-none inline-flex size-9 items-center justify-center rounded-full bg-arctic transition group-data-hovered:bg-arctic/80 group-data-pressed:scale-95",
  closeIcon: "size-5",
  body: "min-h-0 overflow-y-auto overscroll-contain px-6 pb-2",
  step: "animate-reveal-in",
  choices: "flex flex-col gap-3 pb-2",
};

export function ReviewPage() {
  const isOpen = usePath() === ROUTES.review;
  const close = () => navigate(ROUTES.landing);
  const drag = useSheetDrag(close);
  const { reset } = drag;

  useLayoutEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && close()}
      isDismissable
      className={styles.overlay}
    >
      <Modal
        style={drag.style}
        className={({ isEntering, isExiting }) =>
          `${styles.panel} ${
            !isEntering && !isExiting && !drag.dragging ? styles.settle : ""
          }`
        }
      >
        <div
          {...drag.handleProps}
          aria-hidden="true"
          className={styles.handleZone}
        >
          <span className={styles.handleBar} />
        </div>
        <Dialog className={styles.dialog}>
          {({ close }) => <ReviewSheet close={close} />}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

type Step = "choose" | "note" | "sent";

function ReviewSheet({ close }: { close: () => void }) {
  const s = useStrings(strings);
  const [step, setStep] = useState<Step>("choose");
  const [form, setForm] = useState<ReviewFormValues>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = form.message.trim();
  const tooShort = message.length < LIMITS.minNote;

  function openGoogleReview() {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    close();
  }

  async function submit() {
    if (tooShort || sending) return;
    setSending(true);
    setError(null);
    try {
      await postJson(REVIEW_API, {
        message,
        name: form.name.trim(),
        contact: form.contact.trim(),
        website: form.website,
      });
      setStep("sent");
    } catch (e) {
      let message = s.error;

      if (e instanceof ApiError) {
        if (e.status === 429 || e.code === "RATE_LIMITED") {
          message = s.tooMany;
        } else if (e.status === 422 || e.code === "INVALID_INPUT") {
          message = s.invalidInput;
        } else if (e.code === "TIMEOUT") {
          message = s.timeout;
        } else if (
          e.status >= 500 ||
          e.code === "INTERNAL_ERROR" ||
          e.code === "INVALID_RESPONSE"
        ) {
          message = s.serverError;
        }
      }

      setError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className={styles.header}>
        <Heading slot="title" className={styles.title}>
          {step === "note" ? s.noteTitle : s.sheetTitle}
        </Heading>
        <Button
          slot="close"
          aria-label={s.close}
          className={styles.closeButton}
        >
          <span className={styles.closeVisual}>
            <Icon name="close" className={styles.closeIcon} />
          </span>
        </Button>
      </div>

      <div className={styles.body}>
        <div key={step} className={styles.step}>
          {step === "choose" && (
            <div className={styles.choices}>
              <ChoiceCard
                icon="star"
                title={s.googleTitle}
                hint={s.googleHint}
                onPress={openGoogleReview}
              />
              <ChoiceCard
                icon="chat"
                title={s.noteTitle}
                hint={s.noteHint}
                onPress={() => setStep("note")}
              />
            </div>
          )}

          {step === "note" && (
            <ReviewForm
              values={form}
              onChange={(field, value) => {
                setForm((prev) => ({ ...prev, [field]: value }));
                if (error) setError(null);
              }}
              onSubmit={submit}
              limits={LIMITS}
              labels={{
                note: s.noteLabel,
                name: s.nameLabel,
                contact: s.contactLabel,
                submit: sending ? s.sending : s.send,
              }}
              noteHint={tooShort ? s.tooShort : undefined}
              canSubmit={!tooShort && !sending}
              error={error}
            />
          )}

          {step === "sent" && (
            <ThankYou message={s.thanks} closeLabel={s.close} onClose={close} />
          )}
        </div>
      </div>
    </>
  );
}
