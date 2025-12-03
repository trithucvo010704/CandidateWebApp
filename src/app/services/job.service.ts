import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Job {
  id: number;
  title: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
  status: string;
  roundCount: number;
  updatedAt: string;
}

export interface JobDetail {
  id: number;
  title: string;
  description: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
  workTime?: string;
  yoe?: number;
  unit?: string;
  roundCount: number;
  status: string;
  publishedAt: string;
  deadline?: string;
  applyUrl?: string;
  createdAt: string;
  updatedAt: string;
  rounds: any[];
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getPublicJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/public`);
  }

  getPublicJobById(jobId: number): Observable<JobDetail> {
    return this.http.get<JobDetail>(`${this.apiUrl}/public/${jobId}`);
  }
}

