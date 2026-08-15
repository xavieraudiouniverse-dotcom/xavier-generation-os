import type { FC } from "react";

export type TemplateProps = Record<string, unknown>;
export type TemplateComponent = FC<TemplateProps>;

export const str = (p: TemplateProps, k: string, d: string) =>
  typeof p[k] === "string" && (p[k] as string).length ? (p[k] as string) : d;

export const num = (p: TemplateProps, k: string, d: number) =>
  typeof p[k] === "number" && Number.isFinite(p[k]) ? (p[k] as number) : d;

export const words = (text: string) => text.split(/\s+/).filter(Boolean);
