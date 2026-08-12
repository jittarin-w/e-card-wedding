# Wedding E-Card Web App

Static prototype for Jittarin Wongnangsue and Sirikanya Somsri wedding e-card.

## Pages

- `#/` welcome envelope animation
- `#/home` invitation landing page, pre-wedding gallery, schedule, venue map
- `#/register` wedding guest RSVP
- `#/seating` table booking lookup by Code ID
- `#/after-code` after party access code gate
- `/afterparty` direct after party access code gate for private invite links
- `#/after-party` Slow Bar Rooftop after party RSVP
- `#/admin` admin dashboard

## Prototype Data

Data is stored in browser `localStorage` under `wedding-ecard-state-v1`.

- Admin PIN: `1205`
- Default after party access codes: `AFTER0512`, `SLOWROOF`, `JS2026`
- Default tables: 12 tables, 10 seats per table
- Each wedding guest registration receives one unique Lucky Number for the mini game.

When moving to production, replace the `localStorage` functions in `app.js` with a real API/database and add proper admin authentication.
