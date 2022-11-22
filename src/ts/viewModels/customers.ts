import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import "ojs/ojselectsingle";
import "ojs/ojchart";
import "ojs/ojlabel";
import "ojs/ojlistview";
import "ojs/ojavatar";
import 'ojs/ojdialog';
import 'ojs/ojinputtext';
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import { ojListView } from "ojs/ojlistview";
import { RESTDataProvider } from "ojs/ojrestdataprovider";
import { ojDialog } from 'ojs/ojdialog';
import { ojButtonEventMap } from 'ojs/ojbutton';
import "demo-update-item/loader";

//Data ejercicio
import MutableArrayDataprovider = require("ojs/ojmutablearraydataprovider")
import { Model, Collection } from 'ojs/ojmodel';
import * as KnockoutUtils from "ojs/ojknockout-model";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import { stringToNodeArray } from "@oracle/oraclejet/dist/types/ojhtmlutils";
import ViewModel from "demo-update-item/demo-update-item-viewModel";


type Activity = {
  id: number
}

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

type ItemToUpdate = {
  itemId: number;
  name: string;
  short_desc: string;
  price: number;
}

type ActivityItems = {
  id: number;
  name: string;
  items: Array<Item>;
  short_desc: string;
  image: string;
};

const emptyItem : Item = {
  id: 0,
  name: '',
  short_desc: '',
  price: 0,
  quantity: 0,
  quantity_shipped: 0,
  quantity_instock: 0,
  activity_id: 0,
  image: ''
}

class CustomersViewModel {
  //crear itemObservable de Observable<Item>
  //Usar ese objeto en Update y create
  currentItem: ko.Observable<Item>;

  //field for update
  useCase: ko.Observable<string>; //Create, update...

  //  Fields for delete button and update dialog, among others
  selectedRow = ko.observable<number>();


  quantity: number;
  inputImageFile: string = 'css/images/product_images/jet_logo_256.png'


  keyAttributes = "id";
  activityKey : number = 1;
  restServerURLActivities = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/";
  //activityDataProvider: RESTDataProvider<Activity["id"], Activity>;
  itemsDataProvider: RESTDataProvider<Item["id"], Item>
  restServerURLItems = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + this.activityKey + "/items/";

  pieSeriesValue: ko.ObservableArray;
  selectedActivity = new ObservableKeySet();
  activitySelected = ko.observable(false);
  firstSelectedActivity = ko.observable();
  //selectedActivityIds = ko.observable();
  itemSelected = ko.observable(false);
  selectedKeyItem = ko.observable();
  firstSelectedItem = ko.observable();



  //Dataprovider exercise
  activitiesObservable : ko.Observable<Collection>;
  itemsObservable : ko.Observable<Collection>;
  activityCollectionDataProvider: ko.Observable<CollectionDataProvider<number, Activity>>;
  itemCollectionDataProvider: ko.Observable<CollectionDataProvider<number, Item>>;
  
  

  private parseActivity = (response: {
    id: number;
    name: string;
    image: string;
    short_desc: string;
  }) => {
    return {
      id: response["id"],
      name: response["name"],
      image:  response["image"],
      short_desc: response["short_desc"],
    };
  };
  private parseSaveActivity = (response: {
    id: number;
    name: string;
    image: string;
    short_desc: string;
  }) => {
    return {
      id: response["id"],
      name: response["name"],
      image:  response["image"],
      short_desc: response["short_desc"],
    };
  };


  private parseItem = (response: {
    id: number;
    activity_id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    quantity_shipped: number,
    quantity_instock: number,
  }) => {

    return {
      id: response["id"],
      activity_id: response["activity_id"],
      name: response["name"],
      price: response["price"],
      description: response["description"],
      image: response["image"],
      quantity_shipped: response["quantity_shipped"],
      quantity_instock: response["quantity_instock"],
    };
  };
  private parseSaveItem = (response: {
    id: number;
    name: string;
    price: number;
    description: string;
    quantity: number,
    quantity_shipped: number,
    quantity_instock: number,
    activity_id: number,
    image: string;
  }) => {
    return {
      id: response["id"],
      name: response["name"],
      price: response["price"],
      description: response["description"],
      image: response["image"],
      activity_id: response["activity_id"],
      quantity_shipped: response["quantity_shipped"],
      quantity_instock: response["quantity_instock"],
    };
  };

