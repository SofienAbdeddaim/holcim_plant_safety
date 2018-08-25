import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tsv-uploader',
  templateUrl: './tsv-uploader.component.html',
  styleUrls: ['./tsv-uploader.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TsvUploaderComponent implements OnInit {
  success: boolean;

  activeColor = 'green';
  baseColor = '#ccc';
  overlayColor = 'rgba(255,255,255,0.5)';

  dragging = false;
  loaded = false;
  imageLoaded = false;
  imageSrc = [];
  iconColor: string;
  borderColor: string;
  inspectionId: any;
  fail: boolean;

  inspectionsCollection: AngularFirestoreCollection<any> = this.afs.collection(
    'Inspeccion'
  );

  constructor(private afs: AngularFirestore, private toastr: ToastrService) {}

  ngOnInit() {}

  handleDragEnter() {
    this.dragging = true;
  }

  handleDragLeave() {
    this.dragging = false;
  }

  handleDrop(e) {
    e.preventDefault();
    this.dragging = false;
    this.handleInputChange(e);
  }

  handleImageLoad() {
    this.imageLoaded = true;
    this.iconColor = this.overlayColor;
  }

  handleInputChange(e) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    const files: FileList = e.dataTransfer
      ? e.dataTransfer.files
      : e.target.files;

    for (let i = 0; i < files.length; i++) {
      const pattern = /csv-*/;
      const reader = new FileReader();

      if (!files[i].type.match(pattern)) {
        alert('invalid format');
        return;
      }

      this.loaded = false;

      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(files[i]);
    }
  }

  _handleReaderLoaded(e) {
    const reader = e.target;

    const imageObj = {
      descripcion: '',
      imagefile: Date.now(),
      tipoelemento: '1',
      uploaded: false,
      rowImage: reader.result
    };

    this.imageSrc.push(imageObj);

    console.log('image src', this.imageSrc);
    this.loaded = true;
  }

  dataURItoBlob(dataURI) {
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'csv' });
  }

  csvToJson(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    console.log('lines', lines);

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[
          JSON.parse(JSON.stringify(headers[j]).replace('\\r', ''))
        ] = JSON.parse(JSON.stringify(currentline[j]).replace('\\r', ''));
      }
      result.push(obj);
    }

    console.log('taken data', result);

    // this.categorizeByDate(result);

    const withEnglishHeaders = this.mapToEnglishHeaders(result);
    // const withEnglishHeaders = null;
    const groupByShortId = _.groupBy(withEnglishHeaders[0], 'ShortId');
    const groupByShortIdDetails = _.groupBy(withEnglishHeaders[1], 'ShortId');

    console.log('groupByShortId', groupByShortId);
    console.log('groupByShortIdDetails', groupByShortIdDetails);

    const realAgendas = Object.keys(groupByShortIdDetails).map(key => {
      const orders = {};
      groupByShortId[key].forEach(element => {
        orders[Object.keys(element)[0]] = element[Object.keys(element)[0]];
      });
      return {
        ...groupByShortIdDetails[key][0],
        Orders: orders
      };
    });

    console.log(realAgendas);

    const addInspections = [];

    for (let index = 0; index < realAgendas.length; index++) {
      const agenda = realAgendas[index];
      const key = `${agenda['ShortId']}-${Date.now()}`;
      addInspections.push(
        this.inspectionsCollection.doc(key).set({
          ProjectId: key,
          ProjectIdLong: key,
          ...agenda
        })
      );
    }

    Promise.all(addInspections)
      .then(value => {
        console.log(value);
        this.showSuccess();
      })
      .catch(err => console.error);
  }

  showSuccess() {
    this.toastr.success('Success!!', 'Uploaded Successfully!');
  }

  changeListener($event): void {
    this.success = false;
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = e => {
      // you can perform an action with readed data here

      this.csvToJson(myReader.result);
    };

    myReader.readAsText(file);
  }

  mapToEnglishHeaders(agendas: CSVFormat[]) {
    const newAgendasWithPedido = agendas.map(agenda => {
      return {
        ShortId: agenda['Project-code'],
        [agenda['Pedido']]: {
          hora: new Date(agenda['Start-date-and-time']).getTime(),
          diseno: agenda['Product-description'],
          elemento: agenda['elemento'],
          cantidad: agenda['Cant-Depuracion'],
          metododescarga: agenda['Metodo-Descarga'],
          intervalo: agenda['Truck-spacing-minutes'],
          Aditivos: '',
          Avance_de_Obra: '',
          fecha: '',
          nivel: '',
          operadorbomba: '',
          pedido: '',
          status: '',
          tiempoarmado: '',
          tuberia: ''
        }
      };
    });
    const value = agendas.map(agenda => {
      return {
        CreationDate: new Date().getTime(), // creation date
        CustomerName: agenda['Cliente'],
        DeliveryAddress: agenda['Shipping-address-line'],
        DeliveryMethod: agenda['Cant-Despachada'],
        DocumentType: 'Agenda',
        SupervisorId: agenda['SUPERVISORES'],
        ShortId: agenda['Project-code'],
        Agreement: '',
        ContactEmail: '',
        ContactName: '',
        ContactPhone: '',
        DeliveryDate: null,
        InspectionLocalDate: null,
        Name: '',
        OperatorName: '',
        Project: agenda['Project-code'],
        Recommendations: [
          {
            Answer: false,
            Label: 'Despejar accesos para equipos Holcim (Bomba-Mixer)'
          },
          {
            Answer: false,
            Label:
              'Contar con luminarias a partir de las 18:00 para evitar incidentes por falta de luz natural'
          },
          {
            Answer: false,
            Label: 'Contrar con suficiente personal para ejecutar los trabajos'
          },
          {
            Answer: false,
            Label:
              'Aislar Área de ubicacion de equipos Holcim (Cinta peligro, Conos, Etc)'
          },
          {
            Answer: false,
            Label:
              'Realizar correcto proceso de vaciado, vibrado y posterior curado del hormigón'
          },
          {
            Answer: false,
            Label:
              'Controlar espesores y niveles constantemente para evitar faltante de hormigón (M3)'
          },
          {
            Answer: false,
            Label:
              'Señalizar varillas desprotegidas en punta y excavaciones desprotegidas (Cinta peligro)'
          },
          {
            Answer: false,
            Label:
              'Se recomienda que personal de obra utilize EPP (Cascos, guantes, gafas, botas de seguridad, etc)'
          },
          {
            Answer: false,
            Label:
              // tslint:disable-next-line:max-line-length
              'El area de parqueo y ruta de armado deberá estar libre de materiales, equipos, herramientas, escombros y demás elementos que obtaculicen y retrasen los trabajos'
          },
          {
            Answer: false,
            Label:
              'Contar con plastico a la mano en caso de presencia repentina de lluvia'
          },
          {
            Answer: '',
            Label: 'Otro'
          }
        ],
        SafetyChecklist: [
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Los accesos a la obra son adecuados para el mixer y la bomba'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Ubicación de los equipos: Dentro de obra'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Estacionamiento en contravía'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Suelo inestable'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Pendiente abrupta o precipicio mayor a 1 m'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Existen cables de energía que impiden el movimiento de los equipo'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'El área de trabajo está libre de caídas de objetos, existe protección contra caída de objetos'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'El acceso para el personal y la ruta de armado se encuentra libre de obstáculos'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Existe iluminación adecuada (Trabajos nocturnos, sitios cerrados con deficiencia de luz)'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Existe iluminación suficiente en el sector de armado de tuberías y escaleras'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Las escaleras se encuentran aseguradas de forma adecuada y en buen estado'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Existe señalización, aislamiento y protección en excavaciones, huecos en la estructura o aberturas'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Existe señalización y aislamiento en zonas de izaje'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Se revisó en forma general los apuntalamientos y encofrados en los elementos de fundición, sean éstos: Metálico,Madera'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'El encofrado cuenta con sistemas de arrostramiento'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Se coordinó con el cliente la ruta de armado de la tubería y puntos de anclaje'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'La obra cuenta con líneas de vida y puntos de anclaje'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'El elemento a fundir requiere el uso de andamios'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Son adecuadas las protecciones y conexiones de los cables eléctricos encontrados'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              'Existen espacios confinados con suficiente ventilación e iluminación'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label:
              // tslint:disable-next-line:max-line-length
              'Se revisó si en el lugar de descarga de concreto, no existe riesgo de ahogamiento (si la respuesta es cuestionable se deberá realizar un ATR y PTR con el personal competente).'
          },
          {
            Agreement: '',
            Answer: 'Correcto',
            Label: 'Lugar para el destino final de los residuos de concreto'
          }
        ],
        SessionId: '',
        Status: '',
        SupervisorName: '',
        TimeStamp: null,
        Token: ''
      };
    });
    const x = _.uniqWith(value, _.isEqual);
    return [newAgendasWithPedido, x];
  }

  categorizeByCity(obj) {
    const categorizeByCity = _.groupBy(obj, 'city');

    console.log('categorizeByCity', categorizeByCity);

    const allAgendas = {};

    for (const key in categorizeByCity) {
      if (categorizeByCity.hasOwnProperty(key)) {
        const agendas = categorizeByCity[key];

        const agendasObj = {};
        agendas.forEach(agenda => {
          agendasObj[`${agenda['customerID']}-${Date.now()}`] = agenda;
        });

        allAgendas[key] = agendasObj;
      }
    }

    console.log(allAgendas);

    // this.firebase.init('/Inspection');

    // for (const key in allAgendas) {
    //   if (allAgendas.hasOwnProperty(key)) {
    //     const thisAgendas = allAgendas[key];
    //     this.firebase.updateObject(key, thisAgendas).then(
    //       () => {
    //         this.success = true;
    //         setTimeout(() => {
    //           this.success = false;
    //         }, 5000);
    //       },
    //       () => {
    //         this.fail = true;
    //         setTimeout(() => {
    //           this.fail = false;
    //         }, 5000);
    //       }
    //     );
    //   }
    // }
  }
}

