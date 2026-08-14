"use client";

import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

export function ThemeToastContainer() {
    const { resolvedTheme } = useTheme();

    return (
        <ToastContainer
            position="top-left"
            autoClose={4000}
            style={{ width: "230px" }}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
    );
}