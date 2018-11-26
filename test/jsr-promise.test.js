const { vfrMocks, vfr } = require('../src/jsr-promise.es6');

test('Can call JSR', async () => {
  const mocks = new vfrMocks({
    foo: {
      method: function() {
        return true;
      }
    }
  });
  const jsr = vfr(mocks);
  const res = await jsr({ method: 'foo', args: ['bar'] });
  expect(res).toEqual(true);
});

test('Handles session timeout', async () => {
  const mocks = new vfrMocks({
    foo: {
      method: function() {},
      event: { type: 'exception', message: 'expected failure' }
    }
  });
  const jsr = vfr(mocks);
  try {
    const res = await jsr({ method: 'foo', args: ['bar'] });
    expect(res).toBe(undefined);
  } catch (error) {
    expect(error.message).toEqual('expected failure');
  }
});

test('Can pass options to Remoting', async () => {
  const mocks = new vfrMocks({
    foo: {
      method: function() {
        return true;
      }
    }
  });
  const jsr = vfr(mocks);
  const res = await jsr({
    method: 'foo',
    args: ['bar'],
    options: { buffer: true, escape: true, timeout: 1000 }
  });
});

test('Fails if no mocks are set', async () => {
  try {
    const mocks = new vfrMocks();
    const jsr = vfr(mocks);
    const res = await jsr({ method: 'foo', args: ['bar'] });
  } catch (err) {
    expect(err).toEqual('No mocks are configured');
  }
});

test('Fails if no method is passed', async () => {
  try {
    const mocks = new vfrMocks({});
    const jsr = vfr(mocks);
    const res = await jsr({ args: ['bar'] });
  } catch (err) {
    expect(err).toEqual('No Method passed to InvokeStaticAction');
  }
});

test('Fails if no method is matched', async () => {
  try {
    const mocks = new vfrMocks({});
    const jsr = vfr(mocks);
    const res = await jsr({ method: 'foo', args: ['bar'] });
  } catch (err) {
    expect(err).toEqual('Missing Mock for method foo');
  }
});