  Activity = Model.extend({
      parse: this.parseActivity,
      parseSave: this.parseSaveActivity,
      idAttribute: "id",
  })
  Item = Model.extend({
      parse: this.parseItem,
      parseSave: this.parseSaveItem,
      idAttribute: "id",    
  })

  myActivity = new this.Activity();
  myItem = new this.Item();

  private ItemCollection = Collection.extend({
    url: "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + "0" + "/items/",
    model: this.myItem,
    comparator: 'id'
  });

  
  private ActivityCollection  = Collection.extend({
    url: this.restServerURLActivities,
    model: this.myActivity,
    comparator: 'id'
  });
  myData : ko.Observable<any>;
  itemCollection : Collection;
  
  constructor() {

    
    this.pieSeriesValue = ko.observableArray([]);

    let pieSeries = [
      {name: "Quantity in Stock", items: [this.firstSelectedItem()?.data.quantity_instock]},
      {name: "Quantity Shipped", items: [this.firstSelectedItem()?.data.quantity_shipped]}
    ];
    this.pieSeriesValue(pieSeries);

    this.quantity = 0;
    //
    this.useCase = ko.observable('');

    //
    this.currentItem = ko.observable({...emptyItem});

    //Dataprovider exercise

    //hacer fetch de actividades e items para mi activity data provider
    this.itemsObservable = ko.observable(new Collection());
    let actCollection = new this.ActivityCollection();
    actCollection.fetch({
      success: () => {
        //debugger
        //let koObjActivity = (KnockoutUtils.map(this.myActivity) as unknown as Activity);
        //this.currentItem(koObjActivity);
        this.activitiesObservable(actCollection);
      },
    })
    this.activitiesObservable = ko.observable(actCollection);

    this.activityCollectionDataProvider = ko.observable(new CollectionDataProvider<number, Activity>(this.activitiesObservable()));
    
    this.itemCollection = new this.ItemCollection();
    
    this.itemCollectionDataProvider = ko.observable(new CollectionDataProvider<number, Item>(this.itemCollection))

    //debugger
    this.myActivity.urlRoot = this.restServerURLActivities;
    this.myItem.urlRoot = this.restServerURLItems;
  }

  selectedActivityChanged = (event: ojListView.firstSelectedItemChanged<ActivityItems["id"], ActivityItems>) => {
    /**
    *  If no items are selected then the firstSelectedItem property  returns an object 
    *  with both key and data properties set to null.
    */
    let activityContext = event.detail.value.data;
 
    if (activityContext != null) {    
      
      this.activitySelected(false);
      this.activityKey = event.detail.value.data.id;

      

      //hacer el fetch de los items
      // observable de items?

      //FETCH DEL MODEL ITEM
      //let itemCollection = new ItemCollection();
      (this.itemCollection as Collection).url = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + this.activityKey + "/items/"
      this.itemCollection.fetch({
        success: (collection: Collection)=>{
          //this.itemsObservable(collection);
          //this.itemCollectionDataProvider(new CollectionDataProvider<number, Item>(this.itemsObservable()));
          
        }
      })
      

      this.activitySelected(true);
      this.itemSelected(false);
      this.selectedKeyItem();
      //this.selectedData();
    } else {
      // debugger
      // If deselection, hide list      
      this.activitySelected(false);
      this.itemSelected(false);    
    }
  };

  public showCreateDialog = (event: ojButtonEventMap["ojAction"])=>{
    //Observable de useCase
    this.useCase('create');

    //Inicializar observable de currentItem
    this.currentItem({...emptyItem, activity_id : this.firstSelectedActivity().data.id});

    let x = document.getElementById("createDialog");
    let y = (x as ojDialog);
    y.open()
  }

