import React from "react";
import logo from "@/assets/StaffLoop-Logo-Blue.svg";

interface LogoProps {
  alt?: string;
}

export function Logo({ alt = "StaffLoop Logo" }: LogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className="h-10 w-auto"
    />
  );
}
