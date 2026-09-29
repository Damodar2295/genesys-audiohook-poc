Source: https://github.com/purecloudlabs/audiohook-reference-implementation
Commit: 2871b01cb07812de8d1b32f46d8142e282ad6928 (retrieved 2026-09-29).
MIT license: see LICENSE.

audiohook/ contains app/audiohook/src, without infrastructure or reference app services.
mediasource-tone.ts and clientwebsocket.ts come from client/src.
Client imports are relocated; request-header logging is removed to prevent credential disclosure.
Two audioframe.ts fixes: correct L16 interleaved-frame size validation parentheses;
copy unaligned Uint8Array/Buffer data into aligned storage instead of Buffer.slice().
Numeric validators add explicit typeof narrowing for strict TypeScript 5.6.
Client UUID generation uses Node's randomUUID, removing the old uuid dependency.
Protocol state machines and HTTP signature implementation are otherwise unchanged.
