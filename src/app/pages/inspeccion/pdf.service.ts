import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class PdfService {
  constructor(private http: HttpClient) {}

  getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/pdf');
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');
    headers.append(
      'Content-Disposition',
      `attachment;filename='downloaded.pdf'`
    );
    return headers;
  }

  fetchInspectionData(inspectionJSON) {
    const options = {
      headers: this.getHeaders()
      // responseType: 'Blob'
    };

    console.log('client details in service', inspectionJSON);
    return this.http.post('/api/viewreport', inspectionJSON, options);
  }
}
