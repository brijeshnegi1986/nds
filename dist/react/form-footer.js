import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./button.js";
/**
 * The end of a settings form: a line, then Save on the right with Cancel
 * before it. Save is the black Secondary (saving isn't a call to action);
 * Cancel is Tertiary and shows only when `onCancel` is given, so a form
 * passes it when there are changes to undo. While saving, Save shows the
 * Loading state and Cancel waits.
 */
export function FormFooter({ saving = false, saveLabel = "Save changes", onCancel, cancelLabel = "Cancel", divider = true, className = "", }) {
    return (_jsxs("div", { className: `flex flex-wrap items-center justify-end gap-3 ${divider ? "border-t border-(--color-border-subtle) pt-5" : ""} ${className}`.trim().replace(/\s+/g, " "), children: [onCancel && (_jsx(Button, { type: "button", variant: "tertiary", onClick: onCancel, disabled: saving, children: cancelLabel })), _jsx(Button, { type: "submit", variant: "secondary", loading: saving, children: saveLabel })] }));
}
