# Records Info

A widget that shows the records for the current map. This includes the world record and the local server record.

A first-party GoControlPanel plugin. Permissions: `ui`, `records:read`, `nadeo:read`.

## Events

Other plugins listen with `ctx.on("records-info:<event>", (payload) => ...)`. Panels without plugin events ignore them.

| Event | When | Payload |
|---|---|---|
| `newLocalRecord` | A finish beat the server's local record | `{ mapUid, login, nickName, time, previousTime }` |
| `newWorldRecord` | A finish beat the world record | `{ mapUid, login, nickName, time, previousTime }` |

`previousTime` is `null` when there was no record yet. Warm-up and paused runs are ignored. A finish that beats both records emits both events.
