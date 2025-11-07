import type { Route } from "../+types/root";
import Login from "~/auth/login";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Login" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function LoginPage() {
  return <Login />;
}