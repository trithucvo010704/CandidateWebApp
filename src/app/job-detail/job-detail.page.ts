import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';
import { JobService, JobDetail } from '../services/job.service';
import { ApplicationService } from '../services/application.service';
import { JdFormatPipe } from '../pipes/jd-format.pipe';

interface ApplicationForm {
  fullName: string;
  phone: string;
  email: string;
  file: File | null;
}

interface TouchedFields {
  fullName: boolean;
  phone: boolean;
  email: boolean;
}

@Component({
  selector: 'app-job-detail',
  templateUrl: 'job-detail.page.html',
  styleUrls: ['job-detail.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonSpinner,
    IonToast,
    JdFormatPipe,
  ],
})
export class JobDetailPage implements OnInit {
  jobId: number | null = null;
  jobDetail: JobDetail | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';

  formData: ApplicationForm = {
    fullName: '',
    phone: '',
    email: '',
    file: null,
  };

  touchedFields: TouchedFields = {
    fullName: false,
    phone: false,
    email: false,
  };

  fileError: boolean = false;
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService
  ) {
    addIcons({ cloudUploadOutline });
  }

  ngOnInit() {
    // Get slug from route params (format: {jobId}-{slug})
    const slugParam = this.route.snapshot.paramMap.get('slug');
    // Get job ID from route params (for backward compatibility with /job-detail/:id)
    const idParam = this.route.snapshot.paramMap.get('id');

    if (slugParam) {
      // Extract jobId from slug (format: {jobId}-{title-slug}-{location-slug})
      // JobId is the part before the first dash
      const jobIdMatch = slugParam.match(/^(\d+)-/);
      if (jobIdMatch) {
        this.jobId = Number(jobIdMatch[1]);
      } else {
        console.error('Invalid slug format:', slugParam);
        this.showToastMessage('URL không hợp lệ', 'danger');
        return;
      }
    } else if (idParam) {
      // Backward compatibility: direct jobId
      this.jobId = Number(idParam);
    }

    // Load job details if jobId exists
    if (this.jobId) {
      this.loadJobDetails();
    } else {
      this.showToastMessage('Không tìm thấy thông tin công việc', 'danger');
    }
  }

  loadJobDetails() {
    if (!this.jobId) return;

    this.loading = true;
    this.jobService.getPublicJobById(this.jobId).subscribe({
      next: (job) => {
        this.jobDetail = job;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.loading = false;
        this.showToastMessage('Không thể tải thông tin công việc', 'danger');
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileError = false;

    if (file) {
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        this.showToastMessage(
          'File size quá lớn. Vui lòng chọn file nhỏ hơn 10MB.',
          'danger'
        );
        // Clear file input
        const fileInput = document.getElementById(
          'file-input'
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.formData.file = null;
        this.fileError = true;
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.showToastMessage(
          'Chỉ chấp nhận file PDF, DOC, hoặc DOCX.',
          'danger'
        );
        const fileInput = document.getElementById(
          'file-input'
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.formData.file = null;
        this.fileError = true;
        return;
      }

      this.formData.file = file;
      this.fileError = false;
      console.log('File selected:', file.name, 'Size:', file.size);
    }
  }

  onFileButtonClick() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  }

  markFieldTouched(fieldName: keyof TouchedFields) {
    this.touchedFields[fieldName] = true;
  }

  isFieldInvalid(fieldName: string, form: NgForm): boolean {
    if (
      !this.submitted &&
      !this.touchedFields[fieldName as keyof TouchedFields]
    ) {
      return false;
    }
    const field = form.controls[fieldName];
    return field && (field.invalid || (this.submitted && !field.value));
  }

  onSubmit(form: NgForm) {
    this.submitted = true;

    // Mark all fields as touched
    this.touchedFields.fullName = true;
    this.touchedFields.phone = true;
    this.touchedFields.email = true;

    if (!this.jobId) {
      this.showToastMessage('Không tìm thấy thông tin công việc', 'danger');
      return;
    }

    // Validate file
    if (!this.formData.file) {
      this.fileError = true;
    } else {
      this.fileError = false;
    }

    // Check form validity
    if (form.invalid || !this.formData.file) {
      if (!this.formData.file) {
        this.showToastMessage('Vui lòng upload CV', 'danger');
      } else {
        this.showToastMessage(
          'Vui lòng điền đầy đủ thông tin hợp lệ',
          'danger'
        );
      }
      return;
    }

    this.submitting = true;
    this.applicationService
      .applyJob(
        this.jobId,
        {
          fullName: this.formData.fullName,
          phone: this.formData.phone,
          email: this.formData.email,
        },
        this.formData.file
      )
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.submitted = false;
          this.showToastMessage(
            'Đơn ứng tuyển đã được gửi thành công!',
            'success'
          );
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error submitting application:', error);
          this.submitting = false;

          // Extract error message from different error formats
          let errorMessage = 'Có lỗi xảy ra khi gửi đơn ứng tuyển';

          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          // Handle specific error codes
          if (error.status === 0) {
            errorMessage =
              'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
          } else if (error.status === 401) {
            errorMessage = 'Không có quyền truy cập. Vui lòng thử lại.';
          } else if (error.status === 413 || error.status === 413) {
            errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.';
          }

          this.showToastMessage(errorMessage, 'danger');
        },
      });
  }

  showToastMessage(message: string, color: string) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  /**
   * Format số tiền thành định dạng có dấu chấm ngăn cách
   * Ví dụ: 10000000 -> "10.000.000"
   */
  private formatCurrency(amount: number): string {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Format mức lương theo logic từ create-post
   * - Nếu có cả salaryFrom và salaryTo: "10.000.000 - 20.000.000 VNĐ"
   * - Nếu chỉ có salaryFrom: "Từ 10.000.000 VNĐ"
   * - Nếu chỉ có salaryTo: "Lên tới 20.000.000 VNĐ"
   * - Nếu không có: "Thỏa thuận"
   */
  formatSalary(): string {
    if (!this.jobDetail) return 'Thỏa thuận';

    if (
      this.jobDetail.salaryFrom !== undefined &&
      this.jobDetail.salaryFrom !== null
    ) {
      if (
        this.jobDetail.salaryTo !== undefined &&
        this.jobDetail.salaryTo !== null
      ) {
        // Format: "10.000.000 - 20.000.000 VNĐ"
        return `${this.formatCurrency(
          this.jobDetail.salaryFrom
        )} - ${this.formatCurrency(this.jobDetail.salaryTo)} VNĐ`;
      } else {
        // Chỉ có salaryFrom
        return `Từ ${this.formatCurrency(this.jobDetail.salaryFrom)} VNĐ`;
      }
    } else if (
      this.jobDetail.salaryTo !== undefined &&
      this.jobDetail.salaryTo !== null
    ) {
      // Chỉ có salaryTo
      return `Lên tới ${this.formatCurrency(this.jobDetail.salaryTo)} VNĐ`;
    } else {
      return 'Thỏa thuận';
    }
  }

  /**
   * Format số năm kinh nghiệm theo logic từ create-post
   * - Nếu có yoe và unit: "2 năm" hoặc "6 tháng"
   * - Nếu chỉ có yoe: "2 năm" (mặc định)
   * - Nếu không có: "Không yêu cầu"
   */
  formatExperience(): string {
    if (!this.jobDetail) return 'Không yêu cầu';

    if (this.jobDetail.yoe !== undefined && this.jobDetail.yoe !== null) {
      const unit = this.jobDetail.unit || 'year'; // Mặc định là 'year'
      const unitLabel = unit === 'month' ? 'tháng' : 'năm';

      // Format số: nếu là số nguyên thì không hiển thị phần thập phân
      const yoeValue = Number.isInteger(this.jobDetail.yoe)
        ? this.jobDetail.yoe.toString()
        : this.jobDetail.yoe.toFixed(1);

      return `${yoeValue} ${unitLabel}`;
    }

    return 'Không yêu cầu';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
}
