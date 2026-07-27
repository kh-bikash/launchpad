import type { Metadata } from "next";
import { LaunchPad } from "./LaunchPad";

export const metadata: Metadata = {
  title: "LaunchPad — Launch operations workspace",
  description:
    "Plan launches, assign ownership, track readiness, and move every release to go-live.",
};

export default function Home() {
  return <LaunchPad />;
}
