import {
  Component,
  enableProdMode,
  OnInit,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/observable';
import { Inspeccion } from './inspeccion.model';
import { AngularFirestore } from 'angularfire2/firestore';
import * as moment from 'moment';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { PdfService } from './pdf.service';
import * as FileSaver from 'file-saver';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-membership',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspeccionComponent implements OnInit {
  @ViewChild('content')
  content: any;

  dataSourceEquip: Inspeccion[] = [];
  events: Array<string> = [];
  equipment = 'Inspections';
  inspections = 'Inspeccion';
  public itemsEquip: Observable<any[]>;
  public displayMonths = 2;
  public navigation = 'select';
  modelPopup;
  lastVisible: any;
  lastVisible2: any;
  rowData: any = {};

  closeResult: string;
  selectedInspection: any;
  selectedImages: {}[];
  selectedRecommendations: {}[];
  selectedChecklist: {}[];

  constructor(
    private db: AngularFirestore,
    private pdfService: PdfService,
    private modalService: NgbModal
  ) {
    // this.dataSourceEquip = service.getEmployees();
    // this.states = service.getStates();
    this.itemsEquip = db
      .collection(this.inspections, ref =>
        ref
          .orderBy('DeliveryDate', 'desc')
          .where('DocumentType', '==', 'Inspeccion')
      )
      .snapshotChanges();
    // console.log(this.itemsEquip);
    this.getEquipItems();
  }

  ngOnInit() {
    // this.check();
  }

  onDateSelect(e) {
    // console.log(e);
    // let selectedDate = moment().year(e.year).month(e.month - 1).date(e.day).format("MM-DD-YYYY");
    // console.log(selectedDate);
    // this.itemsEquip = this.db.collection(this.equipment, ref =>
    //     ref.where( 'DeliveryDate', '==', selectedDate))
    //     .snapshotChanges();
    // this.getEquipItems();
  }

  selectedDate(d) {
    console.log(this.modelPopup);
    // console.log(d);
    // let date2 = new Date();
    // date2.setFullYear(this.modelPopup.year, this.modelPopup.month, this.modelPopup.day);
    // console.log(date2);
    // console.log(date2.toString());
    console.log(this.lastVisible);
    const selectedDate =
      this.modelPopup.year +
      '-' +
      this.modelPopup.month +
      '-' +
      this.modelPopup.day;
    console.log(this.selectedDate);
    // this.itemsEquip = this.db.collection(this.equipment, ref =>
    //     ref.orderBy('CreationDate', 'desc')
    //         .where( 'CreationDate', '==', selectedDate)
    //         .limit(50))
    //     .snapshotChanges();
    // this.getEquipItems();
  }

  getEquipItems() {
    this.itemsEquip.subscribe(actions => {
      console.log('actions', actions);
      if (actions.length > 0) {
        this.dataSourceEquip = [];
        let lastDate = null;
        const lastAction = actions[actions.length - 1];
        this.lastVisible = lastAction.payload.doc.data();

        this.lastVisible2 = lastAction.payload.doc;
        // console.log(this.lastVisible);
        actions.map(a => {
          const id = a.payload.doc.id;
          const item = a.payload.doc.data();
          // Keep the row values of inspections
          this.rowData[item.ProjectId] = item;

          const equipment: Inspeccion = new Inspeccion();
          equipment.ID = id;
          equipment.ContactEmail = item.ContactEmail;
          equipment.ContactName = item.ContactName;
          equipment.ContactPhone = item.ContactPhone;
          equipment.CustomerName = item.CustomerName;
          equipment.DeliveryDate = item.DeliveryDate;
          equipment.DeliveryAddress = item.DeliveryAddress;
          equipment.DocumentType = item.DocumentType;
          equipment.Project = item.Project;
          equipment.ProjectId = item.ProjectId;
          equipment.Status = item.Status;
          equipment.SupervisorId = item.SupervisorId;
          equipment.TimeStamp = item.TimeStamp;

          // equipment.DeliveryAddress = item.DeliveryAddress;

          // equipment.SupervisorId = item.SupervisorId;

          // console.log(equipment.CustomerName);
          this.dataSourceEquip.push(equipment);
          lastDate = item.CreationDate;
          // console.log(id);
          // console.log(this.dataSourceEquip);
        });
      }
      console.log('row data', this.rowData);
    });
  }

  customerData(name) {
    console.log(name);
  }

  onNext() {
    this.itemsEquip = this.db
      .collection(this.equipment, ref =>
        ref
          .orderBy('DeliveryDate', 'desc')
          .startAfter(this.lastVisible2)
          .limit(50)
      )
      .snapshotChanges();
    this.getEquipItems();
  }

  logEvent(eventName, event) {
    this.events.unshift(eventName);
  }

  updateItem(data) {
    const dataGrid = data.data;
    const dataDoc = {};
    for (const key in dataGrid) {
      if (dataGrid.hasOwnProperty(key)) {
        dataDoc[key] = dataGrid[key];
      }
    }
    // let collection = (grid === 'insp') ? this.inspections : this.equipment;
    const collection = this.equipment;
    this.db
      .collection(collection)
      .doc('/' + data.key)
      .update(dataDoc)
      .then(() => {
        console.log('done');
      })
      .catch(function(error) {
        console.error('Error writing document: ', error);
      });
  }

  addItem(event) {
    const collection = this.equipment;
    this.db
      .collection(collection)
      .add(event.data)
      .then(function(docRef) {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch(function(error) {
        console.error('Error adding document: ', error);
      });
  }

  toDeleteItem(event) {
    const collection = this.equipment;
    this.db
      .collection('/Inspeccion')
      .doc(event.key)
      .delete()
      .then(function() {
        console.log('Document successfully deleted!');
      })
      .catch(function(error) {
        console.error('Error removing document: ', error);
      });
  }

  clearEvents() {
    this.events = [];
  }

  // check(){
  //     this.db.collection('/Inspeccion').snapshotChanges().subscribe(
  //         items=>{
  //             console.log(items);
  //             console.log(this.dataSourceEquip);
  //         }
  //     );
  // }

  onClick(event, data) {
    console.log(event, data);
    console.log('row inspection ----> ', this.rowData[data['key']]);
    this.pdfService
      .fetchInspectionData(this.rowData[data['key']])
      .subscribe((response: any) => {
        console.log('response', response);
        const blob = response.blob();
        const filename = 'report.pdf';
        FileSaver.saveAs(blob, filename);
      });
  }

  openModal(event, data) {
    const selectedInspection = this.rowData[data['key']];
    this.selectedImages = Object.values(selectedInspection['Pictures']);
    this.selectedRecommendations = selectedInspection['Recommendations'];
    this.selectedChecklist = selectedInspection['SafetyChecklist'];
    console.log('selected', selectedInspection);
    this.open(this.content);
  }

  open(content) {
    this.modalService.open(content, { size: 'lg' }).result.then(
      result => {
        this.closeResult = `Closed with: ${result}`;
      },
      reason => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
