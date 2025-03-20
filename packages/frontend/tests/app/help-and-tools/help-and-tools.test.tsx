import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Help from "@/app/help/page";
import Tools from "@/app/tools/page";
import { IntlProvider } from "react-intl";
import { commonTexts } from "@/texts/common/common";
import HelpSupport from "@/components/common/HelpSupport";

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  __esModule: true,
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("@/components/common/ComingSoon", () => ({
  __esModule: true,
  default: () => <div>Coming Soon</div>,
}));

describe("Help Component", () => {
  it("should render the Help page with the HelpSupport component", () => {
    render(
      <IntlProvider locale="en">
        <Help />
      </IntlProvider>
    );

    expect(screen.getByText("Help")).toBeTruthy();
    expect(screen.getByText("Need Help?")).toBeTruthy();
  });

  it("should render the ProtectedRoute component", () => {
    render(
      <IntlProvider locale="en">
        <Help />
      </IntlProvider>
    );

    expect(screen.getByText("Help")).toBeTruthy();
  });
});
describe("HelpSupport Component", () => {
  it("should render the HelpSupport component with the correct content", () => {
    render(
      <IntlProvider locale="en">
        <HelpSupport />
      </IntlProvider>
    );

    expect(screen.getByText("Need Help?")).toBeTruthy();

    expect(screen.getByText(commonTexts.needHelp.defaultMessage)).toBeTruthy();

    expect(screen.getByText(commonTexts.helpIntro.defaultMessage)).toBeTruthy();

    expect(
      screen.getByText(commonTexts.helpContact.defaultMessage)
    ).toBeTruthy();

    expect(screen.getByText(commonTexts.helpEmail.defaultMessage)).toBeTruthy();
  });
});

describe("Tools Component", () => {
  it("should render the Tools page with the ComingSoon component", () => {
    render(<Tools />);

    expect(screen.getByText("Tools")).toBeTruthy();
    expect(screen.getByText("Coming Soon")).toBeTruthy();
  });

  it("should render the ProtectedRoute component", () => {
    render(<Tools />);

    expect(screen.getByText("Coming Soon")).toBeTruthy();
  });
});
