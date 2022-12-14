"use strict";

import * as ko from "knockout";
import componentStrings = require("ojL10n!./resources/nls/demo-update-item-strings");
import Context = require("ojs/ojcontext");
import Composite = require("ojs/ojcomposite");
import "ojs/ojknockout";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojlabelvalue";
import { IntlNumberConverter } from "ojs/ojconverter-number";
import AsyncLengthValidator = require("ojs/ojasyncvalidator-length");
import * as KnockoutUtils from "ojs/ojknockout-model";



type Item = {
    id: number;
    name: string;
    short_desc: string;
    price: number;
    quantity: number;
    quantity_shipped: number;
    quantity_instock: number;
    activity_id: number;
    image: string;
  }

  interface MyProperties {
    useCase: string;
    item: Item;
  }
  

export default class ViewModel implements Composite.ViewModel<MyProperties> {
    busyResolve: (() => void);
    composite: Element;
    messageText: ko.Observable<string>;
    properties: MyProperties;
    res: { [key: string]: string };
    smallQuery = ResponsiveUtils.getFrameworkQuery( ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
    isSmall: ko.Observable = ResponsiveKnockoutUtils.createMediaQueryObservable(this.smallQuery);
    labelEdge: ko.Computed = ko.computed(() => {
        return this.isSmall() ? "top" : "start";
    }, this);
    currency: IntlNumberConverter;
    lengthValue1: ko.Observable<string>;
    validators: ko.ObservableArray<AsyncLengthValidator<string>>;
    myObservable : ko.Observable<Item>;
    id: ko.Observable<string>;

    //fix observable.name

    myFix: any;

    constructor(context: Composite.ViewModelContext<MyProperties>) {        
        //At the start of your viewModel constructor
        const elementContext: Context = Context.getContext(context.element);
        const busyContext: Context.BusyContext = elementContext.getBusyContext();
        const options = {"description": "Web Component Startup - Waiting for data"};
        this.busyResolve = busyContext.addBusyState(options);

        this.composite = context.element;

        //obtener context.uniqueId

        //Example observable
        this.messageText = ko.observable("Hello from demo-update-item");
        this.properties = context.properties;
        //const item = {...};
        this.myObservable = ko.observable<Item>(this.properties.item);

        this.res = componentStrings["demo-update-item"];

        this.currency = new IntlNumberConverter({
            style: "currency",
            currency: "USD ",
            currencyDisplay: "code",
        });

        this.lengthValue1 = ko.observable("");
        this.validators = ko.observableArray([
            new AsyncLengthValidator({min:5, max: 50}),
        ])

        this.id = ko.observable(context.uniqueId);
        //Once all startup and async activities have finished, relocate if there are any async activities
        this.busyResolve(); 
    }

    

    //Lifecycle methods - implement if necessary 

    activated(context: Composite.ViewModelContext<MyProperties>): Promise<any> | void {
        
    };

    connected(context: Composite.ViewModelContext<MyProperties>): void {
      if(this.myObservable()){
        debugger
      
        //this.myFix = KnockoutUtils.map({...this.myObservable})
      }
    };

    bindingsApplied(context: Composite.ViewModelContext<MyProperties>): void {
      
    };

    propertyChanged = (context: Composite.PropertyChangedContext<MyProperties>): void => {
        //Cuando cambia una propiedad. context.property = qu?? cambia, context.value = a qu??
        
        if (context.property === "item") {
          this.myObservable(context.value as Item);
          
          debugger;          
          
        } else if (context.property === "useCase") {
          
        }
      };

    disconnected(element: Element): void {
        
    };
};