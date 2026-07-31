# Chrome extension hydration warning

- The local dev server reported a React hydration mismatch during Chrome QA because an installed extension injected `data-immersive-translate-page-theme="dark"` on `<html>` before hydration.
- The preview continued to return HTTP 200 and the tested UI behaved correctly; this warning is external browser-extension state, not an application-rendering difference.
