import { AboutContent } from './about-content';

export const aboutContentVi: AboutContent = {
  lede: 'Image Optimizer ra đời từ một nhu cầu đơn giản: nén ảnh hàng loạt mà không phải lo ảnh riêng tư bị upload đi đâu đó.',

  storyTitle: 'Câu chuyện',
  storyParagraphs: [
    'Mình là dev front-end. Một ngày phải gửi cho khách hàng 80 ảnh sản phẩm, mỗi cái 4-5 MB. TinyPNG đếm số file, Squoosh chỉ làm được từng cái một, và mấy tool desktop thì phải cài đặt + có khi tracking gì đó. Cuối cùng quyết định ngồi viết.',
    'Mục tiêu là một công cụ mà bạn mở ra dùng được ngay, không đăng ký, không upload, không giới hạn. Vì xử lý toàn bộ trong trình duyệt, mình không trả phí server — và bạn không phải tin mình về chuyện ảnh có rời máy bạn hay không.',
  ],

  techTitle: 'Công nghệ',
  techBlurb:
    'Lựa chọn ưu tiên sự gọn nhẹ và khả năng kiểm chứng. Bundle ban đầu của trang landing dưới 110 KB gzipped.',
  techStack: [
    { name: 'Angular 21', role: 'Framework + Signals + SSG prerender', url: 'https://angular.dev' },
    { name: 'RxJS', role: 'Điều phối nén song song (3 ảnh/lần)', url: 'https://rxjs.dev' },
    {
      name: 'heic-to',
      role: 'Decode HEIC từ iPhone (libheif WASM)',
      url: 'https://github.com/hoppergee/heic-to',
    },
    { name: 'JSZip', role: 'Đóng gói batch thành .zip', url: 'https://stuk.github.io/jszip/' },
    {
      name: '@angular/cdk',
      role: 'Drag-drop + Dialog overlay',
      url: 'https://material.angular.dev/cdk',
    },
  ],

  privacyTitle: 'Cam kết quyền riêng tư',
  privacyBlurb:
    'Đây không phải là policy dài 5000 chữ. Đây là những gì code thực sự làm — bạn có thể tự kiểm chứng trên GitHub.',
  privacyBullets: [
    'Ảnh KHÔNG bao giờ rời khỏi trình duyệt. Không có endpoint upload nào trong code.',
    'Không cookie tracking, không Google Analytics, không Facebook Pixel, không phần mềm thứ ba đọc nội dung file.',
    'localStorage chỉ lưu cấu hình UI (preset, ngôn ngữ, theme). Xoá lịch sử trình duyệt là sạch.',
    'Không cần tài khoản, không cần email. Bạn vào dùng — xong là tắt tab.',
    'Mã nguồn công khai MIT — bất kỳ ai cũng có thể audit hoặc self-host trên domain riêng.',
    'Hoạt động được sau khi tải trang lần đầu, kể cả ngắt mạng. (PWA cache đầy đủ đang trong roadmap.)',
  ],

  ossTitle: 'Mã nguồn mở',
  ossParagraphs: [
    'Toàn bộ code release theo MIT license. Bạn có thể fork, sửa đổi, dùng trong dự án thương mại — miễn giữ copyright notice.',
    'Mọi issue, pull request, ý tưởng tính năng đều welcome. Roadmap công khai trên GitHub Projects.',
  ],

  supportTitle: 'Ủng hộ dự án',
  supportBlurb:
    'App miễn phí, không quảng cáo, không bán dữ liệu, không kế hoạch premium. Nếu nó giúp công việc của bạn dễ hơn, một ly cà phê sẽ giúp mình duy trì và build thêm tính năng.',
  supportCta: '☕ Mời mình ly cà phê',

  contactTitle: 'Liên hệ',
  contactBlurb: 'Cách nhanh nhất để được phản hồi:',
  contactLines: [
    {
      label: 'Bug & feature request',
      href: 'https://github.com/ttquang1063750/angular-image-optimizer/issues',
      text: 'GitHub Issues',
    },
    {
      label: 'Pull request',
      href: 'https://github.com/ttquang1063750/angular-image-optimizer',
      text: 'GitHub repository',
    },
  ],
};
