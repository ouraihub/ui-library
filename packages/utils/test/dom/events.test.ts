import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { debounce, throttle } from '../../src/dom/events';

describe('Event Tools', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('debounce()', () => {
    it('应该延迟执行函数', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('多次调用应该只执行最后一次', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('应该传递参数到原函数', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2', 123);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('应该在每次调用时重置延迟', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('应该支持多个独立的防抖实例', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const debounced1 = debounce(fn1, 100);
      const debounced2 = debounce(fn2, 100);

      debounced1();
      debounced2();

      vi.advanceTimersByTime(100);
      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).toHaveBeenCalledOnce();
    });

    it('应该处理不同的延迟时间', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const debounced1 = debounce(fn1, 50);
      const debounced2 = debounce(fn2, 150);

      debounced1();
      debounced2();

      vi.advanceTimersByTime(50);
      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn2).toHaveBeenCalledOnce();
    });

    it('应该处理对象参数', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      const obj = { key: 'value' };

      debounced(obj);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith(obj);
    });

    it('应该处理函数参数', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      const callback = () => 'test';

      debounced(callback);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith(callback);
    });
  });

  describe('throttle()', () => {
    it('应该立即执行第一次调用', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledOnce();
    });

    it('应该限制执行频率', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('应该传递参数到原函数', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('应该在节流间隔后执行待处理的调用', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('first');
      expect(fn).toHaveBeenCalledWith('first');

      throttled('second');
      throttled('third');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('third');
    });

    it('应该支持多个独立的节流实例', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const throttled1 = throttle(fn1, 100);
      const throttled2 = throttle(fn2, 100);

      throttled1();
      throttled2();

      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).toHaveBeenCalledOnce();
    });

    it('应该处理不同的节流间隔', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const throttled1 = throttle(fn1, 50);
      const throttled2 = throttle(fn2, 100);

      throttled1();
      throttled2();

      expect(fn1).toHaveBeenCalledOnce();
      expect(fn2).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(50);
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalledOnce();
    });

    it('应该处理对象参数', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      const obj = { key: 'value' };

      throttled(obj);

      expect(fn).toHaveBeenCalledWith(obj);
    });

    it('应该处理函数参数', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      const callback = () => 'test';

      throttled(callback);

      expect(fn).toHaveBeenCalledWith(callback);
    });

    it('应该在多次快速调用后正确更新参数', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(1);
      expect(fn).toHaveBeenCalledWith(1);

      throttled(2);
      throttled(3);
      throttled(4);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenLastCalledWith(4);
    });

    it('应该在节流间隔内不执行重复调用', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();

      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(50);
      throttled();

      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
