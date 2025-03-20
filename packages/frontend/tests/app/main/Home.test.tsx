import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

vi.mock("@/components/login/LoginForm", () => ({
  default: () => <div>Login Form Component</div>,
}));

describe("Home Component", () => {
  it("renders the LoginForm component", () => {
    render(<Home />);

    expect(screen.getByText("Login Form Component")).toBeTruthy();
  });
});
