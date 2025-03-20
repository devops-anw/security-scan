import { ReactNode } from "react";

import { MessageDescriptor } from "react-intl";

export type Translation = MessageDescriptor & {
  values?: Record<string, string | number | Date | null>;
};

export type TranslationOrNode = Translation | ReactNode;
