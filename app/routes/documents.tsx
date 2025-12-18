import Documents from "~/documents/documents";
import type { Route } from "../+types/root";
import ProtectedRoute from "~/components/ProtectedRoute";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Documents" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <Documents />
    </ProtectedRoute>
  );
}