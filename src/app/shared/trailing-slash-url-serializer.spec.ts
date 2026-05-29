import { TrailingSlashUrlSerializer } from './trailing-slash-url-serializer';

describe('TrailingSlashUrlSerializer', () => {
  const serializer = new TrailingSlashUrlSerializer();

  function serializeFromString(url: string): string {
    const tree = serializer.parse(url);
    return serializer.serialize(tree);
  }

  it('append trailing slash cho path thường', () => {
    expect(serializeFromString('/vi/about')).toBe('/vi/about/');
    expect(serializeFromString('/en/blog/webp-vs-jpeg')).toBe('/en/blog/webp-vs-jpeg/');
  });

  it('giữ nguyên path đã có trailing slash', () => {
    expect(serializeFromString('/vi/about/')).toBe('/vi/about/');
  });

  it('root path `/` không bị append thêm slash', () => {
    expect(serializeFromString('/')).toBe('/');
  });

  it('giữ query string sau khi append slash', () => {
    expect(serializeFromString('/vi/blog?tag=webp')).toBe('/vi/blog/?tag=webp');
  });

  it('giữ fragment sau khi append slash', () => {
    expect(serializeFromString('/vi/about#contact')).toBe('/vi/about/#contact');
  });

  it('xử lý đúng khi có cả query + fragment', () => {
    expect(serializeFromString('/vi/blog?tag=webp#top')).toBe('/vi/blog/?tag=webp#top');
  });

  it('single-segment path cũng có trailing slash', () => {
    expect(serializeFromString('/vi')).toBe('/vi/');
    expect(serializeFromString('/en')).toBe('/en/');
  });

  it('parse() loại bỏ trailing slash để khớp với UrlTree không có trailing slash', () => {
    const treeWithSlash = serializer.parse('/vi/about/');
    const treeWithoutSlash = serializer.parse('/vi/about');
    expect(treeWithSlash.toString()).toBe(treeWithoutSlash.toString());
  });
});
