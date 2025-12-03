import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'jdFormat',
  standalone: true,
})
export class JdFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    let html = value;

    html = html.replace(/\r\n/g, '\n');

    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = html.split('\n');
    const processedLines: string[] = [];

    for (let rawLine of lines) {
      const line = rawLine.replace(/[ \t]+$/, '');

      if (!line.trim()) {
        processedLines.push('');
        continue;
      }

      const headingRegex =
        /^(Mô tả công việc|Yêu cầu công việc|Yêu cầu|Quyền lợi|Phúc lợi|Mô tả|Thông tin thêm)/i;
      if (headingRegex.test(line)) {
        const headingText = line.replace(headingRegex, '$1');
        processedLines.push(
          `<h2 class="jd-section-title">${headingText}</h2>`
        );
        continue;
      }

      if (/^\s{4,}[•\-o\d]/.test(rawLine)) {
        const bulletText = rawLine.trim().replace(/^[•·\-o]\s*/, '');
        processedLines.push(`<li class="jd-sub-bullet">${bulletText}</li>`);
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const bulletText = line.replace(/^\d+\.\s+/, '');
        processedLines.push(`<li class="jd-ol-item">${bulletText}</li>`);
        continue;
      }

      if (/^[•·\-o]\s+/.test(line)) {
        const bulletText = line.replace(/^[•·\-o]\s+/, '');
        processedLines.push(`<li class="jd-ul-item">${bulletText}</li>`);
        continue;
      }

      processedLines.push(`<p>${line}</p>`);
    }

    html = processedLines.join('\n');

    html = html.replace(
      /(?:\n?)(<li class="jd-ol-item">[\s\S]*?<\/li>)+/g,
      (match) => `<ol>${match.replace(/\n/g, '')}</ol>`
    );

    html = html.replace(
      /(?:\n?)(<li class="jd-ul-item">[\s\S]*?<\/li>)+/g,
      (match) => `<ul>${match.replace(/\n/g, '')}</ul>`
    );

    html = html.replace(
      /(<li class="jd-sub-bullet">[\s\S]*?<\/li>)/g,
      '<ul class="jd-sub-list">$1</ul>'
    );

    html = html.replace(
      /(Học vấn|Kinh nghiệm|Kỹ năng|Ngoại ngữ|Quyền lợi|Mức lương|Địa điểm làm việc|Địa điểm):/gi,
      '<strong>$1:</strong>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}


