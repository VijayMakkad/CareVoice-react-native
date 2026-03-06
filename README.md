# CareVoice

CareVoice is a React Native Expo application designed to assist users with medication management, emergency situations, and daily accessibility via voice features.

## 🌟 Key Features

*   **Medication Management**: Track medications, schedule them, and log whether they were taken or skipped.
*   **Emergency SOS**: Quickly contact pre-configured emergency contacts. Keep a log of emergency events.
*   **Voice Assistant**: Use natural language to interact with the app, check medication status, trigger an SOS, and have the app read out information to you.
*   **Fall Detection**: Utilizing device sensors to detect falls and trigger an emergency response.
*   **Accessible Settings**: Haptic feedback, voice feedback, and customizable notifications.

## 🛠 Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
*   **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
*   **Navigation**: [React Navigation](https://reactnavigation.org/)
*   **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
*   **Storage**: `@react-native-async-storage/async-storage`
*   **Device capabilities**: `expo-speech`, `expo-haptics`, `expo-sensors`

## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   Expo CLI (`npm install -g expo-cli`)

### Installation

1.  Clone the repository and navigate to the project root:
    ```bash
    cd "CareVoiceExpo"
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the App

Start the Expo development server:

```bash
npx expo start
```

Press `a` to open the app on an Android emulator, `i` to open on an iOS simulator, or scan the QR code with the Expo Go app on your physical device.

## 🗂 Project Structure

*   `/src/screens/` - Screen components for various pages (Home, Settings, Meds, etc.)
*   `/src/components/` - Reusable UI components
*   `/src/store/` - Zustand state management stores
*   `/src/services/` - App services (Voice, Emergency, Fall Detection)
*   `/src/navigation/` - React Navigation configuration
*   `/src/theme/` - Styling and theming constants

## 📄 License

This project is licensed under the MIT License.
