import { areEqual } from "@/utils/memo";
import { Translation, TranslationOrNode } from "@/utils/translation";
import { createElement, HTMLAttributes, memo, ReactNode } from "react";

import { useIntl } from "react-intl";

export interface IText extends HTMLAttributes<HTMLElement> {
  text: TranslationOrNode;
  values?: Record<string, string | number | Date>;
  textSuffix?: ReactNode;
  textFormatter?: (text: string) => string;
  tagName?: string;
}

const Tag = ({
  tagName,
  children,
  ...props
}: { tagName?: string } & HTMLAttributes<HTMLElement>) =>
  tagName ? createElement(tagName, props, children) : <>{children}</>;

const FormattedTranslationOrNode = ({
  text,
  values,
  textSuffix = "",
  tagName,
  textFormatter,
  ...props
}: IText) => {
  const { formatMessage } = useIntl();

  function renderTranslation(translation: string) {
    if (textFormatter && typeof translation === "string") {
      return textFormatter(translation);
    }
    return translation;
  }

  return (
    <Tag tagName={tagName} {...props}>
      {typeof text === "object" && (text as Translation)?.defaultMessage ? (
        renderTranslation(
          formatMessage(
            text as Translation,
            values || (text as Translation).values
          )
        )
      ) : (
        <>{text}</>
      )}
      {textSuffix}
    </Tag>
  );
};

export default memo<IText>(FormattedTranslationOrNode, areEqual);
