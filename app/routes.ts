import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/index.tsx"),
  route("documents", "./routes/documents.tsx"),
  route("upload", "./routes/upload.tsx"),
  route("chat", "./routes/chat.tsx"),
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx")
] satisfies RouteConfig