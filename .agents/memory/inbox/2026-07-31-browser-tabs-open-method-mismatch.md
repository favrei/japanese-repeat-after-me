# Local browser handoff used an unsupported tab-open method

- The retained Browser binding listed no current tabs.
- A first handoff attempt called `browser.tabs.open(...)`, but that method is not supported by this Browser API.
- No app or browser state changed; the Browser documentation was consulted before retrying with its supported user-visible tab-opening method.
