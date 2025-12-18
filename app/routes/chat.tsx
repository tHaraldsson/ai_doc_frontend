import Chat from "~/chat/chat";
import type { Route } from "../+types/root";
import ProtectedRoute from "~/components/ProtectedRoute";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Chat" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  );
}