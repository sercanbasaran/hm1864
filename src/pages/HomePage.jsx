import React from "react";
import templates from "../templates/index.js";
import Template from "../components/templates/TemplateRenderer.jsx";

export default function HomePage() {
  return <Template node={templates.home} />;
}
