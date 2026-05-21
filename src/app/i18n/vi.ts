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
  watermark_toggle: 'Bật đóng dấu',
  watermark_type_text: 'Text',
  watermark_type_image: 'Hình ảnh',
  watermark_placeholder: 'Nội dung đóng dấu...',
  watermark_pos: 'Vị trí:',
  watermark_size: 'Cỡ (%):',
  watermark_opacity: 'Mờ:',
  watermark_upload_image: 'Chọn hình logo',
  watermark_remove_image: 'Bỏ hình',
  watermark_no_image: 'Chưa chọn hình',

  // Validation
  error_value_range: 'Giá trị phải từ {min} đến {max}',
  error_value_nan: 'Vui lòng nhập một số hợp lệ',

  pos_bottom_right: 'Dưới - Phải',
  pos_bottom_left: 'Dưới - Trái',
  pos_top_right: 'Trên - Phải',
  pos_top_left: 'Trên - Trái',
  pos_center: 'Chính giữa',

  // Drop zone
  drop_zone_text: 'Kéo thả ảnh vào đây hoặc click để chọn file',
  drop_zone_hint: '(Hỗ trợ JPG, PNG, HEIC - Nén đồng thời 3 ảnh)',
  drop_zone_shortcut: 'hoặc nhấn Ctrl/⌘ + O',
  shortcut_download_all: 'Ctrl/⌘ + S',

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

  // Presets
  label_saved_presets: 'Cấu hình đã lưu:',
  preset_default: 'Cấu hình mặc định',
  preset_placeholder: 'Tên cấu hình mới...',
  btn_save_preset: 'Lưu cấu hình',
  btn_export_presets: 'Xuất file cấu hình',
  btn_import_presets: 'Nhập file cấu hình',
  confirm_delete_preset: 'Bạn có chắc chắn muốn xóa cấu hình này không?',
  msg_preset_saved: 'Đã lưu cấu hình thành công!',
  msg_preset_loaded: 'Đã tải cấu hình!',
  msg_preset_deleted: 'Đã xóa cấu hình!',
  msg_preset_imported: 'Đã nhập cấu hình thành công!',
  msg_invalid_preset_file: 'Tập tin cấu hình không hợp lệ!',
  msg_preset_name_empty: 'Vui lòng nhập tên cấu hình!',
  msg_preset_name_exists: 'Tên cấu hình đã tồn tại!',
  msg_preset_quota_exceeded: 'LocalStorage đã đầy! Vui lòng xoá bớt cấu hình cũ.',
  msg_preset_save_failed: 'Lưu cấu hình thất bại.',
  msg_preset_file_too_large: 'File quá lớn (tối đa 10 MB).',
  label_settings: 'Cài đặt thông số',
  btn_close: 'Đóng',
  btn_cancel: 'Hủy',
  btn_delete_confirm: 'Đồng ý xóa',
};
