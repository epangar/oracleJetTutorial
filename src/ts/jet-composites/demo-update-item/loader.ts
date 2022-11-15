import Composite = require("ojs/ojcomposite");
import * as view from "text!./demo-update-item-view.html";
import viewModel from "./demo-update-item-viewModel";
import * as metadata from "text!./component.json";
import "css!./demo-update-item-styles.css";

Composite.register("demo-update-item", {
  view: view,
  viewModel: viewModel,
  metadata: JSON.parse(metadata)
});
