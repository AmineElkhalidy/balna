import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Site settings — singleton document.
 *
 * Holds the WhatsApp number and bank details used by the manual checkout
 * flow. Always edited as a single document — see `sanity/structure.ts` which
 * forces it to open as a singleton instead of a list.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      description:
        "Country code + number, no spaces or symbols. e.g. 212600000000 for Morocco.",
      type: "string",
      validation: (R) =>
        R.required()
          .regex(/^\d{8,15}$/)
          .error("Digits only, 8–15 of them. No '+', no spaces."),
    }),
    defineField({
      name: "bankTransfer",
      title: "Bank transfer details",
      description: "Shown in the 'Reserve via Bank Transfer' modal.",
      type: "object",
      fields: [
        defineField({ name: "bankName", title: "Bank name", type: "string" }),
        defineField({
          name: "accountHolder",
          title: "Account holder",
          type: "string",
        }),
        defineField({
          name: "iban",
          title: "IBAN / Account #",
          type: "string",
        }),
        defineField({ name: "swift", title: "SWIFT / BIC", type: "string" }),
        defineField({
          name: "instructions",
          title: "Reference instructions",
          description:
            "Tell buyers what to put in the transfer reference — usually the product ID. e.g. 'Use this reference: BAL-####'.",
          type: "text",
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
