import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApplyJobRequest {
  fullName: string;
  phone: string;
  email: string;
}

export interface ApplyJobResponse {
  applicationId: number;
  candidateId: number;
  jobId: number;
  cvUrl: string;
  message: string;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyJob(
    jobId: number,
    request: ApplyJobRequest,
    cvFile: File
  ): Observable<ApplyJobResponse> {
    const formData = new FormData();
    formData.append('fullName', request.fullName);
    formData.append('phone', request.phone);
    formData.append('email', request.email);
    formData.append('cv', cvFile);

    return this.http.post<ApplyJobResponse>(
      `${this.apiUrl}/apply/${jobId}`,
      formData
    );
  }
}
