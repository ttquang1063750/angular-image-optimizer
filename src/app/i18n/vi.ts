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
  file_drag_handle_title: 'Kéo để sắp xếp file',

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

  // Marketing chrome
  nav_landing: 'Trang chủ',
  nav_blog: 'Blog',
  nav_about: 'Giới thiệu',
  nav_changelog: 'Cập nhật',
  btn_open_app: 'Mở app →',
  app_shell_back_to_home: '← Về trang chủ',
  footer_tagline: 'Nén ảnh client-side, không upload, mã nguồn mở.',
  footer_links_title: 'Liên kết',
  footer_link_source: 'Mã nguồn',
  footer_link_privacy: 'Quyền riêng tư',
  footer_link_contact: 'Liên hệ',
  footer_copyright: '© {year} Image Optimizer. Mọi quyền được bảo lưu.',

  // SEO meta — Landing
  seo_landing_title: 'Image Optimizer — Nén ảnh online miễn phí, ngay tại trình duyệt',
  seo_landing_description:
    'Nén, resize, watermark và đổi định dạng ảnh hàng loạt. 100% client-side — không upload, không đăng ký. Hỗ trợ JPG, PNG, WebP, HEIC.',

  // SEO meta — Optimize app
  seo_optimize_title: 'App nén ảnh — Image Optimizer',
  seo_optimize_description:
    'Công cụ nén và resize ảnh hàng loạt chạy trực tiếp trên trình duyệt của bạn.',

  // SEO meta — About
  seo_about_title: 'Giới thiệu — Image Optimizer',
  seo_about_description:
    'Câu chuyện đằng sau Image Optimizer: công cụ nén ảnh client-side ưu tiên quyền riêng tư, mã nguồn mở.',

  // SEO meta — Changelog
  seo_changelog_title: 'Cập nhật — Image Optimizer',
  seo_changelog_description: 'Lịch sử phiên bản và các tính năng mới của Image Optimizer.',

  // SEO meta — Blog
  seo_blog_title: 'Blog — Image Optimizer',
  seo_blog_description:
    'Bài viết về nén ảnh, WebP, performance web và các kỹ thuật xử lý ảnh client-side.',

  // SEO meta — 404
  seo_not_found_title: '404 Không tìm thấy — Image Optimizer',
  seo_not_found_description: 'Trang bạn tìm không tồn tại.',

  // Landing — Hero
  hero_h1: 'Tối ưu ảnh ngay trong trình duyệt — không upload, không đăng ký',
  hero_subline:
    'Nén, resize, watermark và đổi định dạng ảnh hàng loạt. Riêng tư 100%, miễn phí 100%, mã nguồn mở.',
  hero_badge_privacy: 'Riêng tư',
  hero_badge_free: 'Miễn phí',
  hero_badge_oss: 'Mã nguồn mở',
  hero_cta_secondary: 'Xem tính năng',
  hero_image_alt: 'Minh hoạ nén ảnh trước và sau',

  // Landing — Features
  features_heading: 'Tất cả bạn cần để tối ưu ảnh',
  features_subheading: 'Không spyware, không watermark gắn cứng, không thuê bao.',
  feature_privacy_title: 'Riêng tư 100% client-side',
  feature_privacy_desc:
    'Ảnh không bao giờ rời khỏi trình duyệt. Không có server lưu trữ, không có analytics đọc nội dung file.',
  feature_bulk_title: 'Xử lý hàng loạt',
  feature_bulk_desc:
    'Nén tối đa 3 ảnh đồng thời, theo dõi tiến trình realtime. Đặt prefix, suffix, đánh số file tự động.',
  feature_webp_title: 'WebP & HEIC',
  feature_webp_desc:
    'Đổi JPEG/PNG sang WebP để giảm 25-35% dung lượng. Đọc cả HEIC trực tiếp từ iPhone.',
  feature_watermark_title: 'Watermark linh hoạt',
  feature_watermark_desc:
    'Thêm chữ hoặc logo PNG với vị trí, độ trong suốt, kích thước tuỳ chỉnh. Tối đa 5 watermark mỗi ảnh.',
  feature_exif_title: 'Giữ metadata EXIF',
  feature_exif_desc: 'Tuỳ chọn giữ thông tin máy ảnh, GPS, thời gian chụp khi nén JPEG → JPEG.',
  feature_presets_title: '3 mức nén preset',
  feature_presets_desc:
    'Nén nhẹ giữ chất lượng cao, nén vừa cân bằng, nén tối đa tiết kiệm dung lượng nhất.',
  feature_drag_title: 'Sắp xếp kéo thả',
  feature_drag_desc:
    'Đổi thứ tự file trước khi xuất zip. Watermark cũng kéo thả để layer theo ý muốn.',
  feature_save_title: 'Lưu cấu hình',
  feature_save_desc:
    'Lưu nhiều bộ cấu hình cho từng workflow. Export JSON, dùng lại trên máy khác.',

  // Landing — How it works
  how_heading: 'Chỉ 3 bước',
  how_subheading: 'Không cần học, không cần đọc tài liệu.',
  how_step1_title: 'Kéo thả ảnh',
  how_step1_desc: 'Drag-drop, click chọn, hoặc nhấn Ctrl/⌘ + O. Hỗ trợ JPG, PNG, HEIC, WebP.',
  how_step2_title: 'Tuỳ chỉnh',
  how_step2_desc: 'Chọn preset, format, kích thước, đặt tên, watermark. Áp dụng cho toàn bộ batch.',
  how_step3_title: 'Tải về',
  how_step3_desc: 'Tải từng ảnh hoặc đóng gói zip. App tự xử lý trùng tên file.',

  // Landing — Comparison
  compare_heading: 'So với các công cụ khác',
  compare_subheading: 'Tại sao chọn Image Optimizer?',
  compare_col_feature: 'Tính năng',
  compare_col_ours: 'Image Optimizer',
  compare_col_tinypng: 'TinyPNG',
  compare_col_squoosh: 'Squoosh',
  compare_row_privacy: '100% client-side',
  compare_row_free: 'Miễn phí không giới hạn',
  compare_row_bulk: 'Xử lý hàng loạt',
  compare_row_watermark: 'Watermark text + hình',
  compare_row_resize: 'Resize tuỳ chỉnh',
  compare_row_naming: 'Bulk naming + đánh số',
  compare_row_heic: 'Hỗ trợ HEIC (iPhone)',
  compare_row_preset: 'Lưu cấu hình',
  compare_yes: 'Có',
  compare_no: 'Không',
  compare_partial: 'Hạn chế',
  compare_note:
    'So sánh dựa trên gói miễn phí của các công cụ tại thời điểm xuất bản. Phát hiện sai lệch? Mở issue trên GitHub.',

  // Landing — FAQ
  faq_heading: 'Câu hỏi thường gặp',
  faq_subheading: 'Những thắc mắc phổ biến nhất.',
  faq_q1: 'Ứng dụng có upload ảnh của tôi lên server không?',
  faq_a1:
    'Không. Toàn bộ quá trình nén, resize, watermark diễn ra trong trình duyệt của bạn qua Canvas API. Bạn có thể ngắt mạng sau khi tải trang xong và app vẫn chạy bình thường.',
  faq_q2: 'Tôi có cần đăng ký tài khoản không?',
  faq_a2:
    'Không. Không tài khoản, không cookie tracking, không email capture. Cấu hình được lưu cục bộ trong localStorage của trình duyệt bạn.',
  faq_q3: 'Có giới hạn số lượng hoặc dung lượng file không?',
  faq_a3:
    'Không có giới hạn về số lượng file. Dung lượng từng file phụ thuộc vào RAM trình duyệt — thực tế nén ảnh tới 50MB vẫn hoạt động trên máy 8GB RAM.',
  faq_q4: 'WebP và JPEG: tôi nên chọn định dạng nào?',
  faq_a4:
    'WebP giảm 25-35% dung lượng so với JPEG ở cùng chất lượng và được mọi trình duyệt hiện đại hỗ trợ. Chọn JPEG nếu cần tương thích phần mềm cũ hoặc gửi cho khách hàng dùng IE.',
  faq_q5: 'App có giữ được metadata EXIF (GPS, ngày chụp) khi nén ảnh không?',
  faq_a5:
    'Có. Bật tuỳ chọn "Giữ metadata EXIF" trong Cài đặt. Chỉ áp dụng cho JPEG → JPEG vì WebP có định dạng metadata khác.',
  faq_q6: 'Tôi có thể nén nhiều ảnh và đặt watermark cùng lúc không?',
  faq_a6:
    'Có. Drop hàng chục ảnh, đặt tới 5 watermark (text hoặc logo PNG) cho mỗi ảnh. App xử lý song song 3 ảnh để không treo trình duyệt, xuất zip một lần khi xong.',
  faq_q7: 'App có hoạt động offline không?',
  faq_a7:
    'Có. Ứng dụng đã được tích hợp công nghệ PWA (Progressive Web App). Sau lần truy cập đầu tiên, toàn bộ ứng dụng được lưu vào bộ nhớ cache của thiết bị, giúp khởi động tức thì và hoạt động offline 100% không cần kết nối mạng.',
  faq_q8: 'Mã nguồn ứng dụng có công khai không?',
  faq_a8:
    'Có, host trên GitHub theo MIT license. Bạn có thể self-host, fork, sửa đổi, hoặc gửi pull request. Liên kết trong footer.',

  // Landing — CTA
  cta_heading: 'Sẵn sàng tối ưu ảnh?',
  cta_subheading: 'Miễn phí, không upload, không đăng ký. Tự lưu cấu hình cho lần sau.',

  // Blog
  blog_empty_state: 'Chưa có bài viết nào trong ngôn ngữ này.',
  blog_reading_min: 'phút đọc',
  blog_by: 'bởi',
  blog_published: 'Đăng',
  blog_updated: 'Cập nhật',
  blog_tags: 'Thẻ:',
  blog_back_to_list: '← Quay lại danh sách',
  blog_related_posts: 'Bài viết liên quan',
  blog_not_found_title: 'Không tìm thấy bài viết',
  blog_not_found_body: 'Bài viết bạn tìm không tồn tại hoặc đã bị di chuyển.',

  // PWA
  btn_pwa_install: 'Cài đặt ứng dụng',
  pwa_update_available: 'Có phiên bản cập nhật mới!',
  btn_pwa_reload: 'Tải lại trang',
};
