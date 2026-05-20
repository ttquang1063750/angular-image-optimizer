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
  modal_support_intro: 'Your support helps me maintain and develop this app for free for everyone.',
  support_paypal_desc: 'For international friends',
  support_paypal_btn: 'Send via PayPal',
  support_momo_desc: 'Scan code to support',
  support_bank_desc: 'Direct bank transfer',
  bank_name: 'Bank:',
};
