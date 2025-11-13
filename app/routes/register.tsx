import Register from "~/auth/register";
import type { Route } from "../+types/root";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Register" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function RegisterPage() {
  return <Register />;
}