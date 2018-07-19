# clearbit-jsr-mocks

A mock shim for javascript remoting (special thanks to [Dan Shahin](https://github.com/dshahin))

Use to test local versions of single page salesforce apps without deploying to server

## Install

`yarn add clearbit-jsr-mocks`

## Setup Mocks

```javascript
const remoting = vfr(
  new vfrMocks({
    getAccounts: {
      method: (_) -> {...yourMock}
    }
  })
)
;
```

## Setup RemoteActions

In your VF page add something like the following to resolve the names of the remote actions.

```html
<head>
...
    <script>
        window.vfr = {
            getAccounts: '{!$RemoteAction.AccountController.getAccounts}',
        }
    </script>
...
```

## Call the RemoteAction

In your ES6 code, add

```javascript
arg => remoting({ method: 'getAccounts', args: [arg] });
```

clearbit-jsr-mocks utilizes a global object named `vfr` to map your short method name to the fully qualified remote action name. However, you do not have to use this, you can specify the fully qualified remote action name. However, this approach is not dynamic-namespace safe, so is not recommended.

```javascript
arg => remoting({ method: 'ns.AccountController.getAccounts', args: [arg] });
```