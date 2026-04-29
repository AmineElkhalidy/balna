"use client";

import { useEffect, useId, useRef, useState } from "react";
import { format } from "@/lib/format";
import type { Product } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/sanity/products";
import { CopyButton } from "./CopyButton";

type Tab = "whatsapp" | "bank";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  whatsappHref: string;
  settings: SiteSettings;
  dict: Dictionary;
}

/**
 * Manual checkout modal.
 *
 * No cart, no payment gateway — Balna deals in 1-of-1 thrift, so the buyer
 * either WhatsApps Balna directly (default) or reserves the piece by bank
 * transfer. The modal exposes both flows in a single sheet on mobile and a
 * centered card on desktop.
 *
 * Implementation: a controlled HTML <dialog>. We open it imperatively in an
 * effect so that ESC-to-close and the native focus trap work, and we close on
 * backdrop click as well as via the close button.
 */
export function CheckoutModal({
  open,
  onClose,
  product,
  whatsappHref,
  settings,
  dict,
}: CheckoutModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [tab, setTab] = useState<Tab>("whatsapp");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && !node.open) {
      try {
        node.showModal();
      } catch {
        node.setAttribute("open", "");
      }
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  // Reset to WhatsApp tab whenever a new product is opened.
  useEffect(() => {
    if (open) setTab("whatsapp");
  }, [open, product.id]);

  const c = dict.checkout;
  const bank = settings.bankTransfer;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close when the backdrop (the dialog itself, not its child) is clicked.
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby={titleId}
      className="m-0 w-full max-w-md rounded-3xl bg-white p-0 text-balna-ink shadow-2xl backdrop:bg-balna-ink/40 backdrop:backdrop-blur-sm sm:m-auto sm:rounded-3xl"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p
              dir="ltr"
              className="text-xs font-semibold uppercase tracking-wider text-balna-teal-dark"
            >
              {product.brand}
            </p>
            <h2
              id={titleId}
              dir="ltr"
              className="mt-0.5 font-balna-display text-lg font-extrabold text-balna-ink"
            >
              {product.title}
            </h2>
            <p className="mt-1 text-sm text-balna-muted" dir="ltr">
              ${product.price} · {dict.condition[product.condition]} ·{" "}
              {product.sizes.join(" / ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.close}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-balna-line/60 text-balna-ink transition hover:bg-balna-line"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </header>

        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-balna-line/60 p-1 text-sm font-semibold">
          <TabButton
            active={tab === "whatsapp"}
            onClick={() => setTab("whatsapp")}
          >
            {c.tabs.whatsapp}
          </TabButton>
          <TabButton active={tab === "bank"} onClick={() => setTab("bank")}>
            {c.tabs.bank}
          </TabButton>
        </div>

        {tab === "whatsapp" ? (
          <WhatsAppPanel href={whatsappHref} dict={dict} />
        ) : (
          <BankPanel bank={bank} product={product} dict={dict} />
        )}

        <p className="text-center text-xs text-balna-muted">
          {format(c.referenceFooter, { ref: product.id })}
        </p>
      </div>
    </dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "h-10 rounded-xl transition",
        active
          ? "bg-white text-balna-ink shadow-[var(--shadow-card)]"
          : "text-balna-muted hover:text-balna-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function WhatsAppPanel({
  href,
  dict,
}: {
  href: string;
  dict: Dictionary;
}) {
  const c = dict.checkout;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-balna-muted">{c.whatsapp.body}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-balna-whatsapp font-semibold text-white transition hover:bg-balna-whatsapp-dark active:scale-[0.99]"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {c.whatsapp.cta}
      </a>
    </div>
  );
}

function BankPanel({
  bank,
  product,
  dict,
}: {
  bank: SiteSettings["bankTransfer"];
  product: Product;
  dict: Dictionary;
}) {
  const c = dict.checkout;

  if (!bank || !bank.iban) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-balna-line p-4 text-center text-sm text-balna-muted">
        {c.bank.unavailable}
      </div>
    );
  }

  return (
    <dl className="flex flex-col gap-3 rounded-2xl bg-balna-cream p-4">
      <Row label={c.bank.bankName} value={bank.bankName} />
      <Row label={c.bank.accountHolder} value={bank.accountHolder} />
      <Row
        label={c.bank.iban}
        value={bank.iban}
        copy={{ value: bank.iban, dict: c.bank }}
      />
      {bank.swift ? <Row label={c.bank.swift} value={bank.swift} /> : null}
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-balna-teal-dark">
          {c.bank.reference}
        </dt>
        <dd className="mt-1 rounded-xl bg-white px-3 py-2 font-mono text-sm text-balna-ink ring-1 ring-balna-line">
          {product.id}
        </dd>
      </div>
      {bank.instructions ? (
        <p className="text-xs text-balna-muted">{bank.instructions}</p>
      ) : null}
    </dl>
  );
}

function Row({
  label,
  value,
  copy,
}: {
  label: string;
  value: string | null | undefined;
  copy?: { value: string; dict: Dictionary["checkout"]["bank"] };
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-balna-teal-dark">
          {label}
        </dt>
        <dd className="mt-0.5 break-all font-mono text-sm text-balna-ink" dir="ltr">
          {value}
        </dd>
      </div>
      {copy ? (
        <CopyButton
          value={copy.value}
          idleLabel={copy.dict.copy}
          copiedLabel={copy.dict.copied}
        />
      ) : null}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.11 4.91A10 10 0 0 0 4.05 18.27L3 22l3.83-1A10 10 0 1 0 19.1 4.92ZM12 20.13a8.13 8.13 0 0 1-4.13-1.13l-.3-.18-2.27.6.61-2.21-.2-.32A8.13 8.13 0 1 1 12 20.13Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79s-.39-.12-.55.12-.63.79-.78.95-.29.18-.53.06a6.66 6.66 0 0 1-3.34-2.93c-.25-.43.25-.4.72-1.34a.45.45 0 0 0 0-.43c-.06-.12-.55-1.32-.75-1.81s-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.05 4.78 4.78 0 0 0 1 2.55 11 11 0 0 0 4.21 3.71c.59.26 1 .41 1.4.53a3.41 3.41 0 0 0 1.55.1 2.54 2.54 0 0 0 1.66-1.18 2.06 2.06 0 0 0 .14-1.18c-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