  public createItem = async(event: ojButtonEventMap["ojAction"]) => {
    debugger
    //AQUÍ debo actualizar el observable this.currentItem()
    

    //this.currentItem(this.selectedData())
    let a = Number(this.currentItem().quantity_instock);
    let b = Number(this.currentItem().quantity_shipped);

    (this.itemCollection as Collection)

    const itemToCreate = this.Item.extend({
      name: this.currentItem().name,
      short_desc: this.currentItem().short_desc,
      price: this.currentItem().price,
      quantity_instock: a,
      quantity_shipped: b,
      quantity: a+b,
      activity_id: this.currentItem().activity_id
    })

    itemToCreate.set({
      name: this.currentItem().name,
      price: this.currentItem().price,
      description: this.currentItem().short_desc
    })
    
    itemToCreate.save({
      success: ()=>{
        debugger
      }
    })

    
      
    //close
    let x = document.getElementById("createDialog");
    let y = (x as ojDialog);
    y.close();
  }

  public showEditDialog = (event: ojButtonEventMap["ojAction"]) => {
      
      //Observable de useCase
      this.useCase('update');

      //Observable of currentItem
      const item : Item = this.firstSelectedItem().data;
      this.currentItem({...item});

    (document.getElementById("editDialog") as ojDialog).open();
  }

  public updateItemSubmit = async (event: ojButtonEventMap["ojAction"]) => {
    let itemID = this.firstSelectedItem()?.data.id;
    const currentRow = this.selectedRow;
    debugger
    if(currentRow != null){
      
      
      (this.itemCollection as Collection)
      const itemToUpdate = (this.itemCollection.get(itemID) as Model);
      console.log(itemToUpdate);
      itemToUpdate.set({
        id: this.currentItem().id,
        name: this.currentItem().name,
        price: this.currentItem().price,
        description: this.currentItem().short_desc
      })
      itemToUpdate.save(
        
        {
          success : () =>{}
        }
      )
        
      
      // const request = new Request(
      //   `${this.restServerURLItems}${this.currentItem().id}`,
      //   {
      //     headers: new Headers({
      //       "Content-type": "application/json; charset=UTF-8",
      //     }),
      //     body: JSON.stringify(itemToUpdate),
      //     method: "PUT",
      //   }
      // );

      // const response = await fetch(request)
      // const updatedRow = await response.json()


      // const updatedRowKey = this.currentItem().id;
      // const updatedRowMetaData = { key: updatedRowKey}
      // this.itemsDataProvider.mutate({
      //   update: {
      //     data: [updatedRow],
      //     keys: new Set([updatedRowKey]),
      //     metadata: [updatedRowMetaData]
      //   }
      // })

      // this.itemsDataProvider.refresh()
    };

    (document.getElementById("editDialog") as  ojDialog).close()
  }
  
  public deleteItem = async (event: ojButtonEventMap["ojAction"]) => {

    let itemID = this.firstSelectedItem()?.data.id;
   
    const currentRow = this.selectedRow;
    if (currentRow != null) {
      debugger
      let really = confirm("Are you sure you want to delete this item?");
      if (really) {
        (this.itemCollection as Collection)
        const itemToDelete = (this.itemCollection.get(itemID) as Model);
        
        this.itemCollection.remove(itemToDelete)
        itemToDelete.destroy()

        
        
      }
    }
  };

  /**
  * Handle selection from Activity Items list
  */
  selectedItemChanged = (event: ojListView.firstSelectedItemChanged<Item["id"], Item>) => {
    // debugger
    let isClicked = event.detail.value.data;

    if (isClicked != null) {
      // debugger
      // If selection, populate and display list
      
      // Create variable and get attributes of the items list to set pie chart values
      let pieSeries = [
      { name: "Quantity in Stock", items: [isClicked.quantity_instock] },
      { name: "Quantity Shipped", items: [isClicked.quantity_shipped] }
      ];
      // Update the pie chart with the data
      this.pieSeriesValue(pieSeries);

      this.itemSelected(true);

    }
    else {
    // If deselection, hide list
    
      this.itemSelected(false);    
    }
  };

 

  

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";
    
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






export = CustomersViewModel;
