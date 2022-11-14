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

export default class ViewModel implements Composite.ViewModel<Composite.PropertiesType> {
    busyResolve: (() => void);
    composite: Element;
    messageText: ko.Observable<string>;
    properties: Composite.PropertiesType;
    res: { [key: string]: string };
    smallQuery = ResponsiveUtils.getFrameworkQuery( ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
    isSmall: ko.Observable = ResponsiveKnockoutUtils.createMediaQueryObservable(this.smallQuery);
    labelEdge: ko.Computed = ko.computed(() => {
        return this.isSmall() ? "top" : "start";
    }, this);
    currency: IntlNumberConverter;
    lengthValue1: ko.Observable<string>;
    validators: ko.ObservableArray<AsyncLengthValidator<string>>;
    isUpdate : boolean;

    constructor(context: Composite.ViewModelContext<Composite.PropertiesType>) {        
        //At the start of your viewModel constructor
        const elementContext: Context = Context.getContext(context.element);
        const busyContext: Context.BusyContext = elementContext.getBusyContext();
        const options = {"description": "Web Component Startup - Waiting for data"};
        this.busyResolve = busyContext.addBusyState(options);

        this.composite = context.element;

        //Example observable
        this.messageText = ko.observable("Hello from demo-update-item");
        this.properties = context.properties;
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

        // Example for parsing context properties
        // if (context.properties.name) {
        //     parse the context properties here
        // }

        //Once all startup and async activities have finished, relocate if there are any async activities
        this.busyResolve(); 
    }

    //Lifecycle methods - implement if necessary 

    activated(context: Composite.ViewModelContext<Composite.PropertiesType>): Promise<any> | void {
        
    };

    connected(context: Composite.ViewModelContext<Composite.PropertiesType>): void {
    
    };

    bindingsApplied(context: Composite.ViewModelContext<Composite.PropertiesType>): void {
        
    };

    propertyChanged(context: Composite.PropertyChangedContext<Composite.PropertiesType>): void {
    
    };

    disconnected(element: Element): void {
    
    };
};