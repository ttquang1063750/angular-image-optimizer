import { readingTimeMinutes } from './blog-post.model';

describe('readingTimeMinutes', () => {
  it('strip HTML rồi đếm word', () => {
    const html = '<p>one two three four five</p>';
    expect(readingTimeMinutes(html)).toBe(1);
  });

  it('220 WPM standard, làm tròn lên', () => {
    const words = Array.from({ length: 440 }, (_, i) => `word${i}`).join(' ');
    expect(readingTimeMinutes(`<p>${words}</p>`)).toBe(2);
  });

  it('221 từ → 2 phút (ceil)', () => {
    const words = Array.from({ length: 221 }, (_, i) => `w${i}`).join(' ');
    expect(readingTimeMinutes(words)).toBe(2);
  });

  it('rỗng → 1 phút (minimum)', () => {
    expect(readingTimeMinutes('')).toBe(1);
    expect(readingTimeMinutes('<p></p>')).toBe(1);
  });

  it('bỏ qua HTML attributes + nested tags', () => {
    const html = '<h2 class="foo">Hello <strong>world</strong></h2><p>and again</p>';
    // 4 words: Hello, world, and, again
    expect(readingTimeMinutes(html)).toBe(1);
  });
});
