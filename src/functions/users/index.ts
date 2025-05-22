import { app } from "@azure/functions";
import { listUsersHandler } from "./listUsers";

app.get('listUsers', {
  authLevel: 'anonymous',
  handler: listUsersHandler,
  route: "v1/users",
});