import { TranslationDict } from './types';

export const en: TranslationDict = {
  // General
  app_title: 'Image Optimizer',
  app_subtitle:
    'Optimize and compress images directly in your browser - Your images are never uploaded',
  btn_theme_dark: 'Switch to dark mode',
  btn_theme_light: 'Switch to light mode',
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
  exif_preserve: 'Preserve EXIF metadata',
  exif_hint: 'Keep camera info, GPS, timestamps. JPEG → JPEG only.',
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
  watermark_toggle: 'Enable watermark',
  watermark_type_text: 'Text',
  watermark_type_image: 'Image',
  watermark_placeholder: 'Watermark text...',
  watermark_pos: 'Position:',
  watermark_size: 'Size (%):',
  watermark_opacity: 'Opacity:',
  watermark_upload_image: 'Choose logo image',
  watermark_remove_image: 'Remove image',
  watermark_no_image: 'No image selected',
  watermark_add_text: 'Add text watermark',
  watermark_add_image: 'Add image watermark',
  watermark_limit_reached: 'Maximum limit of {max} watermarks reached',
  watermark_item_title: 'Watermark #{index}',
  watermark_item_text_summary: 'Text: "{text}" at {position}',
  watermark_item_image_summary: 'Image: {name} at {position}',
  watermark_item_image_empty_summary: 'No image selected at {position}',
  watermark_drag_handle_title: 'Drag to reorder',
  file_drag_handle_title: 'Drag to reorder file',

  // Validation
  error_value_range: 'Value must be between {min} and {max}',
  error_value_nan: 'Please enter a valid number',

  pos_bottom_right: 'Bottom Right',
  pos_bottom_left: 'Bottom Left',
  pos_top_right: 'Top Right',
  pos_top_left: 'Top Left',
  pos_center: 'Center',

  // Drop zone
  drop_zone_text: 'Drag & drop images here or click to browse',
  drop_zone_hint: '(Supports JPG, PNG, HEIC - 3 concurrent images)',
  drop_zone_shortcut: 'or press Ctrl/⌘ + O',
  shortcut_download_all: 'Ctrl/⌘ + S',

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
  modal_support_intro: 'Your support helps me maintain and develop this app for free for everyone.',
  support_paypal_desc: 'For international friends',
  support_paypal_btn: 'Send via PayPal',
  support_momo_desc: 'Scan code to support',
  support_bank_desc: 'Direct bank transfer',
  bank_name: 'Bank:',

  // Presets
  label_saved_presets: 'Saved Presets:',
  preset_default: 'Factory Default',
  preset_placeholder: 'New preset name...',
  btn_save_preset: 'Save Preset',
  btn_export_presets: 'Export Presets',
  btn_import_presets: 'Import Presets',
  confirm_delete_preset: 'Are you sure you want to delete this preset?',
  msg_preset_saved: 'Preset saved successfully!',
  msg_preset_loaded: 'Preset loaded!',
  msg_preset_deleted: 'Preset deleted!',
  msg_preset_imported: 'Presets imported successfully!',
  msg_invalid_preset_file: 'Invalid preset file format!',
  msg_preset_name_empty: 'Please enter a preset name!',
  msg_preset_name_exists: 'Preset name already exists!',
  msg_preset_quota_exceeded: 'LocalStorage quota exceeded! Please delete old presets.',
  msg_preset_save_failed: 'Failed to save preset.',
  msg_preset_file_too_large: 'File is too large (max 10 MB).',
  label_settings: 'Parameter Settings',
  btn_close: 'Close',
  btn_cancel: 'Cancel',
  btn_delete_confirm: 'Yes, Delete',
};
