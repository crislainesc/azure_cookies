import { app } from "@azure/functions";
import { loginHandler } from "./login";
import { logoutHandler } from "./logout";

app.post('login', {
  authLevel: 'anonymous',
  handler: loginHandler,
  route: "v1/auth/login",
});

app.post('logout', {
  authLevel: 'anonymous',
  handler: logoutHandler,
  route: "v1/auth/logout",
});