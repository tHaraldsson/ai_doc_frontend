import Chat from "~/chat/chat";
import type { Route } from "../+types/root";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Chat" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function ChatPage() {
  return <Chat />;
}