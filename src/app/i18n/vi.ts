import { TranslationDict } from './types';

export const vi: TranslationDict = {
  // General
  app_title: 'Image Optimizer',
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
  exif_preserve: 'Giữ metadata EXIF',
  exif_hint: 'Giữ thông tin máy ảnh, GPS, thời gian. Chỉ áp dụng cho JPEG → JPEG.',
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
  watermark_add_text: 'Thêm watermark chữ',
  watermark_add_image: 'Thêm watermark hình ảnh',
  watermark_limit_reached: 'Đã đạt giới hạn tối đa {max} watermark',
  watermark_item_title: 'Watermark #{index}',
  watermark_item_text_summary: 'Chữ: "{text}" tại {position}',
  watermark_item_image_summary: 'Hình: {name} tại {position}',
  watermark_item_image_empty_summary: 'Hình chưa chọn tại {position}',
  watermark_drag_handle_title: 'Kéo để sắp xếp thứ tự',
  watermark_preview_title: 'Xem trước vị trí Watermark (Kéo thả trực tiếp)',
  watermark_preview_placeholder: 'Tải ảnh của bạn lên để xem trước & kéo thả watermark trực quan',
  watermark_adjust_visually: 'Tùy chỉnh vị trí trực quan',
  watermark_text_default: 'Watermark',
  watermark_logo_placeholder: 'Logo',
  watermark_alt_background: 'Ảnh nền xem trước',
  watermark_alt_logo: 'Logo watermark',
  file_drag_handle_title: 'Kéo để sắp xếp file',

  // Validation
  error_value_range: 'Giá trị phải từ {min} đến {max}',
  error_value_nan: 'Vui lòng nhập một số hợp lệ',

  pos_bottom_right: 'Dưới - Phải',
  pos_bottom_left: 'Dưới - Trái',
  pos_top_right: 'Trên - Phải',
  pos_top_left: 'Trên - Trái',
  pos_center: 'Chính giữa',
  pos_custom: 'Tùy chỉnh',

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
  btn_crop: 'Cắt hình ảnh',

  // Crop Modal
  modal_crop_title: 'Cắt & xoay hình ảnh:',
  crop_preview_alt: 'Xem trước cắt hình',
  crop_aspect_free: 'Tự do',
  crop_aspect_1_1: '1:1 (Vuông)',
  crop_aspect_4_3: '4:3',
  crop_aspect_16_9: '16:9',
  btn_rotate_left: 'Xoay trái 90°',
  btn_rotate_right: 'Xoay phải 90°',
  btn_flip_h: 'Lật ngang',
  btn_flip_v: 'Lật dọc',
  btn_crop_confirm: 'Áp dụng',
  crop_load_error: 'Không thể khởi tạo trình cắt ảnh. Vui lòng thử lại.',
  crop_apply_error: 'Không thể xử lý ảnh đã cắt. Vui lòng thử lại.',

  // Comparison Modal
  modal_compare_title: 'So sánh chất lượng:',
  tag_original: 'Gốc',
  tag_compressed: 'Nén',
  modal_compare_hint: 'Rê chuột hoặc chạm vào ảnh để xem kính lúp phóng to đồng bộ (Ảnh nén bên trái, ảnh gốc bên phải)',

  // Footer
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
  label_preset_backup: 'Sao lưu thông số',
  btn_close: 'Đóng',
  btn_cancel: 'Hủy',
  btn_delete_confirm: 'Đồng ý xóa',

  // PWA
  btn_pwa_install: 'Lưu app để dùng offline',
  pwa_update_available: 'Có phiên bản cập nhật mới!',
  btn_pwa_reload: 'Tải lại trang',

  // AVIF support
  avif_not_supported_tooltip: 'Trình duyệt của bạn không hỗ trợ nén định dạng AVIF.',
};
