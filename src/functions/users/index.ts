import { app } from "@azure/functions";
import { listUsersHandler } from "./listUsers";
import { createUserHandler } from "./createUser";
import { updateUserHandler } from "./updateUser";
import { getUserHandler } from "./getUser";
import { createSchemaHandler } from "./createSchema";
import { deleteUserHandler } from "./deleteUser";
import { assingRoleHandler } from "./assingRole";

app.get('listUsers', {
  authLevel: 'anonymous',
  handler: listUsersHandler,
  route: "v1/users/list",
});

app.post('createUser', {
  authLevel: 'anonymous',
  handler: createUserHandler,
  route: "v1/users/create",
});

app.patch('updateUser', {
  authLevel: 'anonymous',
  handler: updateUserHandler,
  route: "v1/users/update/{userId}",
});

app.get('getUser', {
  authLevel: 'anonymous',
  handler: getUserHandler,
  route: "v1/users/find/{userId}",
});

app.put('createSchema', {
  authLevel: 'anonymous',
  handler: createSchemaHandler,
  route: "v1/users/schema",
});

app.deleteRequest('deleteUser', {
  authLevel: 'anonymous',
  handler: deleteUserHandler,
  route: "v1/users/delete/{userId}",
});

app.post('assingRole', {
  authLevel: 'anonymous',
  handler: assingRoleHandler,
  route: "v1/users/roles/assign",
});