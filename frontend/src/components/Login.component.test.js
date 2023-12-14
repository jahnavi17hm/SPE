import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";  // Updated import
import Login from "./Login.component";

test("renders login form", () => {
  render(<Login />, { wrapper: MemoryRouter });

  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  expect(screen.getByText(/submit/i)).toBeInTheDocument();
  expect(screen.getByText(/log in with google/i)).toBeInTheDocument();
});