export interface CSVFormat {
  '1': string;
  Pedido: string;
  Cliente: string;
  'Shipping-address-line': string;
  'Project-code': string;
  Obra: string;
  'Start-date-and-time': string;
  'Product-description': string;
  elemento: string;
  'Cant-Depuracion': string;
  planta: string;
  'Metodo-Descarga': string;
  'Truck-spacing-minutes': string;
  SUPERVISORES: string;
}

export interface EnglishFormat {
  Agreement: string;
  ContactEmail: string;
  ContactName: string;
  ContactPhone: string;
  CreationDate: number;
  CustomerName: string;
  DeliveryAddress: string;
  DeliveryDate: number;
  DeliveryMethod: string;
  DocumentType: string;
  InspectionLocalDate: number;
  Name: string;
  OperatorName: string;
  Project: string;
  ProjectId: string;
  ProjectIdLong: string;
  Orders: {
    [key: string]: Order;
  };
  Recommendations: [
    {
      Answer: false;
      Label: 'Despejar accesos para equipos Holcim (Bomba-Mixer)';
    },
    {
      Answer: false;
      Label: 'Contar con luminarias a partir de las 18:00 para evitar incidentes por falta de luz natural';
    },
    {
      Answer: false;
      Label: 'Contrar con suficiente personal para ejecutar los trabajos';
    },
    {
      Answer: false;
      Label: 'Aislar Área de ubicacion de equipos Holcim (Cinta peligro, Conos, Etc)';
    },
    {
      Answer: false;
      Label: 'Realizar correcto proceso de vaciado, vibrado y posterior curado del hormigón';
    },
    {
      Answer: false;
      Label: 'Controlar espesores y niveles constantemente para evitar faltante de hormigón (M3)';
    },
    {
      Answer: false;
      Label: 'Señalizar varillas desprotegidas en punta y excavaciones desprotegidas (Cinta peligro)';
    },
    {
      Answer: false;
      Label: 'Se recomienda que personal de obra utilize EPP (Cascos, guantes, gafas, botas de seguridad, etc)';
    },
    {
      Answer: false;
      // tslint:disable-next-line:max-line-length
      Label: 'El area de parqueo y ruta de armado deberá estar libre de materiales, equipos, herramientas, escombros y demás elementos que obtaculicen y retrasen los trabajos';
    },
    {
      Answer: false;
      Label: 'Contar con plastico a la mano en caso de presencia repentina de lluvia';
    },
    {
      Answer: '';
      Label: 'Otro';
    }
  ];
  SafetyChecklist: [
    {
      Agreement: string;
      Answer: 'Cuestionable';
      Label: 'Los accesos a la obra son adecuados para el mixer y la bomba';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Ubicación de los equipos: Dentro de obra';
    },
    {
      Agreement: string;
      Answer: 'Cuestionable';
      Label: 'Estacionamiento en contravía';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Suelo inestable';
    },
    {
      Agreement: string;
      Answer: 'Cuestionable';
      Label: 'Pendiente abrupta o precipicio mayor a 1 m';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existen cables de energía que impiden el movimiento de los equipo';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'El área de trabajo está libre de caídas de objetos; existe protección contra caída de objetos';
    },
    {
      Agreement: string;
      Answer: 'Cuestionable';
      Label: 'El acceso para el personal y la ruta de armado se encuentra libre de obstáculos';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existe iluminación adecuada (Trabajos nocturnos, sitios cerrados con deficiencia de luz)';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existe iluminación suficiente en el sector de armado de tuberías y escaleras';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Las escaleras se encuentran aseguradas de forma adecuada y en buen estado';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existe señalización, aislamiento y protección en excavaciones, huecos en la estructura o aberturas';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existe señalización y aislamiento en zonas de izaje';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Se revisó en forma general los apuntalamientos y encofrados en los elementos de fundición, sean éstos: Metálico,Madera';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'El encofrado cuenta con sistemas de arrostramiento';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Se coordinó con el cliente la ruta de armado de la tubería y puntos de anclaje';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'La obra cuenta con líneas de vida y puntos de anclaje';
    },
    {
      Agreement: string;
      Answer: 'Cuestionable';
      Label: 'El elemento a fundir requiere el uso de andamios';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Son adecuadas las protecciones y conexiones de los cables eléctricos encontrados';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Existen espacios confinados con suficiente ventilación e iluminación';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      // tslint:disable-next-line:max-line-length
      Label: 'Se revisó si en el lugar de descarga de concreto, no existe riesgo de ahogamiento (si la respuesta es cuestionable se deberá realizar un ATR y PTR con el personal competente).';
    },
    {
      Agreement: string;
      Answer: 'Correcto';
      Label: 'Lugar para el destino final de los residuos de concreto';
    }
  ];
  SessionId: string;
  ShortId: string;
  Status: string;
  SupervisorId: string;
  SupervisorName: string;
  TimeStamp: number;
  Token: string;
}

export interface Order {
  Aditivos: string;
  Avance_de_Obra: string;
  cantidad: string;
  diseno: string;
  elemento: string;
  fecha: string;
  hora: string;
  intervalo: string;
  metododescarga: string;
  nivel: string;
  operadorbomba: string;
  pedido: string;
  status: string;
  tiempoarmado: string;
  tuberia: string;
}
