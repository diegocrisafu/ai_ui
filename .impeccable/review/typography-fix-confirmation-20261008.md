# Narrow fix confirmation — 2026-10-08

**Result: the reported stale numeric-validation P2 is confirmed fixed in the requested cases. No rescore was performed.**

Used an independently created fresh CUA tab at `http://127.0.0.1:3100/`. The in-app browser was unavailable this turn, so verification used a fresh Chrome tab at its unchanged existing viewport (the screenshot was 1394×798, not the prior 1280×720). No viewport resize, detector, full review, source edits, or additional build/test run was performed. The parent's successful check/build and 64 tests remain parent-supplied evidence.

| Requested case | Observed result |
| --- | --- |
| Crossing cart Width `0` + blur → North shelving | Invalid-range message appeared on the cart. Selecting North shelving removed it and displayed valid Width `3`. Pass. |
| North shelving Width `0` + blur → South shelving | Error appeared, then cleared on selection. South shelving displayed Width `3`, despite both objects sharing the same committed width. Pass: reset follows identity, not merely numeric value. |
| Same-object invalid value | South shelving Width `0` remained invalid after blur and after focusing its Object name field. Correcting Width to `3` and blurring cleared the message. Pass. |
| Route-point invalid X → another point | Start Point X `0` produced “Enter 0.1–11.9. Your previous value is unchanged.” Selecting Goal cleared it and displayed Point X `10.8`. Pass. |
| Motion endpoint context | Crossing cart Motion end X `0` produced “Enter 0.45–11.55. Your previous value is unchanged.” Selecting its motion endpoint cleared the message, restored Motion end X `6`, and changed the context labels to End X `6` / End Y `6.5`. Pass. |
| Timeout glyph, source only | `RouteLab.tsx` imports `Clock`; the timeout branch renders `<Clock size={19} />` at line 1825. `RotateCcw` remains on Restart replay. Confirmed; no timeout run was requested or performed. |

Source inspection also confirmed `<Fragment key={selected}>` around selected-object name/geometry/motion at `RouteLab.tsx:1111` and the keyed route-point field pair at line 1487. These boundaries match the independently observed resets, including equal-value object selection.

The requested confirmation is complete. No remaining failure was observed in this bounded set. The prior design and typography judgments were not revisited. The temporary confirmation tab was closed; existing user tabs were not used or changed.
