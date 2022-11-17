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
  activityKey : number = 3;
  restServerURLActivities = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/";
  activityDataProvider: RESTDataProvider<Activity["id"], Activity>;
  itemsDataProvider: RESTDataProvider<Item["id"], Item>
  restServerURLItems = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + this.activityKey + "/items/";

  itemsArray: Array<Object>;
  pieSeriesValue: ko.ObservableArray;
  selectedActivity = new ObservableKeySet();
  activitySelected = ko.observable(false);
  firstSelectedActivity = ko.observable();
  selectedActivityIds = ko.observable();
  itemSelected = ko.observable(false);
  selectedKeyItem = ko.observable();
  firstSelectedItem = ko.observable();


  
  constructor() {
    
    this.activityDataProvider = new RESTDataProvider({
      keyAttributes : this.keyAttributes,
      url: this.restServerURLActivities,
      transforms:{
        fetchFirst: {
          request: async (options) => {
            // debugger
            const url = new URL(options.url);
            const { size, offset } = options.fetchParameters;
            url.searchParams.set("limit", String(size));
            url.searchParams.set("offset", String(offset));
            return new Request(url.href);
          },
          response: async ({body}) => {
            // debugger
            const {items, totalSize, hasMore} = body;
            return {data: items, totalSize, hasMore}
          }
        }
      }
    })

   
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


  
  }

  selectedActivityChanged = (event: ojListView.firstSelectedItemChanged<ActivityItems["id"], ActivityItems>) => {
    /**
    *  If no items are selected then the firstSelectedItem property  returns an object 
    *  with both key and data properties set to null.
    */
  //  debugger
    let itemContext = event.detail.value.data;
 
    if (itemContext != null) {    
      
      this.activitySelected(false);
      this.activityKey = event.detail.value.data.id;
      this.restServerURLItems =  "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + this.activityKey + "/items/";


      this.itemsDataProvider = new RESTDataProvider({
        keyAttributes: this.keyAttributes,
        url: this.restServerURLItems,
        transforms: {
        fetchFirst: {
              request: async (options) => {
                // debugger
              const url = new URL(options.url);
              const { size, offset } = options.fetchParameters;
              url.searchParams.set("limit", String(size));
              url.searchParams.set("offset", String(offset));
              return new Request(url.href);
              },
              response: async ({ body }) => {
                // debugger
              const { items, totalSize, hasMore } = body;
              return { data: items, totalSize, hasMore };
              },
           },
        },
        }); 



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
    console.log(event)


    //this.currentItem(this.selectedData())
    let a = Number(this.currentItem().quantity_instock);
    let b = Number(this.currentItem().quantity_shipped);

    const request = new Request(this.restServerURLItems, {
      headers: new Headers({
        "Content-type": "application/json; charset=UTF-8",
      }),
      body: JSON.stringify(this.currentItem()),
      method: "POST"
    })

    const response = await fetch(request);
    const addedRow = await response.json();


    const addedRowKey = addedRow[this.keyAttributes];

    const addedRomMetaData = {key: addedRowKey};

    this.itemsDataProvider.mutate({
      add: {
        data: [addedRow],
        keys: new Set([addedRowKey]),
        metadata: [addedRomMetaData]
      }
    });

    this.itemsDataProvider.refresh();

    //close
    let x = document.getElementById("createDialog");
    let y = (x as ojDialog);
    y.close();
  }

  public showEditDialog = (event: ojButtonEventMap["ojAction"]) => {
      
      //Observable de useCase
      this.useCase('update');

      //Observable of currentItem
      debugger
      const item : Item = this.firstSelectedItem().data;
      this.currentItem({...item});

    (document.getElementById("editDialog") as ojDialog).open();
  }

  public updateItemSubmit = async (event: ojButtonEventMap["ojAction"]) => {
    
    const currentRow = this.selectedRow;
    debugger
    if(currentRow != null){
      
      const itemToUpdate : ItemToUpdate = {
        itemId: this.currentItem().id,
        name: this.currentItem().name,
        price: this.currentItem().price,
        short_desc: this.currentItem().short_desc
      }
      
      const request = new Request(
        `${this.restServerURLItems}${this.currentItem().id}`,
        {
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(itemToUpdate),
          method: "PUT",
        }
      );

      const response = await fetch(request)
      const updatedRow = await response.json()


      const updatedRowKey = this.currentItem().id;
      const updatedRowMetaData = { key: updatedRowKey}
      this.itemsDataProvider.mutate({
        update: {
          data: [updatedRow],
          keys: new Set([updatedRowKey]),
          metadata: [updatedRowMetaData]
        }
      })

      this.itemsDataProvider.refresh()
    };

    (document.getElementById("editDialog") as  ojDialog).close()
  }
  
  public deleteItem = async (event: ojButtonEventMap["ojAction"]) => {

    let itemID = this.firstSelectedItem()?.data.id;
   
    const currentRow = this.selectedRow;
    if (currentRow != null) {
      let really = confirm("Are you sure you want to delete this item?");
      if (really) {
        
        const request = new Request(
          `${this.restServerURLItems}${itemID}`,
          { method: "DELETE" }
        );
        const response = await fetch(request);
        
        if (response.status === 200) {
          const removedRowKey = itemID;
          const removedRowMetaData = { key: removedRowKey };
   
          this.itemsDataProvider.mutate({
            remove: {
              data: [itemID],
              keys: new Set([removedRowKey]),
              metadata: [removedRowMetaData],
            },
          });
          this.itemsDataProvider.refresh();
   
        }
        else {
          alert("Delete failed with status " + response.status + " : " + response.statusText)
        }
      }
    }
   };


  /**
  * Handle selection from Activity Items list
  */
  selectedItemChanged = (event: ojListView.firstSelectedItemChanged<Item["id"], Item>) => {
    let isClicked = event.detail.value.data;

    if (isClicked != null) {
      debugger
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






export = CustomersViewModel;
