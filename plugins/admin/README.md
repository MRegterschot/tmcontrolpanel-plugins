# Admin Help

A widget and admin command to notify a server admin. The command is '/admin <message>'.

A first-party GoControlPanel plugin. Permissions: `ui`, `chat:send`, `notifications`.

## Events

Other plugins listen with `ctx.on("admin:helpRequested", (payload) => ...)`. Panels without plugin events ignore it.

| Event | When | Payload |
|---|---|---|
| `helpRequested` | A player used the button or `/admin` | `{ login, nickName, description }` |

`description` is `null` when the player gave no message.
