import Upload from "~/upload/upload";
import type { Route } from "../+types/root";
import ProtectedRoute from "~/components/ProtectedRoute";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Upload" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <Upload />
    </ProtectedRoute>
  );
}