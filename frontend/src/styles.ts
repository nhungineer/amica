import type { CSSProperties } from "react";

// Color Palette - Modern & Friendly
export const colors = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  success: "#10b981",
  successHover: "#059669",
  danger: "#ef4444",
  dangerHover: "#dc2626",
  accent: "#14b8a6",
  accentHover: "#0d9488",
  warning: "#f59e0b",
  text: "#1f2937",
  textLight: "#6b7280",
  border: "#e5e7eb",
  background: "#f9fafb",
  white: "#ffffff",
};

// Common Reusable Styles
export const commonStyles = {
  // Page container with card
  pageContainer: {
    backgroundColor: colors.background,
    minHeight: "100vh",
    padding: "20px",
  } as CSSProperties,

  // Card container
  card: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "32px",
    backgroundColor: colors.white,
    borderRadius: "16px",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  } as CSSProperties,

  // Input field
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "8px",
    border: `2px solid ${colors.border}`,
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
    boxSizing: "border-box",
  } as CSSProperties,

  // Label
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: colors.text,
    fontSize: "14px",
  } as CSSProperties,

  // Base button style
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  } as CSSProperties,

  // Primary button (for main actions)
  buttonPrimary: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    backgroundColor: colors.success,
    color: colors.white,
  } as CSSProperties,

  // Secondary button
  buttonSecondary: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    backgroundColor: colors.accent,
    color: colors.white,
  } as CSSProperties,

  // Danger button
  buttonDanger: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    backgroundColor: colors.danger,
    color: colors.white,
  } as CSSProperties,

  // Heading styles
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    color: colors.text,
    marginBottom: "8px",
    marginTop: 0,
  } as CSSProperties,

  subheading: {
    color: colors.textLight,
    fontSize: "16px",
    marginTop: 0,
    marginBottom: "32px",
  } as CSSProperties,

  // Error message
  errorBox: {
    backgroundColor: "#fee2e2",
    border: `2px solid ${colors.danger}`,
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: "500",
  } as CSSProperties,

  // Helper text
  helperText: {
    fontSize: "12px",
    color: colors.textLight,
    marginTop: "5px",
    marginBottom: 0,
  } as CSSProperties,
};

// Helper function for hover effects (use with onMouseEnter/onMouseLeave)
export const buttonHoverEffect = {
  success: {
    enter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.successHover;
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
    },
    leave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.success;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    },
  },
  accent: {
    enter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.accentHover;
    },
    leave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.accent;
    },
  },
  danger: {
    enter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.dangerHover;
    },
    leave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.danger;
    },
  },
};
