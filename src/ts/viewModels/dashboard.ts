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


// type ChartType = {
//   value: string;
//   label:string;
// }

//En vez de crear un observable con cada propiedad, tener un observable de  Item

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

class DashboardViewModel {
  //crear itemObservable de Observable<Item>
  //Usar ese objeto en Update y create
  currentItem: ko.Observable<Item>;


  // Fields in update dialog
  inputItemID: ko.Observable<number>;
  inputItemName: ko.Observable<string>;
  inputPrice: ko.Observable<number>;
  inputShortDescription: ko.Observable<string>;

  //field for update
  useCase: ko.Observable<string>; //Create, update...

  //  Fields for delete button and update dialog, among others
  selectedRow = ko.observable<number>();

  // Fields in Create dialog
  itemName: ko.Observable<string>;
  price: ko.Observable<number>;
  short_desc: ko.Observable<string>;
  quantity_instock: ko.Observable<number>;
  quantity_shipped: ko.Observable<number>;
  quantity: number;
  inputImageFile: string = 'css/images/product_images/jet_logo_256.png'


  keyAttributes = "id";
  activityKey : number = 3;
  restServerURLActivities = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/";
  activityDataProvider: RESTDataProvider<Activity["id"], Activity>;
  itemsDataProvider: RESTDataProvider<Item["id"], Item>
  restServerURLItems = "https://apex.oracle.com/pls/apex/oraclejet/lp/activities/" + this.activityKey + "/items/";

  itemsArray: Array<Object>;
  selectedData: ko.Observable<any>;
  pieSeriesValue: ko.ObservableArray;
  // Observables for Activities
  selectedActivity = new ObservableKeySet();
  activitySelected = ko.observable(false);
  firstSelectedActivity = ko.observable();
  selectedActivityIds = ko.observable();
  // Observables for Activity Items
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

    // this.activityDataProvider

    // let activitiesArray = JSON.parse(storeData);

    // let itemsArray = activitiesArray[0].items;

    this.selectedData = ko.observable('');

    this.pieSeriesValue = ko.observableArray([]);

    let pieSeries = [
      {name: "Quantity in Stock", items: [this.selectedData().quantity_instock]},
      {name: "Quantity Shipped", items: [this.selectedData().quantity_shipped]}
    ];
    this.pieSeriesValue(pieSeries);
    
    this.itemName = ko.observable<string>();
    this.price = ko.observable<number>();
    this.short_desc = ko.observable<string>();
    this.quantity_instock = ko.observable<number>();
    this.quantity_shipped = ko.observable<number>();
    this.quantity = 0;

    this.inputItemID = ko.observable();
    this.inputItemName = ko.observable();
    this.inputPrice = ko.observable();
    this.inputShortDescription = ko.observable();
    
    //
    this.useCase = ko.observable('');

    //
    this.currentItem = ko.observable({...emptyItem});

    

    // this.currentItemSubscription= this.currentItem.subscribe((data)=>{
    //   debugger
    // })
    

  }

  selectedActivityChanged = (event: ojListView.firstSelectedItemChanged<ActivityItems["id"], ActivityItems>) => {
    /**
    *  If no items are selected then the firstSelectedItem property  returns an object 
    *  with both key and data properties set to null.
    */
  //  debugger
    let itemContext = event.detail.value.data;
 
    if (itemContext != null) {    
      // debugger
       // If selection, populate and display list
       // Hide currently-selected activity item
      this.activitySelected(false);

      //let itemsArray = itemContext.items;
      //this.itemsDataProvider.data = itemsArray;
      // Set List View properties

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
      this.selectedData();
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
    this.currentItem({...emptyItem});

    let x = document.getElementById("createDialog");
    let y = (x as ojDialog);
    y.open()
  }

  public createItem = async(event: ojButtonEventMap["ojAction"]) => {
    let a = Number(this.quantity_instock());
    let b = Number(this.quantity_shipped());
    this.quantity = a + b;
    
    
    const row = {
      name : this.itemName(),
      short_desc: this.short_desc(),
      price : this.price(),
      quantity_instock: this.quantity_instock(),
      quantity_shipped: this.quantity_shipped(),
      quantity: this.quantity,
      activity_id: this.activityKey,
      image: this.inputImageFile
    };
    
    const request = new Request(this.restServerURLItems, {
      headers: new Headers({
        "Content-type": "application/json; charset=UTF-8",
      }),
      body: JSON.stringify(row),
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
      this.inputItemName(this.selectedData().name);
      this.inputPrice(this.selectedData().price);
      this.inputShortDescription(this.selectedData().short_desc);
      
      //Observable de useCase
      this.useCase('update');

      /*
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
      }*/
      
      //Observable of currentItem

     

      debugger

      //this.currentItem.id(1)
      

      // this.currentItem({
      //   id: this.selectedData().id,
      //   name: this.selectedData().name,
      //   short_desc: this.selectedData().short_desc,
      //   price: this.selectedData().price,
      //   quantity: this.selectedData().quantity,
      //   quantity_shipped: this.selectedData().quantity_shipped,
      //   quantity_instock: this.selectedData().quantity_instock,
      //   activity_id: this.selectedData().activity_id,
      //   image: this.selectedData().image,
      // })
      


    (document.getElementById("editDialog") as ojDialog).open();
  }




  public updateItemSubmit = async (event: ojButtonEventMap["ojAction"]) => {
    
    const currentRow = this.selectedRow;

    if(currentRow != null){
      debugger
      this.activityKey
      const row = {
        itemId: this.selectedData().id,
        name: this.inputItemName(),
        price: this.inputPrice(),
        short_desc: this.inputShortDescription()
      };
      

      const request = new Request(
        `${this.restServerURLItems}${this.selectedData().id}`,
        {
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(row),
          method: "PUT",
        }
      );

      const response = await fetch(request)
      const updatedRow = await response.json()


      const updatedRowKey = this.selectedData().id;
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

    let itemID = this.firstSelectedItem().data.id;
   
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
    // debugger
    let isClicked = event.detail.value.data;

    if (isClicked != null) {
      // debugger
      // If selection, populate and display list
      this.selectedData(event.detail.value.data); //cambiar a selectedData, y selectedKeyItem cambiar a selectedKeyItem
      this.currentItem(this.selectedData())

      // Create variable and get attributes of the items list to set pie chart values
      let pieSeries = [
      { name: "Quantity in Stock", items: [this.selectedData().quantity_instock] },
      { name: "Quantity Shipped", items: [this.selectedData().quantity_shipped] }
      ];
      // Update the pie chart with the data
      this.pieSeriesValue(pieSeries);

      this.itemSelected(true);

    }
    else {
    // If deselection, hide list
      // debugger
    
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

export = DashboardViewModel;
