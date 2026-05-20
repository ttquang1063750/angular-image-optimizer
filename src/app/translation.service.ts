import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'vi' | 'en';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  // Signal quản lý ngôn ngữ hiện tại
  readonly currentLang = signal<Lang>(this.getInitialLang());

  // Dictionary chứa các bản dịch
  private readonly translations: Record<Lang, Record<string, string>> = {
    vi: {
      // General
      app_title: 'Image Optimizer',
      app_subtitle: 'Tối ưu hóa và nén ảnh trực tiếp tại trình duyệt',
      btn_clear: 'Xóa hết',
      btn_download_zip: 'Tải về toàn bộ (.zip)',
      btn_apply_changes: 'Áp dụng cho tất cả ảnh',
      done_count: 'Đã xong',
      empty_state: 'Chưa có file nào được chọn.',
      warning_settings_changed: 'Thông số đã thay đổi!',
      warning_settings_desc:
        'Các thiết lập mới chưa được áp dụng cho danh sách ảnh hiện tại. Quá trình xử lý lại có thể mất thời gian tùy thuộc vào số lượng ảnh, vui lòng kiên nhẫn.',

      // Controls
      label_compression_level: 'Mức độ nén:',
      preset_light: 'Nén nhẹ',
      preset_medium: 'Nén vừa',
      preset_max: 'Nén tối đa',

      label_output_format: 'Định dạng đầu ra:',
      label_output_size: 'Kích thước đầu ra:',
      resize_auto: 'Tự động',
      resize_width: 'Chiều ngang',
      resize_height: 'Chiều cao',
      resize_percent: 'Phần trăm (%)',

      label_file_naming: 'Đặt tên file:',
      label_prefix: 'Tiền tố:',
      label_suffix: 'Hậu tố:',
      label_numbering: 'Đánh số thứ tự',
      label_start_index: 'Bắt đầu từ:',

      label_watermark: 'Đóng dấu ảnh:',
      watermark_toggle: 'Chèn Text Watermark',
      watermark_placeholder: 'Nội dung đóng dấu...',
      watermark_pos: 'Vị trí:',
      watermark_size: 'Cỡ (%):',
      watermark_opacity: 'Mờ:',

      pos_bottom_right: 'Dưới - Phải',
      pos_bottom_left: 'Dưới - Trái',
      pos_top_right: 'Trên - Phải',
      pos_top_left: 'Trên - Trái',
      pos_center: 'Chính giữa',

      // Drop zone
      drop_zone_text: 'Kéo thả ảnh vào đây hoặc click để chọn file',
      drop_zone_hint: '(Hỗ trợ JPG, PNG, HEIC - Nén đồng thời 3 ảnh)',

      // Item actions
      status_queued: 'Đang chờ xử lý...',
      status_compressing: 'Đang nén...',
      status_error: 'Lỗi:',
      btn_compare: 'So sánh chất lượng',
      btn_download: 'Tải ảnh này',

      // Comparison Modal
      modal_compare_title: 'So sánh chất lượng:',
      tag_original: 'Gốc',
      tag_compressed: 'Nén',
      modal_compare_hint: 'Kéo thanh trượt để so sánh ảnh Gốc (phải) và Nén (trái)',

      // Footer
      footer_credit: 'Phát triển bởi Tang Thanh Quang',
      btn_support: 'Ủng hộ tác giả ☕',

      // Support Modal
      modal_support_title: 'Cảm ơn bạn đã ủng hộ! 💖',
      modal_support_intro:
        'Sự ủng hộ của bạn giúp tôi duy trì và phát triển ứng dụng này miễn phí cho mọi người.',
      support_paypal_desc: 'Dành cho bạn bè quốc tế',
      support_paypal_btn: 'Gửi qua PayPal',
      support_momo_desc: 'Quét mã để ủng hộ',
      support_bank_desc: 'Chuyển khoản trực tiếp',
      bank_name: 'Ngân hàng:',
    },
    en: {
      // General
      app_title: 'Image Optimizer',
      app_subtitle: 'Optimize and compress images directly in your browser',
      btn_clear: 'Clear All',
      btn_download_zip: 'Download All (.zip)',
      btn_apply_changes: 'Apply to all images',
      done_count: 'Completed',
      empty_state: 'No files selected.',
      warning_settings_changed: 'Settings Changed!',
      warning_settings_desc:
        'New settings have not been applied to the current list. Re-processing may take time depending on the number of images, please be patient.',

      // Controls
      label_compression_level: 'Compression Level:',
      preset_light: 'Light',
      preset_medium: 'Medium',
      preset_max: 'Maximum',

      label_output_format: 'Output Format:',
      label_output_size: 'Output Size:',
      resize_auto: 'Auto',
      resize_width: 'Width',
      resize_height: 'Height',
      resize_percent: 'Percent (%)',

      label_file_naming: 'File Naming:',
      label_prefix: 'Prefix:',
      label_suffix: 'Suffix:',
      label_numbering: 'Add Numbering',
      label_start_index: 'Start at:',

      label_watermark: 'Watermark:',
      watermark_toggle: 'Add Text Watermark',
      watermark_placeholder: 'Watermark text...',
      watermark_pos: 'Position:',
      watermark_size: 'Size (%):',
      watermark_opacity: 'Opacity:',

      pos_bottom_right: 'Bottom Right',
      pos_bottom_left: 'Bottom Left',
      pos_top_right: 'Top Right',
      pos_top_left: 'Top Left',
      pos_center: 'Center',

      // Drop zone
      drop_zone_text: 'Drag & drop images here or click to browse',
      drop_zone_hint: '(Supports JPG, PNG, HEIC - 3 concurrent images)',

      // Item actions
      status_queued: 'Queued...',
      status_compressing: 'Compressing...',
      status_error: 'Error:',
      btn_compare: 'Compare quality',
      btn_download: 'Download this image',

      // Comparison Modal
      modal_compare_title: 'Quality Comparison:',
      tag_original: 'Original',
      tag_compressed: 'Compressed',
      modal_compare_hint: 'Drag the slider to compare Original (right) and Compressed (left)',

      // Footer
      footer_credit: 'Developed by Tang Thanh Quang',
      btn_support: 'Support Developer ☕',

      // Support Modal
      modal_support_title: 'Thank you for your support! 💖',
      modal_support_intro:
        'Your support helps me maintain and develop this app for free for everyone.',
      support_paypal_desc: 'For international friends',
      support_paypal_btn: 'Send via PayPal',
      support_momo_desc: 'Scan code to support',
      support_bank_desc: 'Direct bank transfer',
      bank_name: 'Bank:',
    },
  };

  // Signal chứa toàn bộ từ điển của ngôn ngữ hiện tại
  readonly t = computed(() => this.translations[this.currentLang()]);

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }

  private getInitialLang(): Lang {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'vi' || saved === 'en') return saved;

    // Mặc định theo trình duyệt hoặc tiếng Việt
    return navigator.language.startsWith('vi') ? 'vi' : 'en';
  }
}
