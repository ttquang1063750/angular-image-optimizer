import { TranslationDict } from './types';

export const vi: TranslationDict = {
  // General
  app_title: 'Image Optimizer',
  app_subtitle: 'Tối ưu hóa và nén ảnh trực tiếp tại trình duyệt - Không lưu ảnh của bạn',
  btn_theme_dark: 'Chuyển sang chế độ tối',
  btn_theme_light: 'Chuyển sang chế độ sáng',
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
};
