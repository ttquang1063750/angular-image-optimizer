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

  // Marketing chrome
  nav_landing: 'Home',
  nav_blog: 'Blog',
  nav_about: 'About',
  nav_changelog: 'Changelog',
  btn_open_app: 'Open app →',
  app_shell_back_to_home: '← Back to home',
  footer_tagline: 'Client-side image compression. No uploads, open source.',
  footer_links_title: 'Links',
  footer_link_source: 'Source code',
  footer_link_privacy: 'Privacy',
  footer_link_contact: 'Contact',
  footer_copyright: '© {year} Image Optimizer. All rights reserved.',

  // SEO meta — Landing
  seo_landing_title: 'Image Optimizer — Free online image compression, in your browser',
  seo_landing_description:
    'Compress, resize, watermark and convert images in bulk. 100% client-side — no upload, no signup. Supports JPG, PNG, WebP, HEIC.',

  // SEO meta — Optimize app
  seo_optimize_title: 'Image compressor app — Image Optimizer',
  seo_optimize_description:
    'Batch image compression and resizing tool that runs entirely in your browser.',

  // SEO meta — About
  seo_about_title: 'About — Image Optimizer',
  seo_about_description:
    'The story behind Image Optimizer: a privacy-first, open-source client-side image compression tool.',

  // SEO meta — Changelog
  seo_changelog_title: 'Changelog — Image Optimizer',
  seo_changelog_description: 'Version history and recent features of Image Optimizer.',

  // SEO meta — Blog
  seo_blog_title: 'Blog — Image Optimizer',
  seo_blog_description:
    'Articles on image compression, WebP, web performance, and client-side image processing.',

  // SEO meta — 404
  seo_not_found_title: '404 Not Found — Image Optimizer',
  seo_not_found_description: 'The page you are looking for does not exist.',

  // Landing — Hero
  hero_h1: 'Optimize images right in your browser — no upload, no signup',
  hero_subline:
    'Compress, resize, watermark and convert images in bulk. 100% private, 100% free, open source.',
  hero_badge_privacy: 'Private',
  hero_badge_free: 'Free',
  hero_badge_oss: 'Open source',
  hero_cta_secondary: 'See features',
  hero_image_alt: 'Illustration of image compression before and after',

  // Landing — Features
  features_heading: 'Everything you need to optimize images',
  features_subheading: 'No spyware, no embedded watermark, no subscription.',
  feature_privacy_title: '100% client-side privacy',
  feature_privacy_desc:
    'Your images never leave the browser. No server storage, no analytics reading file content.',
  feature_bulk_title: 'Bulk processing',
  feature_bulk_desc:
    'Compress up to 3 images concurrently with real-time progress. Auto-apply prefix, suffix, numbering.',
  feature_webp_title: 'WebP & HEIC',
  feature_webp_desc:
    'Convert JPEG/PNG to WebP for 25-35% smaller files. Reads HEIC straight from iPhone.',
  feature_watermark_title: 'Flexible watermarks',
  feature_watermark_desc:
    'Add text or PNG logo with custom position, opacity and size. Up to 5 watermarks per image.',
  feature_exif_title: 'Preserve EXIF',
  feature_exif_desc:
    'Optionally keep camera info, GPS coordinates and timestamps when compressing JPEG → JPEG.',
  feature_presets_title: '3 compression presets',
  feature_presets_desc:
    'Light keeps quality high, medium balances both, max squeezes out the most savings.',
  feature_drag_title: 'Drag to reorder',
  feature_drag_desc:
    'Rearrange files before exporting zip. Watermarks are also drag-and-drop to layer as you like.',
  feature_save_title: 'Save presets',
  feature_save_desc:
    'Save multiple config sets for different workflows. Export as JSON, reuse on any device.',

  // Landing — How it works
  how_heading: 'Just 3 steps',
  how_subheading: 'No learning curve, no docs to read.',
  how_step1_title: 'Drop your images',
  how_step1_desc: 'Drag-drop, click to browse, or press Ctrl/⌘ + O. Supports JPG, PNG, HEIC, WebP.',
  how_step2_title: 'Customize',
  how_step2_desc: 'Pick preset, format, size, naming, watermark. Apply to the whole batch.',
  how_step3_title: 'Download',
  how_step3_desc: 'Download per file or grab everything as a zip. Duplicate names handled.',

  // Landing — Comparison
  compare_heading: 'How it compares',
  compare_subheading: 'Why pick Image Optimizer?',
  compare_col_feature: 'Feature',
  compare_col_ours: 'Image Optimizer',
  compare_col_tinypng: 'TinyPNG',
  compare_col_squoosh: 'Squoosh',
  compare_row_privacy: '100% client-side',
  compare_row_free: 'Unlimited free',
  compare_row_bulk: 'Bulk processing',
  compare_row_watermark: 'Text + image watermark',
  compare_row_resize: 'Custom resize',
  compare_row_naming: 'Bulk naming + numbering',
  compare_row_heic: 'HEIC (iPhone) support',
  compare_row_preset: 'Saved presets',
  compare_yes: 'Yes',
  compare_no: 'No',
  compare_partial: 'Limited',
  compare_note:
    "Comparison based on each tool's free tier at publish time. Spot something wrong? Open an issue on GitHub.",

  // Landing — FAQ
  faq_heading: 'Frequently asked questions',
  faq_subheading: 'The most common things people want to know.',
  faq_q1: 'Does the app upload my images to a server?',
  faq_a1:
    'No. All compression, resizing, and watermarking happens inside your browser via the Canvas API. You can disconnect from the network after loading the page and the app keeps working.',
  faq_q2: 'Do I need to create an account?',
  faq_a2:
    "No. No accounts, no tracking cookies, no email capture. Your settings live in your browser's localStorage.",
  faq_q3: 'Is there a file count or size limit?',
  faq_a3:
    'No limit on file count. Per-file size depends on your browser RAM — in practice, compressing 50MB images works fine on an 8GB machine.',
  faq_q4: 'WebP vs JPEG: which format should I pick?',
  faq_a4:
    'WebP cuts 25-35% off JPEG file size at the same quality and is supported by all modern browsers. Stick with JPEG only if you need compatibility with old software or clients still on IE.',
  faq_q5: 'Does the app preserve EXIF metadata (GPS, capture time) when compressing?',
  faq_a5:
    'Yes. Enable "Preserve EXIF metadata" in Settings. It only applies to JPEG → JPEG since WebP uses a different metadata format.',
  faq_q6: 'Can I compress many images and add watermarks at the same time?',
  faq_a6:
    'Yes. Drop dozens of images, add up to 5 watermarks (text or PNG logo) per image. The app processes 3 images in parallel to avoid freezing the browser, then exports a single zip.',
  faq_q7: 'Does the app work offline?',
  faq_a7:
    'Partially — after the first page load you can compress offline. Bookmark the page for faster repeat loads. A full PWA cache is on the roadmap.',
  faq_q8: 'Is the source code public?',
  faq_a8:
    'Yes, hosted on GitHub under the MIT license. Self-host, fork, modify, or send a pull request. Link in the footer.',

  // Landing — CTA
  cta_heading: 'Ready to optimize?',
  cta_subheading: 'Free, no upload, no signup. Your presets save automatically for next time.',

  // Blog
  blog_empty_state: 'No posts in this language yet.',
  blog_reading_min: 'min read',
  blog_by: 'by',
  blog_published: 'Published',
  blog_updated: 'Updated',
  blog_tags: 'Tags:',
  blog_back_to_list: '← Back to all posts',
  blog_related_posts: 'Related posts',
  blog_not_found_title: 'Post not found',
  blog_not_found_body: 'The post you are looking for does not exist or has been moved.',
};
