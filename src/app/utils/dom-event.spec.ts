import { getInputFiles, getInputValue, getNumberValue, getSelectValue } from './dom-event';

describe('dom-event utils', () => {
  it('getInputValue trả về value của input', () => {
    const event = { target: { value: 'hello' } } as unknown as Event;
    expect(getInputValue(event)).toBe('hello');
  });

  it('getNumberValue trả về valueAsNumber', () => {
    const event = { target: { valueAsNumber: 42 } } as unknown as Event;
    expect(getNumberValue(event)).toBe(42);
  });

  it('getSelectValue trả về value với generic type narrow', () => {
    const event = { target: { value: 'bottom-right' } } as unknown as Event;
    type Pos = 'top-left' | 'bottom-right';
    const result = getSelectValue<Pos>(event);
    expect(result).toBe('bottom-right');
  });

  it('getInputFiles trả về FileList', () => {
    const fileList = [new File([''], 'a.png')] as unknown as FileList;
    const event = { target: { files: fileList } } as unknown as Event;
    expect(getInputFiles(event)).toBe(fileList);
  });

  it('getInputFiles trả về null khi không có file', () => {
    const event = { target: { files: null } } as unknown as Event;
    expect(getInputFiles(event)).toBeNull();
  });
});
