import Documents from "~/documents/documents";
import type { Route } from "../+types/root";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Documents" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function DocumentsPage() {
  return <Documents />;
}