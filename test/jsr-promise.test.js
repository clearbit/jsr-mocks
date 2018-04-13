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
