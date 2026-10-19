This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Project structure

- `src/view/` — entry point (`App.js`) and screens, split by user role: `login/`, `brigadista/`, `admin/`. Each role folder owns its screens plus a `<Role>Navigator.js`. This is where new screens go.
- `src/components/` — shared UI components (`Button`, `Card`, `TextField`, `StatusPill`, `EmBreve`, `AppTabBar`). `AppTabBar` is role-agnostic — it takes an `icons` prop (route name → Feather icon) instead of hardcoding a role's routes.
- `src/theme/` — design tokens (`colors`, `fonts`, `spacing`).
- `docs/meu-app-firebase/` — archived reference copy of a colleague's original prototype (TypeScript + Firebase + Expo Router). Not part of the app; don't import from it.

## Navigation & Routing

- Use **React Navigation** (`@react-navigation/native` + `@react-navigation/bottom-tabs`).
- `src/view/App.js` only loads fonts/splash and picks which top-level navigator to render based on `role` (`null` → `LoginScreen`, `'brigadista'` → `BrigadistaNavigator`, `'admin'` → `AdminNavigator`). It does not define tabs itself — each role's `<Role>Navigator.js` owns its own `Tab.Navigator`.
- There is no real auth yet: `LoginScreen` calls `onLogin(role)` directly. Today, the "Entrar" button maps to `'brigadista'` and "Entrar com biometria" is a stand-in for `'admin'` access (both just validate usuário/senha) — replace this once real authentication/roles exist.
- Screens receive `navigation` as a prop; use `navigation.navigate('ScreenName')` to move between tabs within the same role's navigator (screen names are the ones given to `Tab.Screen` in that role's `<Role>Navigator.js`).
- This project does **not** use Expo Router — `expo-router` is not a dependency. Don't import from it.
- Docs: https://reactnavigation.org/docs/getting-started

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
