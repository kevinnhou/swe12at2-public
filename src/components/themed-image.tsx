"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemedImage({
  alt,
  className,
  dark,
  height,
  light,
  width,
}: {
  alt: string;
  className?: string;
  dark: string;
  height: number;
  light: string;
  width: number;
}) {
  const { resolvedTheme } = useTheme();
  let src;

  switch (resolvedTheme) {
    case "dark":
      src = dark;
      break;
    case "light":
      src = light;
      break;
    default:
      src = light;
      break;
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      priority
      src={src}
      width={width}
    />
  );
}
