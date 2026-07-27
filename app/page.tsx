import type { Metadata } from "next";
import { LaunchPad } from "./LaunchPad";

export const metadata: Metadata = {
  title: "LaunchPad — Autosana agent loop demo",
  description:
    "A reproducible Code → Test → Find bug → Fix → Retest experiment.",
};

export default function Home() {
  return <LaunchPad />;
}
