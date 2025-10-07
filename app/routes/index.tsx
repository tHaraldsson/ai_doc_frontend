import Index from "~/index/_index";
import type { Route } from "../+types/root";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Document Assistant - Homepage" },
    { name: "description", content: "Welcome to AI Document Assistant" },
  ];
}

export default function IndexPage() {
  return <Index />;
}