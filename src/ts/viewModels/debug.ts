import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import "ojs/ojselectsingle";
import "ojs/ojchart";
import "ojs/ojlabel";
import "ojs/ojlistview";
import * as storeData from "text!../store_data.json"; 

type ChartType = {
  value: string;
  label:string;
}

type Activity = {
  id: number
}

class DebugViewModel {
  val: ko.Observable<string>;
  chartTypes: Array<Object>;
  chartTypesDP: MutableArrayDataProvider<ChartType["value"], ChartType>;
  chartData: Array<Object>;
  activityDataProvider: MutableArrayDataProvider<Activity["id"], Activity>;
  chartDataProvider: MutableArrayDataProvider<string, {}>;


  constructor() {
    this.val = ko.observable("pie");

    this.chartData = [
      { "id": 0, "series": "Baseball", "group": "Group A", "value": 42 },
      { "id": 1, "series": "Baseball", "group": "Group B", "value": 34 },
      { "id": 2, "series": "Bicycling", "group": "Group A", "value": 55 },
      { "id": 3, "series": "Bicycling", "group": "Group B", "value": 30 },
      { "id": 4, "series": "Skiing", "group": "Group A", "value": 36 },
      { "id": 5, "series": "Skiing", "group": "Group B", "value": 50 },
      { "id": 6, "series": "Soccer", "group": "Group A", "value": 22 },
      { "id": 7, "series": "Soccer", "group": "Group B", "value": 46 }
   ];

    this.chartDataProvider = new MutableArrayDataProvider(this.chartData, {
      keyAttributes: "id",
    })

    this.chartTypes = [
      {value: "pie", label: "Pie"},
      {value: "bar", label: "Bar"}
    ];
    
    this.chartTypesDP = new MutableArrayDataProvider<
      ChartType["value"],
      ChartType
      >(this.chartTypes, {
        keyAttributes: "value",
      });

    this.activityDataProvider = new MutableArrayDataProvider<
      Activity["id"],
      Activity
      >(JSON.parse(storeData), {
        keyAttributes:"id",
      });
    
  }

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("Debug page loaded.");
    document.title = "Debug";
    // implement further logic if needed
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = DebugViewModel;
