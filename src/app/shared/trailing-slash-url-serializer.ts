import { DefaultUrlSerializer, UrlTree } from '@angular/router';

/**
 * URL serializer luôn append trailing slash sau path segment (trừ root `/`).
 *
 * Lý do: Cloudflare Pages 308 redirect `/vi/about` → `/vi/about/`. Nếu
 * `routerLink` sinh URL không trailing slash, mỗi navigation kèm 1 round-trip
 * redirect và Googlebot cũng thấy chain redirect khi follow internal link.
 * Serializer này đảm bảo `<a routerLink>` render `href="/vi/about/"` từ đầu.
 *
 * Implementation: super.serialize() trả URL đã chuẩn hoá (vd. `/vi/about?q=1#h`).
 * Ta tách query/fragment ra, append `/` vào path nếu chưa có, rồi nối lại.
 */
export class TrailingSlashUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    // Loại bỏ trailing slash ở cuối path segment trước khi parse.
    // Điều này tránh việc Angular Router parse ra một empty segment ở cuối URL
    // (ví dụ: "/en/" -> ['en', '']), gây lỗi không khớp route (pathMatch: 'full').
    const queryIdx = url.indexOf('?');
    const fragmentIdx = url.indexOf('#');
    const splitIdx =
      queryIdx === -1
        ? fragmentIdx
        : fragmentIdx === -1
          ? queryIdx
          : Math.min(queryIdx, fragmentIdx);

    let path = splitIdx === -1 ? url : url.substring(0, splitIdx);
    const rest = splitIdx === -1 ? '' : url.substring(splitIdx);

    // Bỏ trailing slash nếu path kết thúc bằng '/' và không phải là root '/'
    if (path.endsWith('/') && path !== '/') {
      path = path.slice(0, -1);
    }

    return super.parse(`${path}${rest}`);
  }

  override serialize(tree: UrlTree): string {
    const url = super.serialize(tree);

    // Root path đứng riêng (`/` không thể có thêm slash)
    if (url === '/' || url === '') return url;

    // Tách path khỏi query + fragment (giữ thứ tự gốc)
    const queryIdx = url.indexOf('?');
    const fragmentIdx = url.indexOf('#');
    const splitIdx =
      queryIdx === -1
        ? fragmentIdx
        : fragmentIdx === -1
          ? queryIdx
          : Math.min(queryIdx, fragmentIdx);

    const path = splitIdx === -1 ? url : url.substring(0, splitIdx);
    const rest = splitIdx === -1 ? '' : url.substring(splitIdx);

    return path.endsWith('/') ? url : `${path}/${rest}`;
  }
}
