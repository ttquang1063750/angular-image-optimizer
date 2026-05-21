import {
  getInputFiles,
  getInputValue,
  getNumberValue,
  getSelectValue,
  validateNumberInput,
} from './dom-event';

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

  describe('validateNumberInput', () => {
    function evt(valueAsNumber: number): Event {
      return { target: { valueAsNumber } } as unknown as Event;
    }

    it('valid khi giá trị trong khoảng', () => {
      expect(validateNumberInput(evt(50), 1, 100)).toEqual({ value: 50, valid: true });
    });

    it('reason=below_min khi giá trị < min', () => {
      const r = validateNumberInput(evt(-5), 1, 100);
      expect(r.valid).toBe(false);
      expect(r.reason).toBe('below_min');
      expect(r.value).toBe(-5);
    });

    it('reason=above_max khi giá trị > max', () => {
      const r = validateNumberInput(evt(101), 1, 100);
      expect(r.valid).toBe(false);
      expect(r.reason).toBe('above_max');
    });

    it('reason=nan khi không phải số', () => {
      const r = validateNumberInput(evt(NaN), 1, 100);
      expect(r.valid).toBe(false);
      expect(r.reason).toBe('nan');
    });

    it('biên min và max được chấp nhận (inclusive)', () => {
      expect(validateNumberInput(evt(1), 1, 100).valid).toBe(true);
      expect(validateNumberInput(evt(100), 1, 100).valid).toBe(true);
    });
  });
});
