import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { groupBy } from 'lodash';

@Component({
  selector: 'app-inspection-chart',
  templateUrl: './inspection-chart.component.html',
  styleUrls: ['./inspection-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspectionChartComponent implements OnInit {
  inspections = 'Inspeccion';
  dataSource: any = [];

  months = [
    {
      id: 1,
      name: 'January'
    },
    {
      id: 2,
      name: 'February'
    },
    {
      id: 3,
      name: 'March'
    },
    {
      id: 4,
      name: 'April'
    },
    {
      id: 5,
      name: 'May'
    },
    {
      id: 6,
      name: 'June'
    },
    {
      id: 7,
      name: 'July'
    },
    {
      id: 8,
      name: 'August'
    },
    {
      id: 9,
      name: 'September'
    },
    {
      id: 10,
      name: 'October'
    },
    {
      id: 11,
      name: 'November'
    },
    {
      id: 12,
      name: 'December'
    }
  ];
  currentMonth: number;

  constructor(private db: AngularFirestore) {}

  ngOnInit() {
    const currentMonth = new Date().getMonth() + 1;
    this.currentMonth = currentMonth;
    const selectedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
    const nextMonth = currentMonth < 12 ? `0${currentMonth + 1}` : '01';

    this.changeMonth(selectedMonth, nextMonth);
  }

  customizeTooltip(arg: any) {
    return {
      text: arg.seriesName + ' Inspections: ' + arg.valueText
    };
  }

  onValueChanged(event) {
    const selectedMonth = event.value < 10 ? `0${event.value}` : event.value;
    const nextMonth = event.value < 12 ? `0${event.value + 1}` : '01';

    this.changeMonth(selectedMonth, nextMonth);
  }

  changeMonth(selectedMonth, nextMonth) {
    this.db
      .collection(
        this.inspections,
        ref =>
          ref
            .where(
              'InspectionLocalDate',
              '>',
              new Date(`${selectedMonth}/01/2018`).getTime()
            )
            .where(
              'InspectionLocalDate',
              '<',
              new Date(`${nextMonth}/01/2018`).getTime()
            )
        // .where('DocumentType', '==', 'Agenda')
        // .orderBy('DeliveryDate', 'desc')
      )
      .valueChanges()
      .subscribe(value => {
        console.log(value);
        const inspections = value
          // .filter(
          //   inspection =>
          //     inspection['Status'] === 'en proceso' ||
          //     inspection['Status'] === 'hecho'
          // )
          .map(inspection => {
            return {
              date: new Date(inspection['InspectionLocalDate'])
                .toISOString()
                .split('T')[0],
              status: inspection['Status']
            };
          });
        const groupedByDate = groupBy(inspections, 'date');
        console.log(groupedByDate);

        this.dataSource = Object.keys(groupedByDate).map(key => {
          const groupedByStatus = groupBy(groupedByDate[key], 'status');
          return {
            date: key,
            done: groupedByStatus['hecho']
              ? groupedByStatus['hecho'].length
              : 0,
            pending: groupedByStatus['en proceso']
              ? groupedByStatus['en proceso'].length
              : 0
          };
        });
      });
  }
}
