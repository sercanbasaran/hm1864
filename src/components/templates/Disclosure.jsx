import React, { useState } from "react";

export default function Disclosure({ attrs, nodes, renderNode: RenderNode }) {
  const [open, setOpen] = useState(
    () => !!attrs.open && !matchMedia("(max-width:640px)").matches,
  );
  return (
    <details
      {...attrs}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      {nodes.map((n, i) => (
        <RenderNode key={i} node={n} />
      ))}
    </details>
  );
}
