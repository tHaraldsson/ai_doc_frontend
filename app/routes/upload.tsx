import Upload from "~/upload/upload";
import type { Route } from "../+types/root";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Upload" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function UploadPage() {
  return <Upload />;
}