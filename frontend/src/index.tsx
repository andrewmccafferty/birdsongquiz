import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "react-bootstrap-typeahead/css/Typeahead.css"
import "react-bootstrap-typeahead/css/Typeahead.bs5.css"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